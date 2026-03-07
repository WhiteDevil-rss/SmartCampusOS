# AI SMART UNIVERSITY PLATFORM — Architecture Document

> **Document Type:** Architecture Document | **Version:** v2.0.0 | **Date:** March 2026
> **Product:** AI Smart University Platform — Full-Stack Intelligent University Operating System
> **Classification:** Confidential — Internal Use Only
> **Previous Version:** v1.0.0 (NEP-Scheduler — AI-Powered Timetable Scheduling Platform)
> **Upgrade Notice:** This document supersedes v1.0.0. The platform has been expanded from a timetable scheduler to a full university operating system with per-university public portals, student lifecycle management, smart campus IoT, blockchain verification, and advanced AI features.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview & Design Principles](#2-system-overview--design-principles)
3. [Microservices Architecture](#3-microservices-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Per-University Public Panel Architecture](#6-per-university-public-panel-architecture)
7. [Infrastructure & Deployment](#7-infrastructure--deployment)
8. [Real-Time Architecture](#8-real-time-architecture)
9. [API Design Standards](#9-api-design-standards)
10. [Blockchain Architecture](#10-blockchain-architecture)
11. [AI/ML Architecture](#11-aiml-architecture)
12. [Smart Campus IoT Architecture](#12-smart-campus-iot-architecture)
13. [Scalability & Performance](#13-scalability--performance)
14. [Architecture Decision Records](#14-architecture-decision-records)

---

## 1. Executive Summary

The AI Smart University Platform is a cloud-native, AI-powered, multi-tenant university operating system built for Indian institutions under the **National Education Policy 2020**. It expands from a timetable scheduling engine into a complete digital university ecosystem spanning student lifecycle management, faculty operations, departmental governance, financial management, blockchain-backed result verification, smart campus IoT integration, and an advanced AI suite.

> **Architecture Philosophy:** Domain-Driven Design (DDD) with microservices decomposition, event-driven communication via Apache Kafka, a hybrid multi-tenancy model (schema-per-university), a per-university isolated public portal, and a progressive AI pipeline. Every university is a fully isolated tenant — including its public-facing portal.

### Platform Scale Targets

| Dimension | MVP | Production Scale |
|---|---|---|
| Universities | 5 | 10,000 |
| Students | 10,000 | 10,000,000 |
| Concurrent Users | 500 | 100,000 |
| Daily API Requests | 100,000 | 1,000,000,000 |
| Public Portal Verifications/day | 500 | 1,000,000 |

---

## 2. System Overview & Design Principles

### 2.1 High-Level Architecture Pattern

The platform adopts a **Layered Microservices Architecture** with the following primary tiers:

| Layer | Technology Stack | Responsibility |
|---|---|---|
| Presentation Tier | React 18 + Next.js 14 + TypeScript + React Native (v3) | Seven-panel UI + per-university public portal |
| API Gateway | Kong / AWS API Gateway + OAuth2 + Firebase Auth | Unified entry, auth, rate-limiting, tenant routing |
| Application Services | Node.js (Express) + Python (FastAPI) | Business logic microservices (22 services) |
| AI/ML Engine | Python + OR-Tools + TensorFlow + scikit-learn + LangChain | Scheduling intelligence + AI features |
| Blockchain Layer | Ethereum / Polygon L2 + Solidity Smart Contracts | Immutable academic record verification |
| IoT Gateway | MQTT Broker (Mosquitto) + Node.js IoT Service | Smart campus device integration |
| Messaging Bus | Apache Kafka + Redis Pub/Sub | Async event coordination |
| Data Tier | PostgreSQL + MongoDB + Redis + Elasticsearch + InfluxDB | Persistent, cache, search, time-series storage |
| Infrastructure | Kubernetes on AWS EKS + Terraform | Container orchestration & IaC |

### 2.2 Multi-Tenancy Model

The platform implements a **Hybrid Multi-Tenancy model** combining schema-level isolation per university with row-level security for departments and faculty:

| Tenant Level | Isolation Strategy | Data Scope |
|---|---|---|
| University (Tenant) | Dedicated PostgreSQL schema per university | All university data including public portal data |
| Department | Row-level security (RLS) with `department_id` | Department-scoped data only |
| Faculty | JWT with role claims + RLS | Personal schedule, profile, research |
| Student | JWT with role claims + RLS | Personal academic record, fees, materials |
| Public Portal | Separate read-only API with schema scoping | Public-visible university data only (results, admissions, vacancies) |
| Super Admin | Cross-schema access with audit logging | Global read/write access |

### 2.3 Seven-Panel Role Hierarchy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    GLOBAL SUPERADMIN (/superadmin)                        │
│  Manages all universities, credentials, public portal configs globally   │
├──────────────────────────────────────────────────────────────────────────┤
│                 UNIVERSITY ADMIN (/dashboard)                             │
│    Manages departments, programs, faculty pool, exams, finance, NAAC     │
├──────────────────────────────────────────────────────────────────────────┤
│                DEPARTMENT / COLLEGE ADMIN (/department)                   │
│    Manages timetables, students, faculty, finance, library, placement    │
├──────────────────────────────────────────────────────────────────────────┤
│                  FACULTY PORTAL (/faculty-panel)                          │
│  Attendance, grading, assignments, resources, research, communication    │
├──────────────────────────────────────────────────────────────────────────┤
│                  STUDENT PORTAL (/student)                                │
│  Timetable, fees, materials, AI tools, career, digital ID, services     │
├──────────────────────────────────────────────────────────────────────────┤
│         PUBLIC PORTAL (/public/{university-slug}) — PER UNIVERSITY       │
│   Fully isolated per university: results, admissions, verifications     │
│   Custom domain + branding + feature toggles per university tenant      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Security Architecture

Security enforced at multiple layers following OWASP guidelines and **DPDP Act 2023** compliance:

- **Authentication:** Firebase Authentication (students, faculty) + OAuth 2.0 + OpenID Connect via Keycloak (admin roles) + MFA support
- **Authorization:** Role-Based Access Control (RBAC) with fine-grained permissions per panel
- **Transport:** TLS 1.3 end-to-end for all data in transit
- **Storage:** AES-256 encryption at rest in PostgreSQL and S3
- **Blockchain:** Academic records immutably stored on Polygon L2 (Ethereum-compatible)
- **API Security:** Rate limiting (Kong), WAF (AWS Shield), DDoS protection, AI fraud detection
- **IoT Security:** MQTT over TLS; device certificates; isolated IoT subnet
- **Audit:** Immutable audit log stream via Kafka to Elasticsearch/Kibana
- **Zero Trust:** Every service-to-service call authenticated with mTLS

---

## 3. Microservices Architecture

### 3.1 Complete Service Catalogue (22 Services)

| Service Name | Language | Port | Primary Responsibility |
|---|---|---|---|
| `api-gateway` | Kong/Node.js | 8000 | Traffic routing, auth validation, rate limiting, tenant routing |
| `auth-service` | Node.js + Firebase/Keycloak | 8001 | Login, JWT issuance, password management, RBAC, MFA |
| `tenant-service` | Node.js | 8002 | University/department provisioning, public portal config, multi-tenancy |
| `scheduling-engine` | Python (FastAPI) | 8003 | OR-Tools CP-SAT constraint solving, timetable generation |
| `ai-ml-service` | Python (FastAPI) | 8004 | ML predictions, AI features, LLM chatbot, career recommendation |
| `faculty-service` | Node.js | 8005 | Faculty CRUD, availability, research portfolio, FDP tracking |
| `course-service` | Node.js | 8006 | Course/subject management, batch assignment, curriculum versions |
| `resource-service` | Node.js | 8007 | Classroom/lab inventory, availability matrix, asset tracking |
| `notification-service` | Node.js | 8008 | Real-time alerts via WebSocket, email, SMS, push notifications |
| `report-service` | Python | 8009 | PDF/Excel export, NAAC/NIRF reports, accreditation documents |
| `analytics-service` | Python | 8010 | Dashboard metrics, BI analytics, performance dashboards |
| `realtime-service` | Node.js (Socket.io) | 8011 | WebSocket connections, live schedule and feed updates |
| `student-service` | Node.js | 8012 | Student CRUD, enrollment, performance, attendance, digital ID |
| `fees-service` | Node.js | 8013 | Fee collection, payment gateway, scholarships, payroll, payslips |
| `library-service` | Node.js | 8014 | Book catalog, digital access, reservations, due reminders |
| `placement-service` | Node.js | 8015 | Company management, internship feed, resume analyser, placement records |
| `exam-service` | Node.js | 8016 | Exam timetable, hall tickets, sitting arrangement, invigilator management |
| `blockchain-service` | Node.js + ethers.js | 8017 | Smart contract interactions, result publishing, hash verification |
| `iot-service` | Node.js + MQTT | 8018 | IoT device management, attendance feeds, smart access, bus tracking |
| `public-portal-service` | Node.js | 8019 | Serves per-university public portal data (read-only, tenant-scoped) |
| `admission-service` | Node.js | 8020 | Admission workflow, merit list, application forms, status tracking |
| `communication-service` | Node.js | 8021 | Internal messaging, group chats, anonymous complaints, announcements |

### 3.2 Scheduling Engine — Constraint Model

> **OR-Tools CP-SAT Solver:** Uses Google OR-Tools CP-SAT (Constraint Programming with Boolean Satisfiability) — a state-of-the-art hybrid solver applying constraint propagation, linear relaxation, and DPLL-based SAT solving. Guarantees mathematical optimality with configurable time bounds.

#### Hard Constraints (Never Violated)

| ID | Constraint Description |
|---|---|
| HC-01 | No faculty member assigned to two classes simultaneously |
| HC-02 | No classroom double-booked for the same time slot |
| HC-03 | No batch/division assigned two subjects at the same time |
| HC-04 | Subject must be taught by a faculty qualified for that subject |
| HC-05 | Lab sessions must use lab-type rooms; theory uses classrooms |
| HC-06 | Room capacity must be ≥ batch strength |
| HC-07 | Faculty max weekly hours must not be exceeded |
| HC-08 | NEP 2020 minimum credit hours per subject per week must be met |

#### Soft Constraints (Optimized via Objective Function)

| ID | Constraint Description |
|---|---|
| SC-01 | Minimize gaps in faculty daily schedule (back-to-back preference) |
| SC-02 | Distribute subjects evenly across weekdays |
| SC-03 | Prefer morning slots for high-cognitive subjects (AI, Mathematics) |
| SC-04 | AI Fairness Score: workload variance across faculty < 2 hours/week |
| SC-05 | Lab sessions preferably in 2-hour contiguous blocks |
| SC-06 | Senior faculty (HOD) gets preferred timing windows |
| SC-07 | Elective conflict resolution: cross-department electives avoid overlap |
| SC-08 | FYUP year-wise constraints respected per exit point cohort |

### 3.3 AI/ML Pipeline Architecture

| ML Module | Algorithm | Service | Purpose |
|---|---|---|---|
| Slot Preference Predictor | XGBoost (Gradient Boosted Trees) | `ai-ml-service` | Predict optimal time slots per subject type |
| Conflict Risk Classifier | Random Forest Classifier | `ai-ml-service` | Pre-screen high-risk constraint combinations |
| Substitute Recommender | Collaborative Filtering + Cosine Similarity | `ai-ml-service` | Suggest substitutes when faculty absent |
| Room Utilization Optimizer | Bin Packing + RL | `ai-ml-service` | Maximize room utilization efficiency |
| Student Performance Predictor | XGBoost + SHAP | `ai-ml-service` | Predict end-semester grades; identify at-risk students |
| Dropout Risk Model | Random Forest + SHAP | `ai-ml-service` | Explainable dropout risk scores per student |
| AI Career Advisor | LLM (Claude API) + RAG | `ai-ml-service` | Personalized career recommendations |
| AI Doubt Chatbot | LLM (Claude API) + RAG over study materials | `ai-ml-service` | Subject-specific question answering |
| AI Study Planner | Reinforcement Learning + Calendar API | `ai-ml-service` | Adaptive study schedule generation |
| Resume Analyser | BERT-based NLP | `placement-service` | Score student resumes against JD requirements |
| AI Fraud Detector | Isolation Forest + Rule Engine | `fees-service` | Anomaly detection on payment and verification events |
| Book Recommender | Collaborative Filtering | `library-service` | Suggest books based on student subject enrollment |
| NEP Compliance Checker | Rule-based + NLP | `scheduling-engine` | Validate against NEP 2020 hour requirements |
| Enrolment Forecaster | LSTM Time-Series | `analytics-service` | Predict next-semester enrolment per program |
| Fairness Scorer | Multi-criteria Scoring | `scheduling-engine` | Score timetable fairness across faculty preferences |

---

## 4. Data Architecture

### 4.1 Polyglot Persistence Strategy

| Database | Technology | Data Stored | Justification |
|---|---|---|---|
| Primary OLTP | PostgreSQL 15 (per-schema multi-tenant) | Universities, departments, faculty, students, courses, timetables, fees, results | ACID compliance, complex joins, RLS support |
| Document Store | MongoDB Atlas | Generated timetable JSON, scheduling configs, AI metadata, chat history | Flexible schema for variable structures |
| Cache Layer | Redis Cluster | Active sessions, timetable snapshots, API responses, distributed locks, rate limit counters | Sub-millisecond reads, distributed locking |
| Search Engine | Elasticsearch | Audit logs, full-text search, research papers, analytics events | Full-text search, aggregations |
| Time-Series | InfluxDB | System metrics, IoT sensor data, scheduling telemetry | Efficient time-series storage |
| Object Storage | AWS S3 | Generated PDFs, Excel exports, ML models, study materials, lecture videos, university branding assets | Durable scalable blob storage |
| Blockchain | Polygon L2 (Ethereum) | Academic result hashes, degree verification proofs | Immutable tamper-proof records |
| Message Queue | Apache Kafka | All platform events, IoT feeds, notifications, audit streams | High-throughput event streaming |

### 4.2 Core PostgreSQL Schema Per University

Each university gets a dedicated PostgreSQL schema (e.g., `schema: vnsgu`):

```sql
-- Extended core tables per university schema

-- Academic structure
CREATE TABLE universities (id, name, slug, logo_url, established_year, accreditation, created_at);
CREATE TABLE departments (id, university_id, name, code, hod_faculty_id, created_at);
CREATE TABLE programs (id, department_id, name, type, duration_years, credits_required, nep_exit_points);
CREATE TABLE courses (id, department_id, program_id, name, code, credits, type, is_lab, nep_category);
CREATE TABLE batches (id, department_id, program_id, semester, year, division, strength);
CREATE TABLE faculty (id, university_id, department_id, name, email, phone, designation, specializations[], max_hrs_week);
CREATE TABLE students (id, university_id, department_id, enrollment_no, name, email, phone, batch_id, program_id, admission_year);

-- Timetable
CREATE TABLE timetables (id, department_id, batch_id, semester, academic_year, generated_at, status, metadata JSONB);
CREATE TABLE timetable_slots (id, timetable_id, day_of_week, slot_index, start_time, end_time, course_id, faculty_id, room_id, batch_id, slot_type);

-- Attendance
CREATE TABLE attendance_sessions (id, timetable_slot_id, date, method, qr_token, opened_at, closed_at);
CREATE TABLE attendance_records (id, session_id, student_id, status, marked_at, method);
CREATE TABLE attendance_flags (id, attendance_record_id, flag_type, approved_by, approved_at);

-- Academic records
CREATE TABLE marks (id, student_id, course_id, exam_type, marks_obtained, max_marks, semester, academic_year);
CREATE TABLE results (id, student_id, program_id, semester, academic_year, sgpa, cgpa, status, result_hash, published_at, blockchain_tx_hash);
CREATE TABLE assignments (id, course_id, faculty_id, title, description, due_date, max_marks, created_at);
CREATE TABLE submissions (id, assignment_id, student_id, file_url, submitted_at, marks_obtained, feedback);

-- Fees
CREATE TABLE fee_structures (id, university_id, program_id, semester, academic_year, components JSONB, total_amount);
CREATE TABLE fee_payments (id, student_id, fee_structure_id, amount, payment_date, method, transaction_id, status);
CREATE TABLE scholarships (id, student_id, type, amount, academic_year, status, approved_by);

-- Library
CREATE TABLE books (id, university_id, isbn, title, author, department_id, category, total_copies, available_copies);
CREATE TABLE book_loans (id, student_id, book_id, issued_at, due_date, returned_at, fine_amount);
CREATE TABLE book_reservations (id, student_id, book_id, reserved_at, expires_at);

-- Placement
CREATE TABLE companies (id, university_id, name, type, hr_contact, website);
CREATE TABLE job_postings (id, company_id, department_id, title, description, ctc, eligibility_criteria, deadline);
CREATE TABLE placement_records (id, student_id, company_id, job_posting_id, placed_at, ctc, role);

-- Public portal configuration
CREATE TABLE public_portal_configs (id, university_id, slug, custom_domain, branding JSONB, features JSONB, created_at, updated_at);
CREATE TABLE verification_requests (id, university_id, enrollment_no, requester_ip, request_type, result JSONB, verified_at, blockchain_match BOOLEAN);
CREATE TABLE admission_applications (id, university_id, program_id, applicant_name, email, phone, documents JSONB, status, applied_at);
```

### 4.3 Blockchain Data Model (Polygon L2)

```solidity
// AcademicRecords.sol — Deployed on Polygon L2

struct ResultRecord {
    string universityId;
    string enrollmentNo;
    string programId;
    uint8 semester;
    string resultHash;       // SHA-256 of full result JSON
    uint256 publishedAt;
    address publishedBy;
}

mapping(string => ResultRecord[]) public studentResults;
// Key: keccak256(universityId + enrollmentNo)

event ResultPublished(string indexed universityId, string indexed enrollmentNo, string resultHash, uint256 timestamp);
event ResultVerified(string indexed universityId, string indexed enrollmentNo, bool matches, uint256 timestamp);
```

---

## 5. Frontend Architecture

### 5.1 Multi-Panel Next.js App Structure

```
apps/web/app/
├── (auth)/login/                   → Universal login with role selector + Firebase auth
├── superadmin/                     → Global platform management
│   ├── universities/               → University CRUD + public portal config per university
│   ├── credentials/                → Credential management
│   ├── analytics/                  → Platform-wide analytics
│   └── billing/                    → SaaS subscription management
├── dashboard/                      → University Admin panel
│   ├── departments/ programs/ faculty/ students/ courses/
│   ├── exams/                      → Exam timetable, hall tickets, invigilation
│   ├── finance/                    → Fees, payroll, budget, BI
│   ├── results/                    → Result publication + blockchain hash
│   ├── compliance/                 → NAAC, NIRF, government dashboards
│   └── placement/                  → Company partnerships, stats
├── department/                     → Department Admin panel
│   ├── timetable/ generate/ special/
│   ├── library/                    → Full LMS management
│   ├── placement/                  → Job postings, student records
│   └── research/                   → Research, patent, FDP tracking
├── faculty-panel/                  → Faculty portal
│   ├── attendance/                 → QR + manual + IoT attendance
│   ├── assignments/ marks/ quiz/
│   ├── resources/                  → Material upload
│   └── research/                   → Publications, patents, FDP
├── student/                        → Student portal
│   ├── timetable/ attendance/ marks/ assignments/
│   ├── materials/                  → Study materials (PDF, video, PPT)
│   ├── fees/                       → Payment, history, scholarships
│   ├── services/                   → Bonafide, BRTS, transcript, ID card
│   ├── ai/                         → Chatbot, study planner, career advisor
│   ├── campus/                     → Digital ID, bus tracking, canteen
│   ├── library/                    → Borrowed books, reservations
│   └── placement/                  → Internships, marketplace
└── public/[university-slug]/       → Per-university isolated public portal
    ├── page.tsx                    → University home with custom branding
    ├── results/                    → Result verification
    ├── verify/                     → Blockchain degree/certificate verification
    ├── admissions/                 → Online admission portal
    ├── scholarships/               → Scholarship applications
    ├── vacancies/                  → Public vacancy listings
    └── research/                   → Public research repository
```

### 5.2 Key Frontend Technology Decisions

| Technology | Version | Justification |
|---|---|---|
| Next.js | 14.2.x | SSR for public portal SEO; API routes as BFF; ISR for public pages |
| React | 18.3.x | Component model, concurrent features |
| TypeScript | 5.4.x | Type safety across monorepo |
| Tailwind CSS | 3.4.x | Utility-first; per-university theming via CSS variables |
| shadcn/ui + Radix | Latest | Accessible primitives, no vendor lock-in |
| Zustand | 4.5.x | Global state per panel |
| TanStack Query | 5.x | Caching, background refetch, optimistic updates |
| Firebase SDK | 10.x | Firebase Auth for student/faculty login |
| Socket.io Client | 4.7.x | Real-time schedule and notification updates |
| jsPDF + html2canvas | Latest | Client-side PDF for timetable, ID card |
| ethers.js | 6.x | Blockchain verification on public portal |
| Recharts | 2.x | Analytics dashboards |

---

## 6. Per-University Public Panel Architecture

### 6.1 Routing Strategy

Each university's public portal is served at `/public/{university-slug}` on the shared domain, or optionally at a university-owned custom domain via DNS CNAME pointing to the platform.

```
shared domain:      https://platform.com/public/vnsgu
custom domain:      https://results.vnsgu.ac.in
                         ↓ DNS CNAME
                    platform's CDN edge (Cloudflare)
                         ↓
                    Next.js edge middleware: extract university slug from host header
                         ↓
                    public-portal-service: query only uni-vnsgu PostgreSQL schema
```

### 6.2 Public Portal Isolation Guarantees

- **API Level:** `public-portal-service` only accepts requests with a valid `university_slug`; every DB query is scoped to `SET search_path = {university_schema}` before execution
- **Caching Level:** Redis cache keys include `public:{university_slug}:*` prefix; no cross-university cache sharing
- **Branding Level:** All branding assets (logo, colors, fonts, hero image) loaded from university-specific S3 path: `s3://platform-assets/{university_id}/public-portal/`
- **Feature Level:** Feature toggles stored in `public_portal_configs` table; read on every request; result cached in Redis for 60 seconds
- **SEO Level:** Each university's portal generates unique `<title>`, `<meta>`, `og:image`, `sitemap.xml` using university data

### 6.3 Static Generation for Public Pages

Public portal pages that don't require authentication (vacancy listings, ranking dashboard, research repository) are **statically generated at build time via ISR (Incremental Static Regeneration)** with a 60-second revalidation window, enabling Google indexing and fast load times without database queries per visit.

---

## 7. Infrastructure & Deployment

### 7.1 Kubernetes Architecture (Production)

```
AWS EKS Cluster (Multi-AZ)
├── Namespace: nep-platform
│   ├── api-gateway (Kong) — 3 replicas, HPA
│   ├── auth-service — 2 replicas
│   ├── tenant-service — 2 replicas
│   ├── scheduling-engine — 2 replicas (AI-intensive, GPU node pool)
│   ├── ai-ml-service — 2 replicas (GPU node pool)
│   ├── student-service — 3 replicas, HPA
│   ├── fees-service — 2 replicas
│   ├── library-service — 2 replicas
│   ├── placement-service — 2 replicas
│   ├── exam-service — 2 replicas
│   ├── blockchain-service — 2 replicas
│   ├── iot-service — 2 replicas
│   ├── public-portal-service — 4 replicas, HPA (highest traffic: unauthenticated)
│   ├── admission-service — 2 replicas, HPA (seasonal spikes)
│   ├── notification-service — 2 replicas
│   ├── realtime-service — 3 replicas (Socket.io with Redis adapter)
│   ├── report-service — 2 replicas
│   └── analytics-service — 2 replicas
├── Namespace: data
│   ├── PostgreSQL (AWS RDS Multi-AZ) — per-schema multi-tenant
│   ├── MongoDB Atlas — cluster
│   ├── Redis Cluster (ElastiCache) — 3 shards
│   ├── Elasticsearch (AWS OpenSearch) — 3 nodes
│   └── InfluxDB — IoT time-series
└── Namespace: messaging
    └── Apache Kafka (AWS MSK) — 3 brokers
```

### 7.2 CI/CD Pipeline

| Stage | Tool | Description |
|---|---|---|
| Source Control | GitHub (monorepo, Turborepo) | Feature branches → main; protected main branch |
| CI | GitHub Actions | Lint, TypeScript, tests, build on every PR |
| Security Scanning | Trivy + OWASP ZAP | Container vulnerability scan, DAST |
| Staging Deploy | ArgoCD (GitOps) | Auto-deploy to staging on main merge |
| Production Deploy | ArgoCD + Manual Approval | Blue-green deployment with traffic shifting |
| Performance Testing | k6 | Load testing against staging before production |
| Rollback | ArgoCD + Helm | One-command rollback to previous Helm release |
| Blockchain Deploy | Hardhat + Defender | Smart contract deployment and upgrade management |

---

## 8. Real-Time Architecture

Real-time updates use **CQRS + Event Sourcing** pattern via Kafka + Socket.io:

| Event Type | Kafka Topic | Consumers | Response Time Target |
|---|---|---|---|
| `faculty.absent` | `scheduling.events` | scheduling-engine, notification-service | < 5 seconds |
| `room.unavailable` | `scheduling.events` | scheduling-engine, notification-service | < 5 seconds |
| `timetable.generated` | `timetable.events` | realtime-service, report-service, analytics-service | < 2 seconds |
| `timetable.updated` | `timetable.events` | realtime-service, all affected sessions | < 1 second |
| `attendance.marked` | `academic.events` | student-service, notification-service, analytics-service | < 2 seconds |
| `fees.due` | `fees.events` | notification-service, student-service | < 3 seconds |
| `result.published` | `academic.events` | blockchain-service, public-portal-service, notification-service | < 5 seconds |
| `iot.attendance.feed` | `iot.events` | attendance-service, realtime-service | < 1 second |
| `bus.location.update` | `iot.events` | realtime-service (student app) | < 2 seconds |
| `admission.status.changed` | `admission.events` | notification-service, public-portal-service | < 3 seconds |
| `user.login` | `auth.events` | audit-service | < 500ms |

### 8.1 WebSocket Rooms Strategy

```
Socket.io Namespace: /timetables
  uni-{universityId}        → University Admin receives all dept updates
  dept-{departmentId}       → Dept Admin receives own dept updates
  faculty-{facultyId}       → Faculty receives personal schedule changes
  student-{studentId}       → Student receives timetable, fees, attendance alerts
  superadmin                → Super Admin receives all platform events

Socket.io Namespace: /campus
  bus-{universityId}        → All students receive bus location updates
  announcement-{uniId}      → University-wide announcements
  dept-feed-{deptId}        → Department announcements and results
```

---

## 9. API Design Standards

### 9.1 REST Conventions

- **Base URL:** `https://api.smartuniversity.com/v2`
- **Public Portal Base URL:** `https://api.smartuniversity.com/public/v2` (no authentication, tenant-scoped by slug)
- **Authentication:** Bearer JWT in `Authorization` header (authenticated endpoints)
- **Tenant Context:** `X-University-Slug` header for cross-tenant routing by API gateway
- **Content-Type:** `application/json` for all endpoints
- **Versioning:** URI versioning (`/v1`, `/v2`) with 12-month deprecation window
- **Pagination:** Cursor-based pagination for all list endpoints
- **Error Format:** RFC 7807 Problem Details JSON

### 9.2 Core API Endpoints (Selected)

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| POST | `/v2/auth/login` | Authenticate user, return JWT | Public |
| GET | `/v2/students/{id}/timetable` | Get student's current timetable | STUDENT |
| POST | `/v2/attendance/qr-session` | Create QR session for attendance | FACULTY |
| POST | `/v2/attendance/mark` | Mark attendance via QR/IoT/manual | STUDENT, FACULTY |
| POST | `/v2/fees/pay` | Initiate fee payment | STUDENT |
| GET | `/v2/ai/study-planner` | Get AI-generated study plan | STUDENT |
| POST | `/v2/ai/chatbot` | Send message to AI doubt assistant | STUDENT |
| GET | `/v2/results/{enrollmentNo}` | Fetch student result | FACULTY, DEPT_ADMIN |
| POST | `/v2/results/publish` | Publish result with blockchain hash | UNI_ADMIN |
| POST | `/v2/timetables/generate` | Trigger AI timetable generation | DEPT_ADMIN, UNI_ADMIN |
| GET | `/v2/placement/opportunities` | Get internship/job opportunities | STUDENT |
| GET | `/public/v2/{slug}/results/verify` | Verify result hash (public, unauthenticated) | Public |
| GET | `/public/v2/{slug}/blockchain/verify` | Verify on-chain result proof | Public |
| POST | `/public/v2/{slug}/admissions/apply` | Submit admission application | Public |
| GET | `/public/v2/{slug}/config` | Get public portal branding + feature config | Public |
| GET | `/public/v2/{slug}/vacancies` | List public vacancies | Public |
| GET | `/v2/iot/bus/{universityId}/location` | Get real-time bus location | STUDENT |
| POST | `/v2/library/reserve` | Reserve a book | STUDENT |
| GET | `/v2/analytics/student/{id}/risk` | Get student dropout risk score | FACULTY, DEPT_ADMIN |
| POST | `/v2/exams/generate-hallticket` | Generate hall ticket PDF | UNI_ADMIN, EXAM_ADMIN |
| GET | `/v2/naac/report/export` | Export NAAC report PDF | UNI_ADMIN |

---

## 10. Blockchain Architecture

### 10.1 Smart Contract Design

Smart contracts deployed on **Polygon L2** (low transaction cost, Ethereum-compatible, fast finality):

```
AcademicRecords.sol
├── publishResult(universityId, enrollmentNo, semesterId, resultHash) → onlyPublisher role
├── verifyResult(universityId, enrollmentNo, semesterId, resultHash) → returns bool
├── getResultRecord(universityId, enrollmentNo, semesterId) → returns ResultRecord
└── events: ResultPublished, ResultVerified

DegreeRegistry.sol
├── issueDegree(universityId, enrollmentNo, programId, degreeHash, graduationYear)
├── verifyDegree(degreeHash) → returns DegreeRecord
└── events: DegreeIssued, DegreeVerified
```

### 10.2 Result Publication Flow

```
University Admin publishes result
        ↓
result-service: collect result data → serialize to canonical JSON → SHA-256 hash
        ↓
blockchain-service: call AcademicRecords.publishResult(hash) on Polygon L2
        ↓
blockchain-service: receive transaction hash (tx_hash) → store in PostgreSQL results.blockchain_tx_hash
        ↓
public-portal-service: result now publicly verifiable via hash or QR code
        ↓
Public verifier: enters enrollment no. on public portal
        ↓
public-portal-service: fetches result from PostgreSQL + calls verifyResult on-chain
        ↓
Display: ✅ Verified (hash matches) or ❌ Tampered (hash mismatch) with Polygonscan link
```

---

## 11. AI/ML Architecture

### 11.1 AI Service Architecture

The `ai-ml-service` (Python FastAPI) exposes AI capabilities via REST to other services:

```
ai-ml-service
├── /predict/slot-preference     → XGBoost: optimal slot prediction for scheduling engine
├── /predict/student-performance → XGBoost: grade prediction from mid-term indicators
├── /predict/dropout-risk        → Random Forest + SHAP: explainable dropout risk scores
├── /predict/enrolment           → LSTM: semester-wise enrolment forecast
├── /recommend/substitute        → Collaborative Filtering: substitute faculty recommendation
├── /recommend/career            → LLM (Claude API) + RAG: career path recommendation
├── /recommend/books             → Collaborative Filtering: library book recommendation
├── /chat/doubt-assistant        → LLM (Claude API) + RAG over study materials
├── /plan/study                  → RL + Calendar: personalized study planner
├── /analyse/resume              → BERT NLP: resume scoring against JD
├── /analyse/campus              → Clustering: campus usage pattern analysis
└── /detect/fraud                → Isolation Forest: anomaly detection on payments
```

### 11.2 LLM Integration (Claude API)

The AI Doubt Assistant Chatbot and Career Recommendation engine use Claude via the Anthropic API:

- **RAG Pipeline:** Study materials (PDFs, notes, PPTs) indexed in Elasticsearch; LangChain retrieves top-k relevant chunks per student query; injected into Claude context
- **Temperature Setting:** `temperature=1` — enables diverse, creative, and contextually rich responses across different university deployments; prevents repetitive boilerplate answers
- **Per-University Knowledge Base:** Each university's study materials are indexed in separate Elasticsearch indices (`idx_vnsgu_*`, `idx_spuvvn_*`); queries scoped to the student's enrolled university
- **System Prompt Customization:** Each university can configure a custom AI persona name and tone for the chatbot (e.g., "VNSGU's Vidya Bot")

---

## 12. Smart Campus IoT Architecture

### 12.1 IoT Network Design

```
Campus IoT Devices
├── BLE Attendance Beacons (classrooms)
├── Face Recognition Cameras (labs, entry gates)
├── Smart Parking Sensors (parking lot)
├── Energy Meters (smart meters per building)
├── RFID Access Controllers (hostel, labs)
├── GPS Trackers (college buses)
└── IoT Lab Equipment Tags (lab asset tracking)
        ↓ MQTT over TLS
MQTT Broker (Mosquitto — on-premise university server)
        ↓ MQTT Bridge
iot-service (Node.js — cloud)
        ↓
Kafka Topic: iot.events
        ↓
Consumers:
├── attendance-service   → auto-mark attendance from BLE/face recognition
├── realtime-service     → push bus location to student app via WebSocket
├── analytics-service    → campus energy and utilization analytics
└── resource-service     → update lab equipment availability
```

### 12.2 IoT Attendance Flow

1. Faculty opens attendance session → `iot-service` activates BLE beacon for that classroom
2. Student's mobile app detects beacon → sends attendance signal with student JWT
3. `iot-service` validates JWT + location proximity → publishes to Kafka `iot.events`
4. `attendance-service` consumes event → marks attendance record
5. Session closes after configured window → late markers flagged
6. Face recognition fallback: camera verifies face against student's enrolled photo (on-premise, privacy-safe)

---

## 13. Scalability & Performance

| Metric | Target (MVP) | Target (Scale) | Strategy |
|---|---|---|---|
| Concurrent Users | 500 | 100,000 | Horizontal pod scaling, CDN for static assets |
| Timetable Generation Time | < 30 seconds | < 10 seconds | CP-SAT time limit, ML warm-start, Redis caching |
| API Response Time (p95) | < 500ms | < 200ms | Redis cache, DB indexes, connection pooling |
| Student Portal Load | < 3 seconds | < 1 second | ISR + CDN, optimistic UI updates |
| Public Portal Load | < 2 seconds | < 500ms | ISR static generation, Cloudflare CDN |
| Blockchain Verification | < 3 seconds | < 1 second | Polygon L2 fast finality, result cache |
| Real-time Update Latency | < 2 seconds | < 500ms | Socket.io, Redis Pub/Sub, Kafka |
| Database QPS | 1,000 | 1,000,000 | Read replicas, PgBouncer connection pooling |
| Universities Supported | 10 | 10,000 | Schema-per-tenant, automated provisioning |
| Availability (SLA) | 99.5% | 99.99% | Multi-AZ, health checks, circuit breakers |
| IoT Events/Second | 1,000 | 1,000,000 | Kafka partitioning, iot-service horizontal scale |

---

## 14. Architecture Decision Records

| ADR # | Decision | Rationale |
|---|---|---|
| ADR-001 | OR-Tools CP-SAT over custom algorithms | Industry-proven, Google-backed, handles complex constraints with optimality guarantees |
| ADR-002 | Schema-per-tenant over shared schema | Stronger data isolation, easier backup/restore per university, DPDP regulatory compliance |
| ADR-003 | Next.js over pure React SPA | SEO for public portal, SSR for dashboard initial load, ISR for public pages |
| ADR-004 | Kafka over RabbitMQ | Log retention for event replay, higher throughput, IoT event streaming at scale |
| ADR-005 | Python FastAPI for ML/AI | Native support for ML libraries (TensorFlow, scikit-learn, OR-Tools, LangChain), async performance |
| ADR-006 | PostgreSQL RLS for dept isolation | Native to Postgres, zero application-layer overhead, auditable at DB level |
| ADR-007 | MongoDB for timetable storage | Variable timetable structure (different days/slots), easier JSON serialization |
| ADR-008 | Redis for distributed locking | Prevent concurrent timetable generation race conditions for same department |
| ADR-009 | Polygon L2 over Ethereum mainnet | 10,000x lower transaction cost, sub-second finality, Ethereum-compatible tooling |
| ADR-010 | Per-university public portal isolation | Brand differentiation + data compliance; universities cannot share public data |
| ADR-011 | Firebase Auth for students/faculty | Simpler onboarding, MFA support, social login options for students; reduces auth dev time |
| ADR-012 | Claude API (temperature=1) for AI chatbot | Creative, varied responses across different university knowledge bases; avoids boilerplate |
| ADR-013 | MQTT + Kafka for IoT | MQTT is the IoT industry standard; Kafka bridges IoT to cloud event pipeline efficiently |
| ADR-014 | ISR for public portal pages | Zero latency for public visitors; search engine indexable; auto-revalidates on data changes |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
*Supersedes NEP-Scheduler Architecture v1.0.0 — February 2026*
