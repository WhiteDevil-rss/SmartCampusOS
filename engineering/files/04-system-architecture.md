# 04 — System Architecture

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Architecture Philosophy

NEP-Scheduler follows a **Domain-Driven Design (DDD)** approach with microservices decomposition, event-driven communication via Apache Kafka, a multi-tenant data isolation model, and a progressive AI pipeline. The architecture is cloud-native and designed for horizontal scalability from 10 to 10,000 university tenants.

---

## 2. High-Level Architecture Layers

| Layer | Technology Stack | Responsibility |
|---|---|---|
| Presentation Tier | React 18 + Next.js 14 + TypeScript | Multi-panel UI for 4 user roles |
| API Gateway | Kong / AWS API Gateway + OAuth2 | Unified entry, auth, rate-limiting |
| Application Services | Node.js (Express) + Python (FastAPI) | Business logic microservices |
| AI/ML Engine | Python + OR-Tools + TensorFlow + scikit-learn | Scheduling intelligence |
| Messaging Bus | Apache Kafka + Redis Pub/Sub | Async event coordination |
| Data Tier | PostgreSQL + MongoDB + Redis + Elasticsearch | Persistent and cache storage |
| Infrastructure | Kubernetes on AWS EKS + Terraform | Container orchestration & IaC |

---

## 3. System Context Diagram

```
                      ┌─────────────────────────────────────┐
                      │          INTERNET / CLIENTS          │
                      │  🌐 Browser     📱 Mobile (future)  │
                      └─────────────┬───────────────────────┘
                                    │ HTTPS / WSS
                                    ▼
                      ┌─────────────────────────────────────┐
                      │         CLOUDFLARE / AWS CDN        │
                      │   WAF + DDoS Protection + SSL/TLS   │
                      └─────────────┬───────────────────────┘
                                    │
                                    ▼
          ┌──────────────────────────────────────────────────────┐
          │                    AWS CLOUD (VPC)                   │
          │                                                      │
          │  ┌─────────────┐    ┌───────────────────────────┐   │
          │  │  Next.js    │    │      Kong API Gateway     │   │
          │  │  (Vercel /  │───▶│   Auth Validation,        │   │
          │  │   ECS)      │    │   Rate Limiting, Routing   │   │
          │  └─────────────┘    └──────────┬────────────────┘   │
          │                               │                      │
          │         ┌─────────────────────┼──────────────────┐  │
          │         ▼                     ▼                  ▼  │
          │  ┌─────────────┐  ┌──────────────────┐  ┌──────────┐│
          │  │Auth Service │  │  Node.js API     │  │Socket.io ││
          │  │(Keycloak +  │  │  (Scheduling,    │  │ Server   ││
          │  │ JWT)        │  │   CRUD ops)      │  │(Real-time)│
          │  └─────────────┘  └────────┬─────────┘  └──────────┘│
          │                           │                          │
          │                           ▼                          │
          │                 ┌─────────────────┐                  │
          │                 │  Python FastAPI  │                  │
          │                 │  (AI/ML Engine  │                  │
          │                 │  + OR-Tools)    │                  │
          │                 └─────────────────┘                  │
          │                                                      │
          │  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌────────┐  │
          │  │PostgreSQL│  │  MongoDB │  │Redis │  │ Kafka  │  │
          │  │(Primary) │  │(TT JSON) │  │Cache │  │(Events)│  │
          │  └──────────┘  └──────────┘  └──────┘  └────────┘  │
          └──────────────────────────────────────────────────────┘
```

---

## 4. Microservices Catalogue

| Service Name | Language | Port | Primary Responsibility |
|---|---|---|---|
| `api-gateway` | Kong/Node.js | 8000 | Traffic routing, auth validation, rate limiting |
| `auth-service` | Node.js + Keycloak | 8001 | Login, JWT issuance, password management, RBAC |
| `tenant-service` | Node.js | 8002 | University/department provisioning, multi-tenancy |
| `scheduling-engine` | Python (FastAPI) | 8003 | OR-Tools CP-SAT constraint solving, timetable generation |
| `ai-ml-service` | Python (FastAPI) | 8004 | ML predictions, timetable generation |
| `faculty-service` | Node.js | 8005 | Faculty CRUD, availability |
| `course-service` | Node.js | 8006 | Course/subject management, batch assignment |
| `resource-service` | Node.js | 8007 | Classroom/lab inventory, availability matrix |
| `notification-service` | Node.js | 8008 | Real-time alerts via WebSocket, email, SMS |
| `report-service` | Python | 8009 | PDF/Excel export, accreditation reports |
| `analytics-service` | Python | 8010 | Dashboard metrics, utilization analytics |
| `realtime-service` | Node.js (Socket.io) | 8011 | WebSocket connections, live schedule updates |

