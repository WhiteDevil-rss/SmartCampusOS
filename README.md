# SmartCampus OS

> **SmartCampus OS** — A scalable, secure, multi-institution SaaS platform for managing admissions, results, verifications, timetables, and hiring.

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

# Start all services (Infrastructure + Dev Servers)
# This starts PostgreSQL, Redis, AI Engine, API, and Web
pnpm run dev:all

# Alternatively, if you want more control:
# docker compose up -d
# pnpm run dev
```

| Service | URL |
|---|---|
| Web | `http://localhost:3000` |
| API | `http://localhost:5001` |
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
| Aarav Patel | `EN20250000` | `f8c195f943c0ef2114f4ca966cefaf2aa0a66e15c96f55e9b8dfe8030b6e2777` | `e8e9179b4ca99f93537660d61ec333e750bb83e19a55d34b7dde0efdb86bc80c` |
| Diya Sharma | `EN20250001` | `b6183bf04f490ae449bdcd81ea8aca17f0ffc81136c2d61c2a323fd0b4bb4644` | `8823540396f0128e31d598abeb004412a5cf197a3e2d5ccd0e85ffc9f5dfde63` |
| Rahul Verma | `EN20250002` | `7d4db8585f131e5e2842164c73146af793041c6df8a6c1e83b81dc6b958636e9` | `943e078652fd55555b144d1c81c8f4a61afd2f15617228cb15ef5a1ba0d38274` |
| Sneha Iyer | `EN20250003` | `492d32d872515de6c00dfc0f0997234e83f393a55f292a4f8921d4909859c3a3` | `e2f1051eae31191c68c702d0473c79dcb32246a959ab3801a029e92c4258d137` |
| Rohan Mehta | `EN20250004` | `3617872100d4d83bd0f50dbb8040f7356d70ef500a1d275c5ffc5992d94b043a` | `0aad3d454f3a8af83c8d0443e612f1791895409c50dfae27156ceeac7d0f6352` |
| **TAMPERED TEST** | `EN20250000` | `f8c195f943c0ef2114f4ca966cefaf2aa0a66e15c96f55e9b8dfe8030b6e2777` | `47af10368b89674c860c593b386f1bfd023714bd0638f4a817adb9772ef3aa7f` |
| | | | (Use this to test tampering detection - will return 409) |

**Quick test on `/verify`:**
```
Enrollment:  EN20250000
Result Code: e8e9179b4ca99f93537660d61ec333e750bb83e19a55d34b7dde0efdb86bc80c
```

Each student has **5 subject results** for Semester 2 (2025-26): Internal, External, Total, Grade, Credits, SGPA, CGPA, and a Blockchain TX hash.

---

## 📡 Key API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/inquiries` | Submit an inquiry |
| `POST` | `/v2/admissions/public/submit` | Submit an admission application |
| `GET` | `/v2/verification/public/student` | Verify a student |
| `GET` | `/v2/verification/public/result` | Verify a result |
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