from typing import Optional

from services.generators.image_generator import ImageData, ImageGenerator
from services.generators.g4f_pollinations_generator import G4FPollinationsGenerator

class GeneratorService:
    """Service that manages different image generators"""
    
    def __init__(self, generator: ImageGenerator = None):
        self.generator = generator or G4FPollinationsGenerator()

    def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512,
    ) -> ImageData:
        """
        Generate image using configured generator
        Returns image URL
        """
        return self.generator.gen_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
        ) 