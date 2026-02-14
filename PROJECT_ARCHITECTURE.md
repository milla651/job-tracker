# Job Tracker - Project Architecture & Overview

This document maps out the architecture, technology stack, and core features of the Job Tracker web application.

## 🚀 Project Overview
The **Job Tracker** is a comprehensive web application designed to help users organize and track their job application process. It moves beyond simple spreadsheets by offering a visual, interactive dashboard with smart filtering, status tracking, and document management.

### Key Logic & Data Flow
1.  **User Authentication**: Users sign in (handled via NextAuth.js) to access their private dashboard.
2.  **Job Management**: Users can creating, reading, updating, and deleting (CRUD) job applications.
3.  **Smart Filtering**: The dashboard allows robust filtering by Status, Location, Salary, and Date to quickly find relevant applications.
4.  **Data Persistence**: All data is stored in a PostgreSQL database managed via Prisma ORM.

---

## 🛠 Technology Stack

### Core Framework
-   **[Next.js 16](https://nextjs.org/)**: The React framework for production. content is rendered on the server (SSR) and Server Components for optimal performance.
-   **React 19**: The latest version of the generic library for building user interfaces.
-   **TypeScript**: Static type checking for robust and maintainable code.

### Database & Backend
-   **[PostgreSQL](https://www.postgresql.org/)**: Relational database for structured data storage.
-   **[Prisma ORM](https://www.prisma.io/)**: Type-safe database client for seamless interaction with PostgreSQL.
-   **Next.js Server Actions**: Handles form submissions and data mutations directly from the server.

### Styling & UI
-   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
-   **[Shadcn/UI](https://ui.shadcn.com/)**: Reusable, accessible components (Popover, Button, Input) built on **Radix UI**.
-   **[Lucide React](https://lucide.dev/)**: Beatuiful & consistent icon set.
-   **Framer Motion**: (Use sparingly) for smooth UI transitions and animations.

---

## 📂 Architecture & Folder Structure

The project follows the standard **Next.js App Router** structure:

```
src/
├── app/                  # App Router: Pages & API Routes
│   ├── actions/          # Server Actions (Business Logic)
│   │   └── jobs.ts       # Job CRUD & filtering logic
│   ├── dashboard/        # Dashboard Pages
│   │   ├── page.tsx      # Main Dashboard View
│   │   ├── jobs/         # Job Details & Edit Views
│   │   └── settings/     # User Settings
│   ├── page.tsx          # Landing Page
│   └── layout.tsx        # Root Layout
├── components/           # Reusable UI Components
│   ├── dashboard/        # Dashboard-specific components (JobListing, etc.)
│   └── ui/               # Shadcn UI primitives (Button, Popover, etc.)
├── lib/                  # Utility functions & Shared Code
│   ├── prisma.ts         # Prisma Client Instance
│   └── utils.ts          # Helper functions (formatting, class merging)
└── hooks/                # Custom React Hooks
```

---

## 🗄 Database Schema (Prisma)

The data model is built around the **User** and **JobApplication** entities.

-   **User**: Handles authentication and profile data.
-   **JobApplication**: The core entity.
    -   `status`: Enum (APPLIED, INTERVIEW, OFFER, etc.)
    -   `location`: City/Remote status.
    -   `salaryMin` / `salaryMax`: Salary expectations.
    -   `timeline`: Related events (e.g., "Interview scheduled").
    -   `documents`: Resumes/Cover letters attached to the job.

---

## ✨ Core Features & Output

### 1. Interactive Dashboard
-   **Visual Stats**: Top-level metrics for Total Jobs, Active Applications, and Success Rate.
-   **Job Listing**: A grid/list view of all applications.

### 2. Smart Filtering & Sorting (Recent Update)
-   **Location & Salary**: Filter jobs by city or salary range.
-   **Time Travel**: "Quick Chips" for filtering by [Last 7 Days], [This Month], etc. (In Progress).
-   **Sorting**: Sort by Date, Company Name, Location, or Salary.

### 3. Detailed Job View
-   Track specific details, notes, and the timeline of each application.
-   Attach relevant documents.

---

## 🔮 Future Roadmap / Recommendations

1.  **AI-Powered Insights**: Analyze job descriptions to suggest "Smart Nudges" or resume keywords.
2.  **Kanban Board**: A drag-and-drop board view for managing job statuses visually.
3.  **Application Analytics**: Charts showing application velocity over time.
4.  **Browser Extension**: Quickly add jobs directly from LinkedIn or Indeed.
