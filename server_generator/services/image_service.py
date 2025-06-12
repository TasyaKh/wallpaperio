import os
from typing import Tuple, Union
import uuid
import requests
from urllib.parse import urljoin
from pydantic import BaseModel
from typing import Literal, Union
from tensorflow.keras.applications import EfficientNetV2B0
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
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
            self.base_model = EfficientNetV2B0(
                weights='imagenet',
                include_top=False,
                pooling='avg'
            )
        except Exception as e:
            print(f"Error initializing model: {str(e)}")
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
        os.makedirs(self.images_dir, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)
        return filename, file_path
        
    def save_image_from_url(self, image_url: str) -> SavedImagePaths:
        try:
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            if not response.content:
                raise ValueError("Empty image content")

            # Save image
            filename, file_path = self.save_image_to_server(response.content, ".jpg")

            return SavedImagePaths(
                file_path=file_path, 
                url_path=self.get_url_path(filename)
            )
        except Exception as e:
            raise ValueError(f"Failed to download/save image: {str(e)}")
        
    def save_image_from_base64(self, image_data: Union[str, bytes]) -> SavedImagePaths:
        try:
            if isinstance(image_data, str):
                if "," in image_data:
                    image_data = image_data.split(",")[1]
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
        """Extract L2-normalized features from image using EfficientNetV2"""
        try:
            # Load and preprocess image
            if os.path.exists(image_path_url):
                img = image.load_img(image_path_url, target_size=(224, 224))
            else:
                response = requests.get(image_path_url, timeout=30)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content)).resize((224, 224))
            
            # Extract features
            img_array = preprocess_input(np.expand_dims(image.img_to_array(img), axis=0))
            features = self.base_model.predict(img_array, verbose=0).flatten()
            
            # L2 normalize
            norm = np.linalg.norm(features)
            if norm > 0:
                features = features / norm
            
            print(f"Feature extraction completed. Shape: {features.shape}")
            return features
            
        except Exception as pred_error:
            print(f"Feature extraction failed: {str(pred_error)}")
            print(f"Error type: {type(pred_error).__name__}")
            # Return normalized zero vector
            return np.zeros(1280, dtype=np.float32)
