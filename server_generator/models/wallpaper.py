from pydantic import BaseModel
from typing import List

class WallpaperCreate(BaseModel):
    image_url: str
    image_thumb_url: str | None = None
    category: str
    tags: List[str] 