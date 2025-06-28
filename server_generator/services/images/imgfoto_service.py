import requests

from config import IMG_HOST_API_KEY
from services.images.image_service_base import (
    ImageData,
    ImageServiceBase,
    SavedImagePaths,
)
from models.imgfoto.imgfoto_response import ImgFotoApiResponse


class ImgFotoService(ImageServiceBase):
    def __init__(self):
        self.base_url = "https://freeimghost.net/api"
        self.api_key = IMG_HOST_API_KEY
        self.headers = {"X-API-Key": self.api_key}

    def save_image(self, image_data: ImageData) -> SavedImagePaths:
        try:
            image_base64 = self.get_image_as_base64(image_data)
            data = {"source": image_base64}
            response = requests.post(
                f"{self.base_url}/1/upload",
                # params={"key": self.api_key},
                headers=self.headers,
                data=data,
                timeout=30,
            )
            if response.status_code >= 400:
                error_message = f"API Error: {response.status_code} - {response.text}"
                print(error_message)
                raise ValueError(error_message)
            response_json = response.json()
            api_response = ImgFotoApiResponse(**response_json)
            image_info = api_response.image
            url_path = image_info.url if image_info else ""
            url_path_thumb = image_info.thumb.url if image_info and image_info.thumb else ""
            return SavedImagePaths(
                url_path=url_path,
                url_path_thumb=url_path_thumb
            )
        except Exception as e:
            raise ValueError(f"{str(e)}")
