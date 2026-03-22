# SmartCampus OS

> **Smart Admission & Academic Management Software** — A scalable, secure, multi-institution SaaS platform for managing admissions, timetables, results, verifications, hiring, and the full academic lifecycle.

---

## Overview

SmartCampus OS is a B2B SaaS platform for universities, departments, and academic institutions. It provides a unified system to manage the complete student lifecycle — from admission through result publication — with built-in cryptographic verification, AI-powered timetable generation, and a panel-based hiring system.

The root website is **software-focused** (not tied to any single university) and provides public-facing tools for applicants, verifiers, and job seekers. Internal operations are managed through role-specific panels.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Admissions** | Multi-step application form, no login required, strict field validation |
| **Inquiry** | General admission inquiry submission stored in the database |
| **Result Management** | Full semester results (all subjects) with SGPA/CGPA per student |
| **Cryptographic Verification** | SHA-256 hash-based verification for student applications and results |
| **Blockchain Audit Trail** | Immutable blockchain TX hash recorded for every result |
| **AI Timetable Generation** | OR-Tools powered timetable solver for multi-batch, multi-room scheduling |
| **Careers & Hiring** | Panel-linked job postings (Super Admin / University / Department), public job board with search & filters |
| **Job Applications** | No-login apply form with mandatory resume upload |
| **Faculty Panel** | Timetable view, assignment management, quiz creation, attendance marking |
| **Student Panel** | Timetable, assignments, quizzes, attendance, library, fee payments |
| **Library Management** | Book catalog, issue & return tracking, fine calculation |
| **Placement Tracking** | Company records, placement-to-student mapping, CTC tracking |
| **Payroll** | Faculty payroll configuration and salary slip generation |
| **Attendance** | Session-based QR attendance with student flag/leave management |
| **Notifications** | Role-scoped push notifications via FCM |
| **Audit Logs** | Full action log with IP address, endpoint, duration per user |

---

## 🛠 Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom design system
- **State Management**: Zustand
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend (`apps/api`)
- **Runtime**: Node.js 20
- **Framework**: Express.js v5
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Auth**: Firebase Admin SDK
- **Caching**: Redis

### AI Microservice
- **Language**: Python 3.10
- **Framework**: FastAPI
- **Solver**: OR-Tools (for timetable generation)
- **Port**: `5000` (via Docker)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL running locally
- Redis instance running
- Firebase project (for auth sync)
- Docker (for AI microservice)

### Install & Run

```bash
# Install all dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Fill in: DATABASE_URL, FIREBASE credentials, REDIS_URL

# Push database schema
cd apps/api
npx prisma db push

# Seed the database with demo data
npx prisma db seed

# Start all services (from root)
cd ../..
pnpm run dev
```

| Service | URL |
|---|---|
| Web App | `http://localhost:3000` |
| API | `http://localhost:8000` |
| AI Microservice | `http://localhost:5000` |

---

## 🔑 Demo Login Credentials

All panel users share the same demo password: **`password123`**

> These users are synced to Firebase on each `npx prisma db seed` run.

### Panel Users

