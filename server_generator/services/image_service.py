import os
from typing import Tuple
import uuid
import requests
from urllib.parse import urljoin
from pydantic import BaseModel
from typing import Literal, Union

from config import BASE_PATH, IMAGES_PATH


class SavedImagePaths(BaseModel):
    file_path: str
    url_path: str

class ImageData(BaseModel):
    image: Union[str, bytes]  # Can be either base64 string or URL string
    image_type: Literal["base64", "url"]

class ImageService:
    def __init__(self):
        self.images_dir = IMAGES_PATH
        self.base_path = BASE_PATH

    def save_image(self, image_data: ImageData) -> SavedImagePaths:
        try:
            if image_data.image_type == "url":
                return self.save_image_from_url(image_data.image)
            elif image_data.image_type == "base64":
                return self.save_image_from_base64(image_data.image)
            else:
                raise ValueError(f"Unsupported image type: {image_data.image_type}")
        except Exception as e:
            raise ValueError(f"Failed to save image: {str(e)}")
        
    def save_image_to_server(self, content,  ext=".jpg") -> Tuple[str, str]:
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(self.images_dir, filename)

            # Create directory if it doesn't exist
            os.makedirs(self.images_dir, exist_ok=True)

            # Save image
            with open(file_path, "wb") as f:
                f.write(content)
            return filename, file_path
        
    def save_image_from_url(self, image_url: str) -> SavedImagePaths:
        try:
            # Download image
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()

            # Verify image content
            if not response.content:
                raise ValueError("Empty image content")

            # Save image
            filename, file_path = self.save_image_to_server(response.content, ".jpg")

            return SavedImagePaths(
                file_path=file_path, url_path=self.get_url_path(filename)
            )

        except requests.RequestException as e:
            raise ValueError(f"Failed to download image from {image_url}: {str(e)}")
        except IOError as e:
            raise ValueError(f"Failed to save image to {file_path}: {str(e)}")
        except Exception as e:
            raise ValueError(f"Unexpected error: {str(e)}")
        
    def save_image_from_base64(self, image_data: Union[str, bytes]) -> SavedImagePaths:
        try:
            # Remove data URL prefix if present
            if isinstance(image_data, str) and "," in image_data:
                image_data = image_data.split(",")[1]
            
            # Decode base64 to bytes if it's a string
            if isinstance(image_data, str):
                import base64
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data

                # Save image
            filename, file_path = self.save_image_to_server(image_bytes, ".jpg")

            return SavedImagePaths(
                file_path=file_path,
                url_path=self.get_url_path(filename)
            )
        except Exception as e:
            raise ValueError(f"Failed to save base64 image: {str(e)}")

    def get_url_path(self, filename: str) -> str:
        return urljoin(self.base_path, f"static/images/{filename}")
