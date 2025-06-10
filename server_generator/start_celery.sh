#!/bin/bash

# Start Celery worker
celery -A celery_config.celery_app worker --loglevel=info --concurrency=1 