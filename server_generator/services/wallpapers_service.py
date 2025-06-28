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
        wallpaper_data = wallpaper.model_dump()
        print(f"Sending wallpaper data: {wallpaper_data}")
        print(f"Headers: {self.headers}")
        
        response = requests.post(
            f"{self.base_url}/api/wallpapers",
            json=wallpaper_data,
            headers=self.headers,
        )
        
        if response.status_code >= 400:
            print(f"API Error: {response.status_code} - {response.text}")
            response.raise_for_status()
            
        return response

  