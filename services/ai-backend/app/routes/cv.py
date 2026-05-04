"""CV generation endpoints"""
from flask import Blueprint, request, jsonify
from tasks.cv_tasks import generate_tailored_cv_task, extract_pdf_text_task
from app.middleware.auth import require_auth
from utils.cv_finder import find_similar_cvs
import logging

bp = Blueprint('cv', __name__)
logger = logging.getLogger(__name__)

@bp.route('/generate', methods=['POST'])
@require_auth
def generate_cv():
    """
    Generate tailored CV for a job application
    
    Request body:
    {
        "userId": "user-uuid",
        "jobApplicationId": "job-uuid"
    }
    
    Returns:
    {
        "taskId": "celery-task-id",
        "status": "pending"
    }
    """
    data = request.get_json()
    
    if not data or 'userId' not in data or 'jobApplicationId' not in data:
        return jsonify({"error": "Missing userId or jobApplicationId"}), 400
    
    try:
        # Trigger Celery task
        task = generate_tailored_cv_task.delay(
            user_id=data['userId'],
            job_application_id=data['jobApplicationId']
        )
        
        return jsonify({
            "taskId": task.id,
            "status": "pending"
        }), 202
    
    except Exception as e:
        logger.error(f"Failed to queue CV generation: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route('/extract-pdf', methods=['POST'])
@require_auth
def extract_pdf():
    """
    Extract text from PDF CV
    
    Expects multipart/form-data with 'file' field
    
    Returns:
    {
        "taskId": "celery-task-id"
    }
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files allowed"}), 400
    
    try:
        # Read file bytes
        pdf_bytes = file.read()
        user_id = request.form.get('userId')
        
        if not user_id:
            return jsonify({"error": "Missing userId"}), 400
        
        # Trigger extraction task
        task = extract_pdf_text_task.delay(
            user_id=user_id,
            pdf_bytes=pdf_bytes
        )
        
        return jsonify({
            "taskId": task.id,
            "status": "pending"
        }), 202
    
    except Exception as e:
        logger.error(f"Failed to extract PDF: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route('/similar/<job_application_id>', methods=['GET'])
@require_auth
def get_similar_cvs(job_application_id):
    """
    Get similar existing CVs that might be reusable
    
    Returns:
    {
        "similar": [
            {
                "id": "doc-uuid",
                "name": "CV_Google.pdf",
                "for_company": "Google",
                "for_position": "Software Engineer",
                "match_score": 0.75,
                "created_at": "2024-01-01"
            }
        ]
    }
    """
    import psycopg2
    
    try:
        conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Get target job position and userId
        cursor.execute("""
            SELECT position, "userId" FROM "JobApplication" WHERE id = %s
        """, (job_application_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"similar": []}), 200
        
        position, user_id = row
        
        # Find similar CVs
        similar = find_similar_cvs(user_id, position, job_application_id)
        
        return jsonify({"similar": similar}), 200
    
    except Exception as e:
        logger.error(f"Failed to find similar CVs: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route('/task/<task_id>', methods=['GET'])
@require_auth
def get_task_status(task_id):
    """
    Get status of a CV generation task
    
    Returns:
    {
        "taskId": "...",
        "status": "pending|processing|completed|failed",
        "progress": 0-100,
        "result": {...} (if completed),
        "error": "..." (if failed)
    }
    """
    from tasks.celery_config import celery_app
    
    task = celery_app.AsyncResult(task_id)
    
    response = {
        "taskId": task_id,
        "status": task.state.lower()
    }
    
    if task.state == 'PENDING':
        response["progress"] = 0
    elif task.state == 'PROGRESS':
        response["progress"] = task.info.get('progress', 0)
        response["message"] = task.info.get('status', '')
    elif task.state == 'SUCCESS':
        response["progress"] = 100
        response["result"] = task.result
    elif task.state == 'FAILURE':
        response["error"] = str(task.info)
    
    return jsonify(response), 200
