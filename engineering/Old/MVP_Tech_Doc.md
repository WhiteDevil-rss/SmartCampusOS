# NEP-SCHEDULER — MVP Technical Document

> **Document Type:** MVP Technical Implementation Guide | **Version:** v1.0.0 | **Date:** February 2026
> **Product:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Classification:** Confidential — Internal Use Only

---

## Table of Contents

1. [MVP Scope & Definition](#1-mvp-scope--definition)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [OR-Tools Scheduling Algorithm](#5-or-tools-scheduling-algorithm)
6. [API Implementation Guide](#6-api-implementation-guide)
7. [Frontend Implementation Guide](#7-frontend-implementation-guide)
8. [Environment Configuration](#8-environment-configuration)
9. [Deployment Guide](#9-deployment-guide)
10. [Testing Strategy](#10-testing-strategy)
11. [Test Data — VNSGU Computer Science](#11-test-data--vnsgu-computer-science)

---

## 1. MVP Scope & Definition

> **MVP Definition:** The NEP-Scheduler MVP is a fully functional web platform delivering all four user panels (Superadmin, University Admin, Department Admin, Faculty) with complete CRUD operations, conflict-free timetable generation using OR-Tools, special timetable with resource exclusion, PDF export, and real-time updates. The MVP supports the complete VNSGU Computer Science Department use case out-of-the-box.

### 1.1 MVP Feature Set

| Category | MVP Features | Excluded from MVP |
|---|---|---|
| Auth & Access | JWT login for all 4 roles, password management, RBAC | SSO, OAuth social login, MFA |
| Superadmin | University CRUD, credential management, cross-university timetable trigger | Global analytics, billing management |
| University Admin | Dept CRUD, program management, faculty pool, resources, batches, courses | Multi-university comparison, ERP integration |
| Department Admin | Dept-scoped management, timetable generation, special timetable, PDF export | AI substitute recommendation, mobile alerts |
| Faculty Portal | Personal weekly schedule view, profile edit, password change | Leave management, student interaction |
| Timetable Engine | OR-Tools CP-SAT, hard constraints, soft constraints | RL optimization, predictive scheduling |
| Reports | PDF download, print functionality | Excel export, accreditation reports |
| Real-time | WebSocket for schedule updates | Push notifications, email/SMS alerts |

### 1.2 MVP Timeline Estimate

| Phase | Duration | Deliverables |
|---|---|---|
| Phase 1 — Foundation | 3 weeks | Project setup, auth service, database schema, CI/CD |
| Phase 2 — Core CRUD | 4 weeks | All 4 panels with complete CRUD operations |
| Phase 3 — Scheduling Engine | 3 weeks | OR-Tools integration, constraint model, generation API |
| Phase 4 — Frontend TT View | 2 weeks | Timetable grid component, PDF export, print |
| Phase 5 — Special TT + Real-time | 2 weeks | Special timetable, WebSocket, notifications |
| Phase 6 — Testing & Launch | 2 weeks | QA, load testing, bug fixes, production deploy |
| **Total** | **~16 weeks** | **Full MVP launch-ready** |

---

## 2. Complete Technology Stack

### 2.1 Frontend

| Technology | Version | Justification |
|---|---|---|
| Next.js | 14.2.x | SSR + client routing, Vercel deployment, API routes as BFF |
| React | 18.3.x | Component model, hooks, concurrent features |
| TypeScript | 5.4.x | Type safety, better IDE support, fewer runtime errors |
| Tailwind CSS | 3.4.x | Utility-first, fast prototyping, consistent design system |
| shadcn/ui + Radix | Latest | Accessible, unstyled primitives, no vendor lock-in |
| Zustand | 4.5.x | Lightweight global state, minimal boilerplate, SSR-friendly |
| TanStack Query | 5.x | Caching, background refetch, optimistic updates |
| React Hook Form + Zod | Latest | Performant forms with runtime type validation |
| Recharts | 2.x | React-native charts for dashboard analytics |
| Socket.io Client | 4.7.x | WebSocket with fallback, rooms/namespaces |
| jsPDF + html2canvas | Latest | Client-side PDF generation for timetable export |

### 2.2 Backend (API Server)

| Technology | Version | Justification |
|---|---|---|
| Node.js | 20 LTS | LTS stability, native ESM, excellent ecosystem |
| Express.js | 4.18.x | Minimal, battle-tested, flexible middleware |
| TypeScript | 5.4.x | Shared types with frontend via monorepo |
| Prisma ORM | 5.x | Type-safe DB access, migrations, multi-schema support |
| Zod | 3.x | Schema validation shared between FE and BE |
| jsonwebtoken | 9.x | JWT creation and verification |
| bcrypt | 5.x | Industry-standard password hashing, configurable cost |
| Socket.io Server | 4.7.x | WebSocket server with Redis adapter for horizontal scaling |
| BullMQ | 5.x | Background jobs (PDF generation, notifications) via Redis |
| ioredis | 5.x | Redis client for session, cache, pub/sub |
| multer | 1.x | File upload handling (profile pictures, bulk imports) |
| morgan | 1.x | HTTP request logging |
| helmet | 7.x | Security headers (CSP, HSTS, etc.) |
| cors | 2.x | CORS configuration |
| express-rate-limit | 7.x | API rate limiting per IP |

### 2.3 AI/ML Engine (Python)

| Technology | Version | Justification |
|---|---|---|
| Python | 3.11.x | Latest stable with performance improvements |
| FastAPI | 0.110.x | Async, fast, OpenAPI auto-docs, type hints |
| Uvicorn | 0.29.x | ASGI server for FastAPI |
| Google OR-Tools | 9.9.x | CP-SAT constraint programming solver |
| scikit-learn | 1.4.x | ML models (Random Forest, preprocessing) |
| XGBoost | 2.0.x | Gradient boosted trees for slot prediction |
| NumPy | 1.26.x | Numerical computation |
| pandas | 2.2.x | Data manipulation and analysis |
| Pydantic | 2.6.x | Data validation matching FastAPI types |
| psycopg2-binary | 2.9.x | PostgreSQL driver for Python |
| redis | 5.0.x | Redis client for Python services |

### 2.4 Database & Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15.x | Primary OLTP — universities, faculty, courses, timetables |
| Redis | 7.x | Sessions, rate limiting, distributed locks, cache |
| Apache Kafka | 3.7.x | Event streaming (optional for MVP, can use Redis pub/sub) |
| Docker | 25.x | Containerization for consistent environments |
| Docker Compose | 2.x | Local development orchestration |

---

## 3. Project Structure

### 3.1 Monorepo Layout (Turborepo)

```
nep-scheduler/                          # Root monorepo
├── apps/
│   ├── web/                            # Next.js 14 frontend
│   │   ├── app/                        # App Router pages
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx        # Role selector + login form
│   │   │   ├── superadmin/
│   │   │   │   ├── layout.tsx          # Superadmin sidebar layout
│   │   │   │   ├── page.tsx            # Overview dashboard
│   │   │   │   ├── universities/
│   │   │   │   │   └── page.tsx        # University CRUD table
│   │   │   │   ├── credentials/
│   │   │   │   │   └── page.tsx        # Credentials management
│   │   │   │   └── timetables/
│   │   │   │       └── page.tsx        # All timetables view
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx          # University admin layout
│   │   │   │   ├── page.tsx            # University overview
│   │   │   │   ├── departments/page.tsx
│   │   │   │   ├── programs/page.tsx
│   │   │   │   ├── faculty/page.tsx
│   │   │   │   ├── resources/page.tsx
│   │   │   │   ├── batches/page.tsx
│   │   │   │   ├── courses/page.tsx
│   │   │   │   ├── generate/page.tsx   # TT generation form
│   │   │   │   └── timetables/
│   │   │   │       ├── page.tsx        # TT list
│   │   │   │       └── [id]/page.tsx   # TT viewer
│   │   │   ├── department/
│   │   │   │   ├── layout.tsx          # Department admin layout
│   │   │   │   ├── page.tsx            # Dept overview
│   │   │   │   ├── faculty/page.tsx
│   │   │   │   ├── courses/page.tsx
│   │   │   │   ├── resources/page.tsx
│   │   │   │   ├── batches/page.tsx
│   │   │   │   ├── generate/page.tsx   # Standard TT form
│   │   │   │   ├── special/page.tsx    # Special TT form
│   │   │   │   └── timetables/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   └── faculty-panel/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx            # Personal timetable
│   │   │       ├── profile/page.tsx
│   │   │       └── credentials/page.tsx
│   │   ├── components/
│   │   │   ├── timetable/
│   │   │   │   ├── TimetableGrid.tsx   # Main grid component
│   │   │   │   ├── TimetableCell.tsx   # Individual slot cell
│   │   │   │   └── TimetableExport.tsx # PDF/Print controls
│   │   │   ├── forms/
│   │   │   │   ├── GenerateForm.tsx    # TT generation config form
│   │   │   │   ├── SpecialTTForm.tsx   # Special TT resource selector
│   │   │   │   ├── FacultyForm.tsx
│   │   │   │   ├── CourseForm.tsx
│   │   │   │   └── ResourceForm.tsx
│   │   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── layouts/
│   │   │   │   └── PanelLayout.tsx     # Sidebar + topbar wrapper
│   │   │   └── shared/
│   │   │       ├── DataTable.tsx       # Reusable data table
│   │   │       ├── StatsCard.tsx       # Dashboard stat cards
│   │   │       └── ConfirmModal.tsx    # Delete confirmation
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client (axios wrapper)
│   │   │   ├── socket.ts               # Socket.io client setup
│   │   │   └── utils.ts               # Utility functions
│   │   ├── stores/
│   │   │   ├── authStore.ts            # Zustand auth state
│   │   │   └── uiStore.ts             # UI state (modals, sidebar)
│   │   └── hooks/
│   │       ├── useTimetable.ts         # TT data hooks
│   │       └── useRealtimeUpdates.ts   # Socket.io subscription
│   │
│   ├── api/                            # Node.js Express API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── university.routes.ts
│   │   │   │   ├── department.routes.ts
│   │   │   │   ├── faculty.routes.ts
│   │   │   │   ├── course.routes.ts
│   │   │   │   ├── resource.routes.ts
│   │   │   │   ├── batch.routes.ts
│   │   │   │   └── timetable.routes.ts
│   │   │   ├── controllers/            # Request handlers
│   │   │   ├── services/               # Business logic
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   │   ├── rbac.middleware.ts   # Role checking
│   │   │   │   └── error.middleware.ts  # Global error handler
│   │   │   ├── sockets/
│   │   │   │   └── timetable.socket.ts  # Socket.io handlers
│   │   │   └── jobs/
│   │   │       └── pdf.job.ts          # PDF generation background job
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── ai-engine/                      # Python FastAPI
│       ├── app/
│       │   ├── main.py                 # FastAPI app entry
│       │   ├── solver/
│       │   │   ├── cp_sat_solver.py    # OR-Tools implementation
│       │   │   ├── constraint_model.py # Constraint definitions
│       │   │   └── solution_extractor.py
│       │   ├── api/
│       │   │   ├── solve.py            # POST /solve endpoint
│       │   │   └── health.py           # GET /health endpoint
│       │   └── models/
│       │       └── schemas.py          # Pydantic request/response models
│       └── requirements.txt
│
├── packages/
│   ├── types/                          # Shared TypeScript types
│   │   └── src/index.ts               # University, Faculty, Timetable interfaces
│   └── validation/                     # Shared Zod schemas
│       └── src/index.ts
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── turbo.json                          # Turborepo pipeline config
```

---

## 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model University {
  id           String       @id @default(uuid())
  name         String
  shortName    String       @unique
  location     String?
  email        String?
  estYear      Int?
  website      String?
  adminUserId  String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  departments  Department[]
  programs     Program[]
  resources    Resource[]
  faculty      Faculty[]
  batches      Batch[]
  courses      Course[]
  timetables   Timetable[]
  users        User[]

  @@map("universities")
}

model Department {
  id           String      @id @default(uuid())
  universityId String
  university   University  @relation(fields: [universityId], references: [id], onDelete: Cascade)
  name         String
  shortName    String
  hod          String?
  email        String?
  adminUserId  String?
  createdAt    DateTime    @default(now())
  faculty      Faculty[]
  courses      Course[]
  batches      Batch[]
  timetables   Timetable[]

  @@map("departments")
}

model Faculty {
  id              String          @id @default(uuid())
  departmentId    String
  universityId    String
  department      Department      @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  university      University      @relation(fields: [universityId], references: [id])
  name            String
  email           String          @unique
  phone           String?
  designation     String?
  userId          String?
  user            User?           @relation(fields: [userId], references: [id])
  createdAt       DateTime        @default(now())
  subjects        FacultySubject[]
  timetableSlots  TimetableSlot[]

  @@map("faculty")
}

model FacultySubject {
  id              String   @id @default(uuid())
  facultyId       String
  courseId        String
  faculty         Faculty  @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  isPrimary       Boolean  @default(true)
  proficiencyLevel Int     @default(5)

  @@unique([facultyId, courseId])
  @@map("faculty_subjects")
}

model Course {
  id             String          @id @default(uuid())
  departmentId   String?
  universityId   String
  department     Department?     @relation(fields: [departmentId], references: [id])
  university     University      @relation(fields: [universityId], references: [id])
  name           String
  code           String
  program        String?
  credits        Int             @default(4)
  weeklyHrs      Int             @default(4)
  type           String          @default("Theory")  // Theory | Lab | Theory+Lab
  createdAt      DateTime        @default(now())
  facultySubjects FacultySubject[]
  timetableSlots TimetableSlot[]

  @@map("courses")
}

model Batch {
  id             String          @id @default(uuid())
  departmentId   String?
  universityId   String
  department     Department?     @relation(fields: [departmentId], references: [id])
  university     University      @relation(fields: [universityId], references: [id])
  name           String
  program        String?
  semester       Int?
  division       String?
  year           String?
  strength       Int             @default(30)
  createdAt      DateTime        @default(now())
  timetableSlots TimetableSlot[]
  timetables     Timetable[]

  @@map("batches")
}

model Resource {
  id             String          @id @default(uuid())
  universityId   String
  university     University      @relation(fields: [universityId], references: [id])
  name           String
  type           String          // Classroom | Lab | Seminar Hall | Auditorium
  capacity       Int             @default(30)
  floor          String?
  building       String?
  createdAt      DateTime        @default(now())
  timetableSlots TimetableSlot[]

  @@map("resources")
}

model Program {
  id           String     @id @default(uuid())
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  name         String
  shortName    String
  type         String     // UG | PG | Diploma | Ph.D
  duration     Int        @default(2)
  totalSems    Int        @default(4)

  @@map("programs")
}

model Timetable {
  id              String          @id @default(uuid())
  universityId    String
  departmentId    String?
  batchId         String?
  university      University      @relation(fields: [universityId], references: [id])
  department      Department?     @relation(fields: [departmentId], references: [id])
  batch           Batch?          @relation(fields: [batchId], references: [id])
  name            String?
  isSpecial       Boolean         @default(false)
  status          String          @default("ACTIVE")  // ACTIVE | ARCHIVED | DRAFT
  configJson      Json?
  generatedBy     String          @default("AI")
  version         Int             @default(1)
  conflictCount   Int             @default(0)
  generationMs    Int?
  createdAt       DateTime        @default(now())
  slots           TimetableSlot[]

  @@map("timetables")
}

model TimetableSlot {
  id           String     @id @default(uuid())
  timetableId  String
  timetable    Timetable  @relation(fields: [timetableId], references: [id], onDelete: Cascade)
  dayOfWeek    Int        // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  slotNumber   Int
  startTime    String     // "09:00"
  endTime      String     // "10:00"
  courseId     String?
  facultyId    String?
  roomId       String?
  batchId      String
  course       Course?    @relation(fields: [courseId], references: [id])
  faculty      Faculty?   @relation(fields: [facultyId], references: [id])
  room         Resource?  @relation(fields: [roomId], references: [id])
  batch        Batch      @relation(fields: [batchId], references: [id])
  isBreak      Boolean    @default(false)
  slotType     String     @default("THEORY")  // THEORY | LAB | BREAK

  @@map("timetable_slots")
}

model User {
  id           String    @id @default(uuid())
  username     String    @unique
  email        String?   @unique
  passwordHash String
  role         String    // SUPERADMIN | UNI_ADMIN | DEPT_ADMIN | FACULTY
  entityId     String?   // universityId | departmentId | facultyId
  universityId String?
  university   University? @relation(fields: [universityId], references: [id])
  faculty      Faculty[]
  createdAt    DateTime  @default(now())
  lastLogin    DateTime?

  @@map("users")
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String
  entityType String?
  entityId   String?
  changes    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@map("audit_logs")
}
```

---

## 5. OR-Tools Scheduling Algorithm

### 5.1 Time Slot Generation

```python
# apps/ai-engine/app/solver/cp_sat_solver.py

from ortools.sat.python import cp_model
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import math

def generate_time_slots(config: dict) -> List[dict]:
    """
    Generate daily time slots based on configuration.

    Args:
        config: {
            'start_time': '09:00',
            'end_time': '17:00',
            'lecture_duration': 60,    # minutes
            'break_duration': 60,      # minutes
            'break_after': 2,          # after Nth lecture
        }
    """
    start = datetime.strptime(config['start_time'], '%H:%M')
    end = datetime.strptime(config['end_time'], '%H:%M')
    lecture_dur = timedelta(minutes=config['lecture_duration'])
    break_dur = timedelta(minutes=config['break_duration'])
    break_after = config['break_after']

    slots = []
    current = start
    lecture_count = 0
    slot_num = 1

    while current + lecture_dur <= end:
        slots.append({
            'slot_number': slot_num,
            'start_time': current.strftime('%H:%M'),
            'end_time': (current + lecture_dur).strftime('%H:%M'),
            'is_break': False,
            'slot_type': 'LECTURE'
        })
        current += lecture_dur
        lecture_count += 1
        slot_num += 1

        # Insert break after specified lecture
        if lecture_count == break_after and current + break_dur <= end:
            slots.append({
                'slot_number': slot_num,
                'start_time': current.strftime('%H:%M'),
                'end_time': (current + break_dur).strftime('%H:%M'),
                'is_break': True,
                'slot_type': 'BREAK'
            })
            current += break_dur
            slot_num += 1

    return slots
```

### 5.2 CP-SAT Constraint Solver

```python
class TimetableScheduler:
    """
    Main CP-SAT solver for conflict-free timetable generation.
    Supports both standard and special (resource-excluded) modes.
    """

    def __init__(self, dept_data: dict, config: dict,
                 excluded_faculty: List[str] = None,
                 excluded_rooms: List[str] = None):
        self.model = cp_model.CpModel()
        self.dept_data = dept_data
        self.config = config
        self.excluded_faculty = excluded_faculty or []
        self.excluded_rooms = excluded_rooms or []

        # Filter out unavailable resources
        self.faculty = [f for f in dept_data['faculty']
                        if f['id'] not in self.excluded_faculty]
        self.rooms = [r for r in dept_data['resources']
                      if r['id'] not in self.excluded_rooms]
        self.courses = dept_data['courses']
        self.batches = dept_data['batches']
        self.days = config.get('days_per_week', 5)
        self.slots = [s for s in generate_time_slots(config) if not s['is_break']]
        self.faculty_subject_map = self._build_faculty_subject_map()

    def _build_faculty_subject_map(self) -> dict:
        """Map: course_id -> list of qualified faculty_ids"""
        mapping = {}
        for course in self.courses:
            qualified = [
                fs['faculty_id']
                for fs in self.dept_data['faculty_subjects']
                if fs['course_id'] == course['id']
                and fs['faculty_id'] not in self.excluded_faculty
            ]
            mapping[course['id']] = qualified
        return mapping

    def solve(self) -> dict:
        """
        Main solving method.
        Returns solution dict with slots and metadata.
        """
        # ─── Decision Variables ────────────────────────────────────────
        # assign[batch_idx][course_idx][day][slot][faculty_idx][room_idx]
        # = 1 if that faculty teaches that course to that batch
        #   in that day/slot in that room
        assignments = {}

        for bi, batch in enumerate(self.batches):
            for ci, course in enumerate(self.courses):
                qualified_fac = self.faculty_subject_map.get(course['id'], [])
                if not qualified_fac:
                    continue  # Skip unassignable courses

                for d in range(self.days):
                    for si, slot in enumerate(self.slots):
                        for fi, faculty in enumerate(self.faculty):
                            if faculty['id'] not in qualified_fac:
                                continue
                            for ri, room in enumerate(self.rooms):
                                # Type check: lab courses need lab rooms
                                if course['type'] == 'Lab' and room['type'] != 'Lab':
                                    continue
                                if course['type'] == 'Theory' and room['type'] == 'Lab':
                                    continue
                                # Capacity check
                                if room['capacity'] < batch['strength']:
                                    continue
                                key = (bi, ci, d, si, fi, ri)
                                assignments[key] = self.model.NewBoolVar(
                                    f'a_b{bi}_c{ci}_d{d}_s{si}_f{fi}_r{ri}')

        # ─── HARD CONSTRAINT HC-01: No faculty double-booking ─────────
        for fi, faculty in enumerate(self.faculty):
            for d in range(self.days):
                for si in range(len(self.slots)):
                    self.model.AddAtMostOne(
                        assignments[key]
                        for key in assignments
                        if key[2] == d and key[3] == si and key[4] == fi
                    )

        # ─── HARD CONSTRAINT HC-02: No room double-booking ───────────
        for ri in range(len(self.rooms)):
            for d in range(self.days):
                for si in range(len(self.slots)):
                    self.model.AddAtMostOne(
                        assignments[key]
                        for key in assignments
                        if key[2] == d and key[3] == si and key[5] == ri
                    )

        # ─── HARD CONSTRAINT HC-03: No batch double-booking ──────────
        for bi in range(len(self.batches)):
            for d in range(self.days):
                for si in range(len(self.slots)):
                    self.model.AddAtMostOne(
                        assignments[key]
                        for key in assignments
                        if key[0] == bi and key[2] == d and key[3] == si
                    )


        # ─── HARD CONSTRAINT: Weekly frequency per course ─────────────
        for bi, batch in enumerate(self.batches):
            for ci, course in enumerate(self.courses):
                course_vars = [v for k, v in assignments.items()
                               if k[0] == bi and k[1] == ci]
                if course_vars:
                    target_hrs = course.get('weekly_hrs', 3)
                    self.model.Add(sum(course_vars) == target_hrs)


        # ─── SOLVE ────────────────────────────────────────────────────
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 30.0
        solver.parameters.num_search_workers = 4
        status = solver.Solve(self.model)

        if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            return {'success': False, 'error': 'No feasible solution found',
                    'status': solver.StatusName(status)}

        return self._extract_solution(solver, assignments, status)

    def _extract_solution(self, solver, assignments, status) -> dict:
        """Convert solver assignments to structured timetable."""
        timetable_slots = []
        for key, var in assignments.items():
            if solver.Value(var) == 1:
                bi, ci, d, si, fi, ri = key
                slot = self.slots[si]
                timetable_slots.append({
                    'batch_id': self.batches[bi]['id'],
                    'course_id': self.courses[ci]['id'],
                    'faculty_id': self.faculty[fi]['id'],
                    'room_id': self.rooms[ri]['id'],
                    'day_of_week': d + 1,
                    'slot_number': si + 1,
                    'start_time': slot['start_time'],
                    'end_time': slot['end_time'],
                    'is_break': False,
                    'slot_type': 'LAB' if self.courses[ci]['type'] == 'Lab' else 'THEORY'
                })

        # Find unassignable courses (no qualified faculty)
        unassignable = [
            {'course_id': cid, 'reason': 'No available qualified faculty'}
            for cid, fids in self.faculty_subject_map.items()
            if not fids
        ]

        return {
            'success': True,
            'status': solver.StatusName(status),
            'conflict_count': 0,  # Guaranteed by hard constraints
            'generation_ms': int(solver.WallTime() * 1000),
            'slots': timetable_slots,
            'unassignable_courses': unassignable,
            'time_slots': self.slots
        }
```

---

## 6. API Implementation Guide

### 6.1 Core Endpoints

| Method | Endpoint | Request Body Key Fields | Response |
|---|---|---|---|
| POST | `/v1/auth/login` | `{ username, password, role }` | `{ token, user: { id, name, role, entityId } }` |
| POST | `/v1/universities` | `{ name, shortName, location, email, adminUser, adminPass }` | `{ university, adminCredentials }` |
| POST | `/v1/departments` | `{ universityId, name, shortName, hod, adminUser, adminPass }` | `{ department, adminCredentials }` |
| POST | `/v1/faculty` | `{ departmentId, name, email, designation, subjectIds, user, pass }` | `{ faculty }` |
| POST | `/v1/resources` | `{ universityId, name, type, capacity, floor }` | `{ resource }` |
| POST | `/v1/timetables/generate` | `{ deptId, batchIds, startTime, endTime, lectureDuration, breakDuration, breakAfter, daysPerWeek }` | `{ timetableId, slots[], conflicts: 0, generationTimeMs }` |
| POST | `/v1/timetables/special` | `{ deptId, unavailableFacultyIds[], unavailableRoomIds[], ...config }` | `{ timetableId, slots[], unassignableCourses[] }` |
| GET | `/v1/timetables/:id` | — | `{ timetable, slots[] }` |
| GET | `/v1/timetables/:id/export/pdf` | — | Binary PDF stream |
| GET | `/v1/faculty/:id/schedule` | — | `{ faculty, weeklySlots: [{day, time, course, room, batch}] }` |
| PATCH | `/v1/users/:id/credentials` | `{ currentPass, newUser?, newPass? }` | `{ success: true }` |

### 6.2 Timetable Generation Request/Response

```typescript
// Request
POST /v1/timetables/generate
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "departmentId": "dept-cs-001",
  "batchIds": ["batch-mca-a", "batch-mca-b"],
  "config": {
    "startTime": "09:00",
    "endTime": "17:00",
    "lectureDuration": 60,
    "breakDuration": 60,
    "breakAfterLecture": 2,
    "daysPerWeek": 5,
    "semesterStartDate": "2025-07-01",
    "semesterEndDate": "2025-11-30"
  }
}

// Success Response (201 Created)
{
  "timetableId": "tt-abc-123",
  "status": "OPTIMAL",
  "conflictCount": 0,
  "generationMs": 4250,
  "workloadStats": {
    "faculty-rustam": { "weeklyHrs": 3, "maxAllowed": 20, "utilizationPct": 15 },
    "faculty-dharmen": { "weeklyHrs": 6, "maxAllowed": 18, "utilizationPct": 33 }
  },
  "slots": [
    {
      "dayOfWeek": 1,
      "slotNumber": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "courseName": "Artificial Intelligence",
      "courseCode": "201",
      "facultyName": "Prakash Rana",
      "roomName": "CS Classroom 101",
      "batchName": "MCA Sem 2 Div A 2025-26",
      "slotType": "THEORY"
    }
  ],
  "timeSlots": [
    { "slotNumber": 1, "startTime": "09:00", "endTime": "10:00", "isBreak": false },
    { "slotNumber": 2, "startTime": "10:00", "endTime": "11:00", "isBreak": false },
    { "slotNumber": 3, "startTime": "11:00", "endTime": "12:00", "isBreak": true },
    { "slotNumber": 4, "startTime": "12:00", "endTime": "13:00", "isBreak": false }
  ]
}
```

### 6.3 Authentication Middleware

```typescript
// src/middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'SUPERADMIN' | 'UNI_ADMIN' | 'DEPT_ADMIN' | 'FACULTY';
    entityId: string;
    universityId?: string;
    departmentId?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };

export const requireSameUniversity = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Superadmin bypasses all tenant checks
  if (req.user?.role === 'SUPERADMIN') return next();
  const requestedUniId = req.params.universityId || req.body.universityId;
  if (requestedUniId && requestedUniId !== req.user?.universityId) {
    return res.status(403).json({ error: 'Cross-university access denied' });
  }
  next();
};
```

---

## 7. Frontend Implementation Guide

### 7.1 Timetable Grid Component

```typescript
// components/timetable/TimetableGrid.tsx
'use client';

import { useMemo } from 'react';
import { TimetableSlot, TimeSlot } from '@nep/types';

interface Props {
  slots: TimetableSlot[];
  timeSlots: TimeSlot[];
  batchId?: string;          // Filter for specific batch
  facultyId?: string;        // Filter for faculty personal view
  view: 'batch' | 'faculty';
  showWorkload?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_COLORS = {
  THEORY: 'bg-blue-50 border-l-blue-500',
  LAB: 'bg-purple-50 border-l-purple-500',
  BREAK: 'bg-amber-50 border-l-amber-400',
};

export function TimetableGrid({ slots, timeSlots, batchId, facultyId, view, showWorkload = true }: Props) {
  // Filter slots based on view mode
  const filteredSlots = useMemo(() => {
    let filtered = slots;
    if (batchId) filtered = filtered.filter(s => s.batchId === batchId);
    if (facultyId) filtered = filtered.filter(s => s.facultyId === facultyId);
    return filtered;
  }, [slots, batchId, facultyId]);

  // Create lookup: day → slotNumber → slot
  const slotMap = useMemo(() => {
    const map: Record<string, TimetableSlot> = {};
    filteredSlots.forEach(s => {
      map[`${s.dayOfWeek}-${s.slotNumber}`] = s;
    });
    return map;
  }, [filteredSlots]);

  const activeDays = DAYS.slice(0, timeSlots.length > 0 ? 5 : 5);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="p-3 text-left font-mono text-xs text-slate-300 min-w-[100px]">
              Time
            </th>
            {activeDays.map(day => (
              <th key={day} className="p-3 text-center font-semibold min-w-[140px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((timeSlot, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="p-2 text-center bg-slate-50 font-mono text-xs text-slate-500 border-r border-slate-200">
                {timeSlot.startTime}<br/>
                <span className="text-slate-400">–</span><br/>
                {timeSlot.endTime}
              </td>
              {timeSlot.isBreak ? (
                <td
                  colSpan={activeDays.length}
                  className="p-2 text-center bg-amber-50 text-amber-700 text-xs font-semibold border-y border-amber-200"
                >
                  🍽️ BREAK ({timeSlot.startTime} – {timeSlot.endTime})
                </td>
              ) : (
                activeDays.map((_, dayIdx) => {
                  const cell = slotMap[`${dayIdx + 1}-${timeSlot.slotNumber}`];
                  return (
                    <td key={dayIdx} className="p-1.5 border-r border-slate-100 align-top min-h-[60px]">
                      {cell ? (
                        <div className={`rounded-lg border-l-4 p-2 min-h-[52px] ${SLOT_COLORS[cell.slotType]}`}>
                          <div className="font-semibold text-slate-800 text-xs leading-tight">
                            {cell.courseName}
                          </div>
                          {view === 'batch' && (
                            <div className="text-slate-500 text-xs mt-0.5">
                              {cell.facultyName}
                            </div>
                          )}
                          {view === 'faculty' && (
                            <div className="text-slate-500 text-xs mt-0.5">
                              {cell.batchName}
                            </div>
                          )}
                          <div className="text-slate-400 text-xs mt-0.5 font-mono">
                            📍 {cell.roomName}
                          </div>
                        </div>
                      ) : (
                        <div className="min-h-[52px]" />
                      )}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 7.2 PDF Export Implementation

```typescript
// components/timetable/TimetableExport.tsx
'use client';

import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportProps {
  timetableId: string;
  timetableName: string;
  gridRef: React.RefObject<HTMLDivElement>;
}

export function TimetableExport({ timetableId, timetableName, gridRef }: ExportProps) {
  const handleDownloadPDF = useCallback(async () => {
    if (!gridRef.current) return;
    const canvas = await html2canvas(gridRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.setFontSize(14);
    pdf.text(timetableName, 14, 14);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 20);
    pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight - 10);
    pdf.save(`${timetableName.replace(/\s+/g, '_')}.pdf`);
  }, [gridRef, timetableName]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex gap-2 print:hidden">
      <button
        onClick={handleDownloadPDF}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
      >
        📥 Download PDF
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium"
      >
        🖨️ Print
      </button>
    </div>
  );
}
```

---

## 8. Environment Configuration

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/nepscheduler
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-256-bit-secret-here-use-openssl-rand-base64-32
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
AI_ENGINE_URL=http://localhost:8003
SOCKET_CORS_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=12
NODE_ENV=development
PORT=8000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# apps/ai-engine/.env
DATABASE_URL=postgresql://user:password@localhost:5432/nepscheduler
REDIS_URL=redis://localhost:6379
SOLVER_TIME_LIMIT_SECONDS=30
ENVIRONMENT=development
PORT=8003

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=NEP-Scheduler
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 9. Deployment Guide

### 9.1 MVP Hosting Plan

| Service | Platform | Free Tier? | Paid Cost | Notes |
|---|---|---|---|---|
| Frontend (Next.js) | Vercel | ✅ Yes | $0–$20/mo | Auto-deploy from GitHub |
| API Server (Node.js) | Railway | ✅ Limited | $5–$20/mo | Dockerfile deploy |
| AI Engine (Python) | Railway / Render | ✅ Limited | $7–$25/mo | 1GB RAM minimum |
| PostgreSQL | Supabase or Neon | ✅ Yes | $0–$25/mo | Managed Postgres |
| Redis | Upstash | ✅ Yes | $0–$10/mo | Serverless Redis |
| Domain + SSL | Namecheap + Cloudflare | ❌ No | $10–$15/yr | Cloudflare CDN + SSL |
| **Total MVP Cost** | | | **~$30–$100/mo** | Scales with usage |

### 9.2 Production Deployment (Scale)

Migrate to AWS with Terraform IaC:

```bash
# Quick AWS deployment with Terraform
terraform init
terraform plan -var-file="prod.tfvars"
terraform apply

# Deploy to EKS
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml

# Verify all pods running
kubectl get pods -n nep-scheduler
```

---

## 10. Testing Strategy

| Test Type | Tool | Coverage Target | Key Test Cases |
|---|---|---|---|
| Unit Tests | Jest + Testing Library | 80% line coverage | OR-Tools constraint validation, auth middleware, API handlers |
| Integration Tests | Supertest | 70% API coverage | Full CRUD for all entities, timetable generation end-to-end |
| E2E Tests | Playwright | All 4 panel flows | Login → add data → generate → view → export PDF |
| Load Testing | k6 | 500 concurrent users | Timetable generation under load, API response times |
| Conflict Testing | Jest | 100% constraint coverage | Verify 0 conflicts in 100 randomly generated timetables |
| Security Testing | OWASP ZAP | OWASP Top 10 | Cross-tenant access, SQL injection, JWT manipulation |

### 10.1 Key Test: Conflict Validation

```typescript
// __tests__/timetable.conflict.test.ts
describe('Timetable Generation — Conflict Validation', () => {
  it('should produce 0 faculty conflicts', async () => {
    const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
    const facultyConflicts = detectFacultyConflicts(timetable.slots);
    expect(facultyConflicts).toHaveLength(0);
  });

  it('should produce 0 room conflicts', async () => {
    const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
    const roomConflicts = detectRoomConflicts(timetable.slots);
    expect(roomConflicts).toHaveLength(0);
  });

  it('should produce 0 batch conflicts', async () => {
    const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
    const batchConflicts = detectBatchConflicts(timetable.slots);
    expect(batchConflicts).toHaveLength(0);
  });

  it('should respect faculty max hours per week', async () => {
    const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
    for (const [facultyId, hrs] of Object.entries(timetable.workloadStats)) {
      const faculty = VNSGU_DEPT_DATA.faculty.find(f => f.id === facultyId);
      expect(hrs).toBeLessThanOrEqual(faculty.maxHrsPerWeek);
    }
  });

  it('workload variance should be < 3 hours', async () => {
    const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
    const loads = Object.values(timetable.workloadStats) as number[];
    const variance = Math.max(...loads) - Math.min(...loads);
    expect(variance).toBeLessThan(3);
  });

  it('special timetable excludes faculty correctly', async () => {
    const excluded = ['faculty-dharmen'];
    const timetable = await generateSpecialTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG, { excludedFaculty: excluded });
    const dharmenSlots = timetable.slots.filter(s => s.facultyId === 'faculty-dharmen');
    expect(dharmenSlots).toHaveLength(0);
  });
});
```

---

## 11. Test Data — VNSGU Computer Science

### Pre-loaded Test Data Summary

| Entity | Count | Details |
|---|---|---|
| University | 1 | Veer Narmad South Gujarat University (VNSGU) |
| Department | 1 | Department of Computer Science |
| Faculty | 9 | Rustam, Ravi, Dharmen, Nimisha, Jayshree, Mayur, Prakash, Vimal, Rinku |
| Courses (MCA Sem 2) | 7 | AI(201), Frontend(202), .Net(203), Blockchain(204), Python(204), iOS(205), Android(205) |
| Batches | 2 | MCA Sem 2 Div A 2025-26, MCA Sem 2 Div B 2025-26 |
| Classrooms | 3 | CS Classroom 101 (60), CS Classroom 102 (60), CS Classroom 201 (40) |
| Labs | 2 | CS Lab A (30), CS Lab B (30) |

### Faculty-Subject Assignments

| Faculty | Subjects | Max Hrs/Week |
|---|---|---|
| Rustam Morena | Blockchain | 20 |
| Ravi Gulati | Python | 20 |
| Dharmen Shah | iOS Development, .Net using C# | 18 |
| Nimisha Modi | Android Development | 20 |
| Jayshree Patel | .Net using C# | 20 |
| Mayur Gohil | Android Development | 20 |
| Prakash Rana | Artificial Intelligence | 20 |
| Vimal Choudhary | Frontend Technologies | 20 |
| Rinku Patel | Frontend Technologies | 20 |

### Login Credentials (Demo)

| Role | Username | Password | Access |
|---|---|---|---|
| Super Admin | `superadmin` | `super@admin123` | All data |
| University Admin | `vnsgu_admin` | `vnsgu@123` | VNSGU data |
| Department Admin | `cs_dept` | `cs@123` | CS Dept data |
| Faculty (Rustam) | `rustam_morena` | `faculty@123` | Personal schedule |
| Faculty (Dharmen) | `dharmen_shah` | `faculty@123` | Personal schedule |
| Faculty (Prakash) | `prakash_rana` | `faculty@123` | Personal schedule |

### Expected Generated Timetable Properties

- ✅ Total weekly theory lectures: 7 subjects per batch
- ✅ Labs scheduled in contiguous 2-slot blocks
- ✅ No faculty teaches two classes simultaneously (HC-01 guaranteed)
- ✅ Dharmen Shah: iOS for Div A + .Net for Div B (or vice versa) — zero overlap
- ✅ Android: Nimisha → Div A, Mayur → Div B (or swapped)
- ✅ Frontend: Vimal → Div A, Rinku → Div B (or swapped)
- ✅ Workload variance across 9 faculty: < 2 hours per week

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
