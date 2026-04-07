# CareerOS — User Journey Map

> A product-design-level breakdown of every touchpoint, decision point, and system interaction  
> across the full lifecycle of a job search.

---

## The 7-Stage Journey at a Glance

```
                    ┌────────────────────────────────────────────────────────────┐
                    │                  CAREEROS USER JOURNEY                     │
                    │                                                            │
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
   ░                                                                         ░   │
   ░  1. ONBOARD  ──▶  2. DISCOVER  ──▶  3. EVALUATE  ──▶  4. APPLY         ░   │
   ░                                                            │            ░   │
   ░                                                            ▼            ░   │
   ░                 7. CLOSE  ◀──  6. PREPARE  ◀──  5. TRACK               ░   │
   ░                                                                         ░   │
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
                    └────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Onboarding

**Entry trigger:** New user lands on homepage and clicks "Get Started."  
**Exit condition:** User reaches the dashboard (profile completion is optional).

### Flow

```
Landing Page (/)
   ├── Hero CTA → /auth/register
   └── "Sign In" link → /auth/login

Registration (/auth/register)
   ├── Input: name, email, password
   ├── Validation: email format, password strength (min 8 chars)
   ├── Success → email verification OTP sent
   └── Error → inline field errors (never generic)

Email Verification (/auth/verify-email)
   ├── User enters 6-digit OTP from email
   ├── Expired OTP → "Resend code" (rate-limited: 3 attempts)
   └── Success → redirected to profile wizard

Career Profile Wizard (/dashboard/profile/setup)
   ├── Presented as a drawer over the empty dashboard
   ├── Progress: Step 1 of 3 (dismissable at any point)
   │
   ├── Step 1: Who are you?
   │     - Full name (pre-filled from registration)
   │     - Current location / timezone
   │     - Work preference: Remote / Hybrid / On-site
   │     - Visa sponsorship required? Yes / No
   │
   ├── Step 2: What do you want?
   │     - Primary role(s): multi-select with type-ahead
   │       e.g. "Software Engineer", "Product Manager", "Data Scientist"
   │     - Seniority: Junior / Mid / Senior / Staff / Principal
   │     - One-line career headline
   │       e.g. "Backend engineer specializing in distributed systems"
   │     - (Optional) 3 superpowers — free text
   │       e.g. "I ship fast without cutting corners"
   │
   └── Step 3: What's your floor?
         - Target salary range + currency
         - Minimum acceptable comp (private — only used by AI, never shown)
         - Upload current CV/resume (PDF) — optional
         - If uploaded: AI extracts text → stored as baseCvContent
   │
   ▼
Dashboard — Empty state with onboarding checklist:
   ☐ Complete your profile (Step 2 of 3)
   ☐ Explore job matches
   ☐ Add your first application
   ☐ Set up your STAR story bank
```

### Key UX Principles

- **No wall before value:** Users can skip the wizard and see the explore page immediately
- **Progressive disclosure:** AI features get more accurate as the profile fills in
- **Trust building:** "Your compensation floor is never shown to employers. It's only used to flag low offers."

---

## Stage 2: Discovery

**Entry trigger:** User visits Explore page, or system pushes a "New Matches" notification.  
**Exit condition:** User saves a job to Wishlist or marks it as Applied.

### Flow

```
Explore Page (/dashboard/explore)
   │
   ├── Two sources feeding the same view:
   │     A) DiscoveredJob DB — auto-scanned from 50+ portals every 6 hours
   │     B) scraped_jobs.json — existing static dataset (fallback / bootstrap)
   │
   ├── Default sort: AI fit score (A → F) for logged-in users with profiles
   │   Fallback sort: Most recently discovered (if no profile)
   │
   ├── Filters (left sidebar):
   │     - Search (company or role)
   │     - Location
   │     - Source portal (Greenhouse / Lever / Ashby / etc.)
   │     - Posted within: 24h / 3d / 7d / 30d
   │     - AI score: A-B only / All
   │     - Hide already-saved / Hide discarded
   │
   └── Job Card Actions:
         ├── [★ Save to Wishlist] → creates JobApplication (WISHLIST)
         ├── [✓ Mark Applied]    → creates JobApplication (APPLIED)
         ├── [✗ Discard]         → records discard reason (optional)
         │                         feeds back into AI preference learning
         └── [▼ Quick View]      → expands card with full description
                                   shows AI evaluation if profile is set

"New Matches" notification badge
   - Appears in nav when new high-score jobs (A or B) are discovered
   - Clears once user visits Explore
   - Weekly email digest summarizes top 5 matches (if opted in)

Manual Add
   ├── /dashboard/jobs/new — manual form
   └── Paste-a-URL flow (future): user pastes job URL → AI scrapes description
```

---

## Stage 3: Evaluation

**Entry trigger:** A job is saved to the system (Wishlist or Applied).  
**Exit condition:** User has read the AI evaluation and made a decision.

### Flow

```
Job Saved → AI Evaluation queued (async, non-blocking)
   │
   ├── Within ~10s: AiEvaluation record created
   │
   └── User opens job detail (/dashboard/jobs/[id])

Job Detail Page
   │
   ├── AI Score Badge (top-right): A / B / C / D / F
   │     Color coding: A=teal / B=green / C=yellow / D=orange / F=red
   │
   └── AI Evaluation Report (accordion, collapsed by default)

         ┌─────────────────────────────────────────────────────┐
         │  MATCH ANALYSIS                                     │
         │  CV Match: 78%  ████████░░░░                       │
         │                                                     │
         │  STRENGTHS ALIGNMENT                                │
         │  ✓ 7+ years TypeScript — required ✓                │
         │  ✓ System design experience — valued ✓              │
         │  ✓ Startup experience matches culture ✓             │
         │                                                     │
         │  GAP ANALYSIS                                       │
         │  ✗ Rust experience (nice-to-have, not blocking)     │
         │  ✗ ML background — mentioned but not required       │
         │                                                     │
         │  COMPENSATION SIGNAL                                │
         │  Range: $180k–$220k | Your target: $190k–$230k     │
         │  Signal: AT MARKET — slight room to negotiate       │
         │                                                     │
         │  COMPANY RESEARCH                                   │
         │  Recent: Series C ($40M), hiring aggressively       │
         │  Culture: async-first, high autonomy                │
         │  Challenges: scaling data pipeline                  │
         │                                                     │
         │  PERSONALIZATION PLAN                               │
         │  Lead with: distributed systems expertise           │
         │  Mention: your fintech scaling story                │
         │  Ask about: eng team structure, tech debt mgmt      │
         │                                                     │
         │  OVERALL: B — Good fit. Apply with tailored resume. │
         └─────────────────────────────────────────────────────┘

User Decision Point:
   ├── [Generate Tailored Resume + Apply] → Stage 4
   ├── [Move to Wishlist — not yet ready]
   └── [Discard — not the right fit]
```

---

## Stage 4: Application

**Entry trigger:** User clicks "Apply" on a job.  
**Exit condition:** Status = APPLIED, tailored documents stored.

### Flow

```
Apply Flow
   │
   ├── Step 1: Document Generation (optional but recommended)
   │     │
   │     ├── Resume tailoring
   │     │     - AI rewrites user's base CV for this specific JD
   │     │     - ATS-optimized: single column, keyword-dense
   │     │     - Rendered as PDF via Playwright
   │     │     - Stored as Document → linked to this JobApplication
   │     │
   │     └── Cover letter draft
   │           - AI: profile + evaluation report → personalized letter
   │           - User edits in inline text editor (minimal, fast)
   │           - Stored as Document
   │
   ├── Step 2: Confirmation
   │     "You're about to mark this as Applied."
   │     "Did you submit on the company's portal?" Yes / Not yet
   │
   └── Step 3: Status Update
         JobApplication.status → APPLIED
         Timeline event created: "Application submitted on {date}"
         Smart nudge scheduled: "Follow up in 7 days"
         AI nudge: "Best time to follow up: Tuesday–Thursday, morning"
