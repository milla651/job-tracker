"""File serving endpoints"""
from flask import Blueprint, send_file, jsonify
from app.middleware.auth import require_auth
import psycopg2
import os
import logging

bp = Blueprint('files', __name__)
logger = logging.getLogger(__name__)

@bp.route('/cv/<document_id>', methods=['GET'])
@require_auth
def serve_cv(document_id):
    """
    Serve CV file by document ID
    
    Security: Validates user owns the document before serving
    """
    try:
        # Get document metadata and file path
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.name, d.content, d."mediaType", ja."userId"
            FROM "Document" d
            JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
            WHERE d.id = %s
        """, (document_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Document not found"}), 404
        
        file_name, file_path_bytes, media_type, user_id = row
        file_path = file_path_bytes.decode('utf-8')
        
        # Verify file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found on disk: {file_path}")
            return jsonify({"error": "File not found on disk"}), 404
        
        # Serve file
        return send_file(
            file_path,
            mimetype=media_type,
            as_attachment=True,
            download_name=file_name
        )
    
    except Exception as e:
        logger.error(f"Failed to serve file: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route('/cv/list/<user_id>', methods=['GET'])
@require_auth
def list_user_cvs(user_id):
    """
    List all CVs for a user
    
    Returns:
    {
        "cvs": [
            {
                "id": "doc-uuid",
                "name": "CV_Google.pdf",
                "size": 12345,
                "createdAt": "2024-01-01",
                "jobCompany": "Google",
                "jobPosition": "Software Engineer"
            }
        ]
    }
    """
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.id, d.name, d.size, d."createdAt", ja.company, ja.position
            FROM "Document" d
            JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
            WHERE ja."userId" = %s AND d."mediaType" = 'application/pdf'
            ORDER BY d."createdAt" DESC
        """, (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        cvs = [
            {
                "id": row[0],
                "name": row[1],
                "size": row[2],
                "createdAt": row[3].isoformat() if row[3] else None,
                "jobCompany": row[4],
                "jobPosition": row[5]
            }
            for row in rows
        ]
        
        return jsonify({"cvs": cvs}), 200
    
    except Exception as e:
        logger.error(f"Failed to list CVs: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route('/cv/similar/<job_application_id>', methods=['GET'])
@require_auth
def find_similar_cvs(job_application_id):
    """
    Find similar existing CVs for potential reuse
    
    Matches by job title similarity (e.g., "Software Engineer" variations)
    """
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Get current job position
        cursor.execute("""
            SELECT position, "userId" FROM "JobApplication" WHERE id = %s
        """, (job_application_id,))
        
        row = cursor.fetchone()
        if not row:
            return jsonify({"similar": []}), 200
        
        target_position, user_id = row
        
        # Find similar CVs (simple keyword matching - can be improved)
        keywords = target_position.lower().split()[:3]  # First 3 words
        
        cursor.execute("""
            SELECT DISTINCT d.id, d.name, ja.company, ja.position, d."createdAt"
            FROM "Document" d
            JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
            WHERE ja."userId" = %s 
              AND d."mediaType" = 'application/pdf'
              AND ja.id != %s
              AND (
                LOWER(ja.position) LIKE %s
                OR LOWER(ja.position) LIKE %s
                OR LOWER(ja.position) LIKE %s
              )
            ORDER BY d."createdAt" DESC
            LIMIT 5
        """, (
            user_id,
            job_application_id,
            f"%{keywords[0] if len(keywords) > 0 else ''}%",
            f"%{keywords[1] if len(keywords) > 1 else ''}%",
            f"%{keywords[2] if len(keywords) > 2 else ''}%"
        ))
        
        rows = cursor.fetchall()
        conn.close()
        
        similar = [
            {
                "id": row[0],
                "name": row[1],
                "forCompany": row[2],
                "forPosition": row[3],
                "createdAt": row[4].isoformat() if row[4] else None
            }
            for row in rows
        ]
        
        return jsonify({"similar": similar}), 200
    
    except Exception as e:
        logger.error(f"Failed to find similar CVs: {e}")
        return jsonify({"error": str(e)}), 500
