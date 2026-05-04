"""Configuration for Flask application"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DATABASE_URL = os.getenv("DATABASE_URL")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-in-prod")
    
    # Celery
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")
    
    # Security
    BACKEND_SECRET = os.getenv("BACKEND_SECRET", "shared-secret")
    
    # Models
    CV_GENERATION_MODEL = os.getenv("CV_GENERATION_MODEL", "llama3.1:8b-instruct-q8_0")
    JOB_EVALUATION_MODEL = os.getenv("JOB_EVALUATION_MODEL", "llama3.1:8b-instruct-q4_K_M")
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
