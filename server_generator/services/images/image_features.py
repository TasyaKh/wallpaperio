import os
from typing import Union
import requests
from pydantic import BaseModel
from typing import Literal, Union
from tensorflow.keras.applications import EfficientNetV2B0
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
from io import BytesIO

class ImageFeatures:
    def __init__(self):
       
        try:
            self.base_model = EfficientNetV2B0(
                weights="imagenet", include_top=False, pooling="avg"
            )
        except Exception as e:
            print(f"Error initializing model: {str(e)}")
            raise

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
            img_array = preprocess_input(
                np.expand_dims(image.img_to_array(img), axis=0)
            )
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
