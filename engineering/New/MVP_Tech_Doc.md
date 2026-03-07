# AI SMART UNIVERSITY PLATFORM — MVP Technical Document

> **Document Type:** MVP Technical Implementation Guide | **Version:** v2.0.0 | **Date:** March 2026
> **Product:** AI Smart University Platform — Full-Stack Intelligent University Operating System
> **Classification:** Confidential — Internal Use Only
> **Previous Version:** v1.0.0 (NEP-Scheduler — AI-Powered Timetable Scheduling Platform)
> **Upgrade Notice:** This document supersedes v1.0.0. The MVP scope has been expanded to include student portal, per-university public panel, blockchain result verification, AI features (chatbot, study planner, career advisor), and foundational smart campus integrations.

---

## Table of Contents

1. [MVP Scope & Definition](#1-mvp-scope--definition)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [OR-Tools Scheduling Algorithm](#5-or-tools-scheduling-algorithm)
6. [Blockchain Implementation](#6-blockchain-implementation)
7. [AI Feature Implementation](#7-ai-feature-implementation)
8. [Per-University Public Portal Implementation](#8-per-university-public-portal-implementation)
9. [API Implementation Guide](#9-api-implementation-guide)
10. [Frontend Implementation Guide](#10-frontend-implementation-guide)
11. [Environment Configuration](#11-environment-configuration)
12. [Deployment Guide](#12-deployment-guide)
13. [Testing Strategy](#13-testing-strategy)
14. [Test Data — VNSGU Computer Science](#14-test-data--vnsgu-computer-science)

---

## 1. MVP Scope & Definition

> **MVP Definition:** The AI Smart University Platform MVP is a fully functional web platform delivering seven user panels (Superadmin, University Admin, Department Admin, Faculty, Student, and per-university Public Portal), with complete CRUD operations, conflict-free AI timetable generation, student lifecycle management, QR-based attendance, fee management, blockchain result verification, AI doubt chatbot, and a uniquely configured public portal per university. The MVP supports the complete VNSGU Computer Science Department use case out-of-the-box.

### 1.1 MVP Feature Set

| Category | MVP Features | Excluded from MVP (v3) |
|---|---|---|
| Auth & Access | Firebase Auth (student/faculty), Keycloak (admins), JWT, RBAC, MFA toggle | SSO with Google Workspace, biometric login |
| Superadmin | University CRUD, public portal config per university, credential management | Billing management, SaaS analytics |
| University Admin | Dept CRUD, faculty pool, exam management, result publication + blockchain hash, NAAC export | Full ERP integration, multi-university comparison |
| Department Admin | Timetable generation (OR-Tools), special timetable, fees structure, library management, placement records | BI analytics, procurement management |
| Faculty Portal | Attendance (manual + QR), marks upload, assignments, quizzes, resource upload, research portfolio | Live polls, grant management |
| Student Portal | AI timetable, attendance view, fee payment, study materials, AI chatbot, digital ID, internship feed | Bus tracking, canteen, marketplace |
| Public Portal | Per-university: result verify, blockchain verify, admission portal, admission status, scholarship portal, vacancies | Research repository, ranking dashboard |
| Timetable Engine | OR-Tools CP-SAT, hard constraints, soft constraints, NEP compliance check | RL optimization, multi-objective scheduling |
| AI Features | Doubt chatbot (Claude API + RAG), study planner, career recommendation (basic), dropout risk model | Predictive enrolment, AI campus analytics |
| Blockchain | Result hash on Polygon L2, public verification endpoint, blockchain QR on result | Degree NFT, decentralised identity |
| Reports | PDF (timetable, hall ticket, payslip, NAAC basic), Excel export | Full NAAC criteria report, NIRF auto-report |
| Real-time | WebSocket for timetable updates, bus tracking feed, announcement feed | Push notifications (native app only) |
| Smart Campus | QR attendance, digital student ID with QR, basic bus tracking (GPS) | Face recognition, BLE beacons, IoT labs |

### 1.2 MVP Timeline Estimate

| Phase | Duration | Deliverables |
|---|---|---|
| Phase 1 — Foundation | 3 weeks | Project setup, auth (Firebase + Keycloak), database schema, CI/CD, multi-tenant scaffold |
| Phase 2 — Admin Panels | 4 weeks | Superadmin, University Admin, Department Admin CRUD; timetable generation |
| Phase 3 — Faculty + Student Portals | 4 weeks | Faculty attendance/grading/resources; Student timetable/fees/materials/digital ID |
| Phase 4 — AI Features | 3 weeks | Claude chatbot + RAG pipeline; study planner; career advisor; dropout risk model |
| Phase 5 — Blockchain + Public Portal | 3 weeks | Polygon L2 smart contract; result hash; per-university public portal with branding |
| Phase 6 — Notifications + Real-time | 2 weeks | WebSocket rooms; fee reminders; attendance alerts; announcement feed |
| Phase 7 — Testing & Launch | 2 weeks | QA, load testing, VAPT, bug fixes, production deploy |
| **Total** | **~21 weeks** | **Full MVP launch-ready** |

---

## 2. Complete Technology Stack

### 2.1 Frontend

| Technology | Version | Justification |
|---|---|---|
| Next.js | 14.2.x | SSR for public portal SEO; ISR for public pages; App Router; API routes as BFF |
| React | 18.3.x | Component model, hooks, concurrent features |
| TypeScript | 5.4.x | Type safety across monorepo; shared types with backend |
| Tailwind CSS | 3.4.x | Utility-first; per-university theme via CSS custom properties |
| shadcn/ui + Radix | Latest | Accessible, unstyled primitives, no vendor lock-in |
| Zustand | 4.5.x | Lightweight global state, SSR-friendly |
| TanStack Query | 5.x | Caching, background refetch, optimistic updates |
| React Hook Form + Zod | Latest | Performant forms with runtime type validation |
| Recharts | 2.x | Analytics and performance dashboards |
| Socket.io Client | 4.7.x | WebSocket for real-time timetable/campus updates |
| jsPDF + html2canvas | Latest | Client-side PDF for timetable export, digital ID card |
| ethers.js | 6.x | Blockchain verification calls on public portal |
| Firebase SDK | 10.x | Firebase Authentication for students and faculty |
| QRCode.react | 3.x | QR code generation for digital student ID, attendance sessions |

### 2.2 Backend (API Server)

| Technology | Version | Justification |
|---|---|---|
| Node.js | 20 LTS | LTS stability, native ESM, excellent ecosystem |
| Express.js | 4.18.x | Minimal, battle-tested, flexible middleware |
| TypeScript | 5.4.x | Shared types with frontend via monorepo |
| Prisma ORM | 5.x | Type-safe DB access, migrations, multi-schema support |
| Zod | 3.x | Schema validation shared between FE and BE |
| jsonwebtoken | 9.x | Platform JWT creation and verification |
| bcrypt | 5.x | Password hashing for admin accounts (cost factor 12) |
| Firebase Admin SDK | 12.x | Verify Firebase ID tokens from student/faculty login |
| Socket.io Server | 4.7.x | WebSocket server with Redis adapter |
| BullMQ | 5.x | Background jobs: PDF generation, email, AI tasks |
| ioredis | 5.x | Redis client for session, cache, distributed locks |
| ethers.js | 6.x | Polygon L2 smart contract interaction from blockchain-service |
| multer | 1.x | File upload handling (study materials, profile photos) |
| @aws-sdk/client-s3 | 3.x | S3 upload for PDFs, study materials, university assets |
| morgan | 1.x | HTTP request logging |
| helmet | 7.x | Security headers (CSP, HSTS) |
| cors | 2.x | CORS configuration |
| express-rate-limit | 7.x | API rate limiting per IP |
| mqtt | 5.x | MQTT client for IoT service connectivity |

### 2.3 AI/ML Engine (Python)

| Technology | Version | Justification |
|---|---|---|
| Python | 3.11.x | Latest stable with performance improvements |
| FastAPI | 0.110.x | Async, fast, OpenAPI auto-docs, type hints |
| Uvicorn | 0.29.x | ASGI server for FastAPI |
| Google OR-Tools | 9.9.x | CP-SAT constraint programming solver for timetable |
| scikit-learn | 1.4.x | Dropout risk model (Random Forest), preprocessing |
| XGBoost | 2.0.x | Student performance prediction, slot preference |
| LangChain | 0.2.x | RAG pipeline for AI chatbot and career advisor |
| anthropic | 0.25.x | Claude API SDK for chatbot + career recommendation |
| sentence-transformers | 2.7.x | Embedding study materials for RAG |
| NumPy | 1.26.x | Numerical computation |
| pandas | 2.2.x | Data manipulation for ML pipelines |
| Pydantic | 2.6.x | Data validation for FastAPI endpoints |
| psycopg2-binary | 2.9.x | PostgreSQL driver for Python ML services |
| redis | 5.0.x | Redis client for Python services and job queuing |
| elasticsearch-py | 8.x | Elasticsearch client for RAG document retrieval |

### 2.4 Blockchain Stack

| Technology | Version | Justification |
|---|---|---|
| Hardhat | 2.22.x | Smart contract development, testing, deployment |
| Solidity | 0.8.24 | Smart contract language (AcademicRecords.sol, DegreeRegistry.sol) |
| ethers.js | 6.x | Contract interaction from Node.js blockchain-service |
| OpenZeppelin Contracts | 5.x | AccessControl for publishResult role restriction |
| Polygon SDK / RPC | — | Polygon L2 testnet (Mumbai) → mainnet (Polygon PoS) |
| Hardhat Defender | — | Smart contract upgrade management in production |

### 2.5 Database & Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15.x | Primary OLTP — all university data, per-schema multi-tenant |
| Redis | 7.x | Sessions, rate limiting, distributed locks, caching |
| Elasticsearch | 8.x | RAG document index for AI chatbot, full-text search |
| Apache Kafka | 3.7.x | Event streaming for all platform events + IoT feeds |
| MongoDB Atlas | 7.x | Timetable JSON, AI metadata, chat history |
| InfluxDB | 2.7.x | IoT time-series data (bus GPS, energy meters) |
| Docker | 25.x | Containerization |
| Docker Compose | 2.x | Local development orchestration |
| Mosquitto MQTT | 2.0.x | On-premise IoT broker (campus-side) |

---

## 3. Project Structure

### 3.1 Monorepo Layout (Turborepo)

```
ai-smart-university/                      # Root monorepo
├── apps/
│   ├── web/                              # Next.js 14 — all panels + public portals
│   │   ├── app/
│   │   │   ├── (auth)/login/             # Role selector + login (Firebase / Keycloak)
│   │   │   ├── superadmin/
│   │   │   │   ├── universities/         # University CRUD + public portal config
│   │   │   │   ├── credentials/
│   │   │   │   ├── analytics/
│   │   │   │   └── billing/
│   │   │   ├── dashboard/                # University Admin
│   │   │   │   ├── departments/ programs/ faculty/ students/
│   │   │   │   ├── exams/                # Hall tickets, timetable, invigilators
│   │   │   │   ├── finance/              # Fees, payroll, BI
│   │   │   │   ├── results/              # Result publication + blockchain
│   │   │   │   ├── compliance/           # NAAC, NIRF
│   │   │   │   └── placement/
│   │   │   ├── department/               # Department Admin
│   │   │   │   ├── timetable/ generate/ special/
│   │   │   │   ├── library/
│   │   │   │   ├── placement/
│   │   │   │   └── research/
│   │   │   ├── faculty-panel/            # Faculty Portal
│   │   │   │   ├── attendance/           # QR + manual attendance
│   │   │   │   ├── assignments/ marks/ quiz/
│   │   │   │   ├── resources/
│   │   │   │   └── research/
│   │   │   ├── student/                  # Student Portal
│   │   │   │   ├── timetable/ attendance/ marks/
│   │   │   │   ├── materials/
│   │   │   │   ├── fees/
│   │   │   │   ├── services/             # Bonafide, BRTS, Transcript, ID card
│   │   │   │   ├── ai/                   # Chatbot, study planner, career
│   │   │   │   ├── campus/               # Digital ID, bus tracking, canteen
│   │   │   │   ├── library/
│   │   │   │   └── placement/
│   │   │   └── public/[slug]/            # Per-university public portal
│   │   │       ├── page.tsx              # University home with dynamic branding
│   │   │       ├── results/              # Result verification (hash + blockchain)
│   │   │       ├── verify/               # Degree/certificate blockchain verification
│   │   │       ├── admissions/           # Online admission portal
│   │   │       ├── scholarships/
│   │   │       └── vacancies/
│   │   └── components/
│   │       ├── timetable/                # TimetableGrid, TimetableCell, TimetableExport
│   │       ├── student/                  # DigitalIDCard, AttendanceAlert, FeesDue
│   │       ├── ai/                       # ChatbotWidget, StudyPlannerView, CareerAdvisor
│   │       ├── public-portal/            # UniversityBrandedLayout, VerificationWidget
│   │       ├── blockchain/               # VerificationBadge, PolygonExplorerLink
│   │       └── shared/                   # DataTable, FileUploader, LoadingStates
│   ├── api/                              # Node.js Express — main backend
│   │   ├── src/
│   │   │   ├── services/                 # 22 microservices handlers
│   │   │   ├── middleware/               # auth, rbac, tenant, rate-limit
│   │   │   ├── routes/                   # All route definitions
│   │   │   └── utils/                    # Helpers, validators
│   ├── ai-engine/                        # Python FastAPI — ML + AI
│   │   ├── scheduling/                   # OR-Tools CP-SAT
│   │   ├── ml/                           # Performance prediction, dropout risk
│   │   ├── rag/                          # LangChain + Elasticsearch RAG
│   │   └── chatbot/                      # Claude API integration
│   └── blockchain/                       # Hardhat + Solidity
│       ├── contracts/
│       │   ├── AcademicRecords.sol
│       │   └── DegreeRegistry.sol
│       ├── scripts/deploy.ts
│       └── test/
├── packages/
│   ├── shared-types/                     # TypeScript types shared across FE + BE
│   ├── ui/                               # Shared component library
│   └── utils/                            # Shared utility functions
├── k8s/                                  # Kubernetes manifests
├── terraform/                            # AWS infrastructure as code
└── .github/workflows/                    # CI/CD pipelines
```

---

## 4. Database Schema (Prisma)

### 4.1 Core Schema (Extended)

```prisma
// packages/database/schema.prisma

model University {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  logoUrl       String?
  established   Int?
  accreditation String?
  publicPortal  PublicPortalConfig?
  departments   Department[]
  faculty       Faculty[]
  students      Student[]
  createdAt     DateTime @default(now())
}

model PublicPortalConfig {
  id           String     @id @default(cuid())
  universityId String     @unique
  university   University @relation(fields: [universityId], references: [id])
  slug         String     @unique
  customDomain String?
  branding     Json       // { logo, primaryColor, secondaryColor, heroImage, tagline }
  features     Json       // { resultVerification, admissionPortal, scholarshipPortal, ... }
  rateLimits   Json       // { verificationsPerHour, admissionsPerHour }
  updatedAt    DateTime   @updatedAt
}

model Department {
  id           String    @id @default(cuid())
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  name         String
  code         String
  hodFacultyId String?
  programs     Program[]
  faculty      Faculty[]
  courses      Course[]
  batches      Batch[]
  timetables   Timetable[]
}

model Program {
  id             String     @id @default(cuid())
  departmentId   String
  department     Department @relation(fields: [departmentId], references: [id])
  name           String
  type           String     // UNDERGRADUATE, POSTGRADUATE, DOCTORAL, FYUP, BEd, MEd, ITEP
  durationYears  Int
  creditsRequired Int
  nepExitPoints  Int[]      // [1, 2, 3, 4] for FYUP
  students       Student[]
  courses        Course[]
}

model Student {
  id             String     @id @default(cuid())
  universityId   String
  university     University @relation(fields: [universityId], references: [id])
  departmentId   String
  enrollmentNo   String     @unique
  name           String
  email          String     @unique
  phone          String?
  batchId        String
  batch          Batch      @relation(fields: [batchId], references: [id])
  programId      String
  program        Program    @relation(fields: [programId], references: [id])
  admissionYear  Int
  photoUrl       String?
  attendance     AttendanceRecord[]
  marks          Mark[]
  feePayments    FeePayment[]
  bookLoans      BookLoan[]
  submissions    Submission[]
  placementRecord PlacementRecord?
}

model AttendanceSession {
  id              String   @id @default(cuid())
  timetableSlotId String
  date            DateTime
  method          String   // MANUAL | QR | IOT_BLE | FACE_RECOGNITION
  qrToken         String?  @unique
  openedAt        DateTime
  closedAt        DateTime?
  records         AttendanceRecord[]
}

model AttendanceRecord {
  id          String            @id @default(cuid())
  sessionId   String
  session     AttendanceSession @relation(fields: [sessionId], references: [id])
  studentId   String
  student     Student           @relation(fields: [studentId], references: [id])
  status      String            // PRESENT | ABSENT | LATE | EXCUSED
  method      String
  markedAt    DateTime
  flags       AttendanceFlag[]
}

model AttendanceFlag {
  id               String           @id @default(cuid())
  attendanceId     String
  attendance       AttendanceRecord @relation(fields: [attendanceId], references: [id])
  flagType         String           // SPORTS_DAY | HACKATHON | OFFICIAL_EVENT | MEDICAL
  approvedBy       String?
  approvedAt       DateTime?
}

model Result {
  id              String   @id @default(cuid())
  studentId       String
  programId       String
  semester        Int
  academicYear    String
  sgpa            Float
  cgpa            Float
  status          String   // PASS | FAIL | DETAINED | WITHHELD
  resultHash      String   // SHA-256 of canonical result JSON
  publishedAt     DateTime?
  blockchainTxHash String? // Polygon L2 transaction hash
  blockchainConfirmedAt DateTime?
}

model VerificationRequest {
  id              String   @id @default(cuid())
  universityId    String
  enrollmentNo    String
  requesterIp     String
  requestType     String   // RESULT | DEGREE | CERTIFICATE
  verifiedAt      DateTime @default(now())
  blockchainMatch Boolean
  resultSnapshot  Json?    // Snapshot of result at verification time
}

model FeeStructure {
  id           String  @id @default(cuid())
  universityId String
  programId    String
  semester     Int
  academicYear String
  components   Json    // [{ name, amount, optional }]
  totalAmount  Float
  payments     FeePayment[]
}

model FeePayment {
  id              String       @id @default(cuid())
  studentId       String
  student         Student      @relation(fields: [studentId], references: [id])
  feeStructureId  String
  feeStructure    FeeStructure @relation(fields: [feeStructureId], references: [id])
  amount          Float
  paymentDate     DateTime
  method          String       // ONLINE | CASH | DD | SCHOLARSHIP
  transactionId   String?
  status          String       // PENDING | COMPLETED | FAILED | REFUNDED
  gateway         String?      // RAZORPAY | PAYU
}

model Book {
  id             String    @id @default(cuid())
  universityId   String
  isbn           String
  title          String
  author         String
  departmentId   String?
  category       String
  totalCopies    Int
  availableCopies Int
  loans          BookLoan[]
  reservations   BookReservation[]
}

model BookLoan {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id])
  issuedAt   DateTime
  dueDate    DateTime
  returnedAt DateTime?
  fineAmount Float?
}

model Company {
  id           String   @id @default(cuid())
  universityId String
  name         String
  type         String   // IT | CORE | FINANCE | STARTUP | MNC
  hrContact    String?
  website      String?
  jobPostings  JobPosting[]
  placements   PlacementRecord[]
}

model PlacementRecord {
  id          String  @id @default(cuid())
  studentId   String  @unique
  student     Student @relation(fields: [studentId], references: [id])
  companyId   String
  company     Company @relation(fields: [companyId], references: [id])
  placedAt    DateTime
  ctc         Float
  role        String
}

model AdmissionApplication {
  id             String   @id @default(cuid())
  universityId   String
  programId      String
  applicantName  String
  email          String
  phone          String?
  documents      Json     // { marksheets, photos, certificates }
  status         String   // SUBMITTED | SHORTLISTED | SELECTED | REJECTED | WAITLISTED
  appliedAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## 5. OR-Tools Scheduling Algorithm

```python
# ai-engine/scheduling/solver.py — Extended for NEP 2020 and AI warm-start

from ortools.sat.python import cp_model
from typing import List, Dict, Optional
import xgboost as xgb

class NEPScheduler:
    """
    CP-SAT based scheduler with:
    - Hard constraints: NEP 2020 credit hours, faculty conflicts, room capacity
    - Soft constraints: fairness scoring, preference optimization, FYUP exit points
    - AI warm-start: XGBoost slot preference predictions as objective hints
    """

    def __init__(self, dept_data: dict, config: dict):
        self.model = cp_model.CpModel()
        self.dept_data = dept_data
        self.config = config
        self.slot_vars: Dict = {}
        self.preference_model = self._load_preference_model()

    def _load_preference_model(self):
        """Load XGBoost slot preference predictor from S3 model artifact."""
        try:
            return xgb.Booster(model_file='/models/slot_preference_v2.json')
        except Exception:
            return None  # Fallback to pure CP-SAT without warm-start

    def solve(self) -> dict:
        self._create_variables()
        self._add_hard_constraints()
        self._add_soft_constraints()
        self._set_objective()
        return self._run_solver()

    def _add_hard_constraints(self):
        # HC-01: No faculty double-booking
        for faculty in self.dept_data['faculty']:
            for day in self.config['days']:
                for slot in self.config['slots']:
                    faculty_slots = [
                        self.slot_vars[(c['id'], faculty['id'], day, slot)]
                        for c in self.dept_data['courses']
                        if faculty['id'] in c['qualifiedFacultyIds']
                        if (c['id'], faculty['id'], day, slot) in self.slot_vars
                    ]
                    if len(faculty_slots) > 1:
                        self.model.add_at_most_one(faculty_slots)

        # HC-02: No room double-booking
        for room in self.dept_data['rooms']:
            for day in self.config['days']:
                for slot in self.config['slots']:
                    room_slots = [v for key, v in self.slot_vars.items()
                                  if key[3] == slot and key[2] == day]
                    if len(room_slots) > 1:
                        self.model.add_at_most_one(room_slots)

        # HC-06: Room capacity >= batch strength
        for batch in self.dept_data['batches']:
            for room in self.dept_data['rooms']:
                if room['capacity'] < batch['strength']:
                    for key, var in self.slot_vars.items():
                        if 'batch' in key and key['batch'] == batch['id'] \
                           and 'room' in key and key['room'] == room['id']:
                            self.model.add(var == 0)

        # HC-08: NEP 2020 minimum credit-hours per subject
        for course in self.dept_data['courses']:
            required_slots = course['creditsPerWeek']
            course_slots = [v for key, v in self.slot_vars.items()
                            if key[0] == course['id']]
            self.model.add(sum(course_slots) == required_slots)

    def _add_soft_constraints(self):
        # SC-04: AI Fairness Score — minimize workload variance
        workloads = []
        for faculty in self.dept_data['faculty']:
            faculty_load = sum(
                v for key, v in self.slot_vars.items() if key[1] == faculty['id']
            )
            workloads.append(faculty_load)

        max_load = self.model.new_int_var(0, 100, 'max_load')
        min_load = self.model.new_int_var(0, 100, 'min_load')
        self.model.add_max_equality(max_load, workloads)
        self.model.add_min_equality(min_load, workloads)
        self.fairness_penalty = self.model.new_int_var(0, 100, 'fairness_penalty')
        self.model.add(self.fairness_penalty == max_load - min_load)

    def _set_objective(self):
        penalties = [self.fairness_penalty * 100]

        # AI warm-start: use XGBoost predictions as slot preference hints
        if self.preference_model is not None:
            for key, var in self.slot_vars.items():
                course_id, faculty_id, day, slot_idx = key
                preference_score = self._predict_slot_preference(
                    course_id, faculty_id, day, slot_idx
                )
                # Higher preference score → lower penalty for using that slot
                penalties.append(var * (100 - int(preference_score * 100)))

        self.model.minimize(sum(penalties))

    def _predict_slot_preference(self, course_id, faculty_id, day, slot_idx) -> float:
        """XGBoost prediction: 0.0 (worst) to 1.0 (ideal) for this slot."""
        if self.preference_model is None:
            return 0.5
        features = [[day, slot_idx,
                     self._get_course_type(course_id),
                     self._get_faculty_seniority(faculty_id)]]
        import xgboost as xgb
        dmatrix = xgb.DMatrix(features)
        return float(self.preference_model.predict(dmatrix)[0])

    def _run_solver(self) -> dict:
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = self.config.get('solverTimeLimit', 30)
        solver.parameters.num_workers = 8  # Parallel CP-SAT workers
        status = solver.solve(self.model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return self._extract_solution(solver)
        else:
            raise ValueError("No feasible solution found within time limit")
```

---

## 6. Blockchain Implementation

### 6.1 Smart Contract (Solidity)

```solidity
// blockchain/contracts/AcademicRecords.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AcademicRecords is AccessControl {

    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER_ROLE");

    struct ResultRecord {
        string universityId;
        string enrollmentNo;
        uint8 semester;
        string resultHash;      // SHA-256 of canonical result JSON
        uint256 publishedAt;
        address publishedBy;
    }

    // universityId + enrollmentNo + semester → ResultRecord
    mapping(bytes32 => ResultRecord) private results;

    event ResultPublished(
        string indexed universityId,
        string indexed enrollmentNo,
        uint8 semester,
        string resultHash,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PUBLISHER_ROLE, msg.sender);
    }

    function publishResult(
        string calldata universityId,
        string calldata enrollmentNo,
        uint8 semester,
        string calldata resultHash
    ) external onlyRole(PUBLISHER_ROLE) {
        bytes32 key = keccak256(abi.encodePacked(universityId, enrollmentNo, semester));
        results[key] = ResultRecord({
            universityId: universityId,
            enrollmentNo: enrollmentNo,
            semester: semester,
            resultHash: resultHash,
            publishedAt: block.timestamp,
            publishedBy: msg.sender
        });
        emit ResultPublished(universityId, enrollmentNo, semester, resultHash, block.timestamp);
    }

    function verifyResult(
        string calldata universityId,
        string calldata enrollmentNo,
        uint8 semester,
        string calldata resultHashToVerify
    ) external view returns (bool matches, uint256 publishedAt) {
        bytes32 key = keccak256(abi.encodePacked(universityId, enrollmentNo, semester));
        ResultRecord memory record = results[key];
        matches = keccak256(bytes(record.resultHash)) == keccak256(bytes(resultHashToVerify));
        publishedAt = record.publishedAt;
    }
}
```

### 6.2 Blockchain Service (Node.js)

```typescript
// api/src/services/blockchain.service.ts

import { ethers } from 'ethers';
import { createHash } from 'crypto';
import AcademicRecordsABI from '@blockchain/AcademicRecords.json';

export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY!, this.provider);
        this.contract = new ethers.Contract(
            process.env.ACADEMIC_RECORDS_CONTRACT_ADDRESS!,
            AcademicRecordsABI,
            this.wallet
        );
    }

    async publishResult(universityId: string, enrollmentNo: string, semester: number, resultData: object) {
        const canonicalJson = JSON.stringify(resultData, Object.keys(resultData).sort());
        const resultHash = createHash('sha256').update(canonicalJson).digest('hex');

        const tx = await this.contract.publishResult(universityId, enrollmentNo, semester, resultHash);
        const receipt = await tx.wait();

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            resultHash,
            polygonscanUrl: `https://polygonscan.com/tx/${receipt.hash}`
        };
    }

    async verifyResult(universityId: string, enrollmentNo: string, semester: number, resultData: object) {
        const canonicalJson = JSON.stringify(resultData, Object.keys(resultData).sort());
        const resultHash = createHash('sha256').update(canonicalJson).digest('hex');

        const [matches, publishedAt] = await this.contract.verifyResult(
            universityId, enrollmentNo, semester, resultHash
        );

        return {
            verified: matches,
            resultHash,
            publishedAt: publishedAt > 0 ? new Date(Number(publishedAt) * 1000).toISOString() : null,
            polygonscanUrl: matches
                ? `https://polygonscan.com/address/${process.env.ACADEMIC_RECORDS_CONTRACT_ADDRESS}`
                : null
        };
    }
}
```

---

## 7. AI Feature Implementation

### 7.1 AI Doubt Chatbot (Claude API + RAG)

```python
# ai-engine/chatbot/doubt_assistant.py

from anthropic import Anthropic
from langchain_community.vectorstores import ElasticsearchStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

client = Anthropic()
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

async def answer_student_question(
    question: str,
    university_id: str,
    subject_id: str,
    student_id: str,
    chat_history: list[dict]
) -> str:
    """
    AI Doubt Assistant — retrieves relevant study material chunks via RAG
    and answers the student's question using Claude with temperature=1.

    temperature=1 ensures each university's chatbot gives varied, creative,
    contextually rich responses rather than identical boilerplate answers.
    """

    # Step 1: Retrieve relevant context from university-scoped Elasticsearch index
    index_name = f"uni_{university_id}_subject_{subject_id}"
    vectorstore = ElasticsearchStore(
        es_url=ELASTICSEARCH_URL,
        index_name=index_name,
        embedding=embeddings
    )
    relevant_docs = vectorstore.similarity_search(question, k=5)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])

    # Step 2: Build messages with RAG context + conversation history
    system_prompt = f"""You are an intelligent academic assistant for students at this university.
Your role is to help students understand their course material clearly and accurately.
Use the provided course content as your primary source. If the answer is not in the context,
say so honestly rather than guessing. Be encouraging, patient, and pedagogically effective."""

    messages = [
        *chat_history[-6:],  # Last 3 exchanges for context
        {
            "role": "user",
            "content": f"""Course Material Context:
{context}

Student Question: {question}

Please explain this clearly and thoroughly."""
        }
    ]

    # Step 3: Call Claude API with temperature=1 for creative, varied responses
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system_prompt,
        messages=messages,
        temperature=1  # Enables diverse, non-repetitive responses across different university deployments
    )

    return response.content[0].text

async def index_study_material(
    file_content: bytes,
    file_type: str,
    university_id: str,
    subject_id: str,
    material_id: str
):
    """Index uploaded study material into per-university Elasticsearch index."""
    text = extract_text(file_content, file_type)
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    index_name = f"uni_{university_id}_subject_{subject_id}"
    vectorstore = ElasticsearchStore.from_texts(
        texts=chunks,
        embedding=embeddings,
        es_url=ELASTICSEARCH_URL,
        index_name=index_name,
        metadatas=[{"materialId": material_id, "chunkIndex": i} for i in range(len(chunks))]
    )
    return len(chunks)
```

### 7.2 Dropout Risk Prediction

```python
# ai-engine/ml/dropout_risk.py

import joblib
import shap
import pandas as pd

class DropoutRiskModel:
    """
    Random Forest model predicting student dropout risk.
    Returns a risk score 0–1 with SHAP-based explainability.
    """
    def __init__(self):
        self.model = joblib.load('/models/dropout_risk_rf_v2.pkl')
        self.explainer = shap.TreeExplainer(self.model)

    def predict(self, student_features: dict) -> dict:
        df = pd.DataFrame([student_features])
        risk_score = float(self.model.predict_proba(df)[0][1])
        shap_values = self.explainer.shap_values(df)

        top_risk_factors = self._get_top_factors(
            shap_values[1][0], list(student_features.keys()), n=3
        )

        return {
            "riskScore": round(risk_score, 3),
            "riskLevel": "HIGH" if risk_score > 0.7 else "MEDIUM" if risk_score > 0.4 else "LOW",
            "topRiskFactors": top_risk_factors,
            "recommendation": self._get_recommendation(risk_score, top_risk_factors)
        }

    def _get_top_factors(self, shap_vals, feature_names, n=3):
        factors = sorted(zip(feature_names, shap_vals), key=lambda x: abs(x[1]), reverse=True)
        return [{"factor": f, "impact": round(float(v), 3)} for f, v in factors[:n]]
```

---

## 8. Per-University Public Portal Implementation

### 8.1 Dynamic Branding (Next.js)

```typescript
// apps/web/app/public/[slug]/layout.tsx

import { getPublicPortalConfig } from '@/lib/public-portal-api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const config = await getPublicPortalConfig(params.slug);
    if (!config) return {};
    return {
        title: `${config.branding.universityFullName} — Official Portal`,
        description: config.branding.tagline,
        openGraph: {
            images: [config.branding.heroImageUrl],
            siteName: config.branding.universityFullName
        }
    };
}

export default async function PublicPortalLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { slug: string };
}) {
    const config = await getPublicPortalConfig(params.slug);
    if (!config || !config.enabled) return notFound();

    // Inject university-specific CSS variables for branding
    const cssVars = {
        '--primary': config.branding.primaryColor,
        '--secondary': config.branding.secondaryColor,
        '--font-heading': config.branding.headingFont ?? 'Inter'
    } as React.CSSProperties;

    return (
        <div style={cssVars} className="min-h-screen bg-background font-sans">
            <header className="bg-[--primary] text-white px-6 py-4 flex items-center gap-4">
                <img src={config.branding.logoUrl} alt="University Logo" className="h-12 w-auto" />
                <div>
                    <h1 className="text-xl font-bold">{config.branding.universityFullName}</h1>
                    <p className="text-sm opacity-80">{config.branding.tagline}</p>
                </div>
            </header>

            {/* Feature-gated navigation — different per university */}
            <nav className="bg-[--secondary] text-white px-6 py-2 flex gap-6 text-sm font-medium">
                {config.features.resultVerification && <a href={`/public/${params.slug}/results`}>Results</a>}
                {config.features.admissionPortal && <a href={`/public/${params.slug}/admissions`}>Admissions</a>}
                {config.features.scholarshipPortal && <a href={`/public/${params.slug}/scholarships`}>Scholarships</a>}
                {config.features.vacancyPublication && <a href={`/public/${params.slug}/vacancies`}>Vacancies</a>}
            </nav>

            <main className="container mx-auto px-4 py-8">{children}</main>

            <footer className="bg-[--primary] text-white text-center py-4 text-sm">
                © {new Date().getFullYear()} {config.branding.universityFullName} — Powered by AI Smart University Platform
            </footer>
        </div>
    );
}
```

### 8.2 Blockchain Verification Widget (Next.js)

```typescript
// apps/web/components/public-portal/VerificationWidget.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

