from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import image_routes
from config import DEBUG, HOST, PORT

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

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(image_routes.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Wallpaper Generator API"}

if __name__ == "__main__":
    import uvicorn
    port = PORT
    uvicorn.run(
        "main:app",
        host=HOST,
        port=port,
        reload=DEBUG,
        log_level=False
    ) 