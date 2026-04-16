-- Historical migration kept for compatibility with previous rollout.
ALTER TABLE "UserProfile"
  ADD COLUMN IF NOT EXISTS "emailNudgesEnabled" BOOLEAN NOT NULL DEFAULT true;
