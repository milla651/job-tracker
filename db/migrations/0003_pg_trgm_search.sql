-- Faster ILIKE / similarity on company & position for job search filters.
-- Apply after schema: psql "$DATABASE_URL" -f db/migrations/0003_pg_trgm_search.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "JobApplication_company_trgm_idx"
  ON "JobApplication" USING gin ("company" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "JobApplication_position_trgm_idx"
  ON "JobApplication" USING gin ("position" gin_trgm_ops);
