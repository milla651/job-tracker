# Job Tracker - Overhaul & Roadmap

This document outlines potential enhancements, automation strategies, and major features for a complete project overhaul.

## 🤖 Automation Opportunities

### 1. Smart Job Parsing (AI/LLM Integration)
-   **Goal**: Eliminate manual data entry.
-   **Method**: Paste a job URL -> Fetch meta tags (og:title, etc.) -> Use an LLM (OpenAI/Ollama) to parse:
    -   Company Name, Job Title, Salary Range (if visible), Location, Skills required.
-   **Tech**: Puppeteer (or similar) to scrape + GPT-4o-mini for extraction.

### 2. Auto-Enrichment (Clearbit / Apollo APIs)
-   **Goal**: Make job cards visually rich without user effort.
-   **Method**: Once a company name is entered, automatically fetch:
    -   Company Logo & Website
    -   Industry (Tech, Finance, etc.)
    -   Company Size / Funding data
    -   Glassdoor Rating

### 3. Stale Job Cleanup
-   **Goal**: Keep the dashboard actionable.
-   **Method**: Run a nightly cron job:
    -   If status is "Applied" for >14 days with no update -> Move to "Review Needed" or send a "Nudge" email.
    -   If status is "Interview" and date passed -> Prompt user: "How did it go?"

### 4. Email Parsing (Advanced)
-   **Goal**: Update status via email forwarding.
-   **Method**: Forward rejection/interview emails to `save@tracker.yourdomain.com`.
    -   System parses email subject/body -> Finds matching job -> Updates status (e.g., "Thank you for applying..." -> Rejected).

---

## 🚀 Key Feature Additions

### 1. Kanban Board & Pipeline View
-   **Why**: Lists are good for data, boards are good for flow.
-   **What**: A Trello-style drag-and-drop board.
    -   Columns: Wishlist -> Applied -> Screen -> Interview -> Offer.
    -   Drag a card to update its status instantly.

### 2. Application Funnel & Analytics
-   **Why**: Visualize success rates.
-   **What**: A "Funnel Chart" showing:
    -   100 Applied -> 20 Screens -> 5 Interviews -> 1 Offer.
    -   Charts for "Applications per Day" or "Response Time by Company".

### 3. AI Career Coach / Resume Tailoring
-   **Why**: Improve chances of getting hired.
-   **What**:
    -   Upload Resume PDF.
    -   Click "Analyze against Job Description".
    -   Output: "Missing keywords: React, TypeScript. Relevance Score: 85%".

### 4. Calendar Sync
-   **Why**: Never miss an interview.
-   **What**: One-click "Add to Google Calendar" for interviews.
    -   Or full 2-way sync: System sees "Interview with Google" on your calendar -> Updates job status to "Interview".

### 5. Browser Extension
-   **Why**: Frictionless adding.
-   **What**: A Chrome extension that detects you are on LinkedIn/Indeed.
    -   Click floating "Track" button -> Scrapes page -> Adds to your database -> Shows "Saved!" notification.
