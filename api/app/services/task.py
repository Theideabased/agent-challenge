import math
import os.path
import re
from os import path

from loguru import logger

from app.config import config
from app.models import const
from app.models.schema import VideoConcatMode, VideoParams
from app.services import llm, material, subtitle, video, voice
from app.services import state as sm
from app.services.eliza_agent import get_video_director
from app.utils import utils


def generate_script(task_id, params):
    logger.info("\n\n## generating video script")
    video_script = params.video_script.strip()
    if not video_script:
        # Get ElizaOS agent for prompt analysis
        logger.info("🤖 Consulting ElizaOS agent for prompt optimization...")
        try:
            agent = get_video_director()
            import asyncio
            
            # Run async agent analysis in synchronous context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            analysis = loop.run_until_complete(agent.analyze_prompt(params.video_subject))
            loop.close()
            
            logger.success("✅ ElizaOS agent analysis complete")
            logger.info(f"   Enhanced prompt ready for script generation")
            logger.debug(f"   Agent suggestions: {', '.join(analysis.suggestions[:2])}")
            
        except Exception as e:
            logger.warning(f"⚠️  ElizaOS agent analysis failed: {e}, proceeding with original prompt")
            analysis = None
        
        # Get user's Gemini API key from params
        gemini_api_key = getattr(params, 'gemini_api_key', '')
        if gemini_api_key:
            logger.info(f"🔑 Using user-provided Gemini API key")
        
        video_script = llm.generate_script(
            video_subject=params.video_subject,
            language=params.video_language,
            paragraph_number=params.paragraph_number,
            gemini_api_key=gemini_api_key,
        )
    else:
        logger.debug(f"video script: \n{video_script}")

    if not video_script:
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        logger.error("failed to generate video script.")
        return None

    return video_script


def generate_terms(task_id, params, video_script):
    logger.info("\n\n## generating video terms")
    video_terms = params.video_terms
    if not video_terms:
        video_terms = llm.generate_terms(
            video_subject=params.video_subject, video_script=video_script, amount=5
        )
    else:
        if isinstance(video_terms, str):
            video_terms = [term.strip() for term in re.split(r"[,，]", video_terms)]
        elif isinstance(video_terms, list):
            video_terms = [term.strip() for term in video_terms]
        else:
            raise ValueError("video_terms must be a string or a list of strings.")

        logger.debug(f"video terms: {utils.to_json(video_terms)}")

    if not video_terms:
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        logger.error("failed to generate video terms.")
        return None

    return video_terms


def save_script_data(task_id, video_script, video_terms, params):
    script_file = path.join(utils.task_dir(task_id), "script.json")
    script_data = {
        "title": params.video_subject,
        "script": video_script,
        "search_terms": video_terms,
        "params": params,
    }

    with open(script_file, "w", encoding="utf-8") as f:
        f.write(utils.to_json(script_data))


def generate_audio(task_id, params, video_script):
    '''
    Generate audio for the video script.
    If a custom audio file is provided, it will be used directly.
    There will be no subtitle maker object returned in this case.
    Otherwise, TTS will be used to generate the audio.
    Returns:
        - audio_file: path to the generated or provided audio file
        - audio_duration: duration of the audio in seconds
        - sub_maker: subtitle maker object if TTS is used, None otherwise
    '''
    logger.info("\n\n## generating audio")
    custom_audio_file = params.custom_audio_file
    if not custom_audio_file or not os.path.exists(custom_audio_file):
        if custom_audio_file:
            logger.warning(
                f"custom audio file not found: {custom_audio_file}, using TTS to generate audio."
            )
        else:
            logger.info("no custom audio file provided, using TTS to generate audio.")
        audio_file = path.join(utils.task_dir(task_id), "audio.mp3")
        sub_maker = voice.tts(
            text=video_script,
            voice_name=voice.parse_voice_name(params.voice_name),
            voice_rate=params.voice_rate,
            voice_file=audio_file,
        )
        if sub_maker is None:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            logger.error(
                """failed to generate audio:
1. check if the language of the voice matches the language of the video script.
2. check if the network is available. If you are in China, it is recommended to use a VPN and enable the global traffic mode.
            """.strip()
            )
            return None, None, None
        audio_duration = math.ceil(voice.get_audio_duration(sub_maker))
        if audio_duration == 0:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            logger.error("failed to get audio duration.")
            return None, None, None
        return audio_file, audio_duration, sub_maker
    else:
        logger.info(f"using custom audio file: {custom_audio_file}")
        audio_duration = voice.get_audio_duration(custom_audio_file)
        if audio_duration == 0:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            logger.error("failed to get audio duration from custom audio file.")
            return None, None, None
        return custom_audio_file, audio_duration, None

