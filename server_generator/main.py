from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes.image_routes import router as image_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Image Generator Service", debug=True)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with global api prefix
app.include_router(image_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="debug"
    ) 