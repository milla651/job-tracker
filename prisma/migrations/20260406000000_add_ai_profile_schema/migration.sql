-- CareerOS Migration: Add AI, Profile, Story Bank, Discovered Jobs, Interview Prep
-- Run this against your Prisma Postgres instance when network is available.
-- Or run: npx prisma migrate dev --name add_ai_profile_schema

-- New Enums
CREATE TYPE "WorkPreference" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "Seniority" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL');
CREATE TYPE "AiScore" AS ENUM ('A', 'B', 'C', 'D', 'F');

-- Extend JobApplication
ALTER TABLE "JobApplication"
  ADD COLUMN "aiScore" "AiScore",
  ADD COLUMN "offerBase" INTEGER,
  ADD COLUMN "offerEquity" TEXT,
  ADD COLUMN "offerBonus" INTEGER,
  ADD COLUMN "offerBenefits" TEXT,
  ADD COLUMN "offerStartDate" TIMESTAMP(3),
  ADD COLUMN "offerExpiresAt" TIMESTAMP(3);

-- New composite indexes on JobApplication
CREATE INDEX "JobApplication_userId_status_idx" ON "JobApplication"("userId", "status");
CREATE INDEX "JobApplication_userId_updatedAt_idx" ON "JobApplication"("userId", "updatedAt");

-- UserProfile
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT,
    "timezone" TEXT,
    "visaSponsorship" BOOLEAN NOT NULL DEFAULT false,
    "workPreference" "WorkPreference" NOT NULL DEFAULT 'HYBRID',
    "primaryRoles" TEXT[],
    "seniority" "Seniority" NOT NULL DEFAULT 'MID',
    "archetypes" TEXT[],
    "headline" TEXT,
    "exitStory" TEXT,
    "superpower1" TEXT,
    "superpower2" TEXT,
    "superpower3" TEXT,
    "proofPoints" JSONB,
    "targetCompMin" INTEGER,
    "targetCompMax" INTEGER,
    "minimumComp" INTEGER,
    "compCurrency" TEXT NOT NULL DEFAULT 'USD',
    "linkedInUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "twitterUrl" TEXT,
    "baseCvContent" TEXT,
    "wizardCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AiEvaluation
CREATE TABLE "AiEvaluation" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "score" "AiScore" NOT NULL,
    "scoreNumeric" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "cvMatchPercent" INTEGER,
    "keyGaps" TEXT[],
    "keyStrengths" TEXT[],
    "compensationSignal" TEXT,
    "fullReport" JSONB NOT NULL,
    "companyResearch" JSONB,
    "personalizationPlan" JSONB,
    "modelUsed" TEXT NOT NULL,
    "promptVersion" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "AiEvaluation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiEvaluation_jobApplicationId_key" ON "AiEvaluation"("jobApplicationId");
CREATE INDEX "AiEvaluation_jobApplicationId_idx" ON "AiEvaluation"("jobApplicationId");
ALTER TABLE "AiEvaluation" ADD CONSTRAINT "AiEvaluation_jobApplicationId_fkey"
  FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- StoryBankEntry
CREATE TABLE "StoryBankEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "reflection" TEXT,
    "tags" TEXT[],
    "impact" TEXT,
    "usedInJobIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoryBankEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StoryBankEntry_userId_idx" ON "StoryBankEntry"("userId");
ALTER TABLE "StoryBankEntry" ADD CONSTRAINT "StoryBankEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DiscoveredJob
CREATE TABLE "DiscoveredJob" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "jobUrl" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "sourceSlug" TEXT,
    "postedAt" TIMESTAMP(3),
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "titleRelevanceScore" DOUBLE PRECISION,
    "rawTitleFromScan" TEXT,
    CONSTRAINT "DiscoveredJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DiscoveredJob_externalId_key" ON "DiscoveredJob"("externalId");
CREATE INDEX "DiscoveredJob_source_idx" ON "DiscoveredJob"("source");
CREATE INDEX "DiscoveredJob_discoveredAt_idx" ON "DiscoveredJob"("discoveredAt");
CREATE INDEX "DiscoveredJob_isActive_idx" ON "DiscoveredJob"("isActive");
CREATE INDEX "DiscoveredJob_isActive_discoveredAt_idx" ON "DiscoveredJob"("isActive", "discoveredAt");

-- InterviewPrepPackage
CREATE TABLE "InterviewPrepPackage" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "companyResearch" JSONB,
    "predictedQuestions" JSONB,
    "suggestedStories" JSONB,
    "prepNotes" TEXT,
    "lastExportedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewPrepPackage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InterviewPrepPackage_jobApplicationId_key" ON "InterviewPrepPackage"("jobApplicationId");
CREATE INDEX "InterviewPrepPackage_jobApplicationId_idx" ON "InterviewPrepPackage"("jobApplicationId");
ALTER TABLE "InterviewPrepPackage" ADD CONSTRAINT "InterviewPrepPackage_jobApplicationId_fkey"
  FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
