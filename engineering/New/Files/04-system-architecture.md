# 04 — System Architecture

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Architecture Philosophy

> Domain-Driven Design (DDD) with microservices decomposition, event-driven communication via Apache Kafka, a hybrid multi-tenancy model (schema-per-university), per-university isolated public portal, and a progressive AI pipeline. Every university is a fully isolated tenant — including its public-facing portal.

### Core Principles

| Principle | Implementation |
|---|---|
| Zero Trust | Every service-to-service call authenticated with mTLS; no implicit trust |
| Fail Fast | Validation at API gateway before hitting business logic |
| Tenant Isolation | Schema-per-university; public portal reads are tenant-scoped at DB level |
| Idempotency | Timetable generation and blockchain publishing use Redis locks to prevent duplicates |
| Event Sourcing | All state changes published to Kafka; full audit trail; IoT events streamed |
| Defense in Depth | WAF → Gateway → Firebase/Keycloak Auth → RBAC → RLS → Audit Log |
| Circuit Breaking | Istio circuit breakers prevent cascade failures between services |
| Privacy by Design | Face recognition processed on-premise only; no biometric data sent to cloud |

---

## 2. High-Level Architecture Layers

| Layer | Technology Stack | Responsibility |
|---|---|---|
| Presentation Tier | React 18 + Next.js 14 + TypeScript | Seven-panel UI + per-university public portal |
| API Gateway | Kong / AWS API Gateway + OAuth2 + Firebase Auth | Unified entry, auth, rate-limiting, tenant routing |
| Application Services | Node.js (Express) + Python (FastAPI) | 22 business logic microservices |
| AI/ML Engine | Python + OR-Tools + TensorFlow + scikit-learn + LangChain | Scheduling intelligence + AI features |
| Blockchain Layer | Ethereum / Polygon L2 + Solidity Smart Contracts | Immutable academic record verification |
| IoT Gateway | MQTT Broker (Mosquitto) + Node.js IoT Service | Smart campus device integration |
| Messaging Bus | Apache Kafka + Redis Pub/Sub | Async event coordination |
| Data Tier | PostgreSQL + MongoDB + Redis + Elasticsearch + InfluxDB | Persistent, cache, search, time-series |
| Infrastructure | Kubernetes on AWS EKS + Terraform | Container orchestration & IaC |

---

## 3. System Context Diagram

```
                     ┌────────────────────────────────────────┐
                     │           INTERNET / CLIENTS            │
                     │  Browser  Student App  Employer  Public │
                     └─────────────────┬──────────────────────┘
                                       │ HTTPS / WSS
                                       ▼
                     ┌────────────────────────────────────────┐
                     │         CLOUDFLARE / AWS CDN            │
                     │  WAF + DDoS Protection + SSL/TLS        │
                     │  Per-university domain routing (CNAME)  │
                     └─────────────────┬──────────────────────┘
                                       │
                                       ▼
       ┌───────────────────────────────────────────────────────────────┐
       │                      AWS CLOUD (VPC)                          │
       │                                                               │
       │  ┌──────────┐    ┌────────────────────────────────────────┐  │
       │  │ Next.js  │    │          Kong API Gateway               │  │
       │  │(Vercel / │───▶│  Auth, Rate Limiting, Tenant Routing   │  │
       │  │  ECS)    │    └────────────┬───────────────────────────┘  │
       │  └──────────┘                │                               │
       │          ┌────────────────── ┼ ──────────────────────┐       │
       │          ▼                   ▼                        ▼       │
       │  ┌─────────────┐  ┌──────────────────────┐  ┌───────────┐   │
       │  │ Auth Service│  │ Node.js Microservices  │  │ Socket.io │   │
       │  │ (Firebase + │  │ (22 services — CRUD,   │  │  Server   │   │
       │  │  Keycloak)  │  │  Fees, Library,        │  │(Real-time)│   │
       │  └─────────────┘  │  Placement, IoT...)    │  └───────────┘   │
       │                   └──────────┬─────────────┘                 │
       │                              ▼                                │
       │                   ┌──────────────────────┐                   │
       │                   │  Python FastAPI        │                   │
       │                   │  AI/ML + OR-Tools +    │                   │
       │                   │  LangChain / Claude    │                   │
       │                   └──────────────────────┘                   │
       │                                                               │
       │  ┌──────────┐ ┌────────┐ ┌───────┐ ┌────────┐ ┌──────────┐  │
       │  │PostgreSQL│ │MongoDB │ │ Redis │ │ Kafka  │ │Polygon L2│  │
       │  │per-schema│ │TT/Chat │ │ Cache │ │ Events │ │Blockchain│  │
       │  └──────────┘ └────────┘ └───────┘ └────────┘ └──────────┘  │
       │                                                               │
       │  ┌──────────────────────┐  ┌──────────────────────────────┐  │
       │  │ IoT Gateway (MQTT)   │  │          AWS S3               │  │
       │  │ Campus BLE/GPS/RFID  │  │ PDFs, Videos, ML Models,     │  │
       │  │ Face Recog (on-prem) │  │ Study Materials, Assets      │  │
       │  └──────────────────────┘  └──────────────────────────────┘  │
       └───────────────────────────────────────────────────────────────┘
```

