freelancer-job-tracker/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page-level views
│   │   ├── services/          # API communication (axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                    # Express Backend
│   ├── controllers/           # Request logic
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── middleware/            # Auth, error handling
│   ├── config/                # DB connection, env config
│   ├── server.js
│   └── package.json
│
├── .env.example               # Environment variables
├── README.md
└── LICENSE


📦 Tech Stack

    Frontend: React + Axios + Recharts + TailwindCSS

    Backend: Express + MongoDB + Mongoose + JWT

    Deployment: Vercel (client), Render or Railway (server)

<!-- ✅ 2. OpenAPI Specification (API Docs)

Here’s a simplified [OpenAPI 3.0] JSON snippet for your /api/jobs endpoints: -->

openapi: 3.0.0
info:
  title: Freelancer Job Tracker API
  version: 1.0.0
paths:
  /api/jobs:
    get:
      summary: Get all job applications
      parameters:
        - in: query
          name: status
          schema:
            type: string
          description: Filter by status (applied, interview, offered, rejected)
      responses:
        '200':
          description: A list of job entries
    post:
      summary: Create a new job entry
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Job'
      responses:
        '201':
          description: Job created

  /api/jobs/{id}:
    put:
      summary: Update a job entry
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Job'
      responses:
        '200':
          description: Job updated

    delete:
      summary: Delete a job entry
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Job deleted

components:
  schemas:
    Job:
      type: object
      properties:
        title:
          type: string
        company:
          type: string
        location:
          type: string
        status:
          type: string
        dateApplied:
          type: string
          format: date
<!-- ✅ 3. System Diagrams
a. ER Diagram (MongoDB Style) -->

┌────────────────────────────┐
│         User               │
├────────────────────────────┤
│ _id: ObjectId              │
│ email: string              │
│ password: hashed string    │
│ name: string               │
└────────────┬───────────────┘
             │
     One-to-Many
             │
┌────────────▼───────────────┐
│     JobApplication         │
├────────────────────────────┤
│ _id: ObjectId              │
│ userId: ObjectId           │
│ title: string              │
│ company: string            │
│ location: string           │
│ status: enum               │
│ dateApplied: Date          │
│ notes: string (optional)   │
└────────────────────────────┘

<!-- b. System Architecture Diagram -->
[ Client (React) ]
      |
      |  HTTPS (Axios)
      ▼
[ Node.js Express Server ]
      |
      |  Mongoose ODM
      ▼
[ MongoDB Atlas (Cloud DB) ]

User Authentication (JWT)
⬆         ↕
Auth Middleware / Protected Routes
