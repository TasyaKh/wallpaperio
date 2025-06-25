from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.images.image_features import ImageFeatures
from services.generators.generator_factory import GeneratorFactory
from celery.result import AsyncResult
from models.response_model import BaseResponse, FeatureExtractionResponse
from celery_config import celery_app
from tasks.image_tasks import generate_image_task
import numpy as np

router = APIRouter(prefix="/images", tags=["images"])
image_features = ImageFeatures()

class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    width: int = 512
    height: int = 512
    steps: int = 20
    cfg_scale: float = 7.0
    generator_type: str = "fusion_brain"

class ImagePathRequest(BaseModel):
    image_path: str

@router.get("/generators")
async def get_available_generators():
    return {"generators": GeneratorFactory.get_available_generators()}

@router.post("/generate", response_model=BaseResponse)
async def generate_image(request: ImageRequest):
    """Start image generation process"""
    print("/generate entered")
    try:
        # Convert request to dict for Celery
        request_data = request.model_dump()
        
        # Start Celery task
        task = generate_image_task.delay(request_data)
        print("task", task.id)
        return BaseResponse(
            task_id=task.id,
            status="pending"
        )
    
    except Exception as e:
        print(f"Error details: {str(e)}")
        return BaseResponse(status="failed", error=str(e))

@router.get("/status/{task_id}", response_model=BaseResponse)
async def get_generation_status(task_id: str):
    """Get the status of an image generation task"""
    try:
        # Get task result
        task_result = AsyncResult(task_id, app=celery_app)
       
        if task_result.status == "PENDING":
            return BaseResponse(
                task_id=task_id,
                status="pending"
            )
        elif task_result.status == "SUCCESS":
            result = task_result.result
            # Convert numpy array to list if features exist
            return BaseResponse(
                task_id=task_id,
                status="success",
                url_path_thumb=result.get("url_path_thumb"),
                url_path=result.get("url_path"),
            )
        elif task_result.status == "STARTED":
            return BaseResponse(
                task_id=task_id,
                status="started",
                error=None
            )
        elif task_result.status == "FAILURE":
           
            return BaseResponse(
                task_id=task_id,
                status="failed",
                error=str(task_result.result)
            )
        else:
            return BaseResponse(
                task_id=task_id,
                status="failed",
                error=f"Task failed with status: {task_result.status}"
            )
        
            
    except Exception as e:
        return BaseResponse(
            task_id=task_id,
            status="failed",
            error=str(e)
        )

@router.post("/extract-features", response_model=FeatureExtractionResponse)
async def extract_features(request: ImagePathRequest):
    """
    Extract features from an image using EfficientNet-B0
    """
    try:
        # Extract features
        features = image_features.extract_features(request.image_path)
        
        return FeatureExtractionResponse(
            status="success",
            features=features.tolist(),
            feature_shape=features.shape,
            feature_mean=float(features.mean()),
            feature_std=float(features.std())
        )
    except Exception as e:
        return FeatureExtractionResponse(
            status="error",
            features=[],
            feature_shape=(0,),
            feature_mean=0.0,
            feature_std=0.0,
            error_message=str(e)
        )

# @router.delete("", response_model=BaseResponse)
# async def delete_image(request: ImagePathRequest):
#     try:
#         success = image_service.delete_image(request.image_path)
#         return BaseResponse(
#             status="success" if success else "failed",
#             message="Image deleted successfully" if success else "Failed to delete image"
#         )
#     except Exception as e:
#         return BaseResponse(
#             status="failed",
#             error=str(e)
#         ) 