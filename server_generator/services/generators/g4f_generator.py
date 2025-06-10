from typing import Optional
from services.generators.image_generator import ImageData, ImageGenerator
from g4f import Client


class G4FGenerator(ImageGenerator):
    """G4F implementation of image generator"""

    def __init__(self):
        self.client = Client()

    def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512,
    ) -> ImageData:
        """
        Generate image using g4f client
        Returns image URL
        """
        response = self.client.images.generate(
            model="gpt4o",
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=20,
            cfg_scale=7.0,
            response_format="url",
        )

        # Get first image URL
        if response.data and hasattr(response.data[0], "url"):
            print("Generated image URL:", response.data[0].url)

            return ImageData(image=response.data[0].url, image_type="url")

        raise ValueError("No image URL in response")
