from abc import ABC, abstractmethod
from typing import Optional
from services.images.image_service_base import ImageData

class ImageGenerator(ABC):
    """base class for image generators"""
    
    @abstractmethod
    def gen_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512,
    ) -> ImageData:
        """
        Generate a single image
        Returns image URL
        """
        pass
