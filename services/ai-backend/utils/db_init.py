"""Database initialization utilities"""
import psycopg2
import os
import logging

logger = logging.getLogger(__name__)

CV_TABLES_SQL = """
-- Auto-create CV data tables on startup
-- Safe to run multiple times (IF NOT EXISTS)

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS job_tracker;

-- Set search path to job_tracker schema
SET search_path TO job_tracker;

-- Work Experience table
CREATE TABLE IF NOT EXISTS "WorkExperience" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "company" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "location" TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "isCurrent" BOOLEAN DEFAULT false,
  "description" TEXT,
  "achievements" TEXT[] DEFAULT '{}',
  "technologies" TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "WorkExperience_userId_idx" ON "WorkExperience"("userId");
CREATE INDEX IF NOT EXISTS "WorkExperience_userId_order_idx" ON "WorkExperience"("userId", "order");

-- Education table
CREATE TABLE IF NOT EXISTS "Education" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "institution" TEXT NOT NULL,
  "degree" TEXT NOT NULL,
  "field" TEXT,
  "startDate" DATE,
  "endDate" DATE,
  "gpa" TEXT,
  "honors" TEXT[] DEFAULT '{}',
  "activities" TEXT,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Education_userId_idx" ON "Education"("userId");
CREATE INDEX IF NOT EXISTS "Education_userId_order_idx" ON "Education"("userId", "order");

-- Skill table
CREATE TABLE IF NOT EXISTS "Skill" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "proficiency" TEXT,
  "yearsOfExperience" INTEGER,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Skill_userId_idx" ON "Skill"("userId");
CREATE INDEX IF NOT EXISTS "Skill_userId_category_idx" ON "Skill"("userId", "category");

-- Project table
CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "technologies" TEXT[] DEFAULT '{}',
  "url" TEXT,
  "githubUrl" TEXT,
  "startDate" DATE,
  "endDate" DATE,
  "highlights" TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");

-- Async task tracking table
CREATE TABLE IF NOT EXISTS "AsyncTask" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "progress" INTEGER DEFAULT 0,
  "result" JSONB,
  "error" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "AsyncTask_userId_status_idx" ON "AsyncTask"("userId", "status");
CREATE INDEX IF NOT EXISTS "AsyncTask_type_status_idx" ON "AsyncTask"("type", "status");
"""

def init_cv_tables():
    """
    Initialize CV-related tables on application startup
    Safe to call multiple times - uses IF NOT EXISTS
    """
    try:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            logger.warning("DATABASE_URL not set - skipping auto-migration")
            return False
        
        logger.info("Initializing CV tables...")
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Execute migration SQL
        cursor.execute(CV_TABLES_SQL)
        conn.commit()
        conn.close()
        
        logger.info("✅ CV tables initialized successfully")
        return True
    
    except Exception as e:
        logger.error(f"Failed to initialize CV tables: {e}")
        logger.error("You may need to run migration manually:")
        logger.error("  psql \"$DATABASE_URL\" -f db/migrations/0005_cv_data_models.sql")
        return False