| Role | Username | Email | Panel Access |
|---|---|---|---|
| **Super Admin** | `superadmin` | `admin@smartcampus.os` | `/superadmin` |
| **University Admin** | `admin_vnsgu` | `admin@vnsgu.ac.in` | `/dashboard` |
| **Department Admin** | `admin_dcs_vnsgu` | `admin_dcs@vnsgu.ac.in` | `/department` |
| **Faculty** | `dharmen` | `dharmen@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `jayshree` | `jayshree@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `mayur` | `mayur@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `prakash` | `prakash@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `nimisha` | `nimisha@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `rustam` | `rustam@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `ravi` | `ravi@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `vimal` | `vimal@vnsgu.ac.in` | `/faculty-panel` |
| **Faculty** | `rinku` | `rinku@vnsgu.ac.in` | `/faculty-panel` |

---

## 📋 Seed / Demo Data

### University

| Field | Value |
|---|---|
| Name | Veer Narmad South Gujarat University |
| Short Name | `VNSGU` |
| Location | Surat, Gujarat |
| Email | `admin@vnsgu.ac.in` |
| Established | 1965 |
| Website | `vnsgu.ac.in` |

### Department

| Field | Value |
|---|---|
| Name | Department of Computer Science |
| Short Name | `DCS` |
| HOD | Dr. Apurva Desai |
| Email | `dcs@vnsgu.ac.in` |

### Programs & Batches

| Program | Batch Name | Division | Semester | Strength |
|---|---|---|---|---|
| MCA | MCA Sem 2 - 2025-26 | A | 2 | 60 |
| MCA | MCA Sem 2 - 2025-26 | B | 2 | 60 |
| BCA | BCA Sem 2 - 2025-26 | A | 2 | 60 |

### Courses (MCA Sem 2)

| Code | Subject Name | Credits | Weekly Hrs | Type |
|---|---|---|---|---|
| `201` | Artificial Intelligence | 4 | 4 | Theory |
| `202` | Frontend Technologies | 4 | 4 | Theory |
| `203` | .Net using C# | 4 | 4 | Theory |
| `204` | Blockchain | 4 | 4 | Theory |
| `205` | iOS Development | 4 | 4 | Theory |

### Rooms / Resources

| Name | Type | Capacity | Floor |
|---|---|---|---|
| Lecture Hall 1–5 | Classroom | 60 | 1st |
| Major Lab A, B | Lab | 60 | Ground |
| Minor Lab A, B | Lab | 30 | Ground |
| Theater Hall 1–4 | Classroom | 100 | Ground/1st |

---

## 🎓 Demo Students & Verification Codes

> Verification hashes are regenerated on each `npx prisma db seed` run because SGPA/CGPA are randomized. The console always prints the current values. The hashes below are the **most recently seeded** values.

| Student Name | Enrollment No. | Admission Hash (Student Verify Code) | Result Hash (Result Verify Code) |
|---|---|---|---|
| Aarav Patel | `EN20250000` | `f8c195f943c0ef2114f4ca966cefaf2aa0a66e15c96f55e9b8dfe8030b6e2777` | `257c16368bf8432f651e402de61fb214264c7f4997f499ed3e9e2c0d3ac8f4f7` |
| Diya Sharma | `EN20250001` | `b6183bf04f490ae449bdcd81ea8aca17f0ffc81136c2d61c2a323fd0b4bb4644` | `7aa98ca0f1ee6a40c0234e4bbf948fad6edcc4ecb1d0aeff5bc3ab8746e7d99f` |
| Rahul Verma | `EN20250002` | `7d4db8585f131e5e2842164c73146af793041c6df8a6c1e83b81dc6b958636e9` | `ce6a4f29a42bfee019b4ce76a16dcb69fdfb4349ae7bd1db936d79bfd54292a1` |
| Sneha Iyer | `EN20250003` | `492d32d872515de6c00dfc0f0997234e83f393a55f292a4f8921d4909859c3a3` | `7a7f96502f4b284d0bf6b4432838a906d707999efcbb9346a655e348dc6ec471` |
| Rohan Mehta | `EN20250004` | `3617872100d4d83bd0f50dbb8040f7356d70ef500a1d275c5ffc5992d94b043a` | `999c3bcbacdf46ea4bb6bb6acf65e7ba587573bc41f74f9f7f5063472105ed56` |

#### Additional Seeded Students (no verification hashes — panel view only)

`Priya Desai`, `Amit Singh`, `Neha Gupta`, `Vikram Rathore`, `Pooja Reddy`, `Arjun Iyer`, `Ananya Nair`, `Karthik Raja`, `Meera Krishnan`, `Siddharth Pillai`, `Kavya Menon`, `Varun Reddy`, `Ishaan Rao`, `Tanya Gupta`, `Rohan Sharma`, `Rishi Kapoor`, `Neha Dhupia`, `Akshay Kumar`, `Vidya Balan`, `Hrithik Roshan`, `Kareena Kapoor`, `Ranbir Kapoor`, `Alia Bhatt`, `Varun Dhawan`, `Shraddha Kapoor`

### Demo Semester Results (per verification student)

Each of the 5 verification students has results for **Semester 2 (2025-26)** covering all 5 courses:

| Field | Value |
|---|---|
| Academic Year | 2025-26 |
| Semester | 2 |
| Status | PASS |
| SGPA | Randomized (6.0 – 10.0) |
| CGPA | Randomized (6.0 – 10.0) |
| Subjects | AI, Frontend Technologies, .Net, Blockchain, iOS Dev |

Each subject result contains: **Internal Marks, External Marks, Total, Grade, Credits Earned**.

---

## 💼 Demo Job Postings

| Job ID | Title | Panel | University | Department | Type | Location |
|---|---|---|---|---|---|---|
| `job-sa-001` | System Operations Manager | SuperAdmin | — | — | Full Time | Remote (India) |
| `job-sa-002` | Customer Support Executive | SuperAdmin | — | — | Full Time | Surat, Gujarat |
| `job-sa-003` | DevOps Engineer | SuperAdmin | — | — | Contract | Remote (Worldwide) |
| `job-uni-001` | Professor – Computer Science | University | VNSGU | Computer Science | Full Time | Surat, Gujarat |
| `job-uni-002` | Lab Assistant – Electronics | University | VNSGU | Electronics | Part Time | Surat, Gujarat |
| `job-uni-003` | Academic Counsellor | University | VNSGU | — | Full Time | Surat, Gujarat |
| `job-dept-001` | Lecturer – Data Science | Department | VNSGU | Computer Science | Full Time | Surat, Gujarat |
| `job-dept-002` | Program Coordinator | Department | VNSGU | Computer Science | Full Time | Surat, Gujarat |
| `job-dept-003` | Research Intern – AI/ML | Department | VNSGU | Computer Science | Internship | Remote / Hybrid |

### Demo Job Applications

| Application ID | Job | Applicant Name | Email | Mobile |
|---|---|---|---|---|
| `app-job-sa-001` | System Operations Manager | Arjun Mehta | `arjun.mehta@example.com` | 9876543210 |
| `app-job-uni-001` | Professor – Computer Science | Priya Sharma | `priya.sharma@example.com` | 9123456789 |
| `app-job-dept-001` | Lecturer – Data Science | Rahul Desai | `rahul.desai@example.com` | 9988776655 |

---

## 📖 How to Use Features

### 1. Submitting an Admission Application

1. Go to `http://localhost:3000/admissions`
2. Select University, Department, and Program
3. Fill in personal information (Name, Email, Phone, DOB)
4. Upload required documents
5. Review and submit — no login required
6. You receive a confirmation with your **Application ID**

