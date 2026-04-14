import glob
import os
import pathlib
import shutil
from typing import Union

from fastapi import BackgroundTasks, Depends, Path, Request, UploadFile
from fastapi.params import File
from fastapi.responses import FileResponse, StreamingResponse
from loguru import logger

from app.config import config
from app.controllers import base
from app.controllers.manager.memory_manager import InMemoryTaskManager
from app.controllers.manager.redis_manager import RedisTaskManager
from app.controllers.v1.base import new_router
from app.models.exception import HttpException
from app.models.schema import (
    AudioRequest,
    BgmRetrieveResponse,
    BgmUploadResponse,
    SubtitleRequest,
    TaskDeletionResponse,
    TaskQueryRequest,
    TaskQueryResponse,
    TaskResponse,
    TaskVideoRequest,
    VideoMaterialUploadResponse,
    VideoMaterialRetrieveResponse
)
from app.services import state as sm
from app.services import task as tm
from app.services import nosana_renderer as nr
from app.utils import utils
from app.models import const

# 认证依赖项
# router = new_router(dependencies=[Depends(base.verify_token)])
router = new_router()

_enable_redis = config.app.get("enable_redis", False)
_redis_host = config.app.get("redis_host", "localhost")
_redis_port = config.app.get("redis_port", 6379)
_redis_db = config.app.get("redis_db", 0)
_redis_password = config.app.get("redis_password", None)
_max_concurrent_tasks = config.app.get("max_concurrent_tasks", 5)

redis_url = f"redis://:{_redis_password}@{_redis_host}:{_redis_port}/{_redis_db}"
# Redis
if _enable_redis:
    task_manager = RedisTaskManager(
        max_concurrent_tasks=_max_concurrent_tasks, redis_url=redis_url
    )
else:
    task_manager = InMemoryTaskManager(max_concurrent_tasks=_max_concurrent_tasks)


@router.post("/videos", response_model=TaskResponse, summary="Generate a short video")
def create_video(
    background_tasks: BackgroundTasks, request: Request, body: TaskVideoRequest
):
    return create_task(background_tasks, request, body, stop_at="video")


@router.post("/subtitle", response_model=TaskResponse, summary="Generate subtitle only")
def create_subtitle(
    background_tasks: BackgroundTasks, request: Request, body: SubtitleRequest
):
    return create_task(background_tasks, request, body, stop_at="subtitle")


@router.post("/audio", response_model=TaskResponse, summary="Generate audio only")
def create_audio(
    background_tasks: BackgroundTasks, request: Request, body: AudioRequest
):
    return create_task(background_tasks, request, body, stop_at="audio")


def create_task(
    background_tasks: BackgroundTasks,
    request: Request,
    body: Union[TaskVideoRequest, SubtitleRequest, AudioRequest],
    stop_at: str,
):
    task_id = utils.get_uuid()
    request_id = base.get_task_id(request)
    try:
        # Check if GPU rendering is requested
        use_gpu = body.model_dump().get("use_gpu", False)
        nosana_api_key = body.model_dump().get("nosana_api_key")
        
        task_params = body.model_dump()
        
        # ============================================================
        # GPU Rendering Branch - Submit to Nosana GPU Network
        # ============================================================
        if use_gpu and nosana_api_key and stop_at == "video":
            logger.info(f"🚀 GPU Rendering Requested - Task: {task_id}")
            
            # Get Nosana renderer with provided API key
            renderer = nr.get_nosana_renderer(api_key=nosana_api_key)
            if not renderer:
                raise ValueError("Failed to initialize Nosana GPU renderer")
            
            # Initialize task state
            sm.state.update_task(
                task_id,
                state=const.TASK_STATE_PENDING,
                extra={"rendering_mode": "gpu"}
            )
            
            # Submit job to Nosana GPU (non-blocking with background task)
            background_tasks.add_task(
                tm.start_gpu_rendering,
                task_id=task_id,
                params=body,
                renderer=renderer,
            )
            
            logger.info(f"✅ GPU job queued: {task_id}")
            
            task = {
                "task_id": task_id,
                "request_id": request_id,
                "params": task_params,
                "rendering_mode": "gpu",
                "status": "queued_for_gpu",
            }
            return utils.get_response(200, task)
        
        # ============================================================
        # CPU Rendering Branch - Local Processing (Original Flow)
        # ============================================================
        else:
            logger.info(f"💻 CPU Rendering - Task: {task_id}")
            
            task = {
                "task_id": task_id,
                "request_id": request_id,
                "params": task_params,
            }
            sm.state.update_task(task_id)
            task_manager.add_task(tm.start, task_id=task_id, params=body, stop_at=stop_at)
            logger.success(f"Task created: {utils.to_json(task)}")
            return utils.get_response(200, task)
    
    except ValueError as e:
        raise HttpException(
            task_id=task_id, status_code=400, message=f"{request_id}: {str(e)}"
        )

