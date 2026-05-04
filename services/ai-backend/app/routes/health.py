"""Health check endpoint"""
from flask import Blueprint, jsonify
from utils.ollama_client import OllamaClient
import redis
import psycopg2
import os

bp = Blueprint('health', __name__)

@bp.route('/health', methods=['GET'])
def health_check():
    """Check health of all services"""
    status = {
        "status": "healthy",
        "services": {}
    }
    
    # Check Ollama
    try:
        ollama = OllamaClient()
        ollama.check_health()
        status["services"]["ollama"] = "healthy"
    except Exception as e:
        status["services"]["ollama"] = f"unhealthy: {str(e)}"
        status["status"] = "degraded"
    
    # Check Redis
    try:
        r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
        r.ping()
        status["services"]["redis"] = "healthy"
    except Exception as e:
        status["services"]["redis"] = f"unhealthy: {str(e)}"
        status["status"] = "degraded"
    
    # Check PostgreSQL
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        conn.close()
        status["services"]["postgresql"] = "healthy"
    except Exception as e:
        status["services"]["postgresql"] = f"unhealthy: {str(e)}"
        status["status"] = "degraded"
    
    return jsonify(status), 200 if status["status"] == "healthy" else 503
