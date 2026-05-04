-- Migration: Add CV data models for tailored resume generation
-- Applied: 2026-04-24

BEGIN;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS job_tracker;

-- Set search path to job_tracker
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
  "category" TEXT NOT NULL, -- 'Language', 'Framework', 'Tool', 'Database', 'Cloud', 'Soft'
  "proficiency" TEXT, -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
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
  "type" TEXT NOT NULL, -- 'cv_generation', 'job_evaluation', 'cover_letter', 'pdf_extraction'
  "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  "progress" INTEGER DEFAULT 0, -- 0-100
  "result" JSONB,
  "error" TEXT,
  "metadata" JSONB, -- Store job_id, document_id, etc.
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "AsyncTask_userId_status_idx" ON "AsyncTask"("userId", "status");
CREATE INDEX IF NOT EXISTS "AsyncTask_type_status_idx" ON "AsyncTask"("type", "status");

COMMIT;
