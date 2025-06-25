from celery import shared_task
from services.images.image_service_base import ImageServiceBase
from services.images.imgfoto_service import ImgFotoService
from services.generators.generator_factory import GeneratorFactory
from services.generator_service import GeneratorService
from models.response_model import FailedResponse

image_service: ImageServiceBase = ImgFotoService()

@shared_task(
    name="generate_image_task", 
    bind=True, 
    time_limit=86400,
    result_expires=86400  # 24 hours in seconds
)
def generate_image_task(self, request_data: dict) -> dict:
    """Celery task for image generation"""
    print("/generate_image_task entered")
    try:
        # Get generator from factory
        generator = GeneratorFactory.get_generator(request_data["generator_type"])
        generator_service = GeneratorService(generator)
        
        # Generate image
        image_data = generator_service.generate_image(
            prompt=request_data["prompt"],
            negative_prompt=request_data.get("negative_prompt"),
            width=request_data["width"],
            height=request_data["height"],
        )
        
        # Save generated images
        try:
            paths = image_service.save_image(image_data)
            return paths.model_dump()
        except Exception as e:
            err_msg = f"Failed to save image: {str(e)}"
            print(err_msg)
            return FailedResponse(
                error=err_msg
            ).model_dump()
            
    except Exception as e:
        print(f"Error details: {str(e)}")
        return FailedResponse(
            error=str(e)
        ).model_dump() 