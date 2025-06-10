from celery import Celery
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Redis configuration from environment
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = os.getenv('REDIS_PORT', '6379')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
REDIS_DB = os.getenv('REDIS_DB', '0')

# Construct Redis URLs
REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

# Celery configuration
celery_app = Celery('image_generator')

# Load configuration from environment variables
celery_app.conf.update(
    broker_url=REDIS_URL,
    result_backend=REDIS_URL,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour timeout
    worker_max_tasks_per_child=200,  # Restart worker after 200 tasks
    worker_prefetch_multiplier=1,  # Process one task at a time
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
    redis_max_connections=20,
    redis_socket_timeout=30,
    redis_socket_connect_timeout=30,
    redis_retry_on_timeout=True
)

# Import tasks module
# TODO: it works dont TOUCH IT
from tasks.image_tasks import generate_image_task