def generate_subtitle(task_id, params, video_script, sub_maker, audio_file):
    '''
    Generate subtitle for the video script.
    If subtitle generation is disabled or no subtitle maker is provided, it will return an empty string.
    Otherwise, it will generate the subtitle using the specified provider.
    Returns:
        - subtitle_path: path to the generated subtitle file
    '''
    logger.info("\n\n## generating subtitle")
    if not params.subtitle_enabled or sub_maker is None:
        return ""

    subtitle_path = path.join(utils.task_dir(task_id), "subtitle.srt")
    subtitle_provider = config.app.get("subtitle_provider", "edge").strip().lower()
    logger.info(f"\n\n## generating subtitle, provider: {subtitle_provider}")

    subtitle_fallback = False
    if subtitle_provider == "edge":
        voice.create_subtitle(
            text=video_script, sub_maker=sub_maker, subtitle_file=subtitle_path
        )
        if not os.path.exists(subtitle_path):
            subtitle_fallback = True
            logger.warning("subtitle file not found, fallback to whisper")

    if subtitle_provider == "whisper" or subtitle_fallback:
        subtitle.create(audio_file=audio_file, subtitle_file=subtitle_path)
        logger.info("\n\n## correcting subtitle")
        subtitle.correct(subtitle_file=subtitle_path, video_script=video_script)

    subtitle_lines = subtitle.file_to_subtitles(subtitle_path)
    if not subtitle_lines:
        logger.warning(f"subtitle file is invalid: {subtitle_path}")
        return ""

    return subtitle_path


def get_video_materials(task_id, params, video_terms, audio_duration):
    if params.video_source == "local":
        logger.info("\n\n## preprocess local materials")
        materials = video.preprocess_video(
            materials=params.video_materials, clip_duration=params.video_clip_duration
        )
        if not materials:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            logger.error(
                "no valid materials found, please check the materials and try again."
            )
            return None
        return [material_info.url for material_info in materials]
    else:
        logger.info(f"\n\n## downloading videos from {params.video_source}")
        downloaded_videos = material.download_videos(
            task_id=task_id,
            search_terms=video_terms,
            source=params.video_source,
            video_aspect=params.video_aspect,
            video_contact_mode=params.video_concat_mode,
            audio_duration=audio_duration * params.video_count,
            max_clip_duration=params.video_clip_duration,
        )
        if not downloaded_videos:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            logger.error(
                "failed to download videos, maybe the network is not available. if you are in China, please use a VPN."
            )
            return None
        return downloaded_videos


