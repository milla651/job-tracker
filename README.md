# Job Tracker

A modern job application tracking web app built with Next.js 14, Prisma, PostgreSQL, and NextAuth.js.

## Features

✨ **User Authentication**
- Secure registration and login
- Session-based authentication with JWT
- Protected dashboard routes

📋 **Job Application Tracking**
- Add, edit, and delete job applications
- Track company, position, location, salary range, and job URL
- Add descriptions and personal notes

📊 **Status Tracking**
- 9 different statuses: Wishlist → Applied → Phone Screen → Interview → Technical → Offer → Accepted/Rejected/Withdrawn
- Visual status badges with color coding
- Quick status updates from job detail page

📈 **Dashboard Analytics**
- Total applications count
- Active applications count
- Interview rate percentage
- Success rate percentage
- Applications grouped by status

⏱️ **Timeline History**
- Automatic timeline events for status changes
- Track the progression of each application
- Timestamp for every update

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud - Supabase, Neon, Railway, etc.)

### Installation

1. **Clone the repository**
   ```bash
   cd job-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database URL - PostgreSQL connection string
   DATABASE_URL="postgresql://user:password@localhost:5432/job_tracker"

   # NextAuth Secret - Generate with: openssl rand -base64 32
   NEXTAUTH_SECRET="your-super-secret-key-here"

   # NextAuth URL (your app's base URL)
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Push database schema**
   ```bash
   npx prisma db push
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions
│   │   ├── auth.ts       # Authentication actions
│   │   └── jobs.ts       # Job CRUD actions
│   ├── api/auth/         # NextAuth API routes
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── jobs/
│   │   │   ├── [id]/     # Job detail & edit pages
│   │   │   └── new/      # New job form
│   │   └── page.tsx      # Dashboard home
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── JobCard.tsx       # Job card component
│   ├── JobForm.tsx       # Job create/edit form
│   ├── Navbar.tsx        # Navigation bar
│   ├── StatusBadge.tsx   # Status indicator
│   ├── StatusSelector.tsx # Status dropdown
│   └── Timeline.tsx      # Event timeline
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
└── middleware.ts         # Route protection
```

## Database Schema

```prisma
model User {
  id              String           @id @default(cuid())
  email           String           @unique
  name            String?
  password        String
  jobApplications JobApplication[]
}

model JobApplication {
  id          String          @id @default(cuid())
  company     String
  position    String
  location    String?
  salaryMin   Int?
  salaryMax   Int?
  jobUrl      String?
  description String?
  notes       String?
  status      JobStatus       @default(APPLIED)
  appliedAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  userId      String
  timeline    TimelineEvent[]
}

enum JobStatus {
  WISHLIST
  APPLIED
  PHONE_SCREEN
  INTERVIEW
  TECHNICAL
  OFFER
  ACCEPTED
  REJECTED
  WITHDRAWN
}

model TimelineEvent {
  id               String @id @default(cuid())
  eventType        String
  description      String?
  eventDate        DateTime @default(now())
  jobApplicationId String
}
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## License

MIT
