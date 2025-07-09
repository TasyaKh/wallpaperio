from celery import shared_task
from services.generators.image_generators.generator_factory import GeneratorFactory
from services.images.image_service_base import ImageServiceBase
from services.images.imgfoto_service import ImgFotoService
from services.generators.generator_service import GeneratorService

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
    paths = image_service.save_image(image_data)
    return paths.model_dump() 