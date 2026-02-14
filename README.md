# 🚀 JobTracker - Your AI-Powered Career Companion

JobTracker is a modern, privacy-focused application designed to streamline your job search. Unlike generic spreadsheets or Trello boards, JobTracker is built specifically for the hiring process, featuring a "Premium Glass" aesthetic, gamified progress, and deep analytics.

## ✨ Key Features

### 1. **The Dashboard (Mission Control)**
-   **Visual Analytics**: GitHub-style "Activity Heatmap" and "Pipeline Funnel" to track your momentum.
-   **Stats at a Glance**: Real-time counters for Active Apps, Interviews, and Success Rate.
-   **Mission Control Zero State**: An engaging onboarding experience for new users.

### 2. **Bento Grid Job Management**
-   **Rich Job Profiles**: Every job is a "Bento Grid" page with distinct cards for Role Info, Status, Logistics, and Notes.
-   **Smart Context**: Dedicated fields for Salary Ranges, Job URLs, and Location.
-   **Glassmorphism UI**: A beautiful, distraction-free interface with dark mode support.

### 3. **Gamified Success**
-   **Celebration Mode**: Triggers confetti fireworks when you mark a job as "Offer" or "Accepted".
-   **Progress Bars**: Visual cues for where you are in the hiring pipeline.

### 4. **Smart Navigation**
-   **Cockpit Navbar**: Context-aware navigation with a "Quick Add" button always within reach.
-   **Responsive Design**: Fully optimized for mobile, allowing you to update status on the go.

### 5. **Secure & Private**
-   **NextAuth Authentication**: Secure login/signup flow.
-   **Private Data**: Your job search is your business. Data is isolated per user.

## 🛠️ Tech Stack
-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + ShadCN UI + Framer Motion
-   **Database**: PostgreSQL (via Prisma ORM)
-   **Auth**: NextAuth.js
-   **Visuals**: Lucide Icons, Canvas Confetti

## 🚀 Getting Started

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/job-tracker.git
    cd job-tracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env` file with:
    ```env
    DATABASE_URL="postgresql://..."
    NEXTAUTH_SECRET="your-secret"
    ```

4.  **Run Database Migrations**
    ```bash
    npx prisma db push
    ```

5.  **Start the Server**
    ```bash
    npm run dev
    ```

## 🔮 Future Roadmap
-   **AI Career Copilot**: Auto-generate cover letters.
-   **Smart Nudges**: Reminders to follow up on stale applications.
-   **Document Hub**: Store resumes and contracts.
