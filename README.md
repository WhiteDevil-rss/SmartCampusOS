# SmartCampus OS — Institutional Orchestration Platform

> **SmartCampus OS** is a definitive, secure, multi-institution SaaS platform for managing admissions, academic results, cryptographic verifications, AI-powered timetabling, and high-fidelity institutional hiring.

---

## 🏛 Architecture Overview

SmartCampus OS is designed as a high-performance monorepo for maximum scalability and developer velocity.

- **`apps/web`**: Next.js 14 App Router (React 18) — Premium, theme-aware frontend using Tailwind CSS and Framer Motion.
- **`apps/api`**: Node.js 20 & Express 5 — High-throughput RESTful gateway with Prisma ORM and Socket.IO for real-time telemetry.
- **`apps/ai-engine`**: Python 3.10 & FastAPI — Distributed microservice for multidimensional optimization and AI scheduling.
- **`packages/types`**: Shared TypeScript definitions ensuring end-to-end type safety across the stack.

---

## ✨ Core Modules

### 🛡 Cryptographic Verification Hub
Built with a "Security-First" approach, this module allows third parties (employers, agencies) to verify student admissions and academic results using immutable SHA-256 hashes.
- **Terminal Interface**: A high-fidelity, command-line styled verification desk.
- **Blockchain Ready**: Integrated audit trails with unique transaction hashes for every published record.

### 🤖 AI Timetable Engine
A sophisticated scheduling system that solves complex constraints for universities.
- **Conflict Resolution**: Resolves overlapping faculty schedules, classroom availability, and elective constraints using Google's **OR-Tools**.
- **Optimization**: Maximizes resource utilization across multiple departments.

### 💼 Integrated Hiring Ecosystem
A multi-tier recruitment portal that links graduates directly with institutional opportunities.
- **Role-Based Interaction**: SuperAdmins manage university-wide postings; Departments manage niche clinical or research roles.
- **Live Filtering**: Real-time job boards with deep indexing and status tracking.

### 🎓 Premium Student Portal
A centralized, all-in-one dashboard providing a 360-degree view of the student experience.
- **Fees & Finance**: Real-time balances and virtual receipt generation.
- **Academic Hub**: Integrated library loans, assignment tracking, and material distribution (LMS lite).
- **AI Assistant**: A specialized AI chatbot (Zembaa AI) for answering syllabus and institutional queries.

---

## 🔑 Demo Access Protocols

| Role | Environment | Email | Credentials |
|---|---|---|---|
| **Super Admin** | `/superadmin` | `admin@smartcampus.os` | `password123` |
| **University Admin**| `/dashboard`  | `admin@vnsgu.ac.in` | `password123` |
| **Department Admin**| `/department` | `admin_dcs@vnsgu.ac.in` | `password123` |
| **Faculty Member**  | `/faculty-panel` | `rustam@vnsgu.ac.in` | `password123` |
| **Student**         | `/` (Login)      | `aarav.patel@student.vnsgu.ac.in`| `password123` |

---

## 💎 Technical Specifications (The Stack)

Handcrafted for visual excellence and technical stability:

- **Frontend Core**: Next.js 15+, Tailwind CSS 3.4, Shadcn UI, Framer Motion.
- **Backend Core**: Express 5.0 (Beta), Prisma ORM, Socket.IO 4.7.
- **Datastore**: PostgreSQL (Primary), Redis (Caching & Job Queues).
- **AI Core**: Python 3.10, FastAPI, Google OR-Tools (Constraint Programming).
- **Security**: Firebase Admin SDK (Auth & UID verification), SHA-256 Hashing.

---

## 🛠 Setup & Deployment

Ensure you have **Docker**, **Node.js 20+**, and **PNPM 9+** installed.

### 1. External Infrastructure
Launch the essential services (PostgreSQL, Redis) via Docker:
```bash
docker-compose up -d
```

### 2. Environment Configuration
Populate `.env` files in `apps/api` and `apps/web`:
```bash
# apps/api/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/smartcampus"
REDIS_URL="redis://localhost:6379"
PORT=8001

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:5001/v1"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5001"
```

### 3. Initialize Domain
```bash
pnpm install
pnpm run dev:all # Simultaneously starts API, Web, and AI Engine
```

---

## 🎓 Verification Suite (Stable Hashes)

Use these deterministic hashes to verify the system integrity:

| Profile | Enrollment | Admission Verify Hash (SHA-256) | Result SHA-256 Hash |
|---|---|---|---|
| **Aarav Patel** | `EN20250000` | `f8c195f943c0ef2114f4ca966cefaf2aa0a66e15c96f55e9b8dfe8030b6e2777` | `cb288f88854cdbb641faf5897e46c8a958a4bdfdbececbf63de6a6c49230fa51` |
| **Diya Sharma** | `EN20250001` | `b6183bf04f490ae449bdcd81ea8aca17f0ffc81136c2d61c2a323fd0b4bb4644` | `c92866f70f28bac579f3c1d36ccacae24fdc44401b834b1acc249440b1c5ac53` |
| **Sneha Iyer**  | `EN20250003` | `492d32d872515de6c00dfc0f0997234e83f393a55f292a4f8921d4909859c3a3` | `c22aa491893c94c9e8e1200e506d6cf73390a0b8daf389267eb1ccdc94258068` |

---

## ⚖️ License & Integrity
© 2026 SmartCampus OS — **Handcrafted by Zembaa Solution**. This platform is private intellectual property.
Licensed under the [MIT License](./LICENSE).