```

---

## Stage 5: Tracking

**Entry trigger:** Ongoing — runs throughout the entire job search.  
**Exit condition:** Application reaches a terminal state (ACCEPTED, REJECTED, WITHDRAWN).

### Kanban Board (/dashboard/tracker)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ WISHLIST │ APPLIED  │  SCREEN  │INTERVIEW │TECHNICAL │  OFFER   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ [B] Acme │ [A] TechX│          │          │ [A] BigCo│          │
│ Engineer │ Eng Lead │          │          │ Sr. Eng  │          │
│ 3 days   │ 8 days ⚠│          │          │ Today    │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Legend:
  [A] = AI score badge
  ⚠   = Smart nudge: action needed
  Time = Days since last update
```

### Smart Nudges (Sidebar Widget)

```
SMART NUDGES                                      3 pending ●

  ⚠ HIGH PRIORITY
  ┌──────────────────────────────────────────────┐
  │ TechX — Applied 8 days ago, no response.     │
  │ "It's been a week — follow up now."           │
  │ [View Job] [Copy follow-up email template]    │
  └──────────────────────────────────────────────┘

  ● REMINDER
  ┌──────────────────────────────────────────────┐
  │ BigCo — Technical interview tomorrow.        │
  │ "Your prep package is ready."                │
  │ [Open Prep Package]                          │
  └──────────────────────────────────────────────┘

  ○ INFO
  ┌──────────────────────────────────────────────┐
  │ 4 new jobs match your profile (Score: A or B)│
  │ [View Matches]                               │
  └──────────────────────────────────────────────┘
```

### Activity Dashboard (/dashboard/activity)

```
APPLICATION ACTIVITY — Last 365 Days

 Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
 ░░░  ███  ░░░  ███  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░
      ███  ███  ███
             (peak: 12 applications in 1 week)

PIPELINE FUNNEL                    WIN RATES
  Applied        ████████ 42       Applied → Screen:     28%
  Phone Screen   █████    18       Screen → Interview:   61%
  Interview      ████     11       Interview → Offer:    36%
  Technical      ██       6        Offer → Accepted:     80%
  Offer          █        2
  Accepted       ·        1        Overall: 1 in 42 (2.4%)
```

---

## Stage 6: Interview Preparation

**Entry trigger:** Status changes to PHONE_SCREEN, INTERVIEW, or TECHNICAL.  
**Exit condition:** User feels prepared; has reviewed prep package.

### Flow

```
Status → INTERVIEW
   │
   ├── Auto-generate InterviewPrepPackage (async)
   │     AI: company name + JD + user profile → prep package
   │     Stored in DB, shown in job detail
   │
   └── User visits /dashboard/jobs/[id]/prep

Prep Package Page
   │
   ├── Section 1: Company Research
   │     ├── Overview (mission, stage, size)
   │     ├── AI strategy & recent bets
   │     ├── Engineering culture signals
   │     ├── Recent news (last 30 days)
   │     └── Your angle: "Why you, why now"
   │
   ├── Section 2: Predicted Questions (per round type)
   │     ├── Behavioral: "Tell me about a time you..."
   │     ├── Technical: "How would you design..."
   │     └── Culture fit: "Why are you leaving your current role?"
   │
   ├── Section 3: Your Best STAR Stories (per question)
   │     ├── AI matches your story bank to predicted questions
   │     └── "For 'Tell me about a time you led a difficult project':"
   │           → Your story: "Led the migration to microservices"
   │           → Action items: "Emphasize team size, timeline, measurable outcome"
   │
   └── Section 4: Your Notes
         Free-form scratch pad for interview day

Export:
   [Download PDF Prep Sheet] — Single page printable
   [Share prep link] — Expires in 48h (for practice with a friend)

STAR Story Bank (/dashboard/stories)
   │
   ├── Library of your stories (add, edit, tag)
   ├── Tags: leadership / technical / cross-functional / growth / failure
   ├── AI suggestion: "This story could answer 12 predicted questions"
   └── Add new story:
         - Title
         - Situation (1-3 sentences)
         - Task (your specific role)
         - Action (what you did, step by step)
         - Result (quantified outcome)
         - Reflection (what you learned)
```

---

## Stage 7: Offer & Close