def generate_final_videos(
    task_id, params, downloaded_videos, audio_file, subtitle_path
):
    final_video_paths = []
    combined_video_paths = []
    video_concat_mode = (
        params.video_concat_mode if params.video_count == 1 else VideoConcatMode.random
    )
    video_transition_mode = params.video_transition_mode

    _progress = 50
    for i in range(params.video_count):
        index = i + 1
        combined_video_path = path.join(
            utils.task_dir(task_id), f"combined-{index}.mp4"
        )
        logger.info(f"\n\n## combining video: {index} => {combined_video_path}")
        video.combine_videos(
            combined_video_path=combined_video_path,
            video_paths=downloaded_videos,
            audio_file=audio_file,
            video_aspect=params.video_aspect,
            video_concat_mode=video_concat_mode,
            video_transition_mode=video_transition_mode,
            max_clip_duration=params.video_clip_duration,
            threads=params.n_threads,
        )

        _progress += 50 / params.video_count / 2
        sm.state.update_task(task_id, progress=_progress)

        final_video_path = path.join(utils.task_dir(task_id), f"final-{index}.mp4")

        logger.info(f"\n\n## generating video: {index} => {final_video_path}")
        video.generate_video(
            video_path=combined_video_path,
            audio_path=audio_file,
            subtitle_path=subtitle_path,
            output_file=final_video_path,
            params=params,
        )

        _progress += 50 / params.video_count / 2
        sm.state.update_task(task_id, progress=_progress)

        final_video_paths.append(final_video_path)
        combined_video_paths.append(combined_video_path)

    return final_video_paths, combined_video_paths


def start(task_id, params: VideoParams, stop_at: str = "video"):
    logger.info(f"🎬 start task: {task_id}, stop_at: {stop_at}")
    logger.info(f"👤 User prompt: '{params.video_subject}'")
    sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=5)

    if type(params.video_concat_mode) is str:
        params.video_concat_mode = VideoConcatMode(params.video_concat_mode)

    # 1. Generate script with ElizaOS agent consultation
    logger.info("\n" + "="*60)
    logger.info("🤖 PHASE 1: SCRIPT GENERATION WITH AGENT CONSULTATION")
    logger.info("="*60)
    video_script = generate_script(task_id, params)
    if not video_script or "Error: " in video_script:
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        return

    sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=10)

    if stop_at == "script":
        sm.state.update_task(
            task_id, state=const.TASK_STATE_COMPLETE, progress=100, script=video_script
        )
        return {"script": video_script}

    # 2. Generate terms
    logger.info("\n" + "="*60)
    logger.info("🔍 PHASE 2: SEARCH TERMS GENERATION")
    logger.info("="*60)
    video_terms = ""
    if params.video_source != "local":
        video_terms = generate_terms(task_id, params, video_script)
        if not video_terms:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return

    save_script_data(task_id, video_script, video_terms, params)

    if stop_at == "terms":
        sm.state.update_task(
            task_id, state=const.TASK_STATE_COMPLETE, progress=100, terms=video_terms
        )
        return {"script": video_script, "terms": video_terms}

    sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=20)

    # 3. Generate audio
    logger.info("\n" + "="*60)
    logger.info("🔊 PHASE 3: AUDIO GENERATION (TTS)")
    logger.info("="*60)
    audio_file, audio_duration, sub_maker = generate_audio(
        task_id, params, video_script
    )
    if not audio_file:
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        return

    sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=30)

    if stop_at == "audio":
        sm.state.update_task(
            task_id,
            state=const.TASK_STATE_COMPLETE,
            progress=100,
            audio_file=audio_file,
        )
        return {"audio_file": audio_file, "audio_duration": audio_duration}

    # 4. Generate subtitle
    logger.info("\n" + "="*60)
    logger.info("📝 PHASE 4: SUBTITLE GENERATION")
    logger.info("="*60)
    subtitle_path = generate_subtitle(
        task_id, params, video_script, sub_maker, audio_file
    )

    if stop_at == "subtitle":
        sm.state.update_task(
            task_id,
            state=const.TASK_STATE_COMPLETE,
            progress=100,
            subtitle_path=subtitle_path,
        )
        return {"subtitle_path": subtitle_path}

    sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=40)

    # 5. Get video materials
    logger.info("\n" + "="*60)
    logger.info("🎬 PHASE 5: VIDEO MATERIALS ACQUISITION")
    logger.info("="*60)
    downloaded_videos = get_video_materials(
        task_id, params, video_terms, audio_duration
    )
    if not downloaded_videos:
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        return

    if stop_at == "materials":
        sm.state.update_task(
            task_id,
            state=const.TASK_STATE_COMPLETE,
            progress=100,
            materials=downloaded_videos,
        )
        return {"materials": downloaded_videos}

    sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=50)

    # 6. Generate final videos
    logger.info("\n" + "="*60)
    logger.info("🎥 PHASE 6: FINAL VIDEO RENDERING")
    logger.info("="*60)
    final_video_paths, combined_video_paths = generate_final_videos(
        task_id, params, downloaded_videos, audio_file, subtitle_path
    )

    if not final_video_paths:
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        return

    logger.success(
        f"✅ Task {task_id} finished, generated {len(final_video_paths)} videos."
    )
    logger.info("="*60)
    logger.info("🎉 VIDEO GENERATION COMPLETE")
    logger.info("="*60)

    kwargs = {
        "videos": final_video_paths,
        "combined_videos": combined_video_paths,
        "script": video_script,
        "terms": video_terms,
        "audio_file": audio_file,
        "audio_duration": audio_duration,
        "subtitle_path": subtitle_path,
        "materials": downloaded_videos,
    }
    sm.state.update_task(
        task_id, state=const.TASK_STATE_COMPLETE, progress=100, **kwargs
    )
    return kwargs