export function VerificationWidget({ slug }: { slug: string }) {
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleVerify() {
        setLoading(true);
        try {
            const res = await fetch(`/api/public/${slug}/results/verify?enrollment=${enrollmentNo}`);
            const data = await res.json();
            setResult(data);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Verify Academic Result</h2>
            <input
                className="w-full border rounded-lg px-4 py-2 mb-4"
                placeholder="Enter Enrollment Number"
                value={enrollmentNo}
                onChange={e => setEnrollmentNo(e.target.value)}
            />
            <button
                onClick={handleVerify}
                disabled={loading || !enrollmentNo}
                className="w-full bg-[--primary] text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
                {loading ? 'Verifying on blockchain...' : 'Verify Result'}
            </button>

            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 font-semibold">
                        {result.verified ? '✅ Verified — Authentic Result' : '❌ Verification Failed — Possible Tampering'}
                    </div>
                    {result.verified && (
                        <>
                            <p className="text-sm mt-2">Name: {result.studentName}</p>
                            <p className="text-sm">CGPA: {result.cgpa} | Semester: {result.semester}</p>
                            <p className="text-sm">Published: {new Date(result.publishedAt).toLocaleDateString()}</p>
                            <a href={result.polygonscanUrl} target="_blank" className="text-blue-600 text-xs mt-2 block">
                                View on Polygonscan →
                            </a>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
```

---

## 9. API Implementation Guide

### 9.1 Multi-Tenant Middleware

```typescript
// api/src/middleware/tenant.middleware.ts

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.user?.universityId ?? req.headers['x-university-id'];

    if (!universityId && !req.path.startsWith('/public')) {
        return res.status(403).json({ error: 'No university context' });
    }

    // Set PostgreSQL schema for this request
    if (universityId) {
        const schemaName = universityId.toLowerCase().replace(/-/g, '_');
        await prisma.$executeRawUnsafe(`SET search_path = ${schemaName}, public`);
        req.universityId = universityId;
        req.schemaName = schemaName;
    }

    next();
};
```

### 9.2 Public Portal API Route (Isolated, Read-Only)

```typescript
// api/src/routes/public-portal.routes.ts

router.get('/:slug/results/verify', rateLimiter({ max: 100, windowMs: 60000 }), async (req, res) => {
    const { slug } = req.params;
    const { enrollment, semester } = req.query;

    // Resolve university from slug — set schema
    const config = await PublicPortalService.getConfigBySlug(slug);
    if (!config?.features?.resultVerification) return res.status(404).json({ error: 'Feature not available' });

    await prisma.$executeRawUnsafe(`SET search_path = ${config.schemaName}, public`);

    // Fetch result from PostgreSQL
    const result = await prisma.result.findFirst({
        where: { student: { enrollmentNo: enrollment as string }, semester: Number(semester) },
        include: { student: true }
    });

    if (!result) return res.status(404).json({ error: 'Result not found' });

    // Verify on-chain
    const verification = await blockchainService.verifyResult(
        config.universityId,
        enrollment as string,
        Number(semester),
        result
    );

    // Log verification request for audit
    await prisma.verificationRequest.create({
        data: {
            universityId: config.universityId,
            enrollmentNo: enrollment as string,
            requesterIp: req.ip,
            requestType: 'RESULT',
            blockchainMatch: verification.verified,
            resultSnapshot: result
        }
    });

    res.json({
        verified: verification.verified,
        studentName: result.student.name,
        semester: result.semester,
        sgpa: result.sgpa,
        cgpa: result.cgpa,
        publishedAt: result.publishedAt,
        polygonscanUrl: verification.polygonscanUrl
    });
});
```

---

## 10. Frontend Implementation Guide

### 10.1 Student Digital ID Card Component

```tsx
// apps/web/components/student/DigitalIDCard.tsx

import QRCode from 'qrcode.react';
import { Student } from '@/types';

export function DigitalIDCard({ student }: { student: Student }) {
    const qrData = JSON.stringify({
        id: student.id,
        enrollmentNo: student.enrollmentNo,
        universityId: student.universityId,
        issuer: 'AI-SMART-UNIVERSITY-PLATFORM'
    });

    return (
        <div className="bg-gradient-to-br from-[--primary] to-[--secondary] text-white rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                <img src={student.universityLogoUrl} alt="Logo" className="h-10 w-auto" />
                <span className="text-xs font-mono opacity-70">STUDENT ID</span>
            </div>
            <div className="flex gap-4 items-center mb-4">
                <img src={student.photoUrl ?? '/placeholder-avatar.png'} className="w-16 h-16 rounded-full border-2 border-white object-cover" />
                <div>
                    <p className="font-bold text-lg leading-tight">{student.name}</p>
                    <p className="text-sm opacity-80">{student.program.name}</p>
                    <p className="text-xs font-mono mt-1">{student.enrollmentNo}</p>
                </div>
            </div>
            <div className="bg-white rounded-xl p-3 flex justify-center">
                <QRCode value={qrData} size={120} fgColor="#000000" bgColor="#ffffff" level="H" />
            </div>
            <p className="text-xs text-center mt-2 opacity-60">Scan for quick verification</p>
        </div>
    );
}
```

---

## 11. Environment Configuration

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/smartuniversity
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-256-bit-secret-use-openssl-rand-base64-32
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
AI_ENGINE_URL=http://localhost:8003
SOCKET_CORS_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=12
NODE_ENV=development
PORT=8000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Blockchain (Polygon L2)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology  # Testnet: Amoy | Mainnet: https://polygon-rpc.com
BLOCKCHAIN_PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
ACADEMIC_RECORDS_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS

# AWS
AWS_REGION=ap-south-1
AWS_S3_BUCKET=smart-university-platform-assets
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Payments
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# apps/ai-engine/.env
DATABASE_URL=postgresql://user:password@localhost:5432/smartuniversity
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx   # Claude API for chatbot + career advisor
SOLVER_TIME_LIMIT_SECONDS=30
ENVIRONMENT=development
PORT=8003

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_NAME=AI Smart University Platform
NEXT_PUBLIC_APP_VERSION=2.0.0
```

---

## 12. Deployment Guide

### 12.1 MVP Hosting Plan

| Service | Platform | Free Tier? | Paid Cost | Notes |
|---|---|---|---|---|
| Frontend (Next.js) | Vercel | ✅ Yes | $0–$20/mo | Auto-deploy from GitHub; ISR support |
| API Server (Node.js) | Railway | ✅ Limited | $10–$30/mo | Dockerfile deploy; 22 services via single app |
| AI Engine (Python) | Railway / Render | ✅ Limited | $15–$40/mo | 2GB RAM minimum; GPU optional |
| PostgreSQL | Supabase or Neon | ✅ Yes | $0–$25/mo | Managed Postgres; per-schema multi-tenant |
| Redis | Upstash | ✅ Yes | $0–$10/mo | Serverless Redis |
| Elasticsearch | Elastic Cloud | ❌ No | $15–$50/mo | 2GB RAM for RAG index |
| Blockchain (Polygon L2) | Polygon Amoy Testnet | ✅ Yes | $0 test / ~$10 mainnet | Gas fees for result publishing |
| MongoDB | Atlas M0 | ✅ Yes | $0–$10/mo | Free tier for MVP |
| Domain + SSL | Namecheap + Cloudflare | ❌ No | $10–$15/yr | Cloudflare CDN + per-university CNAME |
| Firebase | Firebase Spark | ✅ Yes | $0–$25/mo | Authentication for students |
| **Total MVP Cost** | | | **~$60–$200/mo** | Scales with universities onboarded |

### 12.2 Smart Contract Deployment

```bash
# Deploy to Polygon Amoy Testnet (dev)
cd blockchain
npx hardhat run scripts/deploy.ts --network amoy

# Verify contract on Polygonscan
npx hardhat verify --network amoy 0xYOUR_CONTRACT_ADDRESS

# Deploy to Polygon Mainnet (production)
npx hardhat run scripts/deploy.ts --network polygon

# Grant PUBLISHER_ROLE to blockchain-service wallet
npx hardhat run scripts/grantPublisherRole.ts --network polygon
```

---

## 13. Testing Strategy

| Test Type | Tool | Coverage Target | Key Test Cases |
|---|---|---|---|
| Unit Tests | Jest + Vitest | 80% line coverage | OR-Tools constraints, blockchain hash computation, AI chatbot mock, tenant middleware |
| Integration Tests | Supertest | 70% API coverage | Full CRUD for all entities; timetable generation; blockchain publish/verify; public portal isolation |
| E2E Tests | Playwright | All 7 panel flows | Login → student flow; admission application; result verification on public portal |
| Load Testing | k6 | 500 concurrent users | Timetable generation; AI chatbot; public portal verifications; fee payment |
| Conflict Testing | Jest | 100% constraint coverage | 0 conflicts in 100 randomly generated timetables |
| Blockchain Tests | Hardhat | All contract functions | publishResult, verifyResult, tamper detection, access control |
| Security Testing | OWASP ZAP + Trivy | OWASP Top 10 | Cross-tenant access, JWT manipulation, SQL injection, public portal data leakage |
| Tenant Isolation Tests | Jest + Supertest | 100% cross-tenant paths | Verify university A cannot access university B data via any API path |

### 13.1 Key Test: Cross-Tenant Isolation

```typescript
// __tests__/tenant-isolation.test.ts
describe('Cross-Tenant Data Isolation', () => {
    it('should prevent university A admin from accessing university B data', async () => {
        const tokenUniA = await loginAs('uni_a_admin');
        const response = await request(app)
            .get('/v2/students')
            .set('Authorization', `Bearer ${tokenUniA}`)
            .set('X-University-Id', 'university-b')  // Attempting to access uni B
        expect(response.status).toBe(403);
    });

    it('should prevent public portal slug A from returning university B results', async () => {
        const response = await request(app)
            .get('/public/v2/university-slug-a/results/verify')
            .query({ enrollment: 'STUDENT_FROM_UNI_B', semester: 3 });
        expect(response.status).toBe(404);  // Not found — not in uni A's schema
    });

    it('should serve different branding per university slug', async () => {
        const configA = await getPublicConfig('vnsgu');
        const configB = await getPublicConfig('spuvvn');
        expect(configA.branding.universityFullName).not.toBe(configB.branding.universityFullName);
        expect(configA.branding.primaryColor).not.toBe(configB.branding.primaryColor);
    });
});
```

### 13.2 Key Test: Blockchain Verification

```typescript
// __tests__/blockchain.test.ts
describe('Blockchain Result Verification', () => {
    it('should verify authentic result', async () => {
        const { txHash, resultHash } = await blockchainService.publishResult(
            'uni-vnsgu', '2021CS001', 4, mockResultData
        );
        expect(txHash).toMatch(/^0x[0-9a-f]{64}$/);

        const { verified } = await blockchainService.verifyResult(
            'uni-vnsgu', '2021CS001', 4, mockResultData
        );
        expect(verified).toBe(true);
    });

    it('should detect tampered result', async () => {
        await blockchainService.publishResult('uni-vnsgu', '2021CS001', 4, mockResultData);
        const tamperedData = { ...mockResultData, cgpa: 9.9 }; // tampered!
        const { verified } = await blockchainService.verifyResult(
            'uni-vnsgu', '2021CS001', 4, tamperedData
        );
        expect(verified).toBe(false);
    });
});
```

---

## 14. Test Data — VNSGU Computer Science

### Pre-loaded Test Data Summary

| Entity | Count | Details |
|---|---|---|
| University | 1 | Veer Narmad South Gujarat University (VNSGU) |
| Public Portal Config | 1 | Slug: `vnsgu`; Domain: `results.vnsgu.ac.in`; Primary: `#003087`; All features enabled |
| Department | 1 | Department of Computer Science |
| Program | 1 | MCA (Master of Computer Applications) — 2 years |
| Faculty | 9 | Rustam, Ravi, Dharmen, Nimisha, Jayshree, Mayur, Prakash, Vimal, Rinku |
| Students | 60 | MCA Sem 2 Div A (30) + Div B (30) |
| Courses (MCA Sem 2) | 7 | AI, Frontend, .Net, Blockchain, Python, iOS, Android |
| Batches | 2 | MCA Sem 2 Div A 2025-26, MCA Sem 2 Div B 2025-26 |
| Classrooms | 3 | CS Classroom 101 (60), CS Classroom 102 (60), CS Classroom 201 (40) |
| Labs | 2 | CS Lab A (30), CS Lab B (30) |
| Published Results | 60 | Sem 1 results with blockchain hashes (for public portal testing) |
| Fee Structures | 2 | MCA Year 1 (₹45,000), MCA Year 2 (₹45,000) |
| Library Books | 50 | CS department books — for library management testing |
| Companies | 5 | TCS, Infosys, Wipro, L&T Infotech, Jaro Education |

### Login Credentials (Demo)

| Role | Username | Password | Access |
|---|---|---|---|
| Super Admin | `superadmin` | `super@admin123` | All data + all public portal configs |
| University Admin | `vnsgu_admin` | `vnsgu@123` | VNSGU data + NAAC/results |
| Department Admin | `cs_dept` | `cs@123` | CS Dept data |
| Faculty (Rustam) | `rustam_morena` | `faculty@123` | Personal schedule + attendance |
| Student (Aryan) | `2025mca001` | `student@123` | Personal student portal |
| Public | No login | — | `results.vnsgu.ac.in` public portal |

### Second University Test Data (SPUVVN)

A second university (Sardar Patel University) is pre-loaded to validate tenant isolation and per-university public portal differentiation:

| Property | VNSGU | SPUVVN |
|---|---|---|
| Public portal slug | `vnsgu` | `spuvvn` |
| Primary color | `#003087` (blue) | `#8B0000` (maroon) |
| Admission portal | Enabled | Disabled |
| Research repo | Disabled | Enabled |
| Blockchain verify | Enabled | Enabled |
| Custom domain | `results.vnsgu.ac.in` | `verify.spu.edu.in` |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
*Supersedes NEP-Scheduler MVP Technical Document v1.0.0 — February 2026*
