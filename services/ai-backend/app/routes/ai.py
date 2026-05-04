"""AI evaluation endpoints"""
from flask import Blueprint, request, jsonify
from tasks.ai_tasks import evaluate_job_task, generate_cover_letter_task
from app.middleware.auth import require_auth
import logging

bp = Blueprint('ai', __name__)
logger = logging.getLogger(__name__)

@bp.route('/evaluate-job', methods=['POST'])
@require_auth
def evaluate_job():
    """
    Evaluate a job against user profile
    
    Request body:
    {
        "userId": "user-uuid",
        "jobApplicationId": "job-uuid"
    }
    """
    data = request.get_json()
    
    if not data or 'userId' not in data or 'jobApplicationId' not in data:
        return jsonify({"error": "Missing userId or jobApplicationId"}), 400
    
    try:
        task = evaluate_job_task.delay(
            user_id=data['userId'],
            job_application_id=data['jobApplicationId']
        )
        
        return jsonify({
            "taskId": task.id,
            "status": "pending"
        }), 202
    
    except Exception as e:
        logger.error(f"Failed to queue job evaluation: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route('/generate-cover-letter', methods=['POST'])
@require_auth
def generate_cover_letter():
    """
    Generate cover letter for job application
    
    Request body:
    {
        "userId": "user-uuid",
        "jobApplicationId": "job-uuid"
    }
    """
    data = request.get_json()
    
    if not data or 'userId' not in data or 'jobApplicationId' not in data:
        return jsonify({"error": "Missing userId or jobApplicationId"}), 400
    
    try:
        task = generate_cover_letter_task.delay(
            user_id=data['userId'],
            job_application_id=data['jobApplicationId']
        )
        
        return jsonify({
            "taskId": task.id,
            "status": "pending"
        }), 202
    
    except Exception as e:
        logger.error(f"Failed to queue cover letter generation: {e}")
        return jsonify({"error": str(e)}), 500