if __name__ == "__main__":
    task_id = "task_id"
    params = VideoParams(
        video_subject="金钱的作用",
        voice_name="zh-CN-XiaoyiNeural-Female",
        voice_rate=1.0,
    )
    start(task_id, params, stop_at="video")


# ============================================================================
# GPU RENDERING FUNCTION - Nosana GPU Integration
# ============================================================================

async def start_gpu_rendering(task_id: str, params: VideoParams, renderer):
    """
    Execute video rendering on Nosana GPU network.
    
    Workflow:
    1. Validate credits on Nosana account
    2. Submit video rendering job to Nosana
    3. Poll job status until completion
    4. Download rendered video
    5. Update task state with results
    
    Args:
        task_id: Unique task identifier
        params: Video generation parameters
        renderer: NosanaGPURenderer instance
    """
    try:
        logger.info(f"\n{'='*60}")
        logger.info(f"🚀 GPU RENDERING ON NOSANA - Task: {task_id}")
        logger.info(f"{'='*60}")
        
        sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=5)
        
        # ====================================================================
        # STEP 1: Validate Account Credits
        # ====================================================================
        logger.info("\n📊 STEP 1: Checking Nosana account credits...")
        account_status = await renderer.check_credits()
        
        if account_status.get("status") == "error":
            error_msg = f"Account error: {account_status.get('message', 'Unknown error')}"
            logger.error(f"❌ {error_msg}")
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return
        
        credits = account_status.get("creditsBalance", 0)
        logger.info(f"✅ Account balance: ${credits:.2f}")
        
        if credits < 0.5:
            error_msg = f"Insufficient credits: ${credits:.2f} (minimum: $0.50)"
            logger.error(f"❌ {error_msg}")
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return
        
        sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=10)
        
        # ====================================================================
        # STEP 2: Generate Script & Prepare Params
        # ====================================================================
        logger.info("\n📝 STEP 2: Generating video script...")
        video_script = generate_script(task_id, params)
        
        if not video_script or "Error: " in video_script:
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return
        
        logger.info(f"✅ Script generated ({len(video_script)} characters)")
        sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=20)
        
        # ====================================================================
        # STEP 3: Submit to Nosana GPU
        # ====================================================================
        logger.info("\n📤 STEP 3: Submitting job to Nosana GPU network...")
        
        video_params_dict = params.model_dump() if hasattr(params, 'model_dump') else vars(params)
        
        job_result = await renderer.submit_job(
            video_params=video_params_dict,
            task_id=task_id,
            gpu_market="RTX 4090",
            max_budget=5.0,
        )
        
        if job_result.get("status") == "error":
            error_msg = f"Submission failed: {job_result.get('message', 'Unknown error')}"
            logger.error(f"❌ {error_msg}")
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return
        
        deployment_id = job_result.get("deploymentId")
        estimated_cost = job_result.get("estimatedCost", 0)
        
        logger.success(f"✅ Job submitted to Nosana")
        logger.info(f"   Deployment ID: {deployment_id}")
        logger.info(f"   Estimated cost: ${estimated_cost:.2f}")
        
        # Store deployment info in task
        sm.state.update_task(
            task_id,
            state=const.TASK_STATE_PROCESSING,
            progress=30,
            extra={
                "deployment_id": deployment_id,
                "gpu_market": "RTX 4090",
                "estimated_cost": estimated_cost,
                "rendering_mode": "gpu",
            }
        )
        
        # ====================================================================
        # STEP 4: Poll Job Status Until Completion
        # ====================================================================
        logger.info("\n⏳ STEP 4: Polling job status (this may take a few minutes)...")
        
        import time
        max_attempts = 600  # 10 minutes with 1-second polling
        attempt = 0
        last_progress = 30
        
        while attempt < max_attempts:
            try:
                job_status = await renderer.get_job_status(deployment_id)
                
                current_status = job_status.get("status", "unknown")
                progress = job_status.get("progress", 0)
                
                # Update task progress
                if progress > last_progress:
                    last_progress = progress
                    sm.state.update_task(task_id, progress=30 + (progress * 0.6))
                
                logger.debug(f"   Status: {current_status} | Progress: {progress}%")
                
                # Check if job is complete
                if current_status == "completed":
                    logger.success(f"✅ GPU rendering completed!")
                    sm.state.update_task(task_id, progress=95)
                    break
                
                # Check for errors
                elif current_status == "failed":
                    error_msg = job_status.get("error", "Unknown error")
                    logger.error(f"❌ GPU job failed: {error_msg}")
                    sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
                    return
                
                # Wait before next poll
                await asyncio.sleep(1)
                attempt += 1
                
            except Exception as e:
                logger.warning(f"⚠️  Status poll error (attempt {attempt + 1}): {str(e)}")
                await asyncio.sleep(2)
                attempt += 1
        
        if attempt >= max_attempts:
            logger.error(f"❌ Job polling timeout after {max_attempts} attempts")
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return
        
        sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=95)
        
        # ====================================================================
        # STEP 5: Download Rendered Video
        # ====================================================================
        logger.info("\n📥 STEP 5: Downloading rendered video...")
        
        output_dir = utils.task_dir(task_id)
        result = await renderer.get_job_result(deployment_id, task_id, output_dir)
        
        if result.get("status") == "error":
            error_msg = f"Download failed: {result.get('message', 'Unknown error')}"
            logger.error(f"❌ {error_msg}")
            sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
            return
        
        video_file = result.get("videoFile")
        final_cost = result.get("finalCost", estimated_cost)
        
        logger.success(f"✅ Video downloaded successfully")
        logger.info(f"   File: {video_file}")
        logger.info(f"   Final cost: ${final_cost:.2f}")
        
        sm.state.update_task(task_id, state=const.TASK_STATE_PROCESSING, progress=98)
        
        # ====================================================================
        # STEP 6: Complete Task
        # ====================================================================
        logger.info(f"\n{'='*60}")
        logger.info(f"🎉 GPU RENDERING COMPLETE - Task: {task_id}")
        logger.info(f"{'='*60}")
        
        sm.state.update_task(
            task_id,
            state=const.TASK_STATE_COMPLETE,
            progress=100,
            videos=[video_file],
            extra={
                "rendering_mode": "gpu",
                "deployment_id": deployment_id,
                "final_cost": final_cost,
            }
        )
        
        logger.success(f"✅ Task {task_id} completed on GPU")
        
    except Exception as e:
        logger.error(f"❌ GPU rendering failed: {str(e)}", exc_info=True)
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        return


# Import asyncio for async support
import asyncio
