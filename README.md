# SmartCampus OS

> **Smart Admission & Academic Management Software** — A scalable, secure, multi-institution SaaS platform for managing admissions, results, verifications, timetables, and hiring.

---

## Overview

SmartCampus OS is a B2B SaaS platform for universities, departments, and academic institutions. It covers the full student lifecycle — from admission through result publication — with built-in cryptographic verification, AI-powered timetable generation, and a panel-based hiring system.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Admissions** | Multi-step application form, no login required |
| **Result Management** | Full semester results with SGPA/CGPA |
| **Cryptographic Verification** | SHA-256 hash verification for applications and results |
| **Blockchain Audit Trail** | Immutable TX hash recorded per result |
| **AI Timetable Generation** | OR-Tools powered conflict-free scheduler |
| **Careers & Hiring** | Panel-linked job board with search & filters |
| **Job Applications** | No-login apply with mandatory resume upload |
| **Faculty Panel** | Timetable, assignments, quizzes, attendance |
| **Student Panel** | Timetable, assignments, library, fee payments |
| **Attendance** | QR-based session attendance with flag management |
| **Notifications** | Role-scoped push notifications via FCM |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Zustand, Shadcn UI |
| **Backend** | Node.js 20, Express.js v5, Prisma, PostgreSQL |
| **Auth** | Firebase Admin SDK |
| **Real-time** | Socket.io, Redis |
| **AI Service** | Python 3.10, FastAPI, OR-Tools (Docker, port `5000`) |

---

## 🚀 Getting Started

```bash
pnpm install

# Configure environment
cp apps/api/.env.example apps/api/.env
# Fill in: DATABASE_URL, Firebase credentials, REDIS_URL

# Setup database
cd apps/api
npx prisma db push
npx prisma db seed

# Start all services
cd ../..
pnpm run dev
```

| Service | URL |
|---|---|
| Web | `http://localhost:3000` |
| API | `http://localhost:8000` |
| AI Microservice | `http://localhost:5000` |

---

## 🔑 Demo Login Credentials

**Password for all accounts:** `password123`

| Role | Email | Panel Route |
|---|---|---|
| Super Admin | `admin@smartcampus.os` | `/superadmin` |
| University Admin | `admin@vnsgu.ac.in` | `/dashboard` |
| Department Admin | `admin_dcs@vnsgu.ac.in` | `/department` |
| Faculty | `rustam@vnsgu.ac.in` | `/faculty-panel` |
| Faculty | `dharmen@vnsgu.ac.in` | `/faculty-panel` |

---

## 🎓 Demo Students & Verification Codes

> **Note:** Hashes are regenerated on each `npx prisma db seed` run (SGPA/CGPA are randomized). The console always prints current values.

| Student | Enrollment No. | Admission Hash | Result Hash |
|---|---|---|---|
| Aarav Patel | `EN20250000` | `f8c195f943c0ef2114f4ca966cefaf2aa0a66e15c96f55e9b8dfe8030b6e2777` | `257c16368bf8432f651e402de61fb214264c7f4997f499ed3e9e2c0d3ac8f4f7` |
| Diya Sharma | `EN20250001` | `b6183bf04f490ae449bdcd81ea8aca17f0ffc81136c2d61c2a323fd0b4bb4644` | `7aa98ca0f1ee6a40c0234e4bbf948fad6edcc4ecb1d0aeff5bc3ab8746e7d99f` |
| Rahul Verma | `EN20250002` | `7d4db8585f131e5e2842164c73146af793041c6df8a6c1e83b81dc6b958636e9` | `ce6a4f29a42bfee019b4ce76a16dcb69fdfb4349ae7bd1db936d79bfd54292a1` |
| Sneha Iyer | `EN20250003` | `492d32d872515de6c00dfc0f0997234e83f393a55f292a4f8921d4909859c3a3` | `7a7f96502f4b284d0bf6b4432838a906d707999efcbb9346a655e348dc6ec471` |
| Rohan Mehta | `EN20250004` | `3617872100d4d83bd0f50dbb8040f7356d70ef500a1d275c5ffc5992d94b043a` | `999c3bcbacdf46ea4bb6bb6acf65e7ba587573bc41f74f9f7f5063472105ed56` |

**Quick test on `/verify`:**
```
Enrollment:  EN20250000
Result Code: 257c16368bf8432f651e402de61fb214264c7f4997f499ed3e9e2c0d3ac8f4f7
```

Each student has **5 subject results** for Semester 2 (2025-26): Internal, External, Total, Grade, Credits, SGPA, CGPA, and a Blockchain TX hash.

---

## 📡 Key API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/inquiries` | Submit an inquiry |
| `POST` | `/v2/admissions` | Submit an admission application |
| `POST` | `/v2/verification/student` | Verify a student |
| `POST` | `/v2/verification/result` | Verify a result |
| `GET` | `/v2/jobs` | List active job postings |
| `POST` | `/v2/jobs/:jobId/apply` | Apply for a job |

### Panel (Auth Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v2/students` | List students |
| `GET` | `/v2/faculty` | List faculty |
| `GET` | `/v2/timetable/:batchId` | Get batch timetable |
| `GET` | `/v2/results/:enrollmentNo` | Get student results |
| `GET` | `/v2/audit-logs` | Audit logs (SuperAdmin) |

---

## 📁 Project Structure

```
SmartCampusOS/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   └── api/              # Express.js backend
│       └── prisma/       # Schema, seed, migrations
├── docker-compose.yml    # AI microservice + Redis
└── turbo.json
```

---

## 📝 License

This project is licensed under the [MIT License](./LICENSE).