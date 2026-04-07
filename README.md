# CareerOS

> **Multi-user, AI-powered career operations platform.**  
> Built by merging [job-tracker](https://github.com/swiftkimani/job-tracker) (web platform) with [career-ops](https://github.com/swiftkimani/career-ops) (AI intelligence engine).

---

## What This Is

CareerOS is not just a job tracker. It is a complete career management system that:

- **Discovers** jobs automatically by scanning 50+ company portals (Greenhouse, Lever, Ashby, Wellfound, Workable)
- **Evaluates** every opportunity against your profile using Claude AI (A–F scoring across 10 dimensions)
- **Generates** tailored, ATS-optimized resumes and cover letters per job description
- **Tracks** your pipeline with a drag-and-drop kanban board, timeline events, and smart nudges
- **Prepares** you for interviews with AI-generated prep packages and a STAR story bank
- **Assists** with offer negotiation using market-aware AI analysis

**Core principle:** AI recommends. Human decides. System tracks. No application is ever submitted without your explicit approval.

---

## Architecture at a Glance

```
Web Layer (Next.js 16 + App Router)
   └── Server Actions (no separate API)
         ├── PostgreSQL via Prisma ORM
         ├── Claude API (Anthropic SDK)  ← intelligence layer
         ├── Resend (email)
         └── Playwright sidecar          ← PDF generation + portal scanning
```

Full architecture, database schema, and implementation roadmap: [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md)  
Full user journey with UX decisions: [`USER_JOURNEY.md`](./USER_JOURNEY.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript 5 |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js 5 (JWT + Credentials) |
| AI | Anthropic Claude API (`claude-sonnet-4-6` / `claude-haiku-4-5`) |
| Styling | Tailwind CSS 4 + ShadCN UI + Radix UI |
| Email | Resend |
| PDF + Scanning | Playwright (sidecar service) |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Playwright E2E |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- An [Anthropic API key](https://console.anthropic.com/)
- A [Resend API key](https://resend.com/)

### Setup

```bash
# 1. Clone this repo
git clone https://github.com/swiftkimani/job-tracker.git
cd job-tracker

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# 4. Set up the database
npx prisma migrate dev

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/careeros"

# Auth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_..."

# AI (required for evaluation, resume generation, interview prep)
ANTHROPIC_API_KEY="sk-ant-..."

# Background jobs
CRON_SECRET="generate-with: openssl rand -base64 32"

# PDF sidecar (required for resume PDF generation)
PDF_SERVICE_URL="http://localhost:3001"
PDF_SERVICE_SECRET="generate-with: openssl rand -base64 32"

# Feature flags
ENABLE_AI_EVALUATION="true"
ENABLE_PORTAL_SCANNING="true"
ENABLE_RESUME_GENERATION="true"
AI_DAILY_CALL_LIMIT="50"
```

---

## Features

### Current (job-tracker foundation)

- Multi-user authentication (email + password, JWT sessions, email verification)
- Job application CRUD with full metadata (company, role, location, salary, URL, notes)
- Kanban board with drag-and-drop status management
- Timeline events — full audit trail per application
- Document management — upload and store resumes, cover letters, offer letters
- Public job discovery — browse a curated job dataset with advanced filters
- Activity heatmap (GitHub-style) + pipeline funnel analytics
- Smart nudges — follow-up reminders for stale applications
- Dark/light theme, responsive design, glassmorphism UI

### Planned (career-ops integration)

- Career profile wizard (target roles, superpowers, compensation floor)
- AI job evaluation — A–F scores with detailed reports per job
- Tailored resume generation — Claude rewrites your CV for each JD
- Cover letter generation — personalized drafts from your profile + evaluation
- Portal scanning — auto-discover jobs from 50+ company portals every 6 hours
- STAR story bank — structured interview story library
- Interview prep packages — AI-generated per-interview briefing
- Company deep research — 6-axis analysis (AI strategy, culture, competition)
- Offer comparison + negotiation scripts
- Weekly email digest

See [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) for the full implementation plan.

---

## Implementation Roadmap

| Phase | Focus | Duration |
|---|---|---|
| 0 | Project merge + rename | 1–2 days |
| 1 | Career profile schema + wizard | 3–4 days |
| 2 | AI evaluation engine | 4–5 days |
| 3 | Portal scanning (Playwright) | 5–6 days |
| 4 | Document generation (resume + cover letter) | 3–4 days |
| 5 | Interview preparation (story bank + prep packages) | 3–4 days |
| 6 | Automation + enhanced nudges + email digest | 2–3 days |
| 7 | Offer management + comparison | 2 days |

Total estimated build: ~4 weeks for a complete v1 of the merged system.

---

## Optimization Opportunities

### Performance

| Area | Current State | Optimization |
|---|---|---|
| Job dataset | 14MB `scraped_jobs.json` in memory | Replace with `DiscoveredJob` DB table (indexed) |
| AI evaluation latency | Synchronous (blocks UI) | Queue async; show "Analyzing..." state |
| PDF generation | Playwright cold start ~2s | Keep Playwright warm; process pool |
| Bundle size | Heavy client JS | Route-level code splitting; defer AI components |
| Kanban queries | Potential N+1 on evaluations | Batch-load with Prisma `include` |

### Cost Control (Claude API)

| Strategy | Detail |
|---|---|
| Cache evaluations | Never re-evaluate unless job description changes |
| Model tiering | Haiku for bulk/fast tasks; Sonnet for quality output |
| Lazy evaluation | Only evaluate jobs user explicitly opens or saves |
| TTL-based refresh | Re-evaluate after 30 days (market data gets stale) |
| Per-user rate limit | Max 50 AI calls/day per user (configurable via env) |

### Scalability

| Layer | When to apply | Strategy |
|---|---|---|
| Database | >10k users | Add composite indexes on `(userId, status)`, `(userId, updatedAt)` |
| Document storage | >1GB stored | Move `Document.content` (bytes) to S3 or Cloudflare R2 |
| Portal scanning | >5 sources active | Distribute workers by portal type; use pg-boss queue |
| AI calls | Spiky load | Queue with pg-boss; exponential backoff on rate limits |

### Path to Full Automation

The system becomes progressively more automated as each phase ships:

```
Phase 2 (AI Evaluation):
  Every saved job gets an instant A–F score.
  User effort per job drops from 10 minutes to 30 seconds.

Phase 3 (Portal Scanning):
  New jobs surface automatically every 6 hours.
  User no longer needs to browse job boards manually.

Phase 4 (Document Generation):
  Resume and cover letter tailored per JD in one click.
  No more manually editing Word documents.

Phase 5 (Interview Prep):
  Prep package auto-generated when interview is scheduled.
  User arrives to every interview with company research + predicted Qs.

Phase 6 (Automation Engine):
  Nudges are AI-generated, context-aware, and actionable.
  Weekly digest keeps user informed without daily check-ins.
  System runs itself; user only needs to make decisions.
```

---

## Development

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run test          # Vitest unit tests
npm run test:watch    # Tests in watch mode
npm run test:coverage # Coverage report (target: 80%)
npm run prisma:studio # Browse database in Prisma Studio
npm run prisma:push   # Push schema changes (dev only)
```

---

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (all data mutations)
│   ├── api/              # API routes (auth, cron jobs)
│   ├── auth/             # Login, register, verify, reset
│   └── dashboard/        # Protected pages
│       ├── explore/      # Job discovery
│       ├── tracker/      # Kanban board
│       ├── pipeline/     # List view
│       ├── activity/     # Analytics
│       ├── jobs/         # Job detail, create, edit
│       ├── stories/      # STAR story bank (Phase 5)
│       ├── offers/       # Offer comparison (Phase 7)
│       └── profile/      # Career profile wizard (Phase 1)
├── components/
│   ├── ai/               # AI score badge, evaluation report (Phase 2)
│   ├── analytics/        # Heatmap, funnel
│   ├── dashboard/        # Kanban, nudges, job listing
│   ├── documents/        # Document manager, generation (Phase 4)
│   ├── jobs/             # Job cards, forms
│   ├── stories/          # STAR story components (Phase 5)
│   └── ui/               # ShadCN base components
├── lib/
│   ├── prompts/          # Claude prompt files (Phase 2+)
│   ├── claude.ts         # Anthropic client (Phase 2)
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client singleton
│   └── mail.ts           # Resend email service
└── types/

services/
├── portal-scanner/       # Playwright portal scanning (Phase 3)
└── pdf-generator/        # Playwright PDF generation (Phase 4)

prisma/
└── schema.prisma         # Database schema
```

---

## Contributing

1. Read [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) before opening a PR
2. Follow the implementation phases in order — Phase N depends on Phase N-1
3. Every new server action must validate authentication and ownership
4. All Claude prompts live in `src/lib/prompts/` — versioned, never inline
5. Test coverage target: 80% for new code
6. No `console.log` in production code — use proper error handling

---

## Related

- [career-ops](https://github.com/swiftkimani/career-ops) — The AI intelligence engine this project merges with
- [Anthropic Claude API docs](https://docs.anthropic.com/)
- [NextAuth.js docs](https://authjs.dev/)
- [Prisma docs](https://www.prisma.io/docs/)
- [Playwright docs](https://playwright.dev/)

---

*CareerOS — job-tracker x career-ops*