---

## 4. Complete Microservices Catalogue (22 Services)

| Service | Language | Port | Responsibility |
|---|---|---|---|
| `api-gateway` | Kong / Node.js | 8000 | Traffic routing, auth validation, rate limiting, tenant routing |
| `auth-service` | Node.js + Firebase + Keycloak | 8001 | Login, JWT, password management, RBAC, MFA |
| `tenant-service` | Node.js | 8002 | University provisioning, public portal config, multi-tenancy |
| `scheduling-engine` | Python (FastAPI) | 8003 | OR-Tools CP-SAT constraint solving, timetable generation |
| `ai-ml-service` | Python (FastAPI) | 8004 | ML predictions, AI chatbot, career recommendation, RAG |
| `faculty-service` | Node.js | 8005 | Faculty CRUD, availability, research portfolio, FDP tracking |
| `course-service` | Node.js | 8006 | Course management, batch assignment, curriculum versions |
| `resource-service` | Node.js | 8007 | Classroom/lab inventory, availability matrix, asset tracking |
| `notification-service` | Node.js | 8008 | Alerts via WebSocket, email, SMS, push |
| `report-service` | Python | 8009 | PDF/Excel export, NAAC/NIRF reports |
| `analytics-service` | Python | 8010 | Dashboard metrics, BI analytics, performance dashboards |
| `realtime-service` | Node.js (Socket.io) | 8011 | WebSocket connections, live updates |
| `student-service` | Node.js | 8012 | Student CRUD, enrollment, performance, attendance, digital ID |
| `fees-service` | Node.js | 8013 | Fee collection, payment gateway, scholarships, payroll |
| `library-service` | Node.js | 8014 | Book catalog, digital access, reservations, late fees |
| `placement-service` | Node.js | 8015 | Company management, internship feed, resume analyser |
| `exam-service` | Node.js | 8016 | Exam timetable, hall tickets, sitting, invigilator management |
| `blockchain-service` | Node.js + ethers.js | 8017 | Smart contract interactions, result publishing, hash verification |
| `iot-service` | Node.js + MQTT | 8018 | IoT device management, attendance feeds, smart access, bus tracking |
| `public-portal-service` | Node.js | 8019 | Per-university public portal data (read-only, tenant-scoped) |
| `admission-service` | Node.js | 8020 | Admission workflow, merit list, application forms, status tracking |
| `communication-service` | Node.js | 8021 | Internal messaging, group chats, anonymous complaints |

---

## 5. Multi-Tenancy Model

| Tenant Level | Isolation Strategy | Data Scope |
|---|---|---|
| University (Tenant) | Dedicated PostgreSQL schema per university | All university data including public portal |
| Department | Row-Level Security (RLS) with `department_id` | Department-scoped data only |
| Faculty | JWT with role claims + RLS | Personal schedule, profile, research |
| Student | JWT with role claims + RLS | Personal academic record, fees, materials |
| Public Portal | Separate read-only API with schema scoping | Public-visible data only |
| Super Admin | Cross-schema access with audit logging | Global read/write access |

### Tenant Routing Flow

```
Incoming Request
      ↓
Kong API Gateway
      ↓ extract X-University-Id from JWT claims
Microservice Middleware
      ↓ validate claim
      ↓ SET search_path = {university_schema}
PostgreSQL RLS
      ↓ department_id + university_id row filters
Response scoped entirely to tenant
```

---

## 6. Event-Driven Architecture (Kafka)

