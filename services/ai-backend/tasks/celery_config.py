"""Celery configuration"""
from celery import Celery
from app.config import Config
import os

# Create Celery instance
celery_app = Celery(
    "careeros",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1"),
    include=['tasks.cv_tasks', 'tasks.ai_tasks']
)

# Configuration
celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Africa/Nairobi',
    enable_utc=True,
    worker_concurrency=2,  # 2 parallel workers for 12GB RAM
    worker_prefetch_multiplier=1,  # Don't hoard tasks
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=300,  # 5 minutes max per task
    task_soft_time_limit=240,  # Warn at 4 minutes
)