**Entry trigger:** Status changes to OFFER.  
**Exit condition:** Application reaches ACCEPTED or REJECTED/WITHDRAWN.

### Flow

```
Status → OFFER
   │
   ├── Prompt: "Congratulations! Enter offer details"
   │     - Base salary
   │     - Equity (% or $)
   │     - Annual bonus
   │     - Benefits summary (free text)
   │     - Start date
   │     - Offer expiry date
   │
   ├── Offer Analysis (AI)
   │     ├── Compare to user's target comp
   │     ├── Compare to market rate (AI estimate)
   │     ├── Compare to other active offers (if any)
   │     └── Verdict: "Strong offer — above your target" or "Below target — room to negotiate"
   │
   ├── If below target → Negotiation Script
   │     "Here's a framework for your conversation:"
   │     ├── Opening line (specific to this company + role)
   │     ├── Counter-offer number (AI suggests: your target + 10% buffer)
   │     ├── What to say if they push back
   │     └── Walk-away line (if necessary)
   │
   └── Offer Comparison (/dashboard/offers) — if multiple offers
         Side-by-side table:
           Company | Role | Base | Equity | Bonus | Total | AI Score | Gut Feel

Decision
   │
   ├── ACCEPTED
   │     ├── Confetti animation 🎉
   │     ├── "Archive all other active applications?" Yes / No
   │     ├── Final reflection prompt (1 question):
   │     │     "What was the most impactful thing you did in this job search?"
   │     └── Stored as personal insight
   │
   ├── REJECTED (by company)
   │     ├── Optional: "Request feedback from recruiter" template
   │     └── Timeline note: capture lessons learned
   │
   └── WITHDRAWN (by user)
         ├── Optional reason (for self-reflection)
         └── Archived cleanly
```

---

## Cross-Cutting Concerns

### Navigation Structure

```
Dashboard Layout (sidebar + top bar)
   │
   ├── Explore        /dashboard/explore
   ├── Tracker        /dashboard/tracker    (kanban)
   ├── Pipeline       /dashboard/pipeline   (list view)
   ├── Activity       /dashboard/activity
   ├── Stories        /dashboard/stories    (STAR bank) ← NEW
   ├── Offers         /dashboard/offers     (comparison) ← NEW
   └── Settings       /dashboard/settings
         └── Profile  /dashboard/profile    ← ENHANCED
```

### Notification System

| Event | Channel | Timing |
|---|---|---|
| New job matches (A/B score) | In-app badge | Real-time (on scan complete) |
| Follow-up reminder | In-app nudge | 7 days after APPLIED with no update |
| Stale application | In-app nudge | 14 days without status change |
| Interview tomorrow | In-app nudge + email | 24h before (if date recorded) |
| Weekly digest | Email | Monday 8AM (user's timezone) |
| Offer received (from another system) | — | User-triggered only |

### Empty States (designed thoughtfully)

| Page | Empty State Message | CTA |
|---|---|---|
| Tracker (no jobs) | "Your job search pipeline is empty." | "Explore matching jobs" |
| Explore (no matches) | "Complete your profile for personalized matches." | "Set up profile" |
| Stories (no stories) | "Your story bank is empty — these help in every interview." | "Add your first story" |
| Offers (no offers) | "No active offers yet — keep going." | "Back to tracker" |

---

## Design Principles Applied

1. **Progressive enhancement** — Core features work without a profile; AI features activate as data grows.
2. **Human in the loop** — Every AI-generated document shows clearly that it was AI-generated; user approves before submitting.
3. **Opinionated defaults** — AI sorts explore results by fit score by default; users can override.
4. **Graceful degradation** — If AI calls fail or API is unavailable, core tracking features continue working.
5. **Privacy by design** — Compensation floors, personal notes, and STAR stories are never shared with employers.
6. **Low friction** — Wizard steps are skippable; document generation is optional; no mandatory onboarding blockers.
7. **Celebration** — Application accepted? Confetti. First job added? Small celebration. These moments matter.

---

*Document: USER_JOURNEY.md*  
*System: CareerOS — job-tracker × career-ops*  
*Version: 1.0 | 2026-04-06*
