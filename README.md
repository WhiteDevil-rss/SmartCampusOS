# SmartCampus OS — Institutional Orchestration Platform

> **SmartCampus OS** is a definitive, secure, multi-institution SaaS platform for managing admissions, academic results, cryptographic verifications, AI-powered timetabling, and high-fidelity institutional hiring.

---

## 🏛 Architecture Overview

SmartCampus OS is designed as a high-performance monorepo for maximum scalability and developer velocity.

- **`apps/web`**: Next.js 14 App Router (React 18) — Premium, theme-aware frontend using Tailwind CSS and Framer Motion.
- **`apps/api`**: Node.js 20 & Express 5 — High-throughput RESTful gateway with Prisma ORM and Socket.IO for real-time telemetry.
- **`apps/blockchain-core`**: Hardhat & Solidity — Secure smart contract suite for results and application status verification.
- **`apps/ai-engine`**: Python 3.10 & FastAPI — Distributed microservice for multidimensional optimization and AI scheduling.
- **`packages/types`**: Shared TypeScript definitions ensuring end-to-end type safety across the stack.

---

### 🛡 Cryptographic Verification Hub
Built with a "Security-First" approach, this module allows third parties (employers, agencies) to verify student admissions and academic results using immutable SHA-256 hashes.
- **Terminal Interface**: A high-fidelity, command-line styled verification desk.
- **On-Chain Audit**: Integrated audit trails with unique transaction hashes for every published record.

### ⛓ Modular Blockchain Ecosystem (14 Specialized Contracts)
A comprehensive suite of smart contracts managing every aspect of campus life:
- **Governance**: Decentralized voting, debates, and IP/Patent registration.
- **Identity Hub**: Blockchain-based KYC, digital IDs, and time-based access control.
- **Finance & Equity**: Transparent fee payments, startup equity distribution, and vesting.
- **Academic Plus**: Automatic scholarship release, exam security, and pay-per-lesson learning.
- **Logistics**: Library loan tracking, lost & found, and on-chain grievance resolution.

### 🤖 AI Timetable Engine
A sophisticated scheduling system that solves complex constraints for universities.
- **Conflict Resolution**: Resolves overlapping faculty schedules, classroom availability, and elective constraints using Google's **OR-Tools**.
- **Optimization**: Maximizes resource utilization across multiple departments.

### 💼 Integrated Hiring Ecosystem
A multi-tier recruitment portal that links graduates directly with institutional opportunities.
- **On-Chain Hiring**: Verified offer letters and recruitment tracking on the `SmartCampusHiring` contract.
- **Live Filtering**: Real-time job boards with deep indexing and status tracking.

### 🎓 Premium Student Portal
A centralized, all-in-one dashboard providing a 360-degree view of the student experience.
- **Blockchain Dashboards**: 14 specialized modules for on-chain interactions.
- **AI Assistant**: A specialized AI chatbot (Zembaa AI) for answering syllabus and institutional queries.
- **Instant Rewards**: Automatic scholarship distributions via the `AcademicPlus` credit system.

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
- **Blockchain Core**: Solidity 0.8.24 (14 Modular Contracts), Hardhat, Ethers.js 6.
- **AI Core**: Python 3.10, FastAPI, Google OR-Tools (Constraint Programming).
- **Versioning Standard**: Unified `/v1` (Legacy/Core) and `/v2` (Premium/Student) routing protocols.
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
PORT=5001
DATABASE_URL="postgresql://user:pass@localhost:5432/smartcampus?schema=public"
REDIS_URL="redis://localhost:6379"

# apps/web/.env
NEXT_PUBLIC_API_URL="http://localhost:5001/v1"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5001"
```

### 3. Initialize & Start
```bash
pnpm install

# Option A: Initial Setup (Required once)
pnpm run db:init   # Starts Docker, pushes schema, and seeds data

# Option B: Standard Start (Docker + Services)
pnpm run dev:all   # Starts everything without re-initializing the database

# Option C: Service Only (If Docker is already running)
pnpm run dev       # Starts only the application services

### 4. Stopping Services
To stop all application services and the Docker infrastructure:
```bash
# First, terminate the terminal process (Ctrl + C)
pnpm run stop      # Stops Docker containers (Postgres, Redis, AI Engine)
```

## 🏛 Blockchain Modular Architecture

SmartCampus OS employs a **Modular Ecosystem Architecture**, where each institutional function is governed by its own dedicated smart contract:

1.  **Governance**: Student Council voting & IP management.
2.  **Workplace**: Campus salaries & Micro-internships.
3.  **Identity**: KYC & Unified Student Digital Identity.
4.  **AcademicPlus**: Scholarship automation & Exam integrity.
5.  **Learning**: Decentralized 'Pay-per-Lesson' modules.
6.  **Equity**: Student startup equity & Milestone vesting.
7.  **Institutional**: Verify, Hiring, Finance, Admission, Reevaluation, Library, Complaints.

### 🚀 Deployment
Deploy the entire modular ecosystem:
```bash
cd apps/blockchain-core
pnpm run deploy:local
```

---

## 🎓 Verification Suite (Stable Hashes)

Use these deterministic hashes to verify the system integrity:

| Profile | Enrollment | Admission Verify Hash (SHA-256) | Result SHA-256 Hash |
|---|---|---|---|
| **Aarav Patel** | `EN20250000` | `f8c195f943c0ef2114f4ca966cefaf2aa0a66e15c96f55e9b8dfe8030b6e2777` | `edfe51c49796bde337cd17fa69f3a5499288d0b2b8b1ef10d6e83791b54af554` |
| **Diya Sharma** | `EN20250001` | `b6183bf04f490ae449bdcd81ea8aca17f0ffc81136c2d61c2a323fd0b4bb4644` | `90d62e7debe59a454384964387d5894a2e5ef83f02a05b9ea1fba2c70fe6d078` |
| **Rahul Verma** | `EN20250002` | `7d4db8585f131e5e2842164c73146af793041c6df8a6c1e83b81dc6b958636e9` | `143889a66ee21085d2ee4248d80e11fede31554cc16599cb5051d74355f18ea6` |
| **Sneha Iyer**  | `EN20250003` | `492d32d872515de6c00dfc0f0997234e83f393a55f292a4f8921d4909859c3a3` | `5206c98d7fe14f5dd5fa5ef1319794d1087346bd1903226b183e1c953fcf7059` |
| **Rohan Mehta** | `EN20250004` | `3617872100d4d83bd0f50dbb8040f7356d70ef500a1d275c5ffc5992d94b043a` | `712cee9340fa31f372ca6b73554c5b715e262e3d1ed2f8a77377d88882288221` |

---

## ⚖️ License & Integrity
© 2026 SmartCampus OS — **Handcrafted by Zembaa Solution**. This platform is private intellectual property.
Licensed under the [MIT License](./LICENSE).
