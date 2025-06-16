import json
from typing import Optional
from config import FUSION_BRAIN_AI_KEY, FUSION_BRAIN_AI_SECRET
from services.generators.image_generator import ImageData, ImageGenerator
import requests
import time


class FusionBrainAIGenerator(ImageGenerator):

    def __init__(self):
        self.URL = "https://api-key.fusionbrain.ai/"
        self.AUTH_HEADERS = {
            "X-Key": f"Key {FUSION_BRAIN_AI_KEY}",
            "X-Secret": f"Secret {FUSION_BRAIN_AI_SECRET}",
        }

    def gen_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512,
    ) -> ImageData:

        try:
            params = {
                "type": "GENERATE",
                "numImages": 1,
                "width": width,
                "height": height,
                "generateParams": {"query": f"{prompt}"},
            }
            request_id = self.generate(params=params)
            res = self.check_generation(request_id)
            if res and len(res) > 0:
                return ImageData(image=res[0], image_type="base64")
            raise Exception("No images were generated")
        except Exception as e:
            raise Exception(f"Failed to generate image: {str(e)}")

    def generate(self, params) -> str:
        try:
            print("generate params", params)
            pipeline = self.get_pipeline()
            data = {
                "pipeline_id": (None, pipeline),
                "params": (None, json.dumps(params), "application/json"),
            }
            response = requests.post(
                self.URL + "key/api/v1/pipeline/run",
                headers=self.AUTH_HEADERS,
                files=data,
            )
            response.raise_for_status()  # Raise an exception for bad status codes
            response = response.json()
            return response["uuid"]
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse API response: {str(e)}")
        except KeyError as e:
            raise Exception(f"Unexpected API response format: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error in generate: {str(e)}")

    def check_generation(self, request_id, attempts=10, delay=10):
        while attempts > 0:
            response = requests.get(
                self.URL + "key/api/v1/pipeline/status/" + request_id,
                headers=self.AUTH_HEADERS,
            )
            data = response.json()
            if data["status"] == "DONE":
                return data["result"]["files"]

            attempts -= 1
            time.sleep(delay)

    def get_pipeline(self):
        response = requests.get(
            self.URL + "key/api/v1/pipelines", headers=self.AUTH_HEADERS
        )
        data = response.json()
        return data[0]["id"]
