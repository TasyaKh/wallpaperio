from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel
from services.image_service import ImageData

class ImageGenerator(ABC):
    """base class for image generators"""
    
    @abstractmethod
    def generate_image(
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
