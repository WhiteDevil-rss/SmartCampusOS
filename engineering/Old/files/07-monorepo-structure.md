# 07 — Monorepo Structure

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Monorepo Overview

NEP-Scheduler is organized as a **Turborepo monorepo** with three primary applications and shared packages. This enables type sharing between frontend and backend, unified CI/CD pipelines, and atomic commits across layers.

**Repository Root:** `nep-scheduler/`
**Monorepo Tool:** [Turborepo](https://turbo.build/)
**Package Manager:** `pnpm` workspaces

---

## 2. Full Directory Tree

```
nep-scheduler/                              # Root monorepo
│
├── apps/
│   ├── web/                                # Next.js 14 Frontend
│   │   ├── app/                            # App Router (Next.js 14)
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx            # Role selector + login form
│   │   │   │
│   │   │   ├── superadmin/                 # SUPERADMIN panel
│   │   │   │   ├── layout.tsx              # Superadmin sidebar layout
│   │   │   │   ├── page.tsx                # Overview dashboard
│   │   │   │   ├── universities/
│   │   │   │   │   └── page.tsx            # University CRUD table
│   │   │   │   ├── credentials/
│   │   │   │   │   └── page.tsx            # Credentials management
│   │   │   │   └── timetables/
│   │   │   │       └── page.tsx            # All timetables (global view)
│   │   │   │
│   │   │   ├── dashboard/                  # UNI_ADMIN panel
│   │   │   │   ├── layout.tsx              # University admin layout
│   │   │   │   ├── page.tsx                # University overview stats
│   │   │   │   ├── departments/page.tsx    # Department CRUD
│   │   │   │   ├── programs/page.tsx       # Program management
│   │   │   │   ├── faculty/page.tsx        # Faculty pool
│   │   │   │   ├── resources/page.tsx      # Classrooms & labs
│   │   │   │   ├── batches/page.tsx        # Batch management
│   │   │   │   ├── courses/page.tsx        # Course catalog
│   │   │   │   ├── generate/page.tsx       # Timetable generation form
│   │   │   │   └── timetables/
│   │   │   │       ├── page.tsx            # Timetable list
│   │   │   │       └── [id]/page.tsx       # Timetable viewer
│   │   │   │
│   │   │   ├── department/                 # DEPT_ADMIN panel
│   │   │   │   ├── layout.tsx              # Department admin layout
│   │   │   │   ├── page.tsx                # Department overview
│   │   │   │   ├── faculty/page.tsx        # Dept faculty management
│   │   │   │   ├── courses/page.tsx        # Dept course management
│   │   │   │   ├── resources/page.tsx      # Dept resource management
│   │   │   │   ├── batches/page.tsx        # Dept batch management
│   │   │   │   ├── generate/page.tsx       # Standard TT generation form
│   │   │   │   ├── special/page.tsx        # Special TT form
│   │   │   │   └── timetables/
│   │   │   │       ├── page.tsx            # Dept timetable list
│   │   │   │       └── [id]/page.tsx       # Timetable viewer + export
│   │   │   │
│   │   │   └── faculty-panel/              # FACULTY portal
│   │   │       ├── layout.tsx              # Faculty panel layout
│   │   │       ├── page.tsx                # Personal timetable grid
│   │   │       ├── profile/page.tsx        # Profile management
│   │   │       └── credentials/page.tsx    # Password change
│   │   │
│   │   ├── components/
│   │   │   ├── timetable/
│   │   │   │   ├── TimetableGrid.tsx       # Main grid component (days × slots)
│   │   │   │   ├── TimetableCell.tsx       # Individual time slot cell
│   │   │   │   └── TimetableExport.tsx     # PDF download + print controls
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── GenerateForm.tsx        # TT generation config form
│   │   │   │   ├── SpecialTTForm.tsx       # Special TT resource selector
│   │   │   │   ├── FacultyForm.tsx         # Faculty add/edit form
│   │   │   │   ├── CourseForm.tsx          # Course add/edit form
│   │   │   │   └── ResourceForm.tsx        # Classroom/lab add/edit form
│   │   │   │
│   │   │   ├── ui/                         # shadcn/ui component overrides
│   │   │   │   └── (Button, Input, Table, Modal, Badge, Alert, etc.)
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   └── PanelLayout.tsx         # Sidebar + topbar wrapper (shared)
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── DataTable.tsx           # Reusable paginated data table
│   │   │       ├── StatsCard.tsx           # Dashboard stat card widget
│   │   │       └── ConfirmModal.tsx        # Generic delete confirmation dialog
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                      # Axios API client wrapper
│   │   │   ├── socket.ts                   # Socket.io client setup & hooks
│   │   │   └── utils.ts                    # Shared utility functions
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts                # Zustand: JWT, role, entityIds
│   │   │   └── uiStore.ts                  # Zustand: modal state, sidebar open
│   │   │
│   │   ├── hooks/
│   │   │   ├── useTimetable.ts             # TanStack Query hooks for timetable data
│   │   │   └── useRealtimeUpdates.ts       # Socket.io subscription hook
│   │   │
│   │   ├── middleware.ts                   # Next.js route protection middleware
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                                # Node.js Express API Server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts          # POST /login, /logout, /refresh
│   │   │   │   ├── university.routes.ts    # CRUD universities
│   │   │   │   ├── department.routes.ts    # CRUD departments
│   │   │   │   ├── faculty.routes.ts       # CRUD faculty + schedule
│   │   │   │   ├── course.routes.ts        # CRUD courses
│   │   │   │   ├── resource.routes.ts      # CRUD resources
│   │   │   │   ├── batch.routes.ts         # CRUD batches
│   │   │   │   └── timetable.routes.ts     # Generate + special + export
│   │   │   │
│   │   │   ├── controllers/               # HTTP request handlers (thin layer)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── university.controller.ts
│   │   │   │   ├── timetable.controller.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── services/                  # Business logic layer
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── timetable.service.ts   # Redis lock, AI call, DB write
│   │   │   │   ├── faculty.service.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts     # JWT verification
│   │   │   │   ├── rbac.middleware.ts     # Role-based access check
│   │   │   │   └── error.middleware.ts    # Global RFC 7807 error handler
│   │   │   │
│   │   │   ├── sockets/
│   │   │   │   └── timetable.socket.ts   # Socket.io event handlers
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   └── pdf.job.ts            # BullMQ: async PDF generation job
│   │   │   │
│   │   │   └── app.ts                    # Express app entry point
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Prisma data model
│   │   │   └── migrations/               # Database migration history
│   │   │
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── ai-engine/                        # Python FastAPI AI/ML Engine
│       ├── app/
│       │   ├── main.py                   # FastAPI app entry + router registration
│       │   │
│       │   ├── solver/
│       │   │   ├── cp_sat_solver.py      # Main OR-Tools CP-SAT implementation
│       │   │   ├── constraint_model.py   # Hard & soft constraint definitions
│       │   │   └── solution_extractor.py # Convert solver output to timetable JSON
│       │   │
│       │   ├── ml/
│       │   │   └── slot_predictor.py     # XGBoost: predict optimal time slots
│       │   │
│       │   ├── api/
│       │   │   ├── solve.py              # POST /solve endpoint
│       │   │   └── health.py             # GET /health endpoint
│       │   │
│       │   └── models/
│       │       └── schemas.py            # Pydantic request/response models
│       │
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── types/                            # Shared TypeScript type definitions
│   │   ├── src/
│   │   │   └── index.ts                 # University, Faculty, Timetable, Slot, User interfaces
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── validation/                      # Shared Zod validation schemas
│       ├── src/
│       │   └── index.ts                 # GenerateRequest, FacultyCreate, etc.
│       ├── tsconfig.json
│       └── package.json
│
├── k8s/                                 # Kubernetes manifests (production)
│   ├── namespaces.yaml
│   ├── secrets.yaml
│   ├── deployments/
│   ├── services/
│   ├── ingress.yaml
│   └── hpa/
│
├── terraform/                           # Infrastructure as Code (AWS)
│   ├── main.tf
│   ├── variables.tf
│   └── prod.tfvars
│
├── .github/
│   └── workflows/
│       ├── ci.yml                       # Lint, test, build on PR
│       └── deploy.yml                   # Deploy to staging/production
│
├── docker-compose.yml                   # Local development stack
├── docker-compose.prod.yml              # Production-like local stack
├── turbo.json                           # Turborepo pipeline config
├── pnpm-workspace.yaml                  # PNPM workspace definition
└── README.md
```

---

## 3. Turborepo Pipeline Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

---

## 4. Package Dependency Graph

```
packages/types        ← consumed by: apps/web, apps/api
packages/validation   ← consumed by: apps/web, apps/api
apps/api              ← called by: apps/web (HTTP/REST + WebSocket)
apps/ai-engine        ← called by: apps/api (HTTP/REST internally)
apps/web              ← served to browser users
```

---

## 5. Key Shared Types (`packages/types/src/index.ts`)

```typescript
export interface University {
  id: string;
  name: string;
  shortName: string;
  location?: string;
  email?: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  designation?: string;
  departmentId: string;
  universityId: string;
  subjects: FacultySubject[];
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  slotNumber: number;
  startTime: string;
  endTime: string;
  courseName?: string;
  courseCode?: string;
  facultyName?: string;
  roomName?: string;
  batchName?: string;
  slotType: 'THEORY' | 'LAB' | 'BREAK';
  isBreak: boolean;
}

export interface TimeSlot {
  slotNumber: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

export interface GenerateRequest {
  departmentId: string;
  batchIds: string[];
  config: ScheduleConfig;
}

export interface ScheduleConfig {
  startTime: string;
  endTime: string;
  lectureDuration: number;
  breakDuration: number;
  breakAfterLecture: number;
  daysPerWeek: number;
  semesterStartDate?: string;
  semesterEndDate?: string;
}
```

---

## 6. Development Commands

```bash
# Install all dependencies (from root)
pnpm install

# Run all apps in development mode
pnpm dev

# Run only the web frontend
pnpm --filter web dev

# Run only the API server
pnpm --filter api dev

# Run the AI engine (Python)
cd apps/ai-engine && uvicorn app.main:app --reload --port 8003

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Type-check all packages
pnpm type-check

# Database migrations (from apps/api)
pnpm --filter api prisma migrate dev
pnpm --filter api prisma migrate deploy   # production
pnpm --filter api prisma db seed          # seed VNSGU test data
```

---

## 7. Docker Compose (Local Development)

```yaml
version: '3.9'
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_SOCKET_URL: http://localhost:8000

  api:
    build: ./apps/api
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/nepscheduler
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-key
      AI_ENGINE_URL: http://ai-engine:8003

  ai-engine:
    build: ./apps/ai-engine
    ports: ["8003:8003"]
    depends_on: [postgres]
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/nepscheduler
      SOLVER_TIME_LIMIT_SECONDS: 30

  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: nepscheduler
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:latest
    ports: ["9092:9092"]

volumes:
  pgdata:
```

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
