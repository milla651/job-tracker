"""AI evaluation Celery tasks"""
from tasks.celery_config import celery_app
from utils.ollama_client import OllamaClient
from prompts.evaluate_job import build_job_evaluation_prompt
from prompts.cover_letter import build_cover_letter_prompt
import psycopg2
import os
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def evaluate_job_task(self, user_id: str, job_application_id: str):
    """
    Evaluate job using local LLM (15-25 seconds)
    
    Note: This can be integrated with existing Next.js AI evaluation
    or used as alternative when Anthropic is not available
    """
    try:
        # Get data
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Get profile
        cursor.execute("""
            SELECT headline, "primaryRoles", seniority, "targetCompMin", "targetCompMax"
            FROM "UserProfile" WHERE "userId" = %s
        """, (user_id,))
        profile = cursor.fetchone()
        
        # Get job
        cursor.execute("""
            SELECT company, position, description, "salaryMin", "salaryMax"
            FROM "JobApplication" WHERE id = %s
        """, (job_application_id,))
        job = cursor.fetchone()
        
        # Build prompt
        prompt = build_job_evaluation_prompt(profile, job)
        
        # Call Ollama with lighter model for evaluation
        ollama = OllamaClient()
        model = os.getenv("JOB_EVALUATION_MODEL", "llama3.1:8b-instruct-q4_K_M")
        
        result = ollama.generate_structured(
            prompt=prompt,
            model=model,
            temperature=0.6,
            max_tokens=2000
        )
        
        logger.info(f"Job evaluation completed for {job_application_id}")
        conn.close()
        
        return {
            "status": "success",
            "evaluation": result
        }
    
    except Exception as e:
        logger.error(f"Job evaluation failed: {e}")
        raise self.retry(exc=e, countdown=30)


@celery_app.task(bind=True, max_retries=3)
def generate_cover_letter_task(self, user_id: str, job_application_id: str):
    """
    Generate cover letter using local LLM (30-45 seconds)
    """
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Get data
        cursor.execute("""
            SELECT up.headline, up."primaryRoles", up.seniority, up."superpower1",
                   ja.company, ja.position, ja.description
            FROM "UserProfile" up
            JOIN "JobApplication" ja ON ja."userId" = up."userId"
            WHERE up."userId" = %s AND ja.id = %s
        """, (user_id, job_application_id))
        
        row = cursor.fetchone()
        if not row:
            raise ValueError("Data not found")
        
        # Build prompt
        prompt = build_cover_letter_prompt(row)
        
        # Generate
        ollama = OllamaClient()
        model = os.getenv("CV_GENERATION_MODEL", "llama3.1:8b-instruct-q8_0")
        
        cover_letter = ollama.generate(
            prompt=prompt,
            model=model,
            temperature=0.8,
            max_tokens=1500
        )
        
        # Store as Document
        cursor.execute("""
            INSERT INTO "Document" (id, name, "mediaType", content, size, "jobApplicationId", "createdAt")
            VALUES (gen_random_uuid()::text, %s, 'text/plain', %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id
        """, (
            f"Cover_Letter_{row[4]}.txt",
            cover_letter.encode('utf-8'),
            len(cover_letter.encode('utf-8')),
            job_application_id
        ))
        document_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "document_id": document_id,
            "preview": cover_letter[:200]
        }
    
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        raise self.retry(exc=e, countdown=60)
