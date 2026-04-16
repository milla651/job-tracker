# Job Tracker — Architecture & Overview

This document describes the technology stack, data flow, and performance-oriented patterns used in the app.

## Project overview

The **Job Tracker** (CareerOS) helps users organize and track job applications with a dashboard, pipeline views, documents, STAR stories, AI evaluation, and interview prep.

### Core data flow

1. **Authentication** — NextAuth (credentials + JWT sessions). User and token rows live in PostgreSQL.
2. **Job management** — Server Actions perform CRUD; reads use explicit SQL modules where hot paths matter.
3. **Caching** — Dashboard summary data is wrapped in `unstable_cache` with a per-user tag; mutations call `revalidateUserCache(userId)` so tagged cache stays coherent.
4. **Persistence** — PostgreSQL. Schema and migrations live under `db/` (SQL files, no ORM).

---

## Technology stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 16** (App Router, React Server Components) |
| UI | **React 19**, **Tailwind CSS**, **Radix** primitives |
| Auth | **NextAuth v5** (beta) |
| Database | **PostgreSQL** via **`pg`** connection pool |
| Types | Shared domain types in `src/lib/db-types.ts` (not code-generated) |

---

## Folder structure (high level)

```
src/
├── app/
│   ├── actions/          # Server Actions (mutations, orchestration)
│   ├── dashboard/        # Authenticated app routes
│   └── api/              # Route handlers (auth, utilities)
├── components/           # React components
├── lib/
│   ├── db.ts             # pg Pool, query helper, withTransaction, table helpers
│   ├── queries/          # Explicit SQL for hot paths (jobs, nudges)
│   ├── db-types.ts       # Shared TS types / enums
│   ├── cache-tags.ts     # user cache tags + revalidateUserCache
│   └── observability.ts  # Dev timing helpers
db/
├── schema.sql            # Full canonical schema
└── migrations/           # Ordered SQL migrations
```

---

## Database layer

- **`src/lib/db.ts`** — `Pool` with configurable env (`PG_POOL_MAX`, `PG_IDLE_TIMEOUT_MS`, `PG_CONNECTION_TIMEOUT_MS`). Exports:
  - `query(sql, params, client?)` — parameterized queries only.
  - `withTransaction(fn)` — real `BEGIN` / `COMMIT` / `ROLLBACK` for multi-statement writes.
  - `db.*` — lightweight helpers for simple CRUD; **not** a full ORM.
- **`src/lib/queries/jobs.ts`** — Explicit SQL for:
  - Paginated job list + total count in **one** round-trip.
  - Job detail with timeline + AI evaluation in **one** round-trip (JSON subselects).
  - Atomic status change + timeline insert in a **transaction**.
- **`src/lib/queries/nudges.ts`** — Nudge candidates with `InterviewPrepPackage` joined (avoids N+1).

**`db.$transaction([...])`** remains **parallel `Promise.all`** for independent reads only. Multi-step writes use `withTransaction`.

---

## Caching

- **Dashboard** (`app/dashboard/page.tsx`) loads summary data through `unstable_cache`, keyed by `['dashboard', userId]`, tagged with `user:${userId}`, `revalidate: 60`.
- Server Actions that change user-visible aggregates call **`revalidateUserCache(userId)`** (wraps `revalidateTag(..., "max")` per Next.js 16) alongside `revalidatePath`.

---

## Search performance

Migration **`0003_pg_trgm_search.sql`** enables `pg_trgm` and GIN indexes on `JobApplication.company` and `JobApplication.position` to speed up typical `ILIKE '%term%'` filters used in the job list.

---

## Operational notes

- **Background AI** — Evaluation and prep generation are triggered asynchronously from actions; production deployments may later add a queue (Redis / worker) for retries and isolation.
- **Observability** — `timed()` in `src/lib/observability.ts` logs slow queries in development.

---

## Feature map

- **Dashboard** — Recent jobs, pipeline counts, nudges, profile completion.
- **Pipeline / Kanban** — Status-driven views with filtering.
- **Job detail** — Timeline, documents, AI report, prep package.
- **Stories & profile** — User narrative and CV content for AI prompts.

---

## Roadmap ideas

- Queue-based AI jobs with retries and rate limits.
- Full-text search (`tsvector`) if search grows beyond substring filters.
- OpenTelemetry traces from Server Actions to PostgreSQL.
