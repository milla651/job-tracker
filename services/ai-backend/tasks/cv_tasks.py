"""CV generation Celery tasks"""
from tasks.celery_config import celery_app
from utils.ollama_client import OllamaClient
from utils.pdf_renderer import render_cv_to_pdf
from utils.pdf_parser import extract_text_from_pdf
from prompts.tailor_cv import build_cv_tailoring_prompt
import psycopg2
import os
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def generate_tailored_cv_task(self, user_id: str, job_application_id: str):
    """
    Generate tailored CV using Ollama (40-60 seconds)
    
    Args:
        user_id: User UUID
        job_application_id: Job application UUID
    
    Returns:
        {
            "status": "success",
            "document_id": "uuid",
            "file_name": "CV_Company.pdf"
        }
    """
    try:
        # Update progress
        self.update_state(
            state='PROGRESS',
            meta={'progress': 10, 'status': 'Fetching user data...'}
        )
        
        # 1. Connect to database
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Get user profile
        cursor.execute("""
            SELECT headline, "primaryRoles", seniority, "baseCvContent",
                   "superpower1", "superpower2", "superpower3", location
            FROM "UserProfile" WHERE "userId" = %s
        """, (user_id,))
        profile_row = cursor.fetchone()
        
        if not profile_row:
            raise ValueError("User profile not found")
        
        profile = {
            'headline': profile_row[0],
            'primaryRoles': profile_row[1],
            'seniority': profile_row[2],
            'baseCvContent': profile_row[3],
            'superpower1': profile_row[4],
            'superpower2': profile_row[5],
            'superpower3': profile_row[6],
            'location': profile_row[7]
        }
        
        # Get work experience
        cursor.execute("""
            SELECT company, title, location, "startDate", "endDate", "isCurrent",
                   description, achievements, technologies
            FROM "WorkExperience" 
            WHERE "userId" = %s 
            ORDER BY "order", "startDate" DESC
        """, (user_id,))
        work_exp = cursor.fetchall()
        
        # Get education
        cursor.execute("""
            SELECT institution, degree, field, "startDate", "endDate", gpa, honors
            FROM "Education" 
            WHERE "userId" = %s 
            ORDER BY "order", "endDate" DESC NULLS LAST
        """, (user_id,))
        education = cursor.fetchall()
        
        # Get skills
        cursor.execute("""
            SELECT name, category, proficiency, "yearsOfExperience"
            FROM "Skill" 
            WHERE "userId" = %s 
            ORDER BY "order", category
        """, (user_id,))
        skills = cursor.fetchall()
        
        # Get projects
        cursor.execute("""
            SELECT name, description, technologies, url, highlights
            FROM "Project" 
            WHERE "userId" = %s 
            ORDER BY "order", "startDate" DESC NULLS LAST
        """, (user_id,))
        projects = cursor.fetchall()
        
        # Get job description
        cursor.execute("""
            SELECT company, position, description, location
            FROM "JobApplication" 
            WHERE id = %s
        """, (job_application_id,))
        job_row = cursor.fetchone()
        
        if not job_row:
            raise ValueError("Job application not found")
        
        job_data = {
            'company': job_row[0],
            'position': job_row[1],
            'description': job_row[2],
            'location': job_row[3]
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'progress': 30, 'status': 'Generating tailored content with AI...'}
        )
        
        # 2. Build prompt
        prompt = build_cv_tailoring_prompt(profile, work_exp, education, skills, projects, job_data)
        
        # 3. Call Ollama (this takes 40-60 seconds)
        ollama = OllamaClient()
        model = os.getenv("CV_GENERATION_MODEL", "gemma3")
        
        tailored_content = ollama.generate(
            prompt=prompt,
            model=model,
            temperature=0.7,
            max_tokens=3000
        )
        
        self.update_state(
            state='PROGRESS',
            meta={'progress': 70, 'status': 'Rendering PDF...'}
        )
        
        # 4. Render to PDF
        pdf_bytes = render_cv_to_pdf(
            content=tailored_content,
            profile=profile,
            template="classic"
        )
        
        self.update_state(
            state='PROGRESS',
            meta={'progress': 90, 'status': 'Saving document...'}
        )
        
        # 5. Save PDF to filesystem
        import uuid
        from datetime import datetime
        
        # Create directory structure: /var/careeros/cvs/{userId}/
        base_dir = os.getenv("CV_STORAGE_PATH", "/tmp/careeros/cvs")
        user_dir = os.path.join(base_dir, user_id)
        os.makedirs(user_dir, exist_ok=True)
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_company = job_data['company'].replace(' ', '_').replace('/', '_')
        file_name = f"CV_{safe_company}_{timestamp}.pdf"
        file_path = os.path.join(user_dir, file_name)
        
        # Write PDF to disk
        with open(file_path, 'wb') as f:
            f.write(pdf_bytes)
        
        logger.info(f"Saved CV to: {file_path}")
        
        # 6. Store metadata in Document table (with file path, not content)
        cursor.execute("""
            INSERT INTO "Document" (id, name, "mediaType", content, size, "jobApplicationId", "createdAt")
            VALUES (gen_random_uuid()::text, %s, 'application/pdf', %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id
        """, (
            file_name,
            file_path.encode('utf-8'),  # Store file path as bytes (for compatibility)
            len(pdf_bytes),
            job_application_id
        ))
        document_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully generated CV for job {job_application_id}")
        
        return {
            "status": "success",
            "document_id": document_id,
            "file_name": file_name
        }
    
    except Exception as e:
        logger.error(f"CV generation failed: {e}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@celery_app.task(bind=True, max_retries=2)
def extract_pdf_text_task(self, user_id: str, pdf_bytes: bytes):
    """
    Extract text from PDF CV and store in user profile
    
    Args:
        user_id: User UUID
        pdf_bytes: PDF file bytes
    
    Returns:
        {
            "status": "success",
            "text_length": int
        }
    """
    try:
        # Extract text
        text = extract_text_from_pdf(pdf_bytes)
        
        # Update user profile
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE "UserProfile" 
            SET "baseCvContent" = %s, "updatedAt" = CURRENT_TIMESTAMP
            WHERE "userId" = %s
        """, (text, user_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully extracted {len(text)} chars from PDF for user {user_id}")
        
        return {
            "status": "success",
            "text_length": len(text)
        }
    
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise self.retry(exc=e, countdown=30)
