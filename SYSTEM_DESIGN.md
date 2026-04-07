# CareerOS — Unified System Design

> Merging **job-tracker** (multi-user web platform) with **career-ops** (AI intelligence engine)  
> into a single, smart, automated career management system.

---

## Table of Contents

1. [System Vision](#1-system-vision)
2. [User Journey Map](#2-user-journey-map)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Schema Changes](#4-database-schema-changes)
5. [Feature Integration Matrix](#5-feature-integration-matrix)
6. [Implementation Phases](#6-implementation-phases)
7. [AI Integration Design](#7-ai-integration-design)
8. [Automation Engine](#8-automation-engine)
9. [Optimization Strategies](#9-optimization-strategies)
10. [Environment & Configuration](#10-environment--configuration)
11. [Security Considerations](#11-security-considerations)
12. [Testing Strategy](#12-testing-strategy)

---

## 1. System Vision

### What We Are Building

A **multi-user, AI-powered career operations platform** — not just a tracker, but an intelligent system that actively filters opportunities, generates tailored documents, prepares users for interviews, and automates repetitive job-search tasks — all within a polished, accessible web interface.

### The Two Projects, Combined

| Project | Role in Merged System | Primary Value |
|---|---|---|
| **job-tracker** | Web platform layer | Multi-user auth, PostgreSQL persistence, kanban/analytics UI |
| **career-ops** | Intelligence layer | AI evaluation engine, portal scanning, tailored document generation |

### Core Principle

> **AI recommends. Human decides. System tracks.**  
> No application is submitted without explicit user approval.  
> No data leaves the platform without user consent.

---

## 2. User Journey Map

The journey is designed around **seven lifecycle stages**. Each stage has a clear entry trigger, key actions, and a success exit condition.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAREEROS USER JOURNEY                               │
│                                                                             │
│  STAGE 1        STAGE 2        STAGE 3        STAGE 4                      │
│  ONBOARDING  →  DISCOVERY  →  EVALUATION  →  APPLICATION                   │
│                                                                             │
│  STAGE 5        STAGE 6        STAGE 7                                      │
│  TRACKING    →  INTERVIEW   →  OFFER & CLOSE                                │
│              PREPARATION                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Stage 1: Onboarding

**Trigger:** User registers for the first time.

**Goal:** Collect enough profile context for AI to make accurate evaluations immediately.

```
Register (email + password)
    │
    ▼
Email Verification (OTP)
    │
    ▼
Career Profile Wizard (3 steps, skippable — defaults to basic mode)
    │
    ├─ Step 1: Identity
    │     Name, Location, Visa status, Remote/Hybrid/Onsite preference
    │
    ├─ Step 2: Target Roles
    │     Primary role types (e.g. "Software Engineer", "Product Manager")
    │     Seniority level (Junior / Mid / Senior / Staff / Principal)
    │     Archetypes (LLMOps / Agentic / Fullstack / etc.)
    │
    └─ Step 3: Compensation & Context
          Target total comp range + currency
          Minimum walk-away threshold
          Optional: Upload current CV for AI baseline
    │
    ▼
Dashboard — Empty state with guided onboarding checklist
```

**Success exit:** Profile ≥ 60% complete OR user clicks "I'll do this later."

**Key UX decisions:**
- Profile wizard is a drawer, not a blocking modal — users can dismiss at any time
- AI features degrade gracefully with incomplete profiles (lower confidence scores shown)
- Upload CV at this stage → stored as a base document; used in all resume tailoring

---

### Stage 2: Discovery

**Trigger:** User visits `/dashboard/explore` or system pushes new matches.

**Goal:** Surface relevant, pre-filtered job opportunities without manual browsing.

```
Two Discovery Channels:

PASSIVE (Automated)                    ACTIVE (User-driven)
─────────────────────                  ──────────────────────
System scans 50+ portals               User searches explore page
  (Ashby, Greenhouse, Lever,           User manually adds a job URL
   Wellfound, Workable)                User uploads a job description
    │
    ▼
Deduplication + normalization
    │
    ▼
AI pre-filter against user profile
  (removes clearly irrelevant jobs)
    │
    ▼
"New Matches" badge in navigation
    │
    ▼
User sees curated discover feed
  (sorted by AI fit score)
```

**Key actions on each job card:**
- View AI fit score (A / B / C / D / F) with one-line reasoning
- Expand full AI evaluation report
- Save to Wishlist
- Mark as Applied
- Discard (with optional reason — feeds back to improve AI filtering)

---

### Stage 3: Evaluation

**Trigger:** User saves a job to Wishlist or pastes a new job URL.

**Goal:** Give the user a complete, structured picture of whether this job is worth pursuing.

```
Job enters the system
    │
    ▼
AI Evaluation Engine (Claude API)
    │
    ├─ Role Analysis
    │     Extract: title, level, required skills, nice-to-haves
    │     Flag: mismatches vs. user profile
    │
    ├─ CV Match Score (0–100)
    │     Keyword overlap analysis
    │     Gap analysis (skills user lacks)
    │     Seniority alignment check
    │
    ├─ Compensation Strategy
    │     Compare JD range (if given) vs. user target
    │     Market rate context
    │
    ├─ Company Research Summary
    │     AI strategy, recent news, culture signals
    │     Engineering culture indicators
    │     Competitive landscape
    │
    ├─ Personalization Plan
    │     Top 3 things to emphasize from user's background
    │     Talking points for cover letter
    │
    └─ Overall Score: A / B / C / D / F
         A = Strong match, pursue actively
         B = Good fit with minor gaps
         C = Possible stretch, needs tailoring
         D = Significant mismatch
         F = Not aligned — save time, skip
    │
    ▼
Evaluation Report stored in DB (visible in job detail page)
    │
    ▼
User decides: Apply / Wishlist / Discard
```

---

### Stage 4: Application

**Trigger:** User moves a job from Wishlist to Applied.

**Goal:** Maximize application quality with minimum user effort.

```
User clicks "Apply to this job"
    │
    ▼
Document Generation (optional — user can skip)
    │
    ├─ Tailored Resume
    │     Claude API: user's base CV + job description → ATS-optimized resume
    │     Output: single-column HTML → PDF (Playwright or html2pdf)
    │     Stored as Document in DB (linked to job application)
    │
    └─ Cover Letter Draft
          Claude API: user profile + evaluation report + JD → cover letter
          User edits in rich text editor
          Stored as Document in DB
    │
    ▼
Application Submission
    │
    ├─ Manual: User submits on company portal, confirms here
    └─ Tracked: System records "Applied" status + timestamp
    │
    ▼
Status: APPLIED
Timeline event created: "Application submitted"
Smart nudge scheduled: "Follow up in 7 days"
```

---

### Stage 5: Tracking

**Trigger:** Continuous — happens throughout the job search lifecycle.

**Goal:** Keep the user informed, remind them of pending actions, surface patterns.

```
Kanban Board (/dashboard/tracker)
    │
    ├─ Columns: Wishlist → Applied → Phone Screen → Interview → Technical → Offer
    ├─ Drag-and-drop status changes
    ├─ Timeline events auto-logged on every status change
    └─ Color-coded AI scores visible on each card
    │
Smart Nudges (sidebar widget)
    │
    ├─ "You applied to Acme Corp 8 days ago — no update. Follow up?"
    ├─ "Interview at TechCo is tomorrow — your prep notes are here"
    ├─ "3 applications haven't moved in 14+ days — archive them?"
    └─ AI-generated suggested next action per job
    │
Activity Dashboard (/dashboard/activity)
    │
    ├─ GitHub-style heatmap (applications per day)
    ├─ Pipeline funnel (conversion rates: applied → interview → offer)
    ├─ Average time-to-response by company tier
    └─ Win rate trend over time
```

---

### Stage 6: Interview Preparation

**Trigger:** Status moves to PHONE_SCREEN, INTERVIEW, or TECHNICAL.

**Goal:** Ensure user walks into every interview fully prepared.

```
Status → INTERVIEW
    │
    ▼
Auto-generated Interview Prep Package
    │
    ├─ Company Deep Research (AI)
    │     Recent news, product direction, engineering blog
    │     "Why this company" talking points
    │
    ├─ Role-specific Questions (AI)
    │     Predicted interview questions based on JD + company
    │     Separated by: Behavioral / Technical / System Design
    │
    ├─ STAR Story Bank
    │     User's saved stories from past experiences
    │     AI suggests which stories best match predicted questions
    │     Add new stories inline
    │
    └─ 1-Click Export
          PDF prep sheet: questions + relevant STAR stories
          Shareable link (private, expires in 48h)
    │
    ▼
Post-Interview
    │
    ├─ Quick "How did it go?" prompt (3 options: Great / OK / Rough)
    ├─ Capture key learnings as a timeline note
    └─ Schedule next touchpoint if positive
```

---

### Stage 7: Offer & Close

**Trigger:** Status moves to OFFER or ACCEPTED/REJECTED.

**Goal:** Help user make an informed decision and close the loop cleanly.

```
Status → OFFER
    │
    ▼
Offer Evaluation
    │
    ├─ Input offer details (base, equity, bonus, benefits, start date)
    ├─ Compare to: user's target comp, other active offers
    ├─ AI analysis: is this offer above/below/at market?
    └─ Negotiation script (if salary is below target)
    │
    ▼
Decision
    │
    ├─ ACCEPTED → Confetti 🎉 + archive all other applications automatically
    ├─ REJECTED → Archive, optional "lessons learned" note
    └─ WITHDRAWN → Archive cleanly
    │
    ▼
Reflection (optional — 1 question prompt)
    "What was the single most effective thing you did in this job search?"
    Response stored as personal insight (private)
```

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAREEROS ARCHITECTURE                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         WEB LAYER (Next.js 16)                      │   │
│  │  Landing · Auth · Dashboard · Explore · Tracker · Activity · Prep   │   │
│  └────────────────────────────┬────────────────────────────────────────┘   │
│                               │                                             │
│  ┌─────────────────────────────▼──────────────────────────────────────┐    │
│  │                     SERVER ACTIONS LAYER                            │    │
│  │  auth · jobs · documents · analytics · nudges · ai-eval · portal   │    │
│  └────────────────────────────┬───────────────────────────────────────┘    │
│                               │                                             │
│  ┌──────────────┬─────────────▼──────────────┬──────────────────────┐     │
│  │              │                            │                       │     │
│  ▼              ▼                            ▼                       ▼     │
│  PostgreSQL    Claude API                  Resend              Playwright  │
│  (Prisma ORM)  (Evaluation,               (Email)             (PDF gen +  │
│                 Resume gen,                                    portal scan)│
│                 Research)                                                   │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    BACKGROUND JOBS (Cron)                         │      │
│  │  Portal Scanner · Email Digest · Nudge Evaluator · Score Refresh  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Keep Next.js App Router | Server components + server actions eliminate a separate API layer |
| Claude API (not Claude Code CLI) | Web app context — API calls from server actions, not CLI invocations |
| Playwright in a sidecar service | PDF generation and portal scanning need a browser; isolate from Next.js process |
| Vercel Cron or pg-boss for jobs | Portal scanning runs on a schedule; Vercel Cron is zero-infra for initial deployment |
| PostgreSQL for all storage | Documents, AI reports, and user data in one system — simplifies backup and queries |
| Per-user AI context | Each user's profile is injected as system context in every Claude API call |

---

## 4. Database Schema Changes

The following additions to `prisma/schema.prisma` unlock all merged features.

### New Models

```prisma
// ─── User Profile Extension ───────────────────────────────────────────
model UserProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Identity
  headline          String?  // "Staff Engineer with 8 years in fintech"
  location          String?
  timezone          String?
  visaSponsorship   Boolean  @default(false)
  workPreference    WorkPreference @default(HYBRID)

  // Target roles
  primaryRoles      String[] // ["Software Engineer", "Staff Engineer"]
  seniority         Seniority @default(MID)
  archetypes        String[] // ["LLMOps", "Fullstack", "Platform"]

  // Superpowers (free text — used in AI personalization)
  headline1         String?
  superpower1       String?
  superpower2       String?
  superpower3       String?
  exitStory         String?  // What makes this candidate unique

  // Compensation
  targetCompMin     Int?
  targetCompMax     Int?
  minimumComp       Int?
  compCurrency      String   @default("USD")

  // Links
  linkedInUrl       String?
  githubUrl         String?
  portfolioUrl      String?

  // Base CV (used for resume tailoring)
  baseCvContent     String?  // Markdown or plain text extracted from uploaded CV

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum WorkPreference { REMOTE HYBRID ONSITE }
enum Seniority      { JUNIOR MID SENIOR STAFF PRINCIPAL }

// ─── AI Evaluation ────────────────────────────────────────────────────
model AiEvaluation {
  id                  String         @id @default(cuid())
  jobApplicationId    String         @unique
  jobApplication      JobApplication @relation(fields: [jobApplicationId], references: [id], onDelete: Cascade)

  score               String         // "A" | "B" | "C" | "D" | "F"
  scoreNumeric        Float          // 0.0–1.0 for sorting/filtering
  summary             String         // One-line AI summary
  fullReport          Json           // Structured report: match, gaps, company research, personalization plan
  cvMatchPercent      Int?           // 0–100
  keyGaps             String[]       // Skills the user lacks
  keyStrengths        String[]       // User's strongest matches for this role
  compensationSignal  String?        // "above" | "at" | "below" | "unknown"
  companyResearch     Json?          // Company deep-dive data

  modelUsed           String         // e.g. "claude-sonnet-4-6"
  promptVersion       Int            @default(1)
  generatedAt         DateTime       @default(now())
  expiresAt           DateTime?      // Re-evaluate if job description changes
}

// ─── STAR Story Bank ─────────────────────────────────────────────────
model StoryBankEntry {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title       String   // Short label: "Led migration to microservices"
  situation   String
  task        String
  action      String
  result      String
  reflection  String?  // What you learned

  tags        String[] // ["leadership", "technical", "cross-functional"]
  impact      String?  // Quantified outcome: "Reduced deploy time by 40%"

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// ─── Discovered Jobs (from portal scanning) ──────────────────────────
model DiscoveredJob {
  id            String    @id @default(cuid())
  externalId    String    @unique // Hash of company+role+url for dedup
  company       String
  position      String
  location      String?
  jobUrl        String
  description   String?
  source        String    // "greenhouse" | "lever" | "ashby" | etc.
  postedAt      DateTime?
  discoveredAt  DateTime  @default(now())
  isActive      Boolean   @default(true)

  // Index for fast explore-page queries
  @@index([source])
  @@index([discoveredAt])
  @@index([isActive])
}

// ─── Interview Prep Package ──────────────────────────────────────────
model InterviewPrepPackage {
  id                  String         @id @default(cuid())
  jobApplicationId    String         @unique
  jobApplication      JobApplication @relation(fields: [jobApplicationId], references: [id], onDelete: Cascade)

  companyResearch     Json?          // Deep-dive: AI strategy, culture, challenges
  predictedQuestions  Json?          // Array of { question, type, difficulty }
  suggestedStories    Json?          // Array of { storyId, questionMatch }
  prepNotes           String?        // User's free-form notes

  generatedAt         DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}
```

### Modified Models

```prisma
// Add to JobApplication:
model JobApplication {
  // ... existing fields ...

  aiScore         String?        // "A" | "B" | "C" | "D" | "F" — cached for UI
  aiEvaluation    AiEvaluation?
  interviewPrep   InterviewPrepPackage?

  // Offer details (Stage 7)
  offerBase       Int?
  offerEquity     String?
  offerBonus      Int?
  offerBenefits   String?
  offerStartDate  DateTime?
}

// Add to User:
model User {
  // ... existing fields ...
  profile         UserProfile?
  storyBank       StoryBankEntry[]
}
```

---

## 5. Feature Integration Matrix

| Feature | Source | Integration Effort | Priority |
|---|---|---|---|
| Multi-user auth + sessions | job-tracker (exists) | None | — |
| Kanban board + drag-drop | job-tracker (exists) | None | — |
| Activity heatmap + funnel | job-tracker (exists) | None | — |
| Document storage | job-tracker (exists) | None | — |
| Smart nudges (basic) | job-tracker (exists) | Enhance with AI | Medium |
| Email notifications | job-tracker (exists) | Enhance triggers | Low |
| Public job explore page | job-tracker (exists) | Replace with DiscoveredJob | Medium |
| Career profile wizard | career-ops (new) | Build from scratch | High |
| AI job evaluation | career-ops (adapt) | Claude API server action | High |
| Tailored resume generation | career-ops (adapt) | Claude API + Playwright sidecar | High |
| Cover letter generation | career-ops (adapt) | Claude API server action | Medium |
| Portal scanning (50+ sources) | career-ops (adapt) | Background job + Playwright | High |
| STAR story bank | career-ops (adapt) | New UI + DB model | Medium |
| Interview prep package | career-ops (adapt) | Claude API server action | Medium |
| Company deep research | career-ops (adapt) | Claude API server action | Medium |
| Offer comparison + negotiation | career-ops (adapt) | New UI + Claude API | Low |
| Batch job processing | career-ops (adapt) | Background job queue | Low |

---

## 6. Implementation Phases

### Phase 0: Project Merge Preparation (1–2 days)

```
1. Clone career-ops alongside job-tracker (or as a git submodule)
   git clone https://github.com/swiftkimani/career-ops ./career-ops-reference

2. Extract reusable assets from career-ops:
   - config/profile.example.yml       → Reference for UserProfile schema
   - modes/*.md                        → Reference for Claude prompts
   - templates/cv.html                 → Base template for resume generation
   - interview-prep/story-bank.md     → Reference for StoryBankEntry UI
   - docs/ARCHITECTURE.md             → Reference throughout

3. Rename project in package.json:
   "name": "career-os"
   "description": "AI-powered career operations platform"

4. Update environment variable names:
   NEXT_PUBLIC_APP_NAME="CareerOS"
```

---

### Phase 1: Profile & Schema Foundation (3–4 days)

**Goal:** Add the data models that unlock everything else.

```
Step 1.1 — Update prisma/schema.prisma
  Add: UserProfile, AiEvaluation, StoryBankEntry, DiscoveredJob,
       InterviewPrepPackage
  Modify: JobApplication (add aiScore, offer fields)
  Run: npx prisma migrate dev --name add_ai_profile_schema

Step 1.2 — Career Profile Wizard UI
  File: src/app/dashboard/profile/page.tsx
  File: src/app/dashboard/profile/components/ProfileWizard.tsx
  - 3-step form (Identity → Target Roles → Compensation)
  - Skippable — stores partial progress
  - CV upload → text extraction → store in UserProfile.baseCvContent

Step 1.3 — Server Actions for Profile
  File: src/app/actions/profile.ts
  - getProfile(userId) → UserProfile | null
  - upsertProfile(userId, data) → UserProfile
  - extractTextFromCv(file) → string (use pdf-parse or similar)

Step 1.4 — Navigation Update
  Add "Profile" to dashboard navigation
  Add profile completion % indicator in UserMenu
```

---

### Phase 2: AI Evaluation Engine (4–5 days)

**Goal:** Every job in the system gets an AI score against the user's profile.

```
Step 2.1 — Claude API Integration
  Install: npm install @anthropic-ai/sdk
  File: src/lib/claude.ts
  - createAnthropicClient() → Anthropic instance
  - buildSystemPrompt(profile: UserProfile) → string
    (Injects user's headline, roles, superpowers, comp target)

Step 2.2 — Evaluation Prompts
  File: src/lib/prompts/evaluate-job.ts
  Adapted from career-ops/modes/evaluate.md:
  - Input: job description + user profile
  - Output: structured JSON { score, summary, cvMatch, gaps, strengths,
            compSignal, companyResearch, personalizationPlan }
  - Schema validated with Zod

Step 2.3 — Evaluation Server Action
  File: src/app/actions/ai-evaluation.ts
  - evaluateJob(jobApplicationId: string) → AiEvaluation
  - Called: automatically when job is added, or manually via "Re-evaluate" button
  - Stores result in AiEvaluation table
  - Updates jobApplication.aiScore (cached)

Step 2.4 — UI: Evaluation Display
  File: src/components/ai/AiScoreBadge.tsx
    - Grade badge (A/B/C/D/F) with color coding
    - Tooltip with one-line summary
  File: src/components/ai/AiEvaluationReport.tsx
    - Full report accordion
    - Sections: Match Analysis, Gaps, Strengths, Company Research, Personalization

Step 2.5 — Integration Points
  - KanbanJobCard.tsx: show AiScoreBadge
  - JobCard.tsx: show AiScoreBadge
  - Job detail page: show full AiEvaluationReport
  - Explore page: sort by aiScore
```

---

### Phase 3: Portal Scanning (5–6 days)

**Goal:** Automatically discover new jobs and surface them in the Explore page.

```
Step 3.1 — Playwright Sidecar Service
  Directory: services/portal-scanner/
  File: services/portal-scanner/package.json
  File: services/portal-scanner/scanner.ts
    - Adapted from career-ops scanning modes
    - Scans: Ashby, Greenhouse, Lever, Wellfound, Workable
    - Output: JSON array of { company, position, location, jobUrl, description, source }
    - Deduplication: hash(company + position + url) for externalId
    - Runs as a separate Node process

Step 3.2 — Background Job System
  Option A (simple): Vercel Cron + API route
    File: src/app/api/cron/scan-portals/route.ts
    - Called by Vercel Cron every 6 hours
    - Spawns scanner, persists results to DiscoveredJob table
  
  Option B (robust): pg-boss (PostgreSQL-backed job queue)
    - Better for long-running scans
    - Retry logic built in

Step 3.3 — Migrate Explore Page to DiscoveredJob
  File: src/app/actions/discover.ts
    - Replace scraped_jobs.json with DiscoveredJob DB queries
    - Keep same filtering API (location, source, query, date)
    - Add: sort by AI pre-filter score

Step 3.4 — Per-User Job Status in Discover
  Keep existing: track which discovered jobs user has saved/discarded
  New: show AI score for each card (evaluate lazily on view)
```

---

### Phase 4: Document Generation (3–4 days)

**Goal:** One-click tailored resume and cover letter for any job application.

```
Step 4.1 — Resume Generation
  File: src/app/actions/generate-resume.ts
  - Input: jobApplicationId + userProfile
  - Step 1: Claude API generates tailored resume content (markdown)
    Adapted from career-ops/modes/pdf.md prompt
  - Step 2: Convert markdown to HTML using career-ops's cv.html template
  - Step 3: Playwright (or puppeteer) renders HTML → PDF
  - Step 4: Store PDF as Document linked to jobApplication
  
  File: src/components/documents/GenerateResumeButton.tsx
    - "Generate tailored resume" button on job detail page
    - Shows progress steps: Analyzing → Writing → Rendering → Done

Step 4.2 — Cover Letter Generation
  File: src/app/actions/generate-cover-letter.ts
  - Input: jobApplicationId + userProfile + (optional) evaluation report
  - Claude API: profile + JD + personalization plan → cover letter draft
  - Stored as Document, editable in rich text editor

Step 4.3 — PDF Service Setup
  File: services/pdf-generator/
  - Standalone Express server wrapping Playwright
  - POST /generate { html } → PDF buffer
  - Called from server actions via internal HTTP
  - Runs as a sidecar in Docker Compose
```

---

### Phase 5: Interview Preparation (3–4 days)

**Goal:** Every interview-stage job has an auto-generated prep package.

```
Step 5.1 — STAR Story Bank UI
  File: src/app/dashboard/stories/page.tsx
  File: src/app/actions/stories.ts (CRUD)
  File: src/components/stories/StoryCard.tsx
  File: src/components/stories/StoryForm.tsx
    - Create/edit stories with STAR+R fields
    - Tag stories by skill/theme
    - AI suggestion: "This story could answer: 'Tell me about a time...'"

Step 5.2 — Auto-Generate Prep Package
  File: src/app/actions/interview-prep.ts
  - Trigger: status changes to INTERVIEW or TECHNICAL
  - Claude API: company name + JD + user profile → prep package JSON
    { companyResearch, predictedQuestions, interviewTips }
  - AI: match user's story bank to predicted questions
  - Store in InterviewPrepPackage table

Step 5.3 — Prep Package UI
  File: src/app/dashboard/jobs/[id]/prep/page.tsx
  Sections:
    - Company Research (accordion)
    - Predicted Questions (with user's best-matched STAR story per question)
    - Interview Tips
    - Export as PDF button
```

---

### Phase 6: Automation & Smart Nudges (2–3 days)

**Goal:** The system proactively guides users without them needing to check in.

```
Step 6.1 — Enhanced Smart Nudges
  File: src/app/actions/nudges.ts (enhance existing)
  New nudge types:
    - "Your AI evaluation for {company} is ready — it scored a B"
    - "Interview at {company} is in 2 days — prep package is ready"
    - "You applied 10 days ago with no response — here's a follow-up template"
    - "5 new jobs matching your profile were found in the last 24h"
    - "Your application to {company} has been stale for 21 days — archive it?"

Step 6.2 — Email Digest
  File: src/app/actions/email-digest.ts
  - Weekly summary email: new matches, pipeline stats, action items
  - Triggered by Vercel Cron (Monday 8AM, user timezone-aware)
  - Template: Resend with React Email

Step 6.3 — Status-Triggered Automations
  When status changes to PHONE_SCREEN → generate interview prep
  When status changes to OFFER → show offer comparison UI
  When status changes to ACCEPTED → archive all others + celebration
  When job added → trigger AI evaluation (async, non-blocking)
```

---

### Phase 7: Offer Management (2 days)

**Goal:** Help users make informed decisions at the final stage.

```
Step 7.1 — Offer Input Form
  File: src/components/jobs/OfferDetailsForm.tsx
  Fields: base salary, equity (%), bonus, benefits summary, start date

Step 7.2 — Offer Comparison
  File: src/app/dashboard/offers/page.tsx
  - Shows all OFFER-status jobs side by side
  - Claude API: analyze offers against user's comp target
  - Generates negotiation script if offer is below target

Step 7.3 — Negotiation Assistant
  File: src/components/jobs/NegotiationScript.tsx
  - Pre-built script from career-ops/modes/offer-handling prompts
  - Customized to specific offer numbers
```

---

## 7. AI Integration Design

### Claude API Usage Pattern

Every AI call follows this pattern for consistency and cost control:

```typescript
// src/lib/claude.ts

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AiCallOptions {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
}

export async function callClaude({
  systemPrompt,
  userMessage,
  model = "claude-haiku-4-5-20251001", // Default: cheap + fast for most tasks
  maxTokens = 4096,
}: AiCallOptions): Promise<string> {
  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}
```

### Model Selection per Feature

| Feature | Model | Reason |
|---|---|---|
| Job pre-filtering (batch) | `claude-haiku-4-5` | Volume operation, needs to be cheap |
| Quick AI score on explore card | `claude-haiku-4-5` | Runs per-card on scroll |
| Full job evaluation report | `claude-sonnet-4-6` | Nuanced analysis, runs once per job |
| Resume tailoring | `claude-sonnet-4-6` | High quality output, user-visible |
| Cover letter generation | `claude-sonnet-4-6` | High quality output, user-visible |
| Company deep research | `claude-sonnet-4-6` | Complex research synthesis |
| Interview question prediction | `claude-haiku-4-5` | Fast, lower stakes |
| Negotiation script | `claude-sonnet-4-6` | High-stakes, quality matters |

### User Profile System Prompt Builder

```typescript
// src/lib/prompts/system-prompt.ts

export function buildUserSystemPrompt(profile: UserProfile): string {
  return `You are an AI career advisor assisting a job seeker.

CANDIDATE PROFILE:
- Headline: ${profile.headline ?? "Not provided"}
- Target roles: ${profile.primaryRoles.join(", ")}
- Seniority: ${profile.seniority}
- Location: ${profile.location ?? "Flexible"} | Work preference: ${profile.workPreference}
- Visa sponsorship needed: ${profile.visaSponsorship ? "Yes" : "No"}

STRENGTHS & DIFFERENTIATORS:
${profile.superpower1 ? `- ${profile.superpower1}` : ""}
${profile.superpower2 ? `- ${profile.superpower2}` : ""}
${profile.superpower3 ? `- ${profile.superpower3}` : ""}
${profile.exitStory ? `Unique background: ${profile.exitStory}` : ""}

COMPENSATION TARGET:
- Range: ${profile.targetCompMin?.toLocaleString() ?? "?"}–${profile.targetCompMax?.toLocaleString() ?? "?"} ${profile.compCurrency}
- Minimum: ${profile.minimumComp?.toLocaleString() ?? "Not set"} ${profile.compCurrency}

Always be direct, honest, and specific. Never pad responses. Provide actionable insights.`;
}
```

### Prompt Version Control

All prompts are versioned files in `src/lib/prompts/`. When a prompt changes,
increment `promptVersion` in the schema and re-evaluate affected jobs.

```
src/lib/prompts/
├── system-prompt.ts          (user context builder)
├── evaluate-job.ts           (v1 — A-F scoring)
├── tailor-resume.ts          (v1 — resume content)
├── generate-cover-letter.ts  (v1 — cover letter)
├── company-research.ts       (v1 — 6-axis research)
├── predict-questions.ts      (v1 — interview Qs)
└── negotiation-script.ts     (v1 — offer negotiation)
```

---

## 8. Automation Engine

### Cron Schedule

```
Every 6 hours:   Portal scanning (discover new jobs)
Every 1 hour:    Nudge evaluator (check stale applications)
Every Monday:    Weekly email digest (per active user)
On-demand:       AI evaluation (triggered when job added/viewed)
On-demand:       Interview prep (triggered on status change)
On-demand:       Resume generation (triggered by user)
```

### Vercel Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/scan-portals",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/evaluate-nudges",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

### Background Job Security

All cron API routes must validate a `CRON_SECRET` header:

```typescript
// src/app/api/cron/_middleware.ts
export function validateCronRequest(request: Request): boolean {
  const secret = request.headers.get("x-cron-secret");
  return secret === process.env.CRON_SECRET;
}
```

---

## 9. Optimization Strategies

### Performance

| Area | Problem | Solution |
|---|---|---|
| AI evaluation latency | Evaluation takes 5-10s | Run async after job save; show "Analyzing..." state |
| Portal scanning size | scraped_jobs.json is 14MB in-memory | Replace with DiscoveredJob DB table (indexed queries) |
| Resume PDF generation | Playwright startup is slow | Keep Playwright warm; use process pool |
| First Contentful Paint | Heavy JS bundle | Route-level code splitting; defer AI components |
| Database queries | N+1 on kanban board | Batch-load evaluations with `include` in Prisma query |

### Cost Control (Claude API)

| Strategy | Implementation |
|---|---|
| Cache evaluations | Never re-evaluate unless description changes (use content hash) |
| Model tiering | Haiku for bulk/fast tasks; Sonnet only for high-quality output |
| Lazy evaluation | Only evaluate jobs user explicitly opens or saves |
| Evaluation TTL | Re-evaluate after 30 days (job market data gets stale) |
| Rate limiting per user | Max 50 AI calls/day per user (configurable) |

### Scalability

| Layer | Strategy |
|---|---|
| Database | Add composite indexes on `(userId, status)`, `(userId, updatedAt)` |
| File storage | Move Document.content (bytes) to S3/R2 as the user base grows |
| Portal scanning | Distribute scan workers by source (one worker per portal type) |
| AI calls | Queue with pg-boss; prevent thundering herd on plan upgrades |

### UX Performance

- Optimistic UI updates on status changes (kanban drag-drop feels instant)
- Skeleton loading states for all AI-generated content
- Service worker caching for the dashboard shell (offline-capable)
- Prefetch job detail routes on hover

---

## 10. Environment & Configuration

```bash
# ── Database ─────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@host:5432/careeros"

# ── Authentication ────────────────────────────────────────
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_APP_URL="https://careeros.app"

# ── Email ─────────────────────────────────────────────────
RESEND_API_KEY="re_..."

# ── AI ───────────────────────────────────────────────────
ANTHROPIC_API_KEY="sk-ant-..."

# ── Background Jobs ───────────────────────────────────────
CRON_SECRET="your-cron-secret-here"

# ── PDF/Playwright Sidecar ────────────────────────────────
PDF_SERVICE_URL="http://localhost:3001"    # Internal service URL
PDF_SERVICE_SECRET="your-pdf-secret-here"

# ── Feature Flags (optional) ──────────────────────────────
ENABLE_AI_EVALUATION="true"
ENABLE_PORTAL_SCANNING="true"
ENABLE_RESUME_GENERATION="true"
AI_DAILY_CALL_LIMIT="50"                   # Per user per day
```

### Docker Compose (for local development)

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: careeros
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  web:
    build: .
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/careeros
    ports:
      - "3000:3000"

  pdf-service:
    build: ./services/pdf-generator
    ports:
      - "3001:3001"
    environment:
      PDF_SERVICE_SECRET: ${PDF_SERVICE_SECRET}
```

---

## 11. Security Considerations

### AI-Specific Security

| Risk | Mitigation |
|---|---|
| Prompt injection via job descriptions | Sanitize job description before injecting into prompts; use structured output (JSON mode) |
| User data leaking between accounts | `buildUserSystemPrompt` is scoped to authenticated user; server-side only |
| AI cost abuse | Per-user daily call limit enforced at server action level |
| Sensitive data in AI context | Never inject passwords, tokens, or payment data into Claude prompts |
| Webhook/cron abuse | All cron routes require `CRON_SECRET` header validation |

### Existing Security (maintained from job-tracker)

- bcryptjs password hashing (10 rounds)
- JWT sessions via NextAuth
- Ownership verification on every data mutation
- Email verification on registration
- Parameterized Prisma queries (no raw SQL)
- CSRF protection via SameSite cookies

---

## 12. Testing Strategy

### Target: 80% coverage across all new code

```
Unit Tests (Vitest)
  - src/lib/prompts/*.ts        → Prompt builder output validation
  - src/app/actions/ai-*.ts    → Mock Claude API, test action logic
  - src/lib/claude.ts          → Mock Anthropic SDK responses
  - Profile form validation    → Zod schema tests

Integration Tests (Vitest + Prisma test DB)
  - Full evaluation flow: job saved → AI called → score stored
  - Profile upsert: wizard submission → DB record created
  - Story bank CRUD operations

E2E Tests (Playwright)
  - User journey: register → profile setup → explore → evaluate → apply
  - Kanban drag-drop status change
  - Document generation flow (mock PDF service)
  - Interview prep package auto-generation

Test Commands:
  npm run test              → Unit tests
  npm run test:integration  → Integration tests (requires DB)
  npm run test:e2e          → Playwright E2E
  npm run test:coverage     → Full coverage report
```

---

## Quick Reference: Files to Create

```
Priority 1 (Phase 1–2, core value):
  prisma/schema.prisma          ← Update with new models
  src/lib/claude.ts             ← Anthropic client
  src/lib/prompts/              ← All AI prompt files
  src/app/actions/ai-evaluation.ts
  src/app/actions/profile.ts
  src/app/dashboard/profile/    ← Profile wizard
  src/components/ai/            ← Score badge + report

Priority 2 (Phase 3–4, automation):
  services/portal-scanner/      ← Playwright scanner
  services/pdf-generator/       ← PDF sidecar
  src/app/api/cron/             ← Cron endpoints
  src/app/actions/generate-resume.ts
  src/app/actions/generate-cover-letter.ts
  vercel.json                   ← Cron schedule

Priority 3 (Phase 5–7, depth):
  src/app/dashboard/stories/    ← STAR story bank
  src/app/actions/stories.ts
  src/app/actions/interview-prep.ts
  src/app/dashboard/jobs/[id]/prep/
  src/app/dashboard/offers/     ← Offer comparison
  src/app/actions/email-digest.ts
```

---

*Last updated: 2026-04-06*  
*System: CareerOS v1.0 — job-tracker × career-ops*
