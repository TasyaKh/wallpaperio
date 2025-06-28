from abc import ABC, abstractmethod
from typing import Literal, Union
from pydantic import BaseModel

import requests

class SavedImagePaths(BaseModel):
    url_path_thumb: str
    url_path: str

class ImageData(BaseModel):
    image: Union[str, bytes]
    image_type: Literal["base64", "url"]

class ImageServiceBase(ABC):
    """Interface for image services"""
    
    @abstractmethod
    def save_image(self, image_data: ImageData) -> SavedImagePaths:
        """Save image and return file paths"""
        pass
    
    def get_image_bytes_from_url(self, image_url: str) -> bytes:
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        if not response.content:
            print("Empty response content received")
            raise ValueError("Empty image content")

        return response.content

    def get_image_as_base64(self, image_data: ImageData) -> str:
        try:
            if image_data.image_type == "base64":
                # Remove data URL prefix if present
                base64_str = image_data.image
                if isinstance(base64_str, str) and "," in base64_str:
                    base64_str = base64_str.split(",", 1)[1]
                return base64_str
            elif image_data.image_type == "url":
                image_bytes = self.get_image_bytes_from_url(image_data.image)
                import base64
                return base64.b64encode(image_bytes).decode('utf-8')
            else:
                raise ValueError(f"Unsupported image type: {image_data.image_type}")
        except Exception as e:
            raise ValueError(f"Failed to get base64 image: {str(e)}")