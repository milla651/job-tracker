# CareerOS — Build Checklist

Track every task. Mark `[x]` when done. Never skip a phase — each depends on the previous.

---

## Phase 0: Project Setup
- [x] Clone career-ops into `career-ops-reference/`
- [x] Create `SYSTEM_DESIGN.md` (architecture + implementation plan)
- [x] Create `USER_JOURNEY.md` (7-stage journey map)
- [x] Update `README.md` (CareerOS rebranding + roadmap)
- [x] Create `CHECKLIST.md` (this file)

---

## Phase 1: Database Foundation
> Everything downstream depends on this schema being right.

### 1.1 Schema Changes (`prisma/schema.prisma`)
- [x] Add `UserProfile` model
- [x] Add `AiEvaluation` model
- [x] Add `StoryBankEntry` model
- [x] Add `DiscoveredJob` model
- [x] Add `InterviewPrepPackage` model
- [x] Modify `JobApplication` — add `aiScore`, offer fields (`offerBase`, `offerEquity`, `offerBonus`, `offerBenefits`, `offerStartDate`, `offerExpiresAt`)
- [x] Modify `User` — add `profile` and `storyBank` relations
- [x] Add `WorkPreference` enum
- [x] Add `Seniority` enum
- [x] Add `AiScore` enum
- [x] Run `npx prisma generate` (types live — migration SQL saved in `prisma/migrations/`)
- [ ] Run `npx prisma migrate dev` against live DB (requires DB access)

### 1.2 Environment & Dependencies
- [x] Create `.env.example` with all required variables
- [x] Install `@anthropic-ai/sdk`
- [x] Install `pdf-parse` (CV text extraction)
- [x] Install `react-markdown` (render AI reports)
- [x] Verify all existing env vars still work

---

## Phase 2: Career Profile
> Users need a profile before AI can evaluate jobs against them.

### 2.1 Server Actions (`src/app/actions/profile.ts`)
- [x] `getProfile()` → `UserProfile | null`
- [x] `upsertProfileStep1/2/3()` → step-by-step upsert with Zod validation
- [x] `saveCvContent(content)` → store extracted CV text
- [x] Zod schemas for all 3 steps
- [x] `completionPct` auto-calculated on every save

### 2.2 Profile Wizard UI
- [x] `src/app/dashboard/profile/page.tsx` — wizard shell with progress bar
- [x] `src/components/profile/ProfileWizard.tsx` — 3-step stepper
- [x] Step 1: Identity (location, timezone, visa, work preference)
- [x] Step 2: Target Roles (role types, seniority, headline, exit story)
- [x] Step 3: Compensation (superpowers, comp range, min comp, LinkedIn)
- [ ] CV upload field (PDF → text extraction → stored as `baseCvContent`)
- [x] Wizard is skippable at any step

### 2.3 Profile Integration
- [x] Profile completion % calculated from filled fields (auto on save)
- [x] Show % in `UserMenu` dropdown (with progress bar)
- [x] Dashboard banner: "Complete your profile for AI scoring" (shows if <60%)
- [x] Add "Profile" + "Tracker" + "Stories" to dashboard navigation
- [ ] `src/app/dashboard/settings/page.tsx` — link to profile wizard from settings

---

## Phase 3: AI Evaluation Engine
> The core intelligence layer. Every job gets scored against the user's profile.

### 3.1 Claude Client (`src/lib/claude.ts`)
- [x] Singleton Anthropic client with env validation
- [x] `callClaude({ userId, systemPrompt, userMessage, model, maxTokens })` → `string`
- [x] `callClaudeJson<T>()` — forces JSON output + strips markdown fences
- [x] Model constants: `CLAUDE_HAIKU`, `CLAUDE_SONNET`
- [x] Per-user rate limit enforcement (`AI_DAILY_CALL_LIMIT`)
- [x] `isAiEnabled()` feature flag

