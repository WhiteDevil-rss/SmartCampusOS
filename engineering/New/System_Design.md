# AI SMART UNIVERSITY PLATFORM — System Design Document

> **Document Type:** System Design Document | **Version:** v2.0.0 | **Date:** March 2026
> **Product:** AI Smart University Platform — Full-Stack Intelligent University Operating System
> **Classification:** Confidential — Internal Use Only
> **Previous Version:** v1.0.0 (NEP-Scheduler — AI-Powered Timetable Scheduling Platform)
> **Upgrade Notice:** This document supersedes v1.0.0 and covers the expanded platform including student lifecycle, smart campus IoT, blockchain verification, per-university public portals, and AI features.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Interaction Map](#2-component-interaction-map)
3. [Detailed Data Flow Designs](#3-detailed-data-flow-designs)
4. [Per-University Public Portal Flow](#4-per-university-public-portal-flow)
5. [Blockchain Verification Flow](#5-blockchain-verification-flow)
6. [Caching Strategy](#6-caching-strategy)
7. [Error Handling Design](#7-error-handling-design)
8. [Security Design](#8-security-design)
9. [Scalability Design](#9-scalability-design)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Disaster Recovery & Business Continuity](#11-disaster-recovery--business-continuity)
12. [Integration Design](#12-integration-design)
13. [System Constraints & Limitations](#13-system-constraints--limitations)

---

## 1. System Overview

> **Scope:** This document provides implementation-level system design for the AI Smart University Platform, covering component interactions, data flows, sequence diagrams, caching strategies, error handling, security patterns, IoT integration, blockchain verification, and per-university public portal isolation.

### 1.1 System Context Diagram

```
                          ┌─────────────────────────────────────────────────────┐
                          │                 INTERNET / CLIENTS                   │
                          │                                                       │
                          │  🌐 Browser  📱 Student App  🏢 Employer  🌐 Public  │
                          └───────────────────────┬─────────────────────────────┘
                                                  │ HTTPS / WSS
                                                  ▼
                          ┌─────────────────────────────────────────────────────┐
                          │              CLOUDFLARE / AWS CDN                   │
                          │       WAF + DDoS Protection + SSL/TLS               │
                          │       Per-university domain routing (CNAME)         │
                          └───────────────────────┬─────────────────────────────┘
                                                  │
                                                  ▼
              ┌────────────────────────────────────────────────────────────────┐
              │                        AWS CLOUD (VPC)                         │
              │                                                                 │
              │  ┌───────────┐    ┌──────────────────────────────────────┐    │
              │  │ Next.js   │    │           Kong API Gateway           │    │
              │  │ (Vercel / │───▶│  Auth Validation, Rate Limiting,     │    │
              │  │  ECS)     │    │  Tenant Routing, Public Portal       │    │
              │  └───────────┘    └───────────────┬──────────────────────┘    │
              │                                   │                            │
              │         ┌─────────────────────────┼────────────────────────┐  │
              │         ▼                         ▼                        ▼  │
              │  ┌────────────┐   ┌──────────────────────┐  ┌───────────────┐ │
              │  │Auth Service│   │  Node.js Microservices│  │  Socket.io   │ │
              │  │(Firebase + │   │  (22 services — CRUD, │  │  Server      │ │
              │  │ Keycloak)  │   │   AI, Fees, Library,  │  │ (Real-time)  │ │
              │  └────────────┘   │   Placement, IoT...)  │  └───────────────┘ │
              │                   └──────────┬───────────┘                    │
              │                             │                                  │
              │                             ▼                                  │
              │                   ┌─────────────────────┐                     │
              │                   │   Python FastAPI     │                     │
              │                   │  (AI/ML Engine,      │                     │
              │                   │   OR-Tools,          │                     │
              │                   │   LangChain/Claude)  │                     │
              │                   └─────────────────────┘                     │
              │                                                                 │
              │  ┌──────────┐  ┌────────┐  ┌───────┐  ┌────────┐  ┌───────┐  │
              │  │PostgreSQL│  │MongoDB │  │ Redis │  │ Kafka  │  │Polygon│  │
              │  │(Per-schema│  │(TT JSON│  │ Cache │  │(Events)│  │  L2   │  │
              │  │ multi-ten)│  │ Chat)  │  │       │  │        │  │(Chain)│  │
              │  └──────────┘  └────────┘  └───────┘  └────────┘  └───────┘  │
              │                                                                 │
              │  ┌──────────────────┐   ┌──────────────────────────────────┐   │
              │  │  IoT Gateway     │   │           AWS S3                 │   │
              │  │  (MQTT Broker)   │   │  PDFs, Videos, Study Materials,  │   │
              │  │  Campus devices  │   │  ML Models, University Assets    │   │
              │  └──────────────────┘   └──────────────────────────────────┘   │
              └────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Principles

| Principle | Implementation |
|---|---|
| **Zero Trust** | Every service-to-service call authenticated with mTLS; no implicit trust |
| **Fail Fast** | Validation at API gateway before hitting business logic |
| **Tenant Isolation** | Schema-per-university; public portal reads are tenant-scoped at DB level |
| **Idempotency** | Timetable generation and blockchain publishing use Redis locks to prevent duplicates |
| **Event Sourcing** | All state changes published to Kafka; full audit trail; IoT events also streamed |
| **Defense in Depth** | WAF → Gateway → Firebase/Keycloak Auth → RBAC → RLS → Audit Log |
| **Circuit Breaking** | Istio circuit breakers prevent cascade failures between services |
| **Privacy by Design** | Face recognition processed on-premise only; no biometric data sent to cloud |

---

## 2. Component Interaction Map

### 2.1 Synchronous Interactions

| From | To | Protocol | Data | Frequency |
|---|---|---|---|---|
| Browser (Next.js) | Kong API Gateway | HTTPS/REST | API requests with JWT Bearer token | Per user action |
| Browser | Socket.io Server | WSS (WebSocket) | Subscribe to timetable/campus/announcement rooms | Persistent connection |
| Kong Gateway | Auth Service (Firebase/Keycloak) | HTTP (internal mTLS) | JWT validation, user claims extraction | Every authenticated request |
| Kong Gateway | Microservices | HTTP (internal mTLS) | Proxied, enriched requests with user + tenant context | Per request |
| Scheduling Service | AI Engine (FastAPI) | HTTP/REST | Dept data, config; receive solved timetable JSON | Per generation request |
| Student Service | AI Engine (FastAPI) | HTTP/REST | Student profile for performance prediction and study plan | On demand |
| AI Engine | Claude API (Anthropic) | HTTPS | Prompt + RAG context for chatbot/career; temp=1 | Per AI query |
| Blockchain Service | Polygon L2 | HTTPS (JSON-RPC) | Smart contract calls (publishResult, verifyResult) | Per result publication / verification |
| IoT Service | MQTT Broker (campus) | MQTT over TLS | Device feeds: attendance, GPS, energy, access | Continuous stream |
| Public Portal Service | PostgreSQL (uni schema) | Prisma/pg | Read-only scoped queries (results, admissions, vacancies) | Per public request |
| Report Service | S3 | AWS SDK | Upload generated PDFs; return signed URL | Per export request |
| All Services | PostgreSQL | Prisma/pg | CRUD operations within tenant schema | Per business operation |
| All Services | Redis | redis-client | Session, rate limit counters, cache | Per request |

### 2.2 Asynchronous Interactions (Kafka Events)

| Event | Producer | Consumers | Payload |
|---|---|---|---|
| `timetable.generated` | scheduling-service | Socket.io Server, report-service, analytics-service | `{ timetableId, deptId, uniId, batchIds, generatedAt }` |
| `timetable.updated` | scheduling-service | Socket.io Server, notification-service | `{ timetableId, changedSlots[], reason, updatedAt }` |
| `result.published` | result-service | blockchain-service, public-portal-service, notification-service | `{ resultId, universityId, enrollmentNos[], semesterId, resultHash }` |
| `result.blockchain.confirmed` | blockchain-service | result-service, notification-service | `{ resultId, txHash, blockNumber, confirmedAt }` |
| `attendance.session.opened` | faculty-service | iot-service, notification-service | `{ sessionId, classroomId, facultyId, courseId, openedAt }` |
| `attendance.marked` | student-service, iot-service | analytics-service, notification-service | `{ sessionId, studentId, method, markedAt }` |
| `fees.payment.completed` | fees-service | notification-service, analytics-service | `{ paymentId, studentId, amount, transactionId }` |
| `fees.due.reminder` | fees-service | notification-service | `{ studentId, dueDate, amountDue, feeType }` |
| `iot.attendance.feed` | iot-service | attendance-service | `{ deviceId, studentId, classroomId, timestamp, signalStrength }` |
| `iot.bus.location` | iot-service | realtime-service | `{ busId, universityId, lat, lng, timestamp }` |
| `admission.status.changed` | admission-service | notification-service, public-portal-service | `{ applicationId, universityId, oldStatus, newStatus, updatedAt }` |
| `faculty.absent` | dept-service | scheduling-service, notification-service | `{ facultyId, date, affectedCourses[] }` |
| `dropout.risk.flagged` | ai-ml-service | notification-service, dept-service | `{ studentId, riskScore, riskFactors[], detectedAt }` |
| `user.login` | auth-service | audit-service | `{ userId, role, ip, timestamp }` |

---

## 3. Detailed Data Flow Designs

### 3.1 Timetable Generation Flow (16 Steps)

```
Dept Admin    Browser    API Gateway    Scheduling    AI Engine    PostgreSQL    Redis    Kafka
    │             │            │           Service         │             │          │       │
    │─Click Gen──▶│            │              │             │             │          │       │
    │             │─POST /gen─▶│              │             │             │          │       │
    │             │            │─Validate JWT─▶│             │             │          │       │
    │             │            │              │─LOCK dept────────────────────────────▶│       │
    │             │            │              │◀─Lock ACK────────────────────────────│       │
    │             │            │              │─SELECT faculty,courses,rooms─────────▶│       │
    │             │            │              │◀─Dept Data───────────────────────────│       │
    │             │            │              │─POST /solve──▶│             │          │       │
    │             │            │              │               │─CP-SAT solve│          │       │
    │             │            │              │               │─ML warm-start│         │       │
    │             │            │              │◀─solution JSON│             │          │       │
    │             │            │              │─INSERT timetable + slots─────────────▶│       │
    │             │            │              │─RELEASE lock─────────────────────────▶│       │
    │             │            │              │─PUBLISH timetable.generated───────────────────▶│
    │             │            │◀─200 OK──────│              │             │          │       │
    │             │◀─TT data───│              │              │             │          │       │
    │◀─Show TT────│            │              │              │             │          │       │
```

### 3.2 QR Attendance Flow (10 Steps)

```
Faculty    Browser    API Gateway    Faculty Service    IoT Service    Student App    Attendance Service
   │           │            │              │                 │               │                │
   │─Open TT──▶│            │              │                 │               │                │
   │           │─POST /qr───▶│              │                 │               │                │
   │           │            │─Validate JWT─▶│                 │               │                │
   │           │            │              │─Generate QR token│               │                │
   │           │            │              │─PUBLISH qr.session.opened─────────────────────────│
   │           │◀─QR Code───│              │                 │               │                │
   │─Show QR──▶│            │              │                 │               │                │
   │           │            │              │                 │◀─Student scans │                │
   │           │            │              │                 │─Validate proximity + JWT         │
   │           │            │              │                 │─PUBLISH iot.attendance.feed──────▶│
   │           │            │              │                 │               │ Mark attendance  │
   │           │            │              │                 │               │─PUBLISH attended ─▶analytics
```

### 3.3 AI Doubt Chatbot Flow (8 Steps)

```
Student    Browser    API Gateway    AI-ML Service    Elasticsearch    Claude API    Student App
   │           │            │              │                 │               │
   │─Type Q────▶│            │              │                 │               │
   │           │─POST /chat─▶│              │                 │               │
   │           │            │─JWT + Role───▶│                 │               │
   │           │            │              │─RAG query(student uni, subject)─▶│
   │           │            │              │◀─Top-k chunks────│               │
   │           │            │              │─Build prompt (context + chunks + question)         │
   │           │            │              │─Claude API call (temp=1)─────────────────────────▶│
   │           │            │              │◀─Response────────────────────────────────────────│
   │           │            │◀─AI response─│                 │               │
   │◀─Display──│            │              │                 │               │
```

### 3.4 Student Fee Payment Flow (9 Steps)

```
Student    Browser    API Gateway    Fees Service    Payment Gateway    Notification Service
   │           │            │              │                │                    │
   │─View Fees─▶│            │              │                │                    │
   │           │─GET /fees──▶│              │                │                    │
   │           │            │─JWT verify───▶│                │                    │
   │           │            │              │─Fetch due amounts from PostgreSQL    │
   │           │◀─Fee data──│              │                │                    │
   │─Pay───────▶│            │              │                │                    │
   │           │─POST /pay──▶│              │                │                    │
   │           │            │─JWT verify───▶│                │                    │
   │           │            │              │─Initiate payment─▶│                  │
   │           │            │              │◀─Payment confirm─│                  │
   │           │            │              │─UPDATE fees_payments record          │
   │           │            │              │─PUBLISH fees.payment.completed───────▶│
   │           │◀─Receipt───│              │                │ SMS/Email receipt  │
```

### 3.5 NAAC Report Generation Flow

```
Uni Admin    Browser    API Gateway    Report Service    Analytics Service    PostgreSQL    S3
   │             │            │              │                  │                 │          │
   │─Export NAAC─▶│            │              │                 │                 │          │
   │             │─POST /naac─▶│              │                 │                 │          │
   │             │            │─JWT + Role───▶│                 │                 │          │
   │             │            │              │─Request metrics──▶│                 │          │
   │             │            │              │                  │─Multi-table JOIN─▶│         │
   │             │            │              │                  │◀─Aggregated data─│         │
   │             │            │              │◀─Analytics JSON──│                 │          │
   │             │            │              │─Render HTML NAAC template          │          │
   │             │            │              │─Puppeteer → PDF                    │          │
   │             │            │              │─Upload PDF──────────────────────────────────▶│
   │             │            │              │─Cache S3 URL in Redis              │          │
   │             │◀─S3 URL────│              │                 │                 │          │
   │◀─Download──▶│            │              │                 │                 │          │
```

---

## 4. Per-University Public Portal Flow

### 4.1 Domain Routing Flow

```
Visitor browser requests: https://results.vnsgu.ac.in/results

DNS resolution: results.vnsgu.ac.in → CNAME → cdn.smartuniversity.com
         ↓
Cloudflare CDN: receives request; checks host header "results.vnsgu.ac.in"
         ↓
Next.js edge middleware: resolves university slug "vnsgu" from host map (stored in Redis)
         ↓
Next.js ISR page: /public/vnsgu/results
         ↓
public-portal-service: SET search_path = vnsgu; query results, branding, feature config
         ↓
Response: VNSGU-branded page with VNSGU-only data

If visitor requests: https://results.spuvvn.edu.in/results
         → Same flow → slug "spuvvn" → SPUVVN data only — zero cross-contamination
```

### 4.2 Feature Toggle Resolution Flow

```
GET /public/v2/vnsgu/config

public-portal-service:
  1. CHECK Redis: public:vnsgu:config (TTL 60s)
  2. MISS → SELECT * FROM vnsgu.public_portal_configs WHERE university_id = 'vnsgu'
  3. Store in Redis with 60s TTL
  4. Return:
     {
       branding: { logo, colors, fonts },
       features: { resultVerification: true, admissionPortal: true, researchRepo: false, ... }
     }

Next.js page: conditionally renders sections based on features object
→ Research section NOT rendered for VNSGU (feature disabled)
→ Same code, different output per university — driven by config, not code changes
```

### 4.3 Admission Application Flow (Public Portal)

```
Applicant    Public Portal    Admission Service    Notification Service    University Admin Panel
    │               │                 │                    │                        │
    │─Fill form─────▶│                 │                    │                        │
    │               │─POST /apply─────▶│                    │                        │
    │               │                 │─Validate form + docs│                        │
    │               │                 │─INSERT admission_applications               │
    │               │                 │─PUBLISH admission.application.submitted──────▶│
    │               │◀─App ID + status│                    │ Email confirmation     │
    │◀─"Submitted"──│                 │                    │                        │
    │               │                 │                    │◀─Admin reviews          │
    │               │                 │                    │                        │
    │─Check status──▶│                 │                    │                        │
    │               │─GET /status─────▶│                    │                        │
    │◀─"Shortlisted"│                 │                    │                        │
```

---

## 5. Blockchain Verification Flow

### 5.1 Result Publication Flow

```
Uni Admin    Dashboard    Result Service    Blockchain Service    Polygon L2    Public Portal
    │             │              │                 │                   │               │
    │─Publish────▶│              │                 │                   │               │
    │             │─POST /publish▶│                 │                   │               │
    │             │              │─Collect results  │                   │               │
    │             │              │─Serialize JSON   │                   │               │
    │             │              │─SHA-256 hash     │                   │               │
    │             │              │─POST /blockchain/publish─▶│          │               │
    │             │              │                 │─Call publishResult()─▶│            │
    │             │              │                 │◀─tx_hash──────────│               │
    │             │              │◀─tx_hash + conf─│                   │               │
    │             │              │─UPDATE results.blockchain_tx_hash   │               │
    │             │◀─"Published"─│                 │                   │               │
    │◀─Success────│              │                 │                   │  Now verifiable│
```

### 5.2 Public Verification Flow

```
Employer    Public Portal    Public Portal Service    Polygon L2 (Polygon scan)
    │               │                 │                       │
    │─Enter Enroll──▶│                 │                       │
    │               │─GET /verify─────▶│                       │
    │               │                 │─Fetch result from PG  │
    │               │                 │─Re-compute SHA-256 hash│
    │               │                 │─Call verifyResult()───▶│
    │               │                 │◀─{ matches: true }────│
    │               │◀─✅ Verified────│                       │
    │◀─"Authentic"──│                 │                       │

If hash mismatch:
    │               │◀─❌ Tampered───│                       │
    │◀─"INVALID"────│                 │                       │
```

---

## 6. Caching Strategy

### 6.1 Cache Layer Design

| Cache Key Pattern | TTL | Data Cached | Invalidation |
|---|---|---|---|
| `timetable:{id}:grid` | 1 hour | Timetable grid JSON | On timetable update event |
| `student:{id}:timetable` | 30 min | Student's current timetable | On timetable update |
| `public:{slug}:config` | 60 sec | University public portal feature config + branding | On config save |
| `public:{slug}:results:{enrollmentNo}` | 10 min | Verified result record + blockchain match | On result update |
| `public:{slug}:vacancies` | 5 min | Active vacancy listings | On vacancy save |
| `public:{slug}:admissions:status:{appId}` | 2 min | Application status | On status change |
| `fees:{studentId}:dues` | 5 min | Outstanding fee dues | On payment |
| `attendance:{sessionId}:present` | Session duration | Set of present students | On session close |
| `analytics:{uniId}:dashboard` | 15 min | University performance dashboard aggregates | On schedule |
| `library:{uniId}:catalog` | 10 min | Book catalog page results | On book update |
| `session:{userId}` | 8 hours | Authenticated session | On logout / token expiry |
| `blockchain:result:{enrollmentNo}:{sem}` | 24 hours | On-chain verification result | Never (immutable) |

### 6.2 Cache-Aside Pattern

All microservices follow **Cache-Aside (Lazy Loading)**: check Redis first → on miss, query PostgreSQL → write to Redis with TTL → return data. Writes always go directly to PostgreSQL first, then cache is invalidated or updated.

### 6.3 CDN Cache (Public Portal)

Public portal pages rendered via ISR are cached at Cloudflare edge with **60-second stale-while-revalidate** TTL, enabling near-zero-latency global access. University admin changes (new vacancies, updated admission status) trigger ISR revalidation via webhook within 60 seconds.

---

## 7. Error Handling Design

### 7.1 Error Classification

| Error Class | HTTP Status | Handling Strategy | User Message |
|---|---|---|---|
| Validation Error | 400 | Return field-level errors; no retry | "Please correct the highlighted fields" |
| Authentication Failed | 401 | Redirect to login; clear session | "Session expired, please log in again" |
| Authorization Failed | 403 | Log to audit trail | "You don't have permission for this action" |
| Resource Not Found | 404 | Return 404 with context | "The requested resource was not found" |
| Timetable Constraint Violation | 422 | Return conflict report with suggestions | "Generation failed — see conflict report" |
| Blockchain Timeout | 503 | Queue for retry; show pending state | "Verification pending — check back in 30 seconds" |
| AI Service Timeout | 503 | Fallback to cached response; log | "AI assistant temporarily unavailable" |
| IoT Device Disconnected | 503 | Switch to manual attendance mode | "IoT attendance unavailable — use manual mode" |
| Rate Limit Exceeded | 429 | Return Retry-After header | "Too many requests — please wait" |
| Internal Server Error | 500 | Log full stack trace; alert on-call | "Something went wrong. Our team has been notified." |

### 7.2 Timetable Generation Error Response (RFC 7807)

```json
{
  "type": "https://api.smartuniversity.com/errors/constraint-violation",
  "title": "Timetable Generation Failed",
  "status": 422,
  "detail": "CP-SAT solver could not find a feasible solution within 30 seconds.",
  "instance": "/v2/timetables/generate",
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

### 7.3 Blockchain Verification Error Response

```json
{
  "type": "https://api.smartuniversity.com/errors/blockchain-mismatch",
  "title": "Result Verification Failed",
  "status": 200,
  "verified": false,
  "message": "The result record has been tampered. On-chain hash does not match database record.",
  "enrollmentNo": "2021CS001",
  "semesterId": "SEM-4-2023",
  "databaseHash": "a1b2c3...",
  "onChainHash": "x9y8z7...",
  "polygonscanUrl": "https://polygonscan.com/tx/0x..."
}
```

---

## 8. Security Design

### 8.1 Authentication Architecture

```
Student / Faculty login:
  Browser → Firebase Auth SDK → Firebase Identity Platform
       → ID Token issued → Exchange for Platform JWT via auth-service
       → Platform JWT contains: userId, role, universityId, departmentId, sessionId

Admin login:
  Browser → Keycloak (self-hosted) → OIDC flow
       → Platform JWT with admin claims → Stored in HttpOnly cookie

Public Portal visitor:
  No authentication required → Rate-limited by IP + Cloudflare Bot Fight Mode
  → Verification requests logged with IP + timestamp for audit
```

### 8.2 Authorization Matrix (RBAC)

| Resource | SUPERADMIN | UNI_ADMIN | DEPT_ADMIN | FACULTY | STUDENT | PUBLIC |
|---|---|---|---|---|---|---|
| All universities | ✅ CRUD | ❌ | ❌ | ❌ | ❌ | ❌ |
| Own university | ✅ CRUD | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| Own department | ✅ CRUD | ✅ CRUD | ✅ CRUD | 👁️ Read | ❌ | ❌ |
| Timetable generate | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Student's own data | ✅ | ✅ | ✅ | 👁️ Read | ✅ Own | ❌ |
| Attendance mark | ✅ | ✅ | ✅ | ✅ Own | ✅ Own | ❌ |
| Result publish | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Public result view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (verify only) |
| Public portal config | ✅ CRUD | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| Fee payment | ✅ | ✅ | ✅ | ❌ | ✅ Own | ❌ |
| Blockchain verify | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NAAC export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI chatbot | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 8.3 Cross-Tenant Protection Design

Every request that touches data must satisfy this chain:

```
1. JWT decoded → extract universityId claim
2. Kong gateway injects X-University-Id header (tamper-proof)
3. Microservice middleware validates X-University-Id matches JWT claim
4. Prisma middleware appends: SET search_path = {universityId}
5. PostgreSQL RLS: department_id and university_id row filters applied
6. Any attempt to query another tenant's schema → 403 + audit log entry
7. Public-portal-service: additionally validates university slug in request path matches JWT-less tenant context
```

### 8.4 IoT Security Design

- All IoT devices communicate via **MQTT over TLS 1.3** to an on-premise Mosquitto broker
- Device certificates provisioned via **AWS IoT Core certificate authority** (each device has unique cert)
- MQTT broker resides in a **campus-isolated subnet** — no direct internet access; cloud bridge only
- Face recognition processing occurs **on-premise** on edge compute; only a boolean result (`present: true`) is transmitted to the cloud — no biometric data leaves campus

---

## 9. Scalability Design

### 9.1 Horizontal Scaling Strategy

| Service | Scaling Trigger | Scaling Strategy |
|---|---|---|
| `public-portal-service` | CPU > 60% or RPS > 500/pod | HPA — scale up to 20 pods; highest traffic service |
| `admission-service` | CPU > 70% (seasonal spike) | HPA with scheduled scaling during admission season |
| `student-service` | CPU > 65% | HPA — scale to 10 pods during peak exam periods |
| `scheduling-engine` | Active jobs > 5 | HPA — GPU node pool; each generation is memory-intensive |
| `ai-ml-service` | Queue depth > 10 | KEDA (event-driven) — scale based on AI request queue depth |
| `iot-service` | Kafka consumer lag > 1000 | HPA — scale consumers for IoT event bursts |
| `fees-service` | CPU > 70% | HPA — scale during fee deadline periods |
| `notification-service` | Queue depth > 500 | KEDA — scale based on notification queue |

### 9.2 Database Scaling Strategy

| Database | Current Strategy | Scale Strategy |
|---|---|---|
| PostgreSQL | Multi-AZ RDS; per-schema isolation | Read replicas per region; PgBouncer connection pooling; sharding by university group |
| Redis | ElastiCache Cluster with 3 shards | Add shards; separate clusters for sessions vs cache vs rate limiting |
| Kafka | 3 brokers, topic partitioned by university | Scale brokers; increase partition count; dedicated cluster for IoT topics |
| Elasticsearch | 3-node cluster | Dedicated index per university; tiered storage for old logs |
| MongoDB | Atlas M10 cluster | Atlas auto-scaling; per-university collection namespacing |

---

## 10. Monitoring & Observability

### 10.1 Observability Stack

| Tool | Purpose |
|---|---|
| Prometheus | Metrics collection from all services |
| Grafana | Dashboards: service health, timetable generation times, AI query latency, IoT device status |
| Loki | Log aggregation from all containers |
| Jaeger | Distributed tracing across microservice chains (e.g., AI chatbot → LangChain → Claude → RAG → Elasticsearch) |
| PagerDuty | On-call alerting for SLA breaches |
| Sentry | Frontend error tracking (Next.js + React Native) |
| Cloudflare Analytics | Public portal traffic, DDoS attempts, per-university request volume |
| Polygon Explorer | On-chain transaction monitoring for academic record publications |

### 10.2 Key Metrics & Alerting

```
CRITICAL ALERTS (immediate paging):
  - API Gateway p99 latency > 2 seconds for > 5 minutes
  - Any cross-tenant data access attempt (RLS violation logged)
  - Blockchain service: result publish failure after 3 retries
  - Fee payment gateway: failure rate > 5%
  - IoT service: MQTT broker disconnected for > 60 seconds

WARNING ALERTS (Slack notification):
  - Timetable generation time > 45 seconds
  - AI service response time > 10 seconds
  - Public portal: verification request rate > 1000/min (possible bot)
  - Student attendance: < 50% marked 30 minutes after session opened
  - Dropout risk ML: > 20 students flagged in one day at one university

INFO ALERTS (dashboard only):
  - Daily active users per university panel
  - AI chatbot query volume per university
  - New admission applications per university
  - Placement records added this week
```

### 10.3 Custom Prometheus Metrics

```javascript
// Key custom metrics
const ttGenerationDuration = new Histogram({
  name: 'timetable_generation_duration_seconds',
  help: 'Timetable generation time in seconds',
  labelNames: ['university_id', 'department_id', 'status']
});

const blockchainPublishDuration = new Histogram({
  name: 'blockchain_publish_duration_seconds',
  help: 'Time from result publish to on-chain confirmation',
  labelNames: ['university_id']
});

const aiChatbotLatency = new Histogram({
  name: 'ai_chatbot_response_seconds',
  help: 'AI doubt chatbot end-to-end response time',
  labelNames: ['university_id', 'subject_category']
});

const publicPortalVerifications = new Counter({
  name: 'public_portal_verifications_total',
  help: 'Total result verifications per university public portal',
  labelNames: ['university_slug', 'verification_type', 'result']
});

const iotAttendanceEvents = new Counter({
  name: 'iot_attendance_events_total',
  help: 'IoT-marked attendance events',
  labelNames: ['university_id', 'method']  // method: ble | face | qr | manual
});

const activeSessions = new Gauge({
  name: 'active_authenticated_sessions',
  help: 'Active authenticated sessions per panel',
  labelNames: ['panel', 'university_id']
});
```

---

## 11. Disaster Recovery & Business Continuity

### 11.1 Recovery Scenarios

| Scenario | RTO | RPO | Recovery Strategy |
|---|---|---|---|
| API Service pod crash | < 30 seconds | 0 (stateless) | Kubernetes restarts pod automatically |
| Database failure (primary) | < 5 minutes | < 30 seconds | PostgreSQL automatic failover to read replica |
| Redis failure | < 2 minutes | Sessions only | Redis Sentinel promotes replica; users re-login |
| Kafka broker failure | < 5 minutes | 0 (replicated) | Kafka leader election for affected partitions |
| AI Engine crash during generation | < 60 seconds | Partial generation | Redis lock TTL releases; retry queue picks up |
| Blockchain service outage | < 10 minutes | 0 (on-chain immutable) | Results still readable from PostgreSQL; blockchain sync on recovery |
| IoT MQTT broker failure | < 5 minutes | IoT events buffered | Devices buffer locally; MQTT bridge reconnects; events replayed |
| Public portal CDN outage | < 2 minutes | 0 (stateless) | Cloudflare auto-routes to secondary edge PoP |
| Full AZ outage (AWS) | < 10 minutes | < 60 seconds | ALB routes to healthy AZ; Multi-AZ RDS failover |
| Full region outage | < 4 hours | < 1 hour | Manual failover to DR region; S3 cross-region replication |
| Accidental bulk delete | < 1 hour | < 24 hours | PostgreSQL PITR from automated backup |
| AI model corruption | < 15 minutes | 0 | Pull latest model artifact from S3 |

### 11.2 Backup Strategy

```
PostgreSQL Backups:
  - Automated daily full backup (AWS RDS) → retained 30 days
  - WAL streaming → Point-in-Time Recovery up to 5 minutes
  - Weekly manual snapshot before major schema migrations
  - Cross-region replication to DR region (async, RPO < 1 hour)

Redis Backups:
  - RDB snapshot every 15 minutes
  - AOF persistence disabled for performance (acceptable: re-login required)

S3 (PDFs / Videos / Models / University Assets):
  - Cross-region replication (automatic)
  - Object versioning enabled (deleted files recoverable for 90 days)
  - Lifecycle policy: archive to Glacier after 90 days

Blockchain (Polygon L2):
  - Immutable by design; no backup needed
  - Platform maintains local mirror of all tx hashes in PostgreSQL for fast lookup

MongoDB (Timetable JSON / Chat History):
  - Atlas automated daily backup → retained 7 days
  - PITR via Atlas Continuous Cloud Backup (4-hour granularity)
```

---

## 12. Integration Design

### 12.1 External Integrations

| Integration | Protocol | Purpose | Tenant Isolation |
|---|---|---|---|
| Payment Gateway (Razorpay / PayU) | HTTPS REST | Student fee collection | Per-university Razorpay account or sub-merchant |
| Firebase Authentication | Firebase SDK | Student/faculty login, MFA | Firebase project per university (or multi-tenant) |
| Claude API (Anthropic) | HTTPS REST | AI chatbot, career advisor | University-scoped system prompts + RAG indices |
| Polygon L2 (blockchain) | JSON-RPC (ethers.js) | Result and degree verification | Single smart contract; university identified by param |
| AWS SES | HTTPS API | Email notifications | University-specific "From" email domain |
| Twilio / MSG91 | HTTPS REST | SMS notifications | Per-university SMS sender ID |
| Google Maps API | HTTPS REST | Bus tracking map in student app | Shared API key; no tenant data leaked |
| Cloudflare | DNS / CDN API | Per-university public portal routing | CNAME + custom hostname per university |

### 12.2 Webhook System (Available in v2)

| Webhook Event | Payload | Example Use Case |
|---|---|---|
| `timetable.generated` | `{ timetableId, deptId, slots[], generatedAt }` | University ERP auto-imports schedule |
| `timetable.updated` | `{ timetableId, changedSlots[], reason }` | Campus digital display board sync |
| `result.published` | `{ resultId, enrollmentNos[], txHash }` | University website results section auto-update |
| `admission.status.changed` | `{ applicationId, status, updatedAt }` | University call centre CRM update |
| `placement.record.added` | `{ studentId, companyId, ctc, role }` | Alumni management system sync |
| `fees.payment.completed` | `{ paymentId, studentId, amount }` | ERP finance module update |

### 12.3 Export Format Specifications

| Format | Structure | Target Consumers |
|---|---|---|
| **PDF (A4 Landscape)** | Days × Time Slots grid; faculty + room labels; color-coded by subject; university branding | Print, notice boards, accreditation |
| **PDF (NAAC Report)** | NAAC criteria-wise structured report with data tables and graphs | NAAC submission |
| **PDF (Hall Ticket)** | Student photo, exam schedule, seating, university seal | Students, exam hall entry |
| **JSON REST API** | Nested: `timetable → days → slots` with full metadata | Third-party apps, student portals, ERP |
| **iCal (.ics)** | Individual events per lecture with `RRULE:FREQ=WEEKLY` | Google Calendar, Outlook |
| **Excel (.xlsx)** | Multiple sheets: one per batch | Admin reporting |
| **CSV** | Flat: `day, time, subject, faculty, room, batch` | Data warehouse |
| **Blockchain QR** | QR code linking to on-chain verification URL | Degree certificates, result documents |

---

## 13. System Constraints & Limitations

### 13.1 Current Platform Limits

| Constraint | Current Limit | Scalability Path |
|---|---|---|
| Max faculty per department (MVP) | 50 faculty | OR-Tools scales linearly; increase solver time limit |
| Max courses per timetable | 20 courses | Decompose into sub-problems |
| Max batches per generation | 10 batches | Parallel solver instances per batch group |
| Max time slots per day | 12 slots | Configurable; UI renders up to 12 without scroll |
| Concurrent generations per dept | 1 (Redis lock) | Intentional: prevents inconsistent state |
| Max study material file size | 500 MB (video) | S3 multipart upload; CDN streaming for video |
| AI chatbot context window | 200k tokens (Claude) | RAG reduces context to top-k relevant chunks |
| IoT devices per university | 500 | MQTT broker horizontal scaling; 10,000+ possible |
| Public portal verifications/hour | 1,000 per university | Per-university rate limiting pool; increase on request |
| Blockchain confirmations | ~2 seconds (Polygon L2) | Polygon PoS finality; acceptable for non-real-time use |
| Max universities | 10 (MVP) | 10,000 with schema automation |

### 13.2 Known Limitations (v2.0)

1. **No native mobile app:** PWA in v2; native iOS/Android in v3
2. **No multi-language support:** English only; Hindi + Gujarati in v3
3. **No ERP integration:** Webhook export available; full ERP sync in v3
4. **Face recognition on-premise only:** No cloud biometric processing (privacy regulation)
5. **Single blockchain network:** Polygon L2 only; multi-chain support is v3 research item
6. **AI chatbot English only:** Hindi language model support planned for v3
7. **IoT limited to supported protocols:** MQTT and BLE only; Zigbee/Z-Wave integration is v3

### 13.3 Technical Debt Logged for v3

| Item | Priority | Effort |
|---|---|---|
| Native iOS/Android mobile apps | P0 | 12 weeks |
| Multi-language support (Hindi + Gujarati) | P1 | 6 weeks |
| Full SAP/Oracle ERP integration | P2 | 8 weeks |
| Decentralised identity (DID) for student credentials | P2 | 10 weeks |
| Multi-chain blockchain support | P3 | 4 weeks |
| AI model fine-tuning per university domain | P1 | 6 weeks |
| Comprehensive multi-semester analytics | P1 | 4 weeks |
| Live video lecture integration (Zoom/Teams) | P2 | 3 weeks |
| AI-powered exam question bank generation | P2 | 5 weeks |
| Campus metaverse / virtual tour (long-term) | P3 | 20 weeks |

---

*This System Design Document is maintained by the AI Smart University Platform Engineering Team and is subject to revision as the system evolves.*

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
*Supersedes NEP-Scheduler System Design v1.0.0 — February 2026*
