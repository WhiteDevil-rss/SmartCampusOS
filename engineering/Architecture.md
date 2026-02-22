# NEP-SCHEDULER — Architecture Document

> **Document Type:** Architecture Document | **Version:** v1.0.0 | **Date:** February 2026
> **Product:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Classification:** Confidential — Internal Use Only

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview & Design Principles](#2-system-overview--design-principles)
3. [Microservices Architecture](#3-microservices-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Infrastructure & Deployment](#6-infrastructure--deployment)
7. [Real-Time Architecture](#7-real-time-architecture)
8. [API Design Standards](#8-api-design-standards)
9. [Scalability & Performance](#9-scalability--performance)
10. [Architecture Decision Records](#10-architecture-decision-records)

---

## 1. Executive Summary

NEP-Scheduler is a cloud-native, AI-powered timetable scheduling platform purpose-built for Indian universities operating under the **National Education Policy 2020**. The system combines **Google OR-Tools Constraint Programming** with a layered Machine Learning engine to produce conflict-free, workload-balanced academic schedules for FYUP, B.Ed., M.Ed., ITEP, and multidisciplinary programs.

> **Architecture Philosophy:** The architecture follows a Domain-Driven Design (DDD) approach with microservices decomposition, event-driven communication via Apache Kafka, a multi-tenant data isolation model, and a progressive AI pipeline that continuously learns from scheduling feedback.

---

## 2. System Overview & Design Principles

### 2.1 High-Level Architecture Pattern

NEP-Scheduler adopts a **Layered Microservices Architecture** with the following primary tiers:

| Layer | Technology Stack | Responsibility |
|---|---|---|
| Presentation Tier | React 18 + Next.js 14 + TypeScript | Multi-panel UI for 4 user roles |
| API Gateway | Kong / AWS API Gateway + OAuth2 | Unified entry, auth, rate-limiting |
| Application Services | Node.js (Express) + Python (FastAPI) | Business logic microservices |
| AI/ML Engine | Python + OR-Tools + TensorFlow + scikit-learn | Scheduling intelligence |
| Messaging Bus | Apache Kafka + Redis Pub/Sub | Async event coordination |
| Data Tier | PostgreSQL + MongoDB + Redis + Elasticsearch | Persistent and cache storage |
| Infrastructure | Kubernetes on AWS EKS + Terraform | Container orchestration & IaC |

### 2.2 Multi-Tenancy Model

The platform implements a **Hybrid Multi-Tenancy model** combining schema-level isolation (per university) with row-level security for departments and faculty:

| Tenant Level | Isolation Strategy | Data Scope |
|---|---|---|
| University (Tenant) | Dedicated PostgreSQL schema per university | All university data |
| Department | Row-level security (RLS) with `department_id` | Department-scoped data only |
| Faculty | JWT with role claims + RLS | Personal schedule & profile |
| Super Admin | Cross-schema access with audit logging | Global read/write access |

### 2.3 Security Architecture

Security is enforced at multiple layers following OWASP guidelines and **DPDP Act 2023** compliance:

- **Authentication:** OAuth 2.0 + OpenID Connect via Keycloak identity provider
- **Authorization:** Role-Based Access Control (RBAC) with fine-grained permissions per panel
- **Transport:** TLS 1.3 end-to-end encryption for all data in transit
- **Storage:** AES-256 encryption for data at rest in PostgreSQL and S3
- **API Security:** Rate limiting (Kong), WAF (AWS Shield), DDoS protection
- **Audit:** Immutable audit log stream via Kafka to Elasticsearch/Kibana

### 2.4 Four-Panel Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    GLOBAL SUPERADMIN (/superadmin)              │
│         Manages all universities, credentials, global TTables   │
├─────────────────────────────────────────────────────────────────┤
│                 UNIVERSITY ADMIN (/dashboard)                   │
│      Manages departments, programs, faculty pool, resources     │
├─────────────────────────────────────────────────────────────────┤
│                DEPARTMENT ADMIN (/department)                   │
│     Manages dept faculty, courses, generates timetables         │
├─────────────────────────────────────────────────────────────────┤
│                  FACULTY PORTAL (/faculty-panel)                │
│          Read-only personal schedule + profile management       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Microservices Architecture

### 3.1 Service Catalogue

| Service Name | Language | Port | Primary Responsibility |
|---|---|---|---|
| `api-gateway` | Kong/Node.js | 8000 | Traffic routing, auth validation, rate limiting |
| `auth-service` | Node.js + Keycloak | 8001 | Login, JWT issuance, password management, RBAC |
| `tenant-service` | Node.js | 8002 | University/department provisioning, multi-tenancy |
| `scheduling-engine` | Python (FastAPI) | 8003 | OR-Tools CP-SAT constraint solving, timetable generation |
| `ai-ml-service` | Python (FastAPI) | 8004 | ML predictions, workload balancing, fairness scoring |
| `faculty-service` | Node.js | 8005 | Faculty CRUD, workload tracking, availability |
| `course-service` | Node.js | 8006 | Course/subject management, batch assignment |
| `resource-service` | Node.js | 8007 | Classroom/lab inventory, availability matrix |
| `notification-service` | Node.js | 8008 | Real-time alerts via WebSocket, email, SMS |
| `report-service` | Python | 8009 | PDF/Excel export, accreditation reports |
| `analytics-service` | Python | 8010 | Dashboard metrics, utilization analytics |
| `realtime-service` | Node.js (Socket.io) | 8011 | WebSocket connections, live schedule updates |

### 3.2 Scheduling Engine — Constraint Model

> **OR-Tools CP-SAT Solver:** The scheduling engine uses Google OR-Tools CP-SAT (Constraint Programming with Boolean Satisfiability) — a state-of-the-art hybrid solver that applies constraint propagation, linear relaxation, and DPLL-based SAT solving. It guarantees mathematical optimality with configurable time bounds.

#### Hard Constraints (Never Violated)

| ID | Constraint Description |
|---|---|
| HC-01 | No faculty member assigned to two classes simultaneously |
| HC-02 | No classroom double-booked for the same time slot |
| HC-03 | No batch/division assigned two subjects at the same time |
| HC-04 | Subject must be taught by a faculty qualified for that subject |
| HC-05 | Lab sessions must use lab-type rooms; theory uses classrooms |
| HC-06 | Room capacity must be ≥ batch strength |
| HC-07 | Daily faculty hours must not exceed `maxHrsPerDay` constraint |
| HC-08 | Weekly faculty hours must not exceed `maxHrsPerWeek` constraint |

#### Soft Constraints (Optimized via Objective Function)

| ID | Constraint Description |
|---|---|
| SC-01 | Minimize gaps in faculty daily schedule (back-to-back preference) |
| SC-02 | Distribute subjects evenly across weekdays |
| SC-03 | Prefer morning slots for high-cognitive subjects (AI, Mathematics) |
| SC-04 | Minimize faculty workload variance (fairness index < 2 hrs/week) |
| SC-05 | Lab sessions preferably in 2-hour contiguous blocks |
| SC-06 | Senior faculty (HOD) gets preferred timing windows |

### 3.3 AI/ML Pipeline Architecture

| ML Module | Algorithm | Purpose |
|---|---|---|
| Slot Preference Predictor | Gradient Boosted Trees (XGBoost) | Predict optimal time slots per subject type |
| Workload Fairness Scorer | Multi-objective LP Relaxation | Score and balance faculty load equity |
| Conflict Risk Classifier | Random Forest Classifier | Pre-screen high-risk constraint combinations |
| Substitute Recommender | Collaborative Filtering + Cosine Similarity | Suggest substitutes when faculty absent |
| Room Utilization Optimizer | Bin Packing Heuristic + RL | Maximize room utilization efficiency |
| Schedule Quality Ranker | Learning to Rank (LambdaMART) | Rank alternative timetable solutions |
| Anomaly Detector | Isolation Forest | Detect unusual workload or scheduling patterns |
| NEP Compliance Checker | Rule-based + NLP | Validate against NEP 2020 hour requirements |

---

## 4. Data Architecture

### 4.1 Polyglot Persistence Strategy

| Database | Technology | Data Stored | Justification |
|---|---|---|---|
| Primary OLTP | PostgreSQL 15 (per-schema multi-tenant) | Universities, departments, faculty, courses, batches, timetables | ACID compliance, complex joins, RLS support |
| Document Store | MongoDB Atlas | Generated timetable JSON, scheduling configs, AI metadata | Flexible schema for variable timetable structures |
| Cache Layer | Redis Cluster | Active sessions, timetable snapshots, API responses, locks | Sub-millisecond reads, distributed locking |
| Search Engine | Elasticsearch | Audit logs, full-text search, analytics events | Full-text search, aggregations, log analytics |
| Time-Series | InfluxDB | System metrics, scheduling performance telemetry | Efficient time-series storage and queries |
| Object Storage | AWS S3 | Generated PDFs, Excel exports, ML model artifacts | Durable, scalable blob storage |
| Message Queue | Apache Kafka | Scheduling events, notifications, audit streams | High-throughput event streaming |

### 4.2 Core PostgreSQL Schema

Each university gets a dedicated PostgreSQL schema (e.g., `schema: vnsgu`):

```sql
-- Core tables per university schema

CREATE TABLE universities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  short_name    TEXT UNIQUE NOT NULL,
  schema_name   TEXT UNIQUE NOT NULL,
  location      TEXT,
  email         TEXT,
  est_year      INT,
  admin_user_id UUID,
  config_json   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  short_name    TEXT NOT NULL,
  hod           TEXT,
  email         TEXT,
  admin_user_id UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faculty (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID REFERENCES departments(id) ON DELETE CASCADE,
  university_id   UUID REFERENCES universities(id),
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  designation     TEXT,
  max_hrs_per_day INT DEFAULT 4,
  max_hrs_per_week INT DEFAULT 20,
  user_id         UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  university_id UUID REFERENCES universities(id),
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,
  program       TEXT,
  credits       INT DEFAULT 4,
  weekly_hrs    INT DEFAULT 4,
  type          TEXT CHECK (type IN ('Theory','Lab','Theory+Lab')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  university_id UUID REFERENCES universities(id),
  name          TEXT NOT NULL,
  program       TEXT,
  semester      INT,
  division      TEXT,
  year          TEXT,
  strength      INT DEFAULT 30
);

CREATE TABLE resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id),
  name          TEXT NOT NULL,
  type          TEXT CHECK (type IN ('Classroom','Lab','Seminar Hall','Auditorium')),
  capacity      INT,
  floor         TEXT,
  building      TEXT
);

CREATE TABLE timetables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  batch_id      UUID REFERENCES batches(id),
  name          TEXT,
  status        TEXT DEFAULT 'ACTIVE',
  is_special    BOOLEAN DEFAULT FALSE,
  config_json   JSONB,
  generated_by  TEXT DEFAULT 'AI',
  version       INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timetable_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id  UUID REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week   INT CHECK (day_of_week BETWEEN 1 AND 6),  -- 1=Mon
  slot_number   INT,
  start_time    TEXT,   -- "09:00"
  end_time      TEXT,   -- "10:00"
  course_id     UUID REFERENCES courses(id),
  faculty_id    UUID REFERENCES faculty(id),
  room_id       UUID REFERENCES resources(id),
  batch_id      UUID REFERENCES batches(id),
  is_break      BOOLEAN DEFAULT FALSE,
  slot_type     TEXT DEFAULT 'THEORY'
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT CHECK (role IN ('SUPERADMIN','UNI_ADMIN','DEPT_ADMIN','FACULTY')),
  entity_id     UUID,   -- university_id, dept_id, or faculty_id
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  changes     JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Frontend Architecture

### 5.1 Application Structure (Next.js 14 App Router)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   └── login/           # Public login with role selector
│   ├── superadmin/          # /superadmin — Global admin panel
│   │   ├── page.tsx         # Overview dashboard
│   │   ├── universities/    # University CRUD
│   │   ├── credentials/     # Credentials management
│   │   └── timetables/      # All timetables view
│   ├── dashboard/           # /dashboard — University admin
│   │   ├── page.tsx         # University overview
│   │   ├── departments/     # Department management
│   │   ├── programs/        # Program management
│   │   ├── faculty/         # Faculty pool
│   │   ├── resources/       # Classrooms & labs
│   │   ├── batches/         # Batch management
│   │   ├── courses/         # Course management
│   │   └── timetables/      # Generate & view timetables
│   ├── department/          # /department — Dept admin
│   │   ├── page.tsx         # Department overview
│   │   ├── faculty/         # Dept faculty management
│   │   ├── courses/         # Dept courses
│   │   ├── resources/       # Dept resources
│   │   ├── generate/        # Standard TT generation
│   │   ├── special/         # Special TT generation
│   │   └── timetables/      # View & export timetables
│   └── faculty-panel/       # /faculty-panel — Faculty
│       ├── page.tsx         # Personal timetable
│       ├── profile/         # Profile management
│       └── credentials/     # Password change
```

### 5.2 Panel Feature Matrix

| Panel | Route | Read | Write | Generate TT | Special TT | Credentials |
|---|---|---|---|---|---|---|
| Super Admin | `/superadmin` | All data | All universities | Per university | — | All users |
| University Admin | `/dashboard` | Own university | Own departments | Own university | — | Dept + Faculty |
| Department Admin | `/department` | Own dept | Own dept data | Own dept | ✅ Yes | Own faculty |
| Faculty | `/faculty-panel` | Own schedule only | Own profile | — | — | Own password |

### 5.3 State Management

| State Type | Tool | Usage |
|---|---|---|
| Global Auth | Zustand | JWT, user role, entity IDs |
| Server State | TanStack Query v5 | API data with caching & invalidation |
| Real-time | Socket.io Client | Live timetable update subscriptions |
| Forms | React Hook Form + Zod | Validated form submission |
| UI State | React useState/useReducer | Local component state |

---

## 6. Infrastructure & Deployment

### 6.1 AWS Cloud Infrastructure

| AWS Service | Purpose | Configuration |
|---|---|---|
| EKS | Container orchestration for all microservices | Multi-AZ cluster, auto-scaling node groups |
| RDS PostgreSQL | Primary OLTP database per tenant | Multi-AZ, automated backups, encryption at rest |
| ElastiCache (Redis) | Session cache and real-time data | Cluster mode, 6 nodes across 3 AZs |
| MSK (Managed Kafka) | Event streaming bus | 3-broker cluster, replication factor 3 |
| S3 + CloudFront | Static assets, PDF storage, CDN | Versioning enabled, lifecycle policies |
| API Gateway | External API entry point | Usage plans, WAF rules, JWT authorizer |
| SageMaker | ML model training and hosting | Spot instances for training, real-time endpoints |
| CloudWatch + X-Ray | Monitoring, tracing, alerting | Custom dashboards, distributed tracing |
| ECR | Docker image registry | Immutable tags, vulnerability scanning |
| Route 53 + ACM | DNS and SSL certificates | Weighted routing, auto-renewal |

### 6.2 CI/CD Pipeline

| Stage | Tool | Action |
|---|---|---|
| Source Control | GitHub Monorepo | Feature branch → PR → main merge |
| Continuous Integration | GitHub Actions | Lint, unit test, integration test, security scan (Snyk) |
| Container Build | Docker + GitHub Actions | Multi-stage builds, push to ECR |
| Security Scanning | Trivy + OWASP ZAP | Container vulnerability scan, DAST |
| Staging Deploy | ArgoCD (GitOps) | Auto-deploy to staging on main merge |
| Production Deploy | ArgoCD + Manual Approval | Blue-green deployment with traffic shifting |
| Performance Testing | k6 | Load testing against staging before production |
| Rollback | ArgoCD + Helm | One-command rollback to previous Helm release |

### 6.3 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.9'
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000

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

## 7. Real-Time Architecture

Real-time updates use **CQRS + Event Sourcing** pattern via Kafka + Socket.io:

| Event Type | Kafka Topic | Consumers | Response Time Target |
|---|---|---|---|
| `faculty.absent` | `scheduling.events` | scheduling-engine, notification-service | < 5 seconds |
| `room.unavailable` | `scheduling.events` | scheduling-engine, notification-service | < 5 seconds |
| `timetable.generated` | `timetable.events` | realtime-service, report-service, analytics-service | < 2 seconds |
| `timetable.updated` | `timetable.events` | realtime-service, all affected user sessions | < 1 second |
| `user.login` | `auth.events` | audit-service | < 500ms |
| `class.cancelled` | `scheduling.events` | notification-service, realtime-service | < 3 seconds |

### 7.1 WebSocket Rooms Strategy

```
Socket.io Namespace: /timetables
Rooms:
  - uni-{universityId}        → University Admin receives all dept updates
  - dept-{departmentId}       → Dept Admin receives own dept updates
  - faculty-{facultyId}       → Faculty receives personal schedule changes
  - superadmin                → Super Admin receives all platform events
```

---

## 8. API Design Standards

### 8.1 REST Conventions

- **Base URL:** `https://api.nep-scheduler.com/v1`
- **Authentication:** Bearer JWT in `Authorization` header
- **Content-Type:** `application/json` for all endpoints
- **Versioning:** URI versioning (`/v1`, `/v2`) with 12-month deprecation window
- **Pagination:** Cursor-based pagination for all list endpoints
- **Error Format:** RFC 7807 Problem Details JSON

### 8.2 Core Endpoints

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| POST | `/v1/auth/login` | Authenticate user, return JWT | Public |
| GET | `/v1/universities` | List all universities | SUPERADMIN |
| POST | `/v1/universities` | Provision new university | SUPERADMIN |
| GET | `/v1/universities/:id/departments` | List university departments | UNI_ADMIN, SUPERADMIN |
| POST | `/v1/departments` | Create department | UNI_ADMIN |
| GET | `/v1/departments/:id/faculty` | List department faculty | DEPT_ADMIN, UNI_ADMIN |
| POST | `/v1/faculty` | Create faculty member | DEPT_ADMIN, UNI_ADMIN |
| POST | `/v1/timetables/generate` | Trigger AI timetable generation | DEPT_ADMIN, UNI_ADMIN |
| GET | `/v1/timetables/:id` | Retrieve timetable | All authenticated |
| POST | `/v1/timetables/special` | Generate special timetable | DEPT_ADMIN |
| GET | `/v1/faculty/:id/schedule` | Get personal faculty schedule | FACULTY, DEPT_ADMIN |
| GET | `/v1/timetables/:id/export/pdf` | Download timetable as PDF | DEPT_ADMIN, UNI_ADMIN |
| PATCH | `/v1/users/:id/credentials` | Update username/password | Self or ADMIN |
| GET | `/v1/analytics/dashboard` | Dashboard metrics | UNI_ADMIN, SUPERADMIN |

### 8.3 Standard Error Response (RFC 7807)

```json
{
  "type": "https://api.nep-scheduler.com/errors/constraint-violation",
  "title": "Timetable Generation Failed",
  "status": 422,
  "detail": "CP-SAT solver could not find a feasible solution within 30 seconds.",
  "instance": "/v1/timetables/generate",
  "traceId": "abc-123-def-456",
  "conflicts": [
    {
      "type": "ROOM_CAPACITY_EXCEEDED",
      "batch": "MCA Sem 2 Div A",
      "course": "Android Development",
      "room": "CS Lab A",
      "batchStrength": 30,
      "roomCapacity": 30,
      "recommendation": "Use CS Lab B as alternate or split batch"
    }
  ]
}
```

---

## 9. Scalability & Performance

| Metric | Target (MVP) | Target (Scale) | Strategy |
|---|---|---|---|
| Concurrent Users | 500 | 50,000 | Horizontal pod scaling, CDN for static assets |
| Timetable Generation Time | < 30 seconds | < 10 seconds | CP-SAT time limit, ML warm-start, Redis caching |
| API Response Time (p95) | < 500ms | < 200ms | Redis cache, DB indexes, connection pooling |
| Timetable Export (PDF) | < 5 seconds | < 2 seconds | Pre-generated cache, async background jobs |
| Real-time Update Latency | < 2 seconds | < 500ms | Socket.io, Redis Pub/Sub, Kafka |
| Database QPS | 1,000 | 100,000 | Read replicas, PgBouncer connection pooling |
| Universities Supported | 10 | 10,000 | Schema-per-tenant, automated provisioning |
| Availability (SLA) | 99.5% | 99.99% | Multi-AZ, health checks, circuit breakers |

---

## 10. Architecture Decision Records

| ADR # | Decision | Rationale |
|---|---|---|
| ADR-001 | OR-Tools CP-SAT over custom algorithms | Industry-proven, Google-backed, handles complex constraints with optimality guarantees |
| ADR-002 | Schema-per-tenant over shared schema | Stronger data isolation, easier backup/restore per university, DPDP regulatory compliance |
| ADR-003 | Next.js over pure React SPA | SEO for public pages, SSR for dashboard initial load performance, API routes as BFF |
| ADR-004 | Kafka over RabbitMQ | Log retention for event replay, higher throughput, better for audit trail requirements |
| ADR-005 | Python FastAPI for ML/AI | Native support for ML libraries (TensorFlow, scikit-learn, OR-Tools), async performance |
| ADR-006 | PostgreSQL RLS for dept isolation | Native to Postgres, zero application-layer overhead, auditable at DB level |
| ADR-007 | MongoDB for timetable storage | Variable timetable structure (different days/slots), easier JSON serialization |
| ADR-008 | Redis for distributed locking | Prevent concurrent timetable generation race conditions for same department |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
