# 🎓 NEP-Scheduler (VNSGU Scale)

**NEVER Endure Painful Scheduling Again!**

NEP-Scheduler is a high-performance, intelligent university timetable generation and management system built on a microservice architecture. Engineered specifically to handle complex NEP guidelines like Primary/Secondary workloads, Special Shifts, parallel lab assignments, and interconnected multi-role RBAC access. 

This platform seamlessly orchestrates a React/Next.js frontend, a Node.js REST API with WebSockets for real-time reactivity, and a standalone Python-powered AI Engine using Google OR-Tools.

## 🌟 Key Features

*   **Intelligent AI Scheduling:** Solves mathematically complex constraint maps (Hard & Soft constraints) via Google OR-Tools in seconds.
*   **Multi-Role RBAC:** Dedicated panels for Superadmins, University Admins, Department Admins, and Faculty members.
*   **Real-Time Subscriptions:** Powered by `Socket.io` — instant timetable refresh notifications across relevant department modules.
*   **Special Contingency Mode:** Dynamically re-route active schedules excluding specific unavailable faculties and visually highlighting substitution matrices.
*   **Workload Tracking:** Automated detection of max hours per week against assigned Primary and Secondary subjects.
*   **Export Ready:** Browser-native PDF grid printing formatted for official university notices.

---

## 🏗️ Architecture Stack

NEP-Scheduler operates on a 3-tier structure managed within a PNPM Monorepo:

### 1. `apps/web` (Frontend)
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS + Shadcn UI
*   **State:** Zustand (Auth) + TanStack Query (Data)
*   **Realtime:** Socket.io-Client

### 2. `apps/api` (Backend)
*   **Runtime:** Node.js 20 + Express (TypeScript)
*   **Database ORM:** Prisma
*   **Realtime Pub/Sub:** Socket.io
*   **Authentication:** JWT + bcrypt

### 3. `apps/ai-engine` (Solver Microservice)
*   **Runtime:** Python 3.10 + FastAPI
*   **Solver API:** Google OR-Tools (CP-SAT Solver)
*   **Schema Validation:** Pydantic models aligning exactly to Node.js interfaces.

### 4. Infrastructure Services
*   **PostgreSQL 15:** Primary transactional dataset.
*   **Redis:** In-memory caching layer enforcing concurrent timetable generation locks.

---

## 🚀 Quick Start (Production via Docker Compose)

The easiest way to spin up the entire application stack is via our consolidated Docker Compose file. This instantiates PostgreSQL, Redis, the Python AI Engine, and the Node.js API simultaneously.

Ensure you have [Docker](https://docs.docker.com/get-docker/) installed.

### 1. Fire up the Stack
```bash
docker-compose up --build -d
```
*   The Database will spin up on `:5432`
*   The Redis cache will spin up on `:6379`
*   The AI Engine will deploy to `:5000`
*   The API Server will deploy to `:8000`

> Note: On initial launch, the API container might restart once while waiting for PostgreSQL to become fully healthy.

### 2. Seed Initial University Data
Once the stack is running, you must push the Prisma Schema and seed the database with the VNSGU demo environment.

```bash
cd apps/api
pnpm install
npx prisma db push
npx prisma db seed
```

### 3. Launch Frontend (Local)
In a new terminal window:
```bash
cd apps/web
pnpm install
pnpm run dev
```
Navigate to `http://localhost:3000`.

---

## 🔑 Demo Access Credentials

The database seeding script populates standard demo accounts bridging across roles. Use these to verify RBAC access:

| Role | Email | Password | Panel URL |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin@nepscheduler.com` | `password123` | `/superadmin` |
| **Uni Admin** | `admin@vnsgu.ac.in` | `password123` | `/dashboard` |
| **Dept Admin** | `admin.cs@vnsgu.ac.in` | `password123` | `/department` |
| **Faculty (CS)**| `dshah@vnsgu.ac.in` | `password123` | `/faculty-panel` |

---

## 🧪 Testing Matrices

The ecosystem uses `ts-node` for exhaustive end-to-end (E2E) integration matrices spanning across all microservice instances simulating real UI clicks via backend endpoint sequences.

To invoke the E2E verification test pipeline:
```bash
cd apps/api
pnpx ts-node test-e2e.ts
```
Expected output:
*   Authentication Token Exchanges
*   Verification of RBAC scopes
*   A mathematical payload execution targeting the Python AI Engine
*   A WebSocket connection validation trigger

## 📜 Development Guidelines
- Always prioritize running `pnpm run lint` and `pnpm run build` from the frontend workspaces prior to pushing.
- Prisma Schema modifications requiring migrations must be pushed via `npx prisma db push`.
# TimeTableGenerator