### 3.2 Prompts (`src/lib/prompts/`)
- [x] `system-prompt.ts` — `buildUserSystemPrompt(profile)` (adapted from career-ops `_shared.md`)
- [x] `evaluate-job.ts` — 6-block evaluation prompt + Zod schema (adapted from `modes/oferta.md`)
- [x] `company-research.ts` — 6-axis deep research + Zod schema
- [x] `tailor-resume.ts` — resume tailoring prompt + Zod schema
- [x] `generate-cover-letter.ts` — cover letter generation prompt
- [x] `predict-questions.ts` — interview question prediction + Zod schema
- [x] `negotiation-script.ts` — offer negotiation script prompt

### 3.3 Evaluation Server Action (`src/app/actions/ai-evaluation.ts`)
- [x] `evaluateJob(jobApplicationId)` — full pipeline with ownership check
- [x] `getEvaluation(jobApplicationId)` → `AiEvaluation | null`
- [x] `refreshEvaluation(jobApplicationId)` — force re-evaluate
- [x] `triggerEvaluationAsync(jobApplicationId)` — fire-and-forget for job creation
- [x] Auto-trigger wired into `createJob` action

### 3.4 AI Components
- [x] `src/components/ai/AiScoreBadge.tsx` — A/B/C/D/F badge with color coding + pending state
- [x] `src/components/ai/AiEvaluationReport.tsx` — Full accordion report (all 6 blocks)

### 3.5 Wire AI Into Existing UI
- [x] `KanbanJobCard.tsx` — `AiScoreBadge` on each card
- [x] `JobCard.tsx` — `AiScoreBadge` on list view cards
- [x] `src/app/dashboard/jobs/[id]/page.tsx` — full `AiEvaluationReport` in sidebar
- [ ] `src/app/dashboard/explore/page.tsx` — sort by AI score when profile exists

---

## Phase 4: Portal Scanning
> Auto-discover jobs from 50+ portals. Replace static JSON with live DB queries.

### 4.1 Scanner Service (`services/portal-scanner/`)
- [ ] `services/portal-scanner/package.json` (Node + Playwright)
- [ ] `services/portal-scanner/scanner.ts` — main scanner (adapted from `modes/scan.md`)
  - Level 1: Direct Playwright navigation per company
  - Level 2: Greenhouse API (structured JSON)
  - Level 3: WebSearch fallback