from fastapi import Query

@router.get("/tasks", response_model=TaskQueryResponse, summary="Get all tasks")
def get_all_tasks(request: Request, page: int = Query(1, ge=1), page_size: int = Query(10, ge=1)):
    request_id = base.get_task_id(request)
    tasks, total = sm.state.get_all_tasks(page, page_size)

    # Convert file paths to HTTP URLs for all tasks
    endpoint = config.app.get("endpoint", "")
    task_dir = utils.task_dir()
    
    def file_to_uri(file: str):
        v = file.replace("\\", "/")
        if not file.startswith(endpoint):
            _uri_path = v.replace(task_dir, "tasks").replace("\\", "/")
            _uri_path = f"{endpoint}/{_uri_path}"
        else:
            _uri_path = file
        return _uri_path
    
    # Process each task to convert file paths to URLs
    for task in tasks:
        if "videos" in task and task["videos"]:
            task["videos"] = [file_to_uri(v) for v in task["videos"]]
        if "combined_videos" in task and task["combined_videos"]:
            task["combined_videos"] = [file_to_uri(v) for v in task["combined_videos"]]

    response = {
        "tasks": tasks,
        "total": total,
        "page": page,
        "page_size": page_size,
    }
    return utils.get_response(200, response)



@router.get("/tasks/{task_id}/video/{video_index}")
async def serve_video(
    request: Request,
    task_id: str = Path(..., description="Task ID"),
    video_index: int = Path(..., description="Video index (1, 2, etc)")
):
    """
    Serve video file for browser playback (streaming support)
    :param request: HTTP request
    :param task_id: Task ID
    :param video_index: Video index (e.g., 1 for final-1.mp4)
    :return: Video file stream
    """
    try:
        tasks_dir = utils.task_dir()
        video_path = os.path.join(tasks_dir, task_id, f"final-{video_index}.mp4")
        
        if not os.path.exists(video_path):
            raise HttpException(
                task_id=task_id, 
                status_code=404, 
                message=f"Video file not found: {task_id}/final-{video_index}.mp4"
            )
        
        file_size = os.path.getsize(video_path)
        range_header = request.headers.get("range")
        if range_header:
            try:
                range_value = range_header.replace("bytes=", "").split("-")
                start = int(range_value[0]) if range_value[0] else 0
                end = int(range_value[1]) if range_value[1] else file_size - 1
                if start < 0 or end >= file_size or start > end:
                    start = 0
                    end = file_size - 1
                def file_generator(start, end):
                    with open(video_path, "rb") as f:
                        f.seek(start)
                        remaining = end - start + 1
                        while remaining > 0:
                            chunk_size = min(65536, remaining)
                            chunk = f.read(chunk_size)
                            if not chunk:
                                break
                            yield chunk
                            remaining -= len(chunk)
                return StreamingResponse(
                    file_generator(start, end),
                    status_code=206,
                    media_type="video/mp4",
                    headers={
                        "Content-Range": f"bytes {start}-{end}/{file_size}",
                        "Content-Length": str(end - start + 1),
                        "Accept-Ranges": "bytes",
                    }
                )
            except Exception as e:
                logger.warning(f"Range request parsing failed: {e}, serving full file")
        
        return FileResponse(
            path=video_path,
            media_type="video/mp4",
            filename=f"final-{video_index}.mp4",
            headers={"Accept-Ranges": "bytes", "Content-Length": str(file_size)},
        )
        
    except HttpException:
        raise
    except Exception as e:
        logger.error(f"Error serving video: {e}")
        raise HttpException(task_id=task_id, status_code=500, message=f"Error serving video: {str(e)}")


