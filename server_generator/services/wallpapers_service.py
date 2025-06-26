import requests
from typing import List
from config import WALLPAPERS_SERVER_API_KEY, WALLPAPERS_SERVER_URL
from models.category import Category
from models.wallpaper import WallpaperCreate

class WallpapersService:
    def __init__(self):
        self.base_url = WALLPAPERS_SERVER_URL
        self.api_key = WALLPAPERS_SERVER_API_KEY
        self.headers = {"X-API-Key": self.api_key}
        
    def get_categories(self) -> List[Category]:
        response = requests.get(f"{self.base_url}/api/categories", headers=self.headers)
        response.raise_for_status()
        return [Category(**category) for category in response.json()]

    def create_wallpaper(self, wallpaper: WallpaperCreate):
        response = requests.post(
            f"{self.base_url}/api/wallpapers",
            json=wallpaper.model_dump(),
            headers=self.headers,
        )
        response.raise_for_status()
        return response

  