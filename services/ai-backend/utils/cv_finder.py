"""CV similarity and reuse utilities"""
import psycopg2
import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

def find_similar_cvs(user_id: str, target_position: str, current_job_id: str) -> List[Dict]:
    """
    Find existing CVs that might be reusable for a similar position
    
    Args:
        user_id: User UUID
        target_position: Job position to match against
        current_job_id: Current job ID to exclude
    
    Returns:
        List of similar CV documents with metadata
    """
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Extract keywords from target position
        keywords = target_position.lower().split()[:4]
        
        # Build dynamic LIKE clauses
        like_clauses = " OR ".join([f"LOWER(ja.position) LIKE %s" for _ in keywords])
        like_params = [f"%{kw}%" for kw in keywords]
        
        query = f"""
            SELECT DISTINCT d.id, d.name, d.content, d.size, d."createdAt",
                   ja.company, ja.position, ja.description
            FROM "Document" d
            JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
            WHERE ja."userId" = %s 
              AND d."mediaType" = 'application/pdf'
              AND ja.id != %s
              AND ({like_clauses})
            ORDER BY d."createdAt" DESC
            LIMIT 10
        """
        
        cursor.execute(query, [user_id, current_job_id] + like_params)
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            doc_id, name, file_path_bytes, size, created_at, company, position, description = row
            file_path = file_path_bytes.decode('utf-8') if file_path_bytes else None
            
            # Check if file still exists
            if file_path and os.path.exists(file_path):
                results.append({
                    "id": doc_id,
                    "name": name,
                    "file_path": file_path,
                    "size": size,
                    "created_at": created_at.isoformat() if created_at else None,
                    "for_company": company,
                    "for_position": position,
                    "match_score": calculate_match_score(target_position, position)
                })
        
        # Sort by match score
        results.sort(key=lambda x: x['match_score'], reverse=True)
        
        return results
    
    except Exception as e:
        logger.error(f"Failed to find similar CVs: {e}")
        return []


def calculate_match_score(target: str, existing: str) -> float:
    """
    Calculate similarity score between two job titles
    
    Simple implementation - can be improved with NLP
    """
    target_words = set(target.lower().split())
    existing_words = set(existing.lower().split())
    
    if not target_words or not existing_words:
        return 0.0
    
    # Jaccard similarity
    intersection = target_words & existing_words
    union = target_words | existing_words
    
    return len(intersection) / len(union) if union else 0.0


def list_user_cvs_by_position(user_id: str) -> Dict[str, List[Dict]]:
    """
    Get all user's CVs grouped by job position
    
    Useful for showing "You already have a CV for 'Software Engineer' roles"
    """
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.id, d.name, d.content, d.size, d."createdAt",
                   ja.company, ja.position
            FROM "Document" d
            JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
            WHERE ja."userId" = %s AND d."mediaType" = 'application/pdf'
            ORDER BY d."createdAt" DESC
        """, (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        # Group by position
        grouped = {}
        for row in rows:
            doc_id, name, file_path_bytes, size, created_at, company, position = row
            file_path = file_path_bytes.decode('utf-8') if file_path_bytes else None
            
            # Check file exists
            if not file_path or not os.path.exists(file_path):
                continue
            
            if position not in grouped:
                grouped[position] = []
            
            grouped[position].append({
                "id": doc_id,
                "name": name,
                "file_path": file_path,
                "size": size,
                "created_at": created_at.isoformat() if created_at else None,
                "for_company": company
            })
        
        return grouped
    
    except Exception as e:
        logger.error(f"Failed to group CVs: {e}")
        return {}