| Event | Producer | Consumers |
|---|---|---|
| `timetable.generated` | scheduling-service | Socket.io, report-service, analytics-service |
| `timetable.updated` | scheduling-service | Socket.io, notification-service |
| `result.published` | result-service | blockchain-service, public-portal-service, notification-service |
| `result.blockchain.confirmed` | blockchain-service | result-service, notification-service |
| `attendance.session.opened` | faculty-service | iot-service, notification-service |
| `attendance.marked` | student-service, iot-service | analytics-service, notification-service |
| `fees.payment.completed` | fees-service | notification-service, analytics-service |
| `fees.due.reminder` | fees-service | notification-service |
| `iot.attendance.feed` | iot-service | attendance-service |
| `iot.bus.location` | iot-service | realtime-service |
| `admission.status.changed` | admission-service | notification-service, public-portal-service |
| `dropout.risk.flagged` | ai-ml-service | notification-service, dept-service |
| `user.login` | auth-service | audit-service |

---

## 7. Real-Time Architecture

Real-time updates use CQRS + Event Sourcing via Kafka + Socket.io:

```
Socket.io Namespace: /timetables
  Rooms:
    uni-{universityId}       → University Admin — all dept updates
    dept-{departmentId}      → Dept Admin — own dept updates
    faculty-{facultyId}      → Faculty — personal schedule changes
    student-{studentId}      → Student — timetable, fees, attendance alerts
    superadmin               → Super Admin — all platform events

Socket.io Namespace: /campus
  Rooms:
    bus-{universityId}       → All students — real-time bus location
    announcement-{uniId}     → University-wide announcements
    dept-feed-{deptId}       → Department announcements and results
```

| Event Type | Kafka Topic | Response Time Target |
|---|---|---|
| `timetable.updated` | `timetable.events` | < 1 second |
| `timetable.generated` | `timetable.events` | < 2 seconds |
| `attendance.marked` | `academic.events` | < 2 seconds |
| `iot.bus.location` | `iot.events` | < 2 seconds |
| `result.published` | `academic.events` | < 5 seconds |
| `fees.due` | `fees.events` | < 3 seconds |
| `user.login` | `auth.events` | < 500ms |

---

## 8. Blockchain Architecture

### Smart Contracts (Polygon L2)

```
AcademicRecords.sol
├── publishResult(universityId, enrollmentNo, semesterId, resultHash)
│     onlyRole(PUBLISHER_ROLE)
├── verifyResult(universityId, enrollmentNo, semesterId, hashToVerify)
│     → returns (bool matches, uint256 publishedAt)
└── events: ResultPublished, ResultVerified

DegreeRegistry.sol
├── issueDegree(universityId, enrollmentNo, programId, degreeHash, year)
├── verifyDegree(degreeHash) → DegreeRecord
└── events: DegreeIssued, DegreeVerified
```

### Result Publication Flow

```
1. Uni Admin publishes result
2. result-service: serialize to canonical JSON → SHA-256 hash
3. blockchain-service: call publishResult() on Polygon L2
4. Receive tx_hash → store in PostgreSQL results.blockchain_tx_hash
5. Public portal: result is now verifiable via hash or QR code
6. Verifier enters enrollment number → live hash vs on-chain hash
7. Display: ✅ Verified | ❌ Tampered + Polygonscan link
```

---

## 9. IoT Architecture

```
Campus Devices:
  BLE Beacons (classrooms) → Attendance
  Face Recognition Cameras (labs, gates) → Attendance (on-premise only)
  GPS Trackers (buses) → Bus tracking
  RFID Controllers (hostel, labs) → Smart access
  Smart Meters (buildings) → Energy monitoring
  Asset Tags (lab equipment) → Equipment tracking
        ↓ MQTT over TLS
  MQTT Broker — Mosquitto (on-premise, campus server)
        ↓ MQTT Bridge
  iot-service (Node.js — cloud)
        ↓
  Kafka Topic: iot.events
        ↓
  Consumers:
    attendance-service    → auto-mark attendance
    realtime-service      → push bus location to student app
    analytics-service     → energy and campus utilization analytics
    resource-service      → lab equipment availability updates
```

**Privacy Guarantee:** Face recognition runs entirely on campus edge hardware. Only a boolean `{ present: true }` is transmitted to the cloud. No biometric data ever leaves campus infrastructure.

---

## 10. AI/ML Service Architecture

