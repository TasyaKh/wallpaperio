from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import asyncio
from functools import partial
from services.image_service import ImageService

router = APIRouter(prefix="/images", tags=["images"])

class ImageRequest(BaseModel):
    prompt: str
    n: int = 1
    negative_prompt: Optional[str] = None
    width: int = 512
    height: int = 512
    steps: int = 20
    cfg_scale: float = 7.0

class ImageResponse(BaseModel):
    images: Optional[List[str]] = None  # Image paths
    error: Optional[str] = None

# Initialize service
image_service = ImageService()

@router.post("/generate", response_model=ImageResponse)
async def generate_image(request: ImageRequest):
    try:
        # Run the synchronous function in a thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            partial(
                image_service.generate_images,
                request.prompt,
                request.negative_prompt,
                request.width,
                request.height,
                request.steps,
                request.cfg_scale
            )
        )
        
        return ImageResponse(images=result)
    except Exception as e:
        print(f"Error details: {str(e)}")
        return ImageResponse(error=str(e)) 