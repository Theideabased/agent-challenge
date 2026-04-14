"""
GPU Rendering API Endpoints

REST API for submitting and managing GPU rendering jobs on Nosana network.

Endpoints:
    POST   /gpu/jobs              - Submit new GPU job
    GET    /gpu/jobs/{jobId}      - Get job status
    POST   /gpu/jobs/{jobId}/cancel - Cancel job
    GET    /gpu/jobs/{jobId}/result - Download result
    GET    /gpu/account           - Check account status
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
import json
from loguru import logger

from app.models.schema import VideoParams, TaskQueryResponse
from app.services import nosana_renderer as nr
from app.services import state as sm
from app.utils import utils
from app.models import const

router = APIRouter(prefix="/gpu", tags=["GPU Rendering"])


# ============================================================================
# Models
# ============================================================================

class GpuJobSubmitRequest(BaseModel):
    """Request to submit a GPU rendering job."""
    taskId: str
    videoParams: dict
    gpuMarket: Optional[str] = "RTX 4090"
    maxBudget: Optional[float] = 5.0


class GpuJobStatusResponse(BaseModel):
    """Response with GPU job status."""
    status: str
    deploymentId: str
    progress: int
    elapsedSeconds: int
    estimatedTotalSeconds: int
    costAccrued: float
    resourceUsage: dict


class GpuJobResultResponse(BaseModel):
    """Response with GPU job result."""
    status: str
    deploymentId: str
    taskId: str
    outputFiles: list
    resultUrl: Optional[str]


class GpuAccountStatusResponse(BaseModel):
    """Response with GPU account status."""
    status: str
    creditsBalance: float
    markets: dict


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/jobs", response_model=dict, summary="Submit GPU rendering job")
async def submit_gpu_job(request: GpuJobSubmitRequest, background_tasks: BackgroundTasks):
    """
    Submit a video rendering job to Nosana GPU network.
    
    Args:
        request: GPU job submission request with task and video params
        
    Returns:
        Job metadata with deployment ID and estimated cost
        
    Raises:
        HTTPException: If job submission fails
    """
    task_id = request.taskId
    logger.info(f"📤 GPU Job Submit Request - Task: {task_id}")
    
    try:
        # Validate task exists
        sm.state.get_task(task_id)
        
        # Get or create Nosana renderer
        renderer = nr.get_nosana_renderer(
            api_key=request.videoParams.get("nosana_api_key")
        )
        
        if not renderer:
            error_msg = "Nosana API key not provided"
            logger.error(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Submit job to Nosana GPU
        import asyncio
        job_result = await renderer.submit_job(
            video_params=request.videoParams,
            task_id=task_id,
            gpu_market=request.gpuMarket,
            max_budget=request.maxBudget,
        )
        
        # Store job metadata in task state
        sm.state.update_task(
            task_id,
            state=const.TASK_STATE_PROCESSING,
            extra={
                "gpu_job": job_result,
                "rendering_mode": "gpu",
                "deployment_id": job_result.get("deploymentId"),
            }
        )
        
        logger.success(f"✅ GPU job submitted: {job_result.get('deploymentId')}")
        
        # Return job info
        return utils.get_response(200, job_result)
    
    except Exception as e:
        logger.error(f"❌ GPU job submission failed: {str(e)}")
        sm.state.update_task(task_id, state=const.TASK_STATE_FAILED)
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit GPU job: {str(e)}"
        )


@router.get("/jobs/{deployment_id}", response_model=dict, summary="Get GPU job status")
async def get_gpu_job_status(deployment_id: str):
    """
    Get current status of a GPU rendering job.
    
    Args:
        deployment_id: Nosana deployment ID
        
    Returns:
        Job status with progress, timing, and resource usage
        
    Raises:
        HTTPException: If job lookup fails
    """
    logger.debug(f"🔍 GPU Job Status Request - Deployment: {deployment_id}")
    
    try:
        # Get renderer instance
        renderer = nr.get_nosana_renderer()
        
        if not renderer:
            raise HTTPException(status_code=400, detail="Nosana renderer not initialized")
        
        # Get job status
        import asyncio
        job_status = await renderer.get_job_status(deployment_id)
        
        logger.debug(f"✅ Job status retrieved: {job_status.get('status')}")
        
        return utils.get_response(200, job_status)
    
    except Exception as e:
        logger.error(f"❌ Failed to get job status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")


@router.post("/jobs/{deployment_id}/cancel", response_model=dict, summary="Cancel GPU job")
async def cancel_gpu_job(deployment_id: str):
    """
    Cancel a GPU rendering job and trigger credit refund.
    
    Args:
        deployment_id: Nosana deployment ID
        
    Returns:
        Cancellation status with refund information
        
    Raises:
        HTTPException: If cancellation fails
    """
    logger.info(f"❌ GPU Job Cancel Request - Deployment: {deployment_id}")
    
    try:
        renderer = nr.get_nosana_renderer()
        
        if not renderer:
            raise HTTPException(status_code=400, detail="Nosana renderer not initialized")
        
        # Cancel job
        import asyncio
        cancel_result = await renderer.cancel_job(deployment_id)
        
        logger.success(f"✅ GPU job cancelled: {cancel_result}")
        
        return utils.get_response(200, cancel_result)
    
    except Exception as e:
        logger.error(f"❌ Failed to cancel job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel job: {str(e)}")


@router.get("/jobs/{deployment_id}/result", response_model=dict, summary="Get GPU job result")
async def get_gpu_job_result(deployment_id: str, task_id: str, output_dir: str = "/tmp"):
    """
    Retrieve rendered video from completed GPU job.
    
    Args:
        deployment_id: Nosana deployment ID
        task_id: Task identifier
        output_dir: Directory to save output files
        
    Returns:
        Result information with video URL and file paths
        
    Raises:
        HTTPException: If result retrieval fails
    """
    logger.info(f"📥 GPU Job Result Request - Deployment: {deployment_id}")
    
    try:
        renderer = nr.get_nosana_renderer()
        
        if not renderer:
            raise HTTPException(status_code=400, detail="Nosana renderer not initialized")
        
        # Get result
        import asyncio
        result = await renderer.get_job_result(deployment_id, task_id, output_dir)
        
        logger.success(f"✅ GPU job result retrieved: {result}")
        
        return utils.get_response(200, result)
    
    except Exception as e:
        logger.error(f"❌ Failed to get job result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get job result: {str(e)}")


@router.get("/account", response_model=dict, summary="Get GPU account status")
async def get_gpu_account_status(api_key: Optional[str] = None):
    """
    Check GPU account status, credits, and market availability.
    
    Args:
        api_key: Optional Nosana API key to check
        
    Returns:
        Account status with credit balance and available markets
        
    Raises:
        HTTPException: If status check fails
    """
    logger.debug(f"💳 GPU Account Status Request")
    
    try:
        renderer = nr.get_nosana_renderer(api_key=api_key)
        
        if not renderer:
            logger.warning("⚠️ No Nosana API key configured")
            return utils.get_response(200, {
                "status": "no-key",
                "message": "No Nosana API key configured",
                "creditsBalance": 0,
            })
        
        # Check account
        import asyncio
        account_status = await renderer.check_credits()
        
        logger.debug(f"✅ Account status retrieved: {account_status.get('status')}")
        
        return utils.get_response(200, account_status)
    
    except Exception as e:
        logger.error(f"❌ Failed to get account status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get account status: {str(e)}")


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health", summary="GPU API health check")
async def gpu_health_check():
    """Health check for GPU API."""
    try:
        renderer = nr.get_nosana_renderer()
        status = "healthy" if renderer else "no-api-key"
        
        return utils.get_response(200, {
            "status": status,
            "service": "gpu-rendering",
            "timestamp": utils.get_timestamp(),
        })
    
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")
