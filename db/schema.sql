-- Job Tracker canonical PostgreSQL schema — idempotent, safe to re-run
-- Apply with: npm run db:init   OR   psql "$DATABASE_URL" -f db/schema.sql

BEGIN;

-- Enums: use exception handling because PostgreSQL lacks CREATE TYPE IF NOT EXISTS
DO $$ BEGIN
  CREATE TYPE "JobStatus" AS ENUM (
    'WISHLIST','APPLIED','PHONE_SCREEN','INTERVIEW','TECHNICAL',
    'OFFER','ACCEPTED','REJECTED','WITHDRAWN','DISCARDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WorkPreference" AS ENUM ('REMOTE','HYBRID','ONSITE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Seniority" AS ENUM ('JUNIOR','MID','SENIOR','STAFF','PRINCIPAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AiScore" AS ENUM ('A','B','C','D','F');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT PRIMARY KEY,
  "email"         TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "name"          TEXT,
  "password"      TEXT NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserProfile" (
  "id"                  TEXT PRIMARY KEY,
  "userId"              TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "location"            TEXT,
  "timezone"            TEXT,
  "visaSponsorship"     BOOLEAN NOT NULL DEFAULT false,
  "workPreference"      "WorkPreference" NOT NULL DEFAULT 'HYBRID',
  "primaryRoles"        TEXT[] NOT NULL DEFAULT '{}',
  "seniority"           "Seniority" NOT NULL DEFAULT 'MID',
  "archetypes"          TEXT[] NOT NULL DEFAULT '{}',
  "headline"            TEXT,
  "exitStory"           TEXT,
  "superpower1"         TEXT,
  "superpower2"         TEXT,
  "superpower3"         TEXT,
  "proofPoints"         JSONB,
  "targetCompMin"       INTEGER,
  "targetCompMax"       INTEGER,
  "minimumComp"         INTEGER,
  "compCurrency"        TEXT NOT NULL DEFAULT 'USD',
  "linkedInUrl"         TEXT,
  "githubUrl"           TEXT,
  "portfolioUrl"        TEXT,
  "twitterUrl"          TEXT,
  "baseCvContent"       TEXT,
  "emailNudgesEnabled"  BOOLEAN NOT NULL DEFAULT true,
  "wizardCompleted"     BOOLEAN NOT NULL DEFAULT false,
  "completionPct"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "JobApplication" (
  "id"             TEXT PRIMARY KEY,
  "company"        TEXT NOT NULL,
  "position"       TEXT NOT NULL,
  "location"       TEXT,
  "salaryMin"      INTEGER,
  "salaryMax"      INTEGER,
  "jobUrl"         TEXT,
  "description"    TEXT,
  "notes"          TEXT,
  "status"         "JobStatus" NOT NULL DEFAULT 'APPLIED',
  "appliedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId"         TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "aiScore"        "AiScore",
  "offerBase"      INTEGER,
  "offerEquity"    TEXT,
  "offerBonus"     INTEGER,
  "offerBenefits"  TEXT,
  "offerStartDate" TIMESTAMP(3),
  "offerExpiresAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "JobApplication_userId_idx"            ON "JobApplication" ("userId");
CREATE INDEX IF NOT EXISTS "JobApplication_status_idx"            ON "JobApplication" ("status");
CREATE INDEX IF NOT EXISTS "JobApplication_userId_status_idx"     ON "JobApplication" ("userId","status");
CREATE INDEX IF NOT EXISTS "JobApplication_userId_updatedAt_idx"  ON "JobApplication" ("userId","updatedAt");

CREATE TABLE IF NOT EXISTS "AiEvaluation" (
  "id"                  TEXT PRIMARY KEY,
  "jobApplicationId"    TEXT NOT NULL UNIQUE REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "score"               "AiScore" NOT NULL,
  "scoreNumeric"        DOUBLE PRECISION NOT NULL,
  "summary"             TEXT NOT NULL,
  "cvMatchPercent"      INTEGER,
  "keyGaps"             TEXT[] NOT NULL DEFAULT '{}',
  "keyStrengths"        TEXT[] NOT NULL DEFAULT '{}',
  "compensationSignal"  TEXT,
  "fullReport"          JSONB NOT NULL,
  "companyResearch"     JSONB,
  "personalizationPlan" JSONB,
  "modelUsed"           TEXT NOT NULL,
  "promptVersion"       INTEGER NOT NULL DEFAULT 1,
  "generatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt"           TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "AiEvaluation_jobApplicationId_idx" ON "AiEvaluation" ("jobApplicationId");

CREATE TABLE IF NOT EXISTS "StoryBankEntry" (
  "id"           TEXT PRIMARY KEY,
  "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title"        TEXT NOT NULL,
  "situation"    TEXT NOT NULL,
  "task"         TEXT NOT NULL,
  "action"       TEXT NOT NULL,
  "result"       TEXT NOT NULL,
  "reflection"   TEXT,
  "tags"         TEXT[] NOT NULL DEFAULT '{}',
  "impact"       TEXT,
  "usedInJobIds" TEXT[] NOT NULL DEFAULT '{}',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "StoryBankEntry_userId_idx" ON "StoryBankEntry" ("userId");

CREATE TABLE IF NOT EXISTS "DiscoveredJob" (
  "id"                   TEXT PRIMARY KEY,
  "externalId"           TEXT NOT NULL UNIQUE,
  "company"              TEXT NOT NULL,
  "position"             TEXT NOT NULL,
  "location"             TEXT,
  "jobUrl"               TEXT NOT NULL,
  "description"          TEXT,
  "source"               TEXT NOT NULL,
  "sourceSlug"           TEXT,
  "postedAt"             TIMESTAMP(3),
  "discoveredAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isActive"             BOOLEAN NOT NULL DEFAULT true,
  "titleRelevanceScore"  DOUBLE PRECISION,
  "rawTitleFromScan"     TEXT
);
CREATE INDEX IF NOT EXISTS "DiscoveredJob_source_idx"              ON "DiscoveredJob" ("source");
CREATE INDEX IF NOT EXISTS "DiscoveredJob_discoveredAt_idx"        ON "DiscoveredJob" ("discoveredAt");
CREATE INDEX IF NOT EXISTS "DiscoveredJob_isActive_idx"            ON "DiscoveredJob" ("isActive");
CREATE INDEX IF NOT EXISTS "DiscoveredJob_isActive_discoveredAt_idx" ON "DiscoveredJob" ("isActive","discoveredAt");

CREATE TABLE IF NOT EXISTS "InterviewPrepPackage" (
  "id"                 TEXT PRIMARY KEY,
  "jobApplicationId"   TEXT NOT NULL UNIQUE REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "companyResearch"    JSONB,
  "predictedQuestions" JSONB,
  "suggestedStories"   JSONB,
  "prepNotes"          TEXT,
  "lastExportedAt"     TIMESTAMP(3),
  "generatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "InterviewPrepPackage_jobApplicationId_idx" ON "InterviewPrepPackage" ("jobApplicationId");

CREATE TABLE IF NOT EXISTS "TimelineEvent" (
  "id"               TEXT PRIMARY KEY,
  "eventType"        TEXT NOT NULL,
  "description"      TEXT,
  "eventDate"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "jobApplicationId" TEXT NOT NULL REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "TimelineEvent_jobApplicationId_idx" ON "TimelineEvent" ("jobApplicationId");

CREATE TABLE IF NOT EXISTS "Document" (
  "id"               TEXT PRIMARY KEY,
  "name"             TEXT NOT NULL,
  "mediaType"        TEXT NOT NULL,
  "content"          BYTEA NOT NULL,
  "size"             INTEGER NOT NULL,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "jobApplicationId" TEXT NOT NULL REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Document_jobApplicationId_idx" ON "Document" ("jobApplicationId");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "id"          TEXT PRIMARY KEY,
  "email"       TEXT NOT NULL,
  "token"       TEXT NOT NULL,
  "expires"     TIMESTAMP(3) NOT NULL,
  "attempts"    INTEGER NOT NULL DEFAULT 0,
  "lastAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("email","token")
);

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id"      TEXT PRIMARY KEY,
  "email"   TEXT NOT NULL,
  "token"   TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL,
  UNIQUE ("email","token")
);

COMMIT;