> All fields marked `*` are mandatory. The form will not proceed without them.

---

### 2. Verifying Students & Results

Navigate to `http://localhost:3000/verify`

#### Student Verification
1. Select the **Student Verification** tab
2. Enter the **Enrollment Number** (e.g., `EN20250000`)
3. Enter the **Verification Code** (Admission Hash from the table above)
4. Click **Verify** → view name, enrollment status, and admission details

#### Result Verification
1. Select the **Result Verification** tab
2. Enter the **Enrollment Number** (e.g., `EN20250000`)
3. Enter the **Result Verification Code** (Result Hash from the table above)
4. Click **Verify** → view full semester result (all subjects, marks, grades, SGPA, CGPA, blockchain TX hash)

**Quick example:**
```
Enrollment:   EN20250000
Result Code:  257c16368bf8432f651e402de61fb214264c7f4997f499ed3e9e2c0d3ac8f4f7
```

---

### 3. Browsing & Applying for Jobs

1. Go to `http://localhost:3000/careers`
2. Browse all active job listings from all panels
3. Use **Search**, **University**, **Department**, and **Job Type** filters (all combinable)
4. Click **Apply Now** on any listing
5. Fill in: Full Name, Email, Mobile, **Resume (mandatory — PDF/DOC)**, Cover Letter (optional)
6. Submit — no login required

---

### 4. Panel Access — Managing Jobs, Timetables & More

> All panels require login at `/login` with Firebase authentication.

| Panel | Route | Key Capabilities |
|---|---|---|
| **Super Admin** | `/superadmin` | Users, Universities, Departments, Permissions, Global Settings, Hiring |
| **University Admin** | `/dashboard` | Students, Faculty, Batches, Courses, Resources, Hiring, Notifications |
| **Department Admin** | `/department` | Timetable generation (AI), Courses, Batches, Faculty assignments, Hiring |
| **Faculty** | `/faculty-panel` | Timetable view, Assignments, Quizzes, Attendance marking, Study Material |
| **Student** | `/student` | Timetable, Assignments, Quiz attempts, Attendance, Library, Fee payments |
| **Faculty Portal** | `/faculty` | Alternative faculty view (profile, schedule) |

---

