from typing import Optional

from services.generators.image_generator import ImageData, ImageGenerator
from services.generators.g4f_generator import G4FGenerator

class GeneratorService:
    """Service that manages different image generators"""
    
    def __init__(self, generator: ImageGenerator = None):
        self.generator = generator or G4FGenerator()

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
        return self.generator.generate_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
        ) 