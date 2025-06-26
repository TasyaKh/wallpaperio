import os
from dotenv import load_dotenv

load_dotenv()

# Server settings
PORT = int(os.getenv("PORT"))
HOST = os.getenv("HOST", "0.0.0.0")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# fusion brain ai
FUSION_BRAIN_AI_KEY = os.getenv("FUSION_BRAIN_AI_KEY", "")
FUSION_BRAIN_AI_SECRET = os.getenv("FUSION_BRAIN_AI_SECRET", "")

# pollinations
POLLINATIONS_TOKEN = os.getenv("POLLINATIONS_TOKEN", "")

IMG_HOST_API_KEY = os.getenv("IMG_HOST_API_KEY", "")
WALLPAPERS_SERVER_URL = os.getenv("WALLPAPERS_SERVER_URL", "")

WALLPAPERS_SERVER_API_KEY= os.getenv("WALLPAPERS_SERVER_API_KEY", "")