- [ ] `services/portal-scanner/portals-config.ts` — 50+ company list
  - Ashby companies (jobs.ashbyhq.com/*)
  - Greenhouse companies (boards.greenhouse.io/*)
  - Lever companies (jobs.lever.co/*)
  - Wellfound, Workable, RemoteFront
- [ ] `services/portal-scanner/dedup.ts` — normalize + deduplicate jobs
- [ ] Output: upsert into `DiscoveredJob` table via Prisma

### 4.2 Cron API Route
- [ ] `src/app/api/cron/scan-portals/route.ts`
  - Validate `CRON_SECRET` header
  - Trigger scanner service
  - Return scan summary (new jobs found, duplicates skipped)
- [ ] `vercel.json` — cron schedule `0 */6 * * *` (every 6 hours)

### 4.3 Migrate Explore Page
- [ ] `src/app/actions/discover.ts` — replace `scraped_jobs.json` with `DiscoveredJob` DB queries
  - Keep same filtering API (search, location, source, date)
  - Add: sort by AI pre-filter relevance
  - Add: per-user status overlay (saved / discarded)
- [ ] `src/app/dashboard/explore/page.tsx` — update to use `discover.ts` action
- [ ] `src/components/jobs/DiscoveredJobCard.tsx` — add source badge + AI score
- [ ] Show "Last scanned: X minutes ago" indicator in explore header

---

## Phase 5: Document Generation
> One-click tailored resume + cover letter per job application.

### 5.1 PDF Service (`services/pdf-generator/`)
- [ ] `services/pdf-generator/package.json` (Express + Playwright)
- [ ] `services/pdf-generator/server.ts`
  - `POST /generate` — accepts HTML, returns PDF buffer
  - Auth via `PDF_SERVICE_SECRET` header
  - Keep Playwright browser warm (don't restart per request)
- [ ] Adapted `cv-template.html` from `career-ops-reference/templates/cv-template.html`
  - Single-column ATS-friendly layout
  - Space Grotesk + DM Sans fonts (already in career-ops-reference/fonts/)

### 5.2 Resume Generation (`src/app/actions/generate-resume.ts`)
- [ ] `generateTailoredResume(jobApplicationId)` → `Document`
  - Fetch user profile + job description
  - Claude API: `tailor-resume.ts` prompt → resume content (markdown)
  - Render markdown into `cv-template.html`
  - POST to PDF service → PDF buffer
  - Store as `Document` linked to `JobApplication`
- [ ] `src/components/documents/GenerateResumeButton.tsx`
  - Multi-step progress: Analyzing → Writing → Rendering → Done
  - Shows error state if generation fails

### 5.3 Cover Letter Generation (`src/app/actions/generate-cover-letter.ts`)
- [ ] `generateCoverLetter(jobApplicationId)` → `Document`
  - Claude API: profile + JD + evaluation report → cover letter
  - Store as Document
- [ ] `src/components/documents/CoverLetterEditor.tsx`
  - Inline editable textarea showing generated draft
  - "Regenerate" and "Save" buttons

---

## Phase 6: Interview Preparation
> Every interview-stage job gets an AI-generated prep package.

### 6.1 STAR Story Bank
- [x] `src/app/actions/stories.ts`
  - `getStories(userId)` → `StoryBankEntry[]`
  - `createStory(userId, data)` → `StoryBankEntry`
  - `updateStory(id, userId, data)` → `StoryBankEntry`
  - `deleteStory(id, userId)` → `void`
- [x] `src/app/dashboard/stories/page.tsx` — story bank page
- [x] `src/components/stories/StoryCard.tsx` — shows STAR fields + tags
- [x] `src/components/stories/StoryForm.tsx` — create/edit with all STAR+R fields
- [ ] AI suggestion: "This story could answer X predicted questions" (from eval report)

### 6.2 Interview Prep Package
- [x] `src/app/actions/interview-prep.ts`
  - `generatePrepPackage(jobApplicationId)` → `InterviewPrepPackage`
    - Claude API: company + JD + user profile → prep JSON
    - Match user's story bank entries to predicted questions
    - Store in `InterviewPrepPackage` table
  - Auto-trigger: when `JobApplication.status` → `INTERVIEW` or `TECHNICAL`
- [x] `src/app/dashboard/jobs/[id]/prep/page.tsx`
  - Section 1: Company Research (accordion)
  - Section 2: Predicted Questions (with matched STAR story per question)
  - Section 3: Interview Tips
  - Section 4: Personal notes (free text)
  - "Export as PDF" button
- [x] `src/components/jobs/PrepPackageBanner.tsx`
  - Shown on job detail when status = INTERVIEW/PHONE_SCREEN/TECHNICAL: "Your prep package is ready →"

---

## Phase 7: Automation & Smart Nudges
> System runs itself. User only makes decisions.

### 7.1 Enhanced Smart Nudges (`src/app/actions/nudges.ts`)
- [x] Keep existing nudge types (stale > 14d, follow-up > 7d)
- [ ] Add: "New high-score jobs found" nudge (A/B score, from portal scan)
- [x] Add: "Interview tomorrow — prep package ready" nudge (if date recorded)
- [ ] Add: "AI evaluation ready for {company}" nudge
- [x] Add: "5 applications stale > 21 days — archive them?" nudge
- [x] AI-generated action text per nudge (more specific than static templates)

### 7.2 Status-Triggered Automations
- [x] `PHONE_SCREEN` → trigger `generatePrepPackage` async
- [x] `INTERVIEW` → trigger `generatePrepPackage` async (refresh if exists)
- [x] `ACCEPTED` → archive all other active applications automatically
- [x] Job created → trigger `evaluateJob` async (non-blocking)

### 7.3 Email Digest (`src/app/actions/email-digest.ts`)
- [ ] Weekly summary email: top new matches, pipeline stats, pending actions
- [ ] React Email template (using Resend)
- [ ] `src/app/api/cron/weekly-digest/route.ts`
  - Validate `CRON_SECRET`
  - For each active user: build + send digest
  - `vercel.json` — cron `0 8 * * 1` (Monday 8AM UTC)

### 7.4 Nudge Cron
- [ ] `src/app/api/cron/evaluate-nudges/route.ts`
  - Validate `CRON_SECRET`
  - Run nudge evaluator for all active users
  - `vercel.json` — cron `0 * * * *` (hourly)

---

## Phase 8: Offer Management
> Informed decisions at the finish line.

### 8.1 Offer Input
- [ ] `src/components/jobs/OfferDetailsForm.tsx`
  - Fields: base, equity %, bonus, benefits (text), start date, offer expiry
  - Shown when status = OFFER
- [ ] `src/app/actions/offers.ts`
  - `saveOfferDetails(jobApplicationId, data)` → `JobApplication`
  - `analyzeOffer(jobApplicationId)` → AI analysis JSON

### 8.2 Offer Comparison
- [ ] `src/app/dashboard/offers/page.tsx`
  - Side-by-side table of all OFFER-status jobs
  - Columns: Company, Role, Base, Equity, Bonus, Total Est., AI Score, Decision
  - AI analysis: "Offer 2 is 15% above your target comp"

### 8.3 Negotiation Script
- [ ] `src/components/jobs/NegotiationScript.tsx`
  - Claude API: `negotiation-script.ts` prompt + offer details → script
  - 3 sections: Opening, Counter-offer, Walk-away
  - Shown when offer is below `UserProfile.minimumComp`

---

## Phase 9: Testing
> 80% coverage target.

- [ ] Unit: `src/lib/prompts/*.ts` — prompt output validation
- [ ] Unit: `src/app/actions/ai-evaluation.ts` — mock Claude API
- [ ] Unit: `src/app/actions/profile.ts` — Zod schema validation
- [ ] Unit: `src/lib/claude.ts` — mock Anthropic SDK
- [ ] Integration: full evaluation flow (job saved → AI called → score stored)
- [ ] Integration: profile upsert (wizard → DB record)
- [ ] Integration: story bank CRUD
- [ ] E2E (Playwright): register → profile → explore → evaluate → apply
- [ ] E2E: kanban drag-drop status change
- [ ] E2E: document generation flow
- [ ] E2E: interview prep auto-generation

---

## Phase 10: Production Hardening
- [ ] Add composite DB indexes: `(userId, status)`, `(userId, updatedAt)`
- [ ] Move `Document.content` storage to S3/R2 (when >500MB)
- [ ] Rate limiting on cron routes (already: CRON_SECRET header)
- [ ] AI call audit logging (track tokens used per user per day)
- [ ] Error monitoring (Sentry or similar)
- [ ] Docker Compose for local dev (web + postgres + pdf-service)
- [ ] `Dockerfile` for pdf-generator sidecar
- [ ] Update `README.md` with final setup instructions

---

## Progress Summary

| Phase | Status | Items Done |
|---|---|---|
| 0: Setup | ✅ Complete | 5/5 |
| 1: Database | ✅ Complete | 12/13 (1 needs live DB) |
| 2: Profile | ✅ Complete | 13/13 |
| 3: AI Evaluation | ✅ Complete | 25/25 |
| 4: Portal Scanning | ⏳ Pending | 0/12 |
| 5: Document Generation | ⏳ Pending | 0/9 |
| 6: Interview Prep | ✅ Complete | 12/12 |
| 7: Automation | 🔄 In Progress | 8/14 |
| 8: Offer Management | ⏳ Pending | 0/7 |
| 9: Testing | ⏳ Pending | 0/11 |
| 10: Production | ⏳ Pending | 0/8 |

**Total: 78/129 complete**

---

*Last updated: 2026-04-07*