@router.get(
    "/tasks/{task_id}", response_model=TaskQueryResponse, summary="Query task status"
)
def get_task(
    request: Request,
    task_id: str = Path(..., description="Task ID"),
    query: TaskQueryRequest = Depends(),
):
    endpoint = config.app.get("endpoint", "")
    if not endpoint:
        endpoint = str(request.base_url)
    endpoint = endpoint.rstrip("/")

    # Use task_id from path parameter, not random UUID from headers
    task = sm.state.get_task(task_id)
    if task:
        task_dir = utils.task_dir()

        def file_to_uri(file):
            if not file.startswith(endpoint):
                # Extract just the filename (e.g. final-1.mp4 -> index 1)
                filename = os.path.basename(file)  # e.g. final-1.mp4
                # Build clean URL: /api/v1/tasks/{task_id}/video/{index}
                import re
                match = re.match(r'final-(\d+)\.mp4', filename)
                if match:
                    idx = match.group(1)
                    return f"{endpoint}/api/v1/tasks/{task_id}/video/{idx}"
                # Fallback: strip storage prefix
                _uri_path = file.replace(task_dir, "").lstrip("/").replace("\\", "/")
                return f"{endpoint}/api/v1/tasks/{_uri_path}"
            else:
                return file

        if "videos" in task:
            videos = task["videos"]
            urls = []
            for v in videos:
                urls.append(file_to_uri(v))
            task["videos"] = urls
        if "combined_videos" in task:
            combined_videos = task["combined_videos"]
            urls = []
            for v in combined_videos:
                urls.append(file_to_uri(v))
            task["combined_videos"] = urls
        return utils.get_response(200, task)

    raise HttpException(
        task_id=task_id, status_code=404, message=f"{task_id}: task not found"
    )


@router.delete(
    "/tasks/{task_id}",
    response_model=TaskDeletionResponse,
    summary="Delete a generated short video task",
)
def delete_video(request: Request, task_id: str = Path(..., description="Task ID")):
    request_id = base.get_task_id(request)
    task = sm.state.get_task(task_id)
    if task:
        tasks_dir = utils.task_dir()
        current_task_dir = os.path.join(tasks_dir, task_id)
        if os.path.exists(current_task_dir):
            shutil.rmtree(current_task_dir)

        sm.state.delete_task(task_id)
        logger.success(f"video deleted: {utils.to_json(task)}")
        return utils.get_response(200)

    raise HttpException(
        task_id=task_id, status_code=404, message=f"{request_id}: task not found"
    )


@router.get(
    "/musics", response_model=BgmRetrieveResponse, summary="Retrieve local BGM files"
)
def get_bgm_list(request: Request):
    suffix = "*.mp3"
    song_dir = utils.song_dir()
    files = glob.glob(os.path.join(song_dir, suffix))
    bgm_list = []
    for file in files:
        bgm_list.append(
            {
                "name": os.path.basename(file),
                "size": os.path.getsize(file),
                "file": file,
            }
        )
    response = {"files": bgm_list}
    return utils.get_response(200, response)


@router.post(
    "/musics",
    response_model=BgmUploadResponse,
    summary="Upload the BGM file to the songs directory",
)
def upload_bgm_file(request: Request, file: UploadFile = File(...)):
    request_id = base.get_task_id(request)
    # check file ext
    if file.filename.endswith("mp3"):
        song_dir = utils.song_dir()
        save_path = os.path.join(song_dir, file.filename)
        # save file
        with open(save_path, "wb+") as buffer:
            # If the file already exists, it will be overwritten
            file.file.seek(0)
            buffer.write(file.file.read())
        response = {"file": save_path}
        return utils.get_response(200, response)

    raise HttpException(
        "", status_code=400, message=f"{request_id}: Only *.mp3 files can be uploaded"
    )