## 🤖 AI Timetable Generation

The department panel includes AI-powered timetable generation backed by Google OR-Tools:

1. Login as **Department Admin** → **Timetable** section
2. Configure: Batches, Courses, Faculty assignments, Room preferences, Time blocks, Session types
3. Click **Generate Timetable**
4. The request is sent to the FastAPI microservice at `http://localhost:5000`
5. The solver returns a conflict-free schedule respecting all room, faculty, and time constraints
6. Review, publish, or regenerate

> **Note**: Redis must be running for AI generation to work. The microservice runs via Docker.

---

## 🔒 Notes

### Verification System
- Each student and result has a **unique SHA-256 hash** derived from enrollment number and academic data
- Hashes are cryptographically tamper-proof — changing any field invalidates the code
- Each result also has a **Blockchain Transaction Hash** (`blockchainTxHash`) for immutable audit trails
- Current hashes are always printed to the terminal during `npx prisma db seed`

### Resume Upload
- Resume is **mandatory** for all job applications — the form cannot be submitted without it
- Accepted formats: `.pdf`, `.doc`, `.docx`
- In production, integrate `/v2/storage` for file persistence

### Empty State Policy
- Absent or uninitialized structures (e.g., no timetable generated yet) return **HTTP 200 with `null`** data — never a 404 — so the frontend can render empty states gracefully

### Job Filtering
- Careers page dropdowns for University and Department are **dynamically generated** from current job data
- All filters work individually and in combination

---

## 📡 API Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/inquiries` | Submit an admission inquiry |
| `GET` | `/v2/admissions/universities` | List active universities |
| `GET` | `/v2/admissions/programs` | List programs for a department |
| `POST` | `/v2/admissions` | Submit an admission application |
| `POST` | `/v2/verification/student` | Verify a student application |
| `POST` | `/v2/verification/result` | Verify a semester result |
| `GET` | `/v2/jobs` | List all active job postings |
| `POST` | `/v2/jobs/:jobId/apply` | Submit a job application |

### Panel (Firebase Auth Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v2/users` | List all users (SuperAdmin) |
| `GET` | `/v2/universities` | List universities |
| `GET` | `/v2/departments` | List departments |
| `GET` | `/v2/students` | List students |
| `GET` | `/v2/faculty` | List faculty |
| `GET` | `/v2/courses` | List courses |
| `GET` | `/v2/batches` | List batches |
| `GET` | `/v2/timetable/:batchId` | Get timetable for a batch |
| `GET` | `/v2/results/:enrollmentNo` | Get student results |
| `GET` | `/v2/notifications` | Get user notifications |
| `GET` | `/v2/audit-logs` | Get audit logs (SuperAdmin) |

---

## 📁 Project Structure

```
SmartCampusOS/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   │   └── app/
│   │       ├── page.tsx            # Homepage / Hero
│   │       ├── admissions/         # Multi-step admission form
│   │       ├── verify/             # Hash-based verification tool
│   │       ├── careers/            # Job listings with filters
│   │       ├── solutions/          # SaaS Solutions page
│   │       ├── about-us/           # About page
│   │       ├── contact/            # Contact page
│   │       ├── legal/              # Legal pages
│   │       ├── superadmin/         # Super Admin panel
│   │       ├── dashboard/          # University Admin panel
│   │       ├── department/         # Department Admin panel
│   │       ├── faculty-panel/      # Faculty panel
│   │       ├── faculty/            # Faculty portal
│   │       ├── student/            # Student portal
│   │       ├── platform/           # Platform info pages
│   │       └── (auth)/             # Login / auth routes
│   └── api/                        # Express.js backend
│       ├── src/
│       │   ├── controllers/        # Route handlers
│       │   ├── routes/             # Express route definitions
│       │   ├── lib/                # Firebase admin, Redis, utilities
│       │   └── generated/client/   # Prisma generated client
│       └── prisma/
│           ├── schema.prisma       # Full database schema
│           ├── seed.ts             # Seed script (generates hashes + jobs)
│           └── seed-data.json      # Static seed fixture data
├── packages/                       # Shared packages (if any)
├── docker-compose.yml              # Docker setup for AI microservice + Redis
├── turbo.json                      # Turborepo pipeline
└── pnpm-workspace.yaml
```

---

## 📝 License

This project is proprietary software developed for academic management use. All rights reserved.