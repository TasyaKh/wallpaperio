from g4f import Client
from typing import Optional, List

class ImageService:
    def __init__(self):
        self.client = Client()

    def generate_images(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512,
        steps: int = 20,
        cfg_scale: float = 7.0
    ) -> List[str]:
        """
        Generate images using g4f client
        Returns list of image paths
        """
        response = self.client.images.generate(
            model="gpt4o",
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=steps,
            cfg_scale=cfg_scale,
            response_format="url"
        )
        
        # Get image paths
        image_paths = []
        for img in response.data:
            if hasattr(img, 'url'):
                print("generate img url ", img.url)
                image_paths.append(img.url)
        
        return image_paths 