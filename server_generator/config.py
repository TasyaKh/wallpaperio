import os
from dotenv import load_dotenv

load_dotenv()

# Server settings
PORT = int(os.getenv("PORT"))
HOST = os.getenv("HOST", "0.0.0.0")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
BASE_PATH = os.getenv("BASE_PATH", "")

IMAGES_PATH = os.getenv("IMAGES_PATH")

# fusion brain ai
FUSION_BRAIN_AI_KEY = os.getenv("FUSION_BRAIN_AI_KEY", "")
FUSION_BRAIN_AI_SECRET = os.getenv("FUSION_BRAIN_AI_SECRET", "")

# pollinations
POLLINATIONS_TOKEN = os.getenv("POLLINATIONS_TOKEN", "")
