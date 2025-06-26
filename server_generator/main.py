from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from routes import image_routes
from config import DEBUG, HOST, PORT
from tasks.wallpaper_generation_task import generate_wallpapers_job

# Load environment variables
load_dotenv()

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler.add_job(generate_wallpapers_job, 'interval', seconds=30, id='wallpaper_job')
    scheduler.start()
    print("Scheduler started...")
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="Image Generator Service", debug=True, lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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