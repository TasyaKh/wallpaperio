import os
from typing import Tuple, List, Dict, Union, Any
import uuid
import requests
from urllib.parse import urljoin
from pydantic import BaseModel
from typing import Literal, Union
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
from io import BytesIO

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
        try:
            self.base_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
        except Exception as e:
            print(f"Error initializing model: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            raise

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
        
    def save_image_to_server(self, content, ext=".jpg") -> Tuple[str, str]:
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
                file_path=file_path, 
                url_path=self.get_url_path(filename)
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

    def extract_features(self, image_path_url: str) -> np.ndarray:
        """
        Extract features from an image using MobileNetV2
        Returns a 1280-dimensional feature vector
        """
        try:
            print(f"Starting feature extraction for image: {image_path_url}")
            
            # First check if it's a local file
            if os.path.exists(image_path_url):
                print("Loading local image file...")
                img = image.load_img(image_path_url, target_size=(224, 224))
            else:
                # Download image from URL
                print("Downloading image from URL...")
                response = requests.get(image_path_url, timeout=30)
                response.raise_for_status()
                
                # Convert response content to image
                img = Image.open(BytesIO(response.content))
                img = img.resize((224, 224))
            
            img_array = image.img_to_array(img)            
            img_array = np.expand_dims(img_array, axis=0)            
            img_array = preprocess_input(img_array)            
            features = self.base_model.predict(img_array, verbose=0)
            print(f"Feature extraction completed. Shape: {features.shape}")
            
            return features.flatten()
            
        except Exception as pred_error:
            print(f"Feature extraction failed: {str(pred_error)}")
            print(f"Error type: {type(pred_error).__name__}")
            return np.zeros(1280)