---

## 5. Multi-Tenancy Model

The platform implements a **Hybrid Multi-Tenancy model** combining schema-level isolation (per university) with row-level security for departments and faculty:

| Tenant Level | Isolation Strategy | Data Scope |
|---|---|---|
| University (Tenant) | Dedicated PostgreSQL schema per university | All university data |
| Department | Row-level security (RLS) with `department_id` | Department-scoped data only |
| Faculty | JWT with role claims + RLS | Personal schedule & profile |
| Super Admin | Cross-schema access with audit logging | Global read/write access |

---

## 6. Four-Panel Role Hierarchy

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

## 7. Security Architecture

Security is enforced at multiple layers following OWASP guidelines and **DPDP Act 2023** compliance:

- **Authentication:** OAuth 2.0 + OpenID Connect via Keycloak identity provider
- **Authorization:** Role-Based Access Control (RBAC) with fine-grained permissions per panel
- **Transport:** TLS 1.3 end-to-end encryption for all data in transit
- **Storage:** AES-256 encryption for data at rest in PostgreSQL and S3
- **API Security:** Rate limiting (Kong), WAF (AWS Shield), DDoS protection
- **Audit:** Immutable audit log stream via Kafka to Elasticsearch/Kibana
- **RLS:** PostgreSQL Row Level Security enforces tenant isolation at database level

---

## 8. Real-Time Architecture

Real-time updates use **CQRS + Event Sourcing** pattern via Kafka + Socket.io:

| Event Type | Kafka Topic | Consumers | Response Time Target |
|---|---|---|---|
| `faculty.absent` | `scheduling.events` | scheduling-engine, notification-service | < 5 seconds |
| `room.unavailable` | `scheduling.events` | scheduling-engine, notification-service | < 5 seconds |
| `timetable.generated` | `timetable.events` | realtime-service, report-service, analytics-service | < 2 seconds |
| `timetable.updated` | `timetable.events` | realtime-service, all affected user sessions | < 1 second |
| `user.login` | `auth.events` | audit-service | < 500ms |
| `class.cancelled` | `scheduling.events` | notification-service, realtime-service | < 3 seconds |

### WebSocket Room Strategy

```
Socket.io Namespace: /timetables

Rooms:
  - uni-{universityId}        → University Admin receives all dept updates
  - dept-{departmentId}       → Dept Admin receives own dept updates
  - faculty-{facultyId}       → Faculty receives personal schedule changes
  - superadmin                → Super Admin receives all platform events
```

---

## 9. Data Architecture (Polyglot Persistence)

| Database | Technology | Data Stored | Justification |
|---|---|---|---|
| Primary OLTP | PostgreSQL 15 (per-schema multi-tenant) | Universities, departments, faculty, courses, batches, timetables | ACID compliance, complex joins, RLS support |
| Document Store | MongoDB Atlas | Generated timetable JSON, scheduling configs, AI metadata | Flexible schema for variable timetable structures |
| Cache Layer | Redis Cluster | Active sessions, timetable snapshots, API responses, locks | Sub-millisecond reads, distributed locking |
| Search Engine | Elasticsearch | Audit logs, full-text search, analytics events | Full-text search, aggregations, log analytics |
| Time-Series | InfluxDB | System metrics, scheduling performance telemetry | Efficient time-series storage and queries |
| Object Storage | AWS S3 | Generated PDFs, Excel exports, ML model artifacts | Durable, scalable blob storage |
| Message Queue | Apache Kafka | Scheduling events, notifications, audit streams | High-throughput event streaming |

---

## 10. Infrastructure (AWS)

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

---

## 11. CI/CD Pipeline

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

---

## 12. Scalability Targets

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

## 13. Architecture Decision Records (ADRs)

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