@router.get(
    "/video_materials", response_model=VideoMaterialRetrieveResponse, summary="Retrieve local video materials"
)
def get_video_materials_list(request: Request):
    allowed_suffixes = ("mp4", "mov", "avi", "flv", "mkv", "jpg", "jpeg", "png")
    local_videos_dir = utils.storage_dir("local_videos", create=True)
    files = []
    for suffix in allowed_suffixes:
        files.extend(glob.glob(os.path.join(local_videos_dir, f"*.{suffix}")))
    video_materials_list = []
    for file in files:
        video_materials_list.append(
            {
                "name": os.path.basename(file),
                "size": os.path.getsize(file),
                "file": file,
            }
        )
    response = {"files": video_materials_list}
    return utils.get_response(200, response)


@router.post(
    "/video_materials",
    response_model=VideoMaterialUploadResponse,
    summary="Upload the video material file to the local videos directory",
)
def upload_video_material_file(request: Request, file: UploadFile = File(...)):
    request_id = base.get_task_id(request)
    # check file ext
    allowed_suffixes = ("mp4", "mov", "avi", "flv", "mkv", "jpg", "jpeg", "png")
    if file.filename.endswith(allowed_suffixes):
        local_videos_dir = utils.storage_dir("local_videos", create=True)
        save_path = os.path.join(local_videos_dir, file.filename)
        # save file
        with open(save_path, "wb+") as buffer:
            # If the file already exists, it will be overwritten
            file.file.seek(0)
            buffer.write(file.file.read())
        response = {"file": save_path}
        return utils.get_response(200, response)

    raise HttpException(
        "", status_code=400, message=f"{request_id}: Only files with extensions {', '.join(allowed_suffixes)} can be uploaded"
    )

@router.get("/stream/{file_path:path}")
async def stream_video(request: Request, file_path: str):
    tasks_dir = utils.task_dir()
    video_path = os.path.join(tasks_dir, file_path)
    range_header = request.headers.get("Range")
    video_size = os.path.getsize(video_path)
    start, end = 0, video_size - 1

    length = video_size
    if range_header:
        range_ = range_header.split("bytes=")[1]
        start, end = [int(part) if part else None for part in range_.split("-")]
        if start is None:
            start = video_size - end
            end = video_size - 1
        if end is None:
            end = video_size - 1
        length = end - start + 1

    def file_iterator(file_path, offset=0, bytes_to_read=None):
        with open(file_path, "rb") as f:
            f.seek(offset, os.SEEK_SET)
            remaining = bytes_to_read or video_size
            while remaining > 0:
                bytes_to_read = min(4096, remaining)
                data = f.read(bytes_to_read)
                if not data:
                    break
                remaining -= len(data)
                yield data

    response = StreamingResponse(
        file_iterator(video_path, start, length), media_type="video/mp4"
    )
    response.headers["Content-Range"] = f"bytes {start}-{end}/{video_size}"
    response.headers["Accept-Ranges"] = "bytes"
    response.headers["Content-Length"] = str(length)
    response.status_code = 206  # Partial Content

    return response


@router.get("/download/{file_path:path}")
async def download_video(_: Request, file_path: str):
    """
    download video
    :param _: Request request
    :param file_path: video file path, eg: /cd1727ed-3473-42a2-a7da-4faafafec72b/final-1.mp4
    :return: video file
    """
    tasks_dir = utils.task_dir()
    video_path = os.path.join(tasks_dir, file_path)
    file_path = pathlib.Path(video_path)
    filename = file_path.stem
    extension = file_path.suffix
    headers = {"Content-Disposition": f"attachment; filename={filename}{extension}"}
    return FileResponse(
        path=video_path,
        headers=headers,
        filename=f"{filename}{extension}",
        media_type=f"video/{extension[1:]}",
    )