```
ai-ml-service (Python FastAPI — Port 8004)
├── /predict/slot-preference      XGBoost — optimal slot for scheduling
├── /predict/student-performance  XGBoost — grade prediction
├── /predict/dropout-risk         Random Forest + SHAP — explainable risk
├── /predict/enrolment            LSTM — semester enrolment forecast
├── /recommend/substitute         Collaborative Filtering — substitute faculty
├── /recommend/career             Claude API + RAG — career recommendations
├── /recommend/books              Collaborative Filtering — library suggestions
├── /chat/doubt-assistant         Claude API + RAG — subject Q&A chatbot
├── /plan/study                   RL + Calendar — personalised study planner
├── /analyse/resume               BERT NLP — resume scoring
├── /analyse/campus               Clustering — usage pattern analysis
└── /detect/fraud                 Isolation Forest — payment anomaly detection
```

### LLM Integration

- **Model:** Claude API (Anthropic) via `claude-sonnet-4-20250514`
- **Temperature:** `1` — enables diverse, creative, context-rich responses across different university deployments
- **RAG:** LangChain + Elasticsearch; study materials indexed per university (`idx_{slug}_subject_{id}`)
- **Privacy:** Each university's RAG index is completely isolated; no cross-university knowledge leakage

---

## 11. Security Architecture

| Layer | Mechanism |
|---|---|
| Network perimeter | Cloudflare WAF + DDoS protection + SSL/TLS termination |
| API Gateway | Kong rate limiting, JWT validation, tenant routing, WAF rules |
| Authentication | Firebase Auth (students/faculty) + Keycloak OIDC (admins) |
| Authorization | RBAC with fine-grained permissions; PostgreSQL Row-Level Security |
| Transport | TLS 1.3 for all external; mTLS for internal service-to-service |
| Storage | AES-256 at rest in PostgreSQL and S3 |
| Blockchain | Academic records immutably on Polygon L2 |
| IoT | MQTT over TLS; device certificates; campus-isolated IoT subnet |
| Messaging | End-to-end encryption for student-faculty messaging |
| Audit | Immutable audit log stream via Kafka to Elasticsearch/Kibana |
| AI Fraud Detection | Isolation Forest on fee payments and verification requests |

---

## 12. Scalability Targets

| Metric | MVP | Production Scale | Strategy |
|---|---|---|---|
| Concurrent Users | 500 | 100,000 | Horizontal pod scaling, CDN |
| Timetable Generation | < 30s | < 10s | CP-SAT + ML warm-start + Redis cache |
| API Response (p95) | < 500ms | < 200ms | Redis cache, DB indexes, connection pooling |
| Public Portal Load | < 2s | < 500ms | ISR + Cloudflare CDN |
| Blockchain Verification | < 3s | < 1s | Polygon L2 + result cache |
| Real-time Latency | < 2s | < 500ms | Socket.io + Redis Pub/Sub + Kafka |
| Database QPS | 1,000 | 1,000,000 | Read replicas + PgBouncer |
| Universities | 10 | 10,000 | Schema-per-tenant + automated provisioning |
| SLA | 99.5% | 99.99% | Multi-AZ + circuit breakers |
| IoT Events/sec | 1,000 | 1,000,000 | Kafka partitioning + iot-service HPA |

---

## 13. Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | OR-Tools CP-SAT over custom algorithms | Google-backed, handles complex constraints, mathematical optimality guarantees |
| ADR-002 | Schema-per-tenant over shared schema | Stronger data isolation, easier per-university backup, DPDP compliance |
| ADR-003 | Next.js over pure React SPA | SEO for public portal, SSR for dashboard, ISR for static public pages |
| ADR-004 | Kafka over RabbitMQ | Log retention, higher throughput, IoT event streaming at scale |
| ADR-005 | Python FastAPI for AI/ML | Native ML library support (TensorFlow, OR-Tools, LangChain), async performance |
| ADR-006 | PostgreSQL RLS for dept isolation | Native, zero application-layer overhead, DB-level auditable |
| ADR-007 | MongoDB for timetable storage | Variable structure, easier JSON serialisation |
| ADR-008 | Redis for distributed locking | Prevent concurrent timetable generation race conditions |
| ADR-009 | Polygon L2 over Ethereum mainnet | 10,000x lower gas cost, sub-second finality, Ethereum-compatible tooling |
| ADR-010 | Per-university public portal isolation | Brand differentiation + data compliance |
| ADR-011 | Firebase Auth for students/faculty | Simpler onboarding, MFA, social login options, reduces auth dev time |
| ADR-012 | Claude API (temperature=1) | Creative, varied responses across different university knowledge bases |
| ADR-013 | MQTT + Kafka for IoT | MQTT is IoT industry standard; Kafka bridges to cloud event pipeline |
| ADR-014 | ISR for public portal pages | Zero latency for visitors; SEO-indexable; auto-revalidates on data changes |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
