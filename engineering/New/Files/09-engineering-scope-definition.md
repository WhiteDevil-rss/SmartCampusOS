# 09 — Engineering Scope Definition

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Scope Overview

This document defines the exact engineering boundaries for the AI Smart University Platform MVP, specifying what is in scope for the current build, what is explicitly deferred, and what is permanently out of scope. It also defines team composition, individual service ownership, and integration points.

---

## 2. In-Scope Engineering Work (MVP)

### 2.1 Infrastructure & Platform

| Component | Scope | Notes |
|---|---|---|
| Monorepo setup (Turborepo + pnpm) | ✅ In Scope | Full workspace config with shared packages |
| Docker + Docker Compose (local dev) | ✅ In Scope | All services containerised |
| CI/CD pipelines (GitHub Actions) | ✅ In Scope | Build, lint, test, deploy on merge to main |
| Kubernetes manifests (k8s/) | ✅ In Scope | Deployments, Services, HPA for all 22 microservices |
| Terraform (AWS EKS, RDS, Redis, S3) | ✅ In Scope | IaC for full prod environment |
| Multi-tenant PostgreSQL schema provisioning | ✅ In Scope | Automated schema creation + RLS setup on university onboarding |
| Prisma ORM + migrations | ✅ In Scope | All schema migrations managed via Prisma |
| Redis cluster configuration | ✅ In Scope | Sessions, cache, distributed locks, rate limiting |
| Apache Kafka setup (topics + consumers) | ✅ In Scope | All platform event topics defined and consumed |
| Elasticsearch cluster (RAG indices) | ✅ In Scope | Per-university subject indices |
| AWS S3 bucket configuration | ✅ In Scope | PDFs, videos, ML models, university assets |
| MongoDB Atlas setup | ✅ In Scope | Timetable JSON, chat history collections |
| Cloudflare CDN + CNAME setup | ✅ In Scope | Per-university public portal custom domain routing |

### 2.2 Authentication & Security

| Component | Scope |
|---|---|
| Firebase Authentication (students + faculty) | ✅ In Scope |
| Keycloak OIDC (admin roles) | ✅ In Scope |
| Platform JWT issuance + validation middleware | ✅ In Scope |
| RBAC middleware with fine-grained permissions | ✅ In Scope |
| Multi-tenant middleware (SET search_path) | ✅ In Scope |
| Rate limiting middleware (per IP + per university) | ✅ In Scope |
| Audit log stream to Kafka | ✅ In Scope |
| TLS 1.3 termination at CDN | ✅ In Scope |
| mTLS for service-to-service communication | ✅ In Scope |
| DPDP Act 2023 compliance (data minimisation, consent) | ✅ In Scope |
| MFA (optional toggle per university) | ✅ In Scope |
| SSO with Google Workspace / Microsoft Entra | ❌ Deferred v3 |
| Biometric login (fingerprint / face) | ❌ Deferred v3 |

### 2.3 Superadmin Panel

| Feature | Scope |
|---|---|
| University CRUD with schema provisioning | ✅ In Scope |
| Public portal config (branding + features + rate limits) | ✅ In Scope |
| University admin credential management | ✅ In Scope |
| All-university timetable viewer (filterable) | ✅ In Scope |
| Platform health dashboard | ✅ In Scope |
| SaaS billing and licensing management | ❌ Deferred v3 |
| Platform-wide AI analytics | ❌ Deferred v3 |

### 2.4 University Admin Panel

| Feature | Scope |
|---|---|
| Department / program / batch CRUD | ✅ In Scope |
| Faculty pool management | ✅ In Scope |
| Student management and admission workflow | ✅ In Scope |
| Exam management (timetable, hall tickets, invigilators) | ✅ In Scope |
| Result publication + SHA-256 hash + Polygon L2 | ✅ In Scope |
| NAAC report generation (PDF export) | ✅ In Scope |
| NIRF report tools | ✅ In Scope |
| Finance — fees, payroll, HR billing, budget | ✅ In Scope |
| Placement and company partnership management | ✅ In Scope |
| University performance dashboard | ✅ In Scope |
| NAAC full criteria report (auto-formatted, multi-year) | ❌ Deferred v3 |
| Full ERP integration (SAP / Oracle) | ❌ Deferred v3 |
| Multi-university benchmarking | ❌ Deferred v3 |
| Alumni management | ❌ Deferred v3 |

### 2.5 Department Admin Panel

| Feature | Scope |
|---|---|
| Standard timetable generation (OR-Tools CP-SAT) | ✅ In Scope |
| Special timetable (faculty / room exclusion) | ✅ In Scope |
| Timetable viewer (weekly grid) | ✅ In Scope |
| PDF / Excel / iCal / JSON export | ✅ In Scope |
| Faculty CRUD, availability, qualification assignment | ✅ In Scope |
| Student management (dept-scoped) | ✅ In Scope |
| Course and batch management | ✅ In Scope |
| Classroom and lab resource management | ✅ In Scope |
| Exam management | ✅ In Scope |
| Fee structure, collection, dues, payroll | ✅ In Scope |
| Library management (catalog, loans, reservations) | ✅ In Scope |
| Placement records (job postings, tracking, statistics) | ✅ In Scope |
| Research portfolio management | ✅ In Scope |
| Vacancy publication (public portal linked) | ✅ In Scope |
| Complaints management | ✅ In Scope |
| At-risk student dashboard (dropout risk feed) | ✅ In Scope |
| BI analytics and strategic reporting | ❌ Deferred v3 |
| Alumni management | ❌ Deferred v3 |
| Hostel management | ❌ Deferred v3 |
| Procurement and vendor management | ❌ Deferred v3 |
| Asset and inventory management | ❌ Deferred v3 |

### 2.6 Faculty Portal

| Feature | Scope |
|---|---|
| Personal timetable view (read-only, real-time) | ✅ In Scope |
| Manual attendance marking | ✅ In Scope |
| QR code attendance session (generate + validate) | ✅ In Scope |
| Marks upload + internal assessment management | ✅ In Scope |
| Assignment creation and submission grading | ✅ In Scope |
| Online quiz with MCQ auto-grading | ✅ In Scope |
| Study material upload (PDF, PPT, Notes, Video) | ✅ In Scope |
| Student messaging and group announcements | ✅ In Scope |
| Research portfolio and publication tracking | ✅ In Scope |
| Complaint handling | ✅ In Scope |
| Faculty profile management | ✅ In Scope |
| Face recognition / BLE IoT attendance | ❌ Deferred v3 |
| Live classroom polls | ❌ Deferred v3 |
| Grant proposal management | ❌ Deferred v3 |
| Conference and patent tracker (full) | ❌ Deferred v3 |
| FDP full tracking with certificates | ❌ Deferred v3 |

### 2.7 Student Portal

| Feature | Scope |
|---|---|
| AI-generated timetable view | ✅ In Scope |
| Attendance view, flags (sports/hackathon), risk alerts | ✅ In Scope |
| Marks, grades, and performance dashboard | ✅ In Scope |
| Assignment submission | ✅ In Scope |
| Study materials (PDF viewer, video, notes) | ✅ In Scope |
| Online fee payment (Razorpay) + history + receipts | ✅ In Scope |
| Fee reminders and scholarship adjustment | ✅ In Scope |
| Service requests (Bonafide, BRTS, Transcript, ID card) | ✅ In Scope |
| Anonymous complaint submission | ✅ In Scope |
| University and college updates feed | ✅ In Scope |
| Student group and faculty messaging | ✅ In Scope |
| Library (borrowed books, due reminders, catalog search) | ✅ In Scope |
| Digital Student ID Card (QR code) | ✅ In Scope |
| Subject analytics and performance charts | ✅ In Scope |
| AI Study Planner | ✅ In Scope |
| AI Doubt Assistant Chatbot (Claude + RAG) | ✅ In Scope |
| Internship opportunities feed | ✅ In Scope |
| Attendance risk alerts | ✅ In Scope |
| AI Career Recommendation | ✅ In Scope |
| Bus tracking (GPS map) | ❌ Deferred v3 |
| Canteen menu and feedback | ❌ Deferred v3 |
| Student marketplace (buy/sell books) | ❌ Deferred v3 |
| Lost and found portal | ❌ Deferred v3 |
| Certification and hackathon tracker | ❌ Deferred v3 |
| Behaviour ratings view | ❌ Deferred v3 |

### 2.8 Public Portal (Per-University)

| Feature | Scope |
|---|---|
| Per-university isolated portal at `/public/[slug]` | ✅ In Scope |
| Custom domain routing (Cloudflare CNAME) | ✅ In Scope |
| Dynamic branding (logo, colours, fonts from DB config) | ✅ In Scope |
| Feature toggles per university | ✅ In Scope |
| Result verification (hash lookup) | ✅ In Scope |
| Blockchain verification (Polygon L2) | ✅ In Scope |
| Online admission application form | ✅ In Scope |
| Admission status tracker | ✅ In Scope |
| Scholarship application portal | ✅ In Scope |
| Public vacancy listings | ✅ In Scope |
| Degree certificate verification | ✅ In Scope |
| Certificate verification | ✅ In Scope |
| Public research repository | ❌ Deferred v3 |
| University ranking dashboard | ❌ Deferred v3 |
| Migration progress tracking | ❌ Deferred v3 |

### 2.9 AI and ML Features

| Feature | Scope |
|---|---|
| OR-Tools CP-SAT timetable generation | ✅ In Scope |
| XGBoost slot preference warm-start | ✅ In Scope |
| AI workload fairness scoring | ✅ In Scope |
| Constraint violation report | ✅ In Scope |
| NEP 2020 compliance checker | ✅ In Scope |
| Claude API doubt chatbot + RAG pipeline | ✅ In Scope |
| Study material indexing (Elasticsearch) | ✅ In Scope |
| Student performance prediction (XGBoost) | ✅ In Scope |
| Dropout risk prediction (Random Forest + SHAP) | ✅ In Scope |
| AI study planner (RL-based) | ✅ In Scope |
| Career recommendation (Claude + collaborative filtering) | ✅ In Scope |
| Resume analyser (BERT) | ✅ In Scope |
| AI fraud detection (Isolation Forest) | ✅ In Scope |
| Substitute faculty recommender | ✅ In Scope |
| Book recommendation (collaborative filtering) | ✅ In Scope |
| Predictive enrolment forecasting (LSTM) | ❌ Deferred v3 |
| Multi-objective scheduling (NSGA-II) | ❌ Deferred v3 |
| AI campus analytics (clustering) | ❌ Deferred v3 |
| Course demand prediction (Prophet) | ❌ Deferred v3 |
| AI-generated exam question bank | ❌ Deferred v3 |

### 2.10 Blockchain

| Feature | Scope |
|---|---|
| AcademicRecords.sol smart contract | ✅ In Scope |
| DegreeRegistry.sol smart contract | ✅ In Scope |
| Result hash publication to Polygon L2 | ✅ In Scope |
| On-chain result verification via public portal | ✅ In Scope |
| Polygonscan link on verification | ✅ In Scope |
| Blockchain QR code on result documents | ✅ In Scope |
| Degree NFT issuance | ❌ Deferred v3 |
| Decentralised identity (DID) | ❌ Deferred v3 |
| Multi-chain support (Ethereum mainnet, Base) | ❌ Deferred v3 |
| Smart contract upgrade proxy | ❌ Deferred v3 |

### 2.11 Smart Campus / IoT

| Feature | Scope |
|---|---|
| QR code attendance session (MQTT-free, app-based) | ✅ In Scope |
| Digital student ID card with QR | ✅ In Scope |
| Basic GPS bus tracking (frontend only) | ✅ In Scope |
| MQTT broker integration (BLE beacons) | ❌ Deferred v3 |
| Face recognition attendance (on-premise) | ❌ Deferred v3 |
| Smart hostel RFID access | ❌ Deferred v3 |
| Smart classroom IoT control | ❌ Deferred v3 |
| Campus energy monitoring | ❌ Deferred v3 |
| Smart parking system | ❌ Deferred v3 |

---

## 3. Permanently Out of Scope

| Item | Reason |
|---|---|
| Native iOS / Android apps | v3 roadmap; PWA covers MVP need |
| Multi-language UI (Hindi / Gujarati) | v3 roadmap; English-only for MVP |
| SAP / Oracle ERP integration | Webhook export covers integration need |
| Video conferencing (Zoom / Teams) | Link embedding only; no embedded conferencing |
| Metaverse / virtual campus | Long-term vision; no timeline |
| Competitive exam preparation portal | Separate product consideration |
| Multi-chain blockchain | Polygon L2 covers all verification needs |

---

## 4. Service Ownership Matrix

| Service | Owner Team | Language | Dependencies |
|---|---|---|---|
| `api-gateway` | Platform | Kong | Redis, auth-service |
| `auth-service` | Security | Node.js | Firebase, Keycloak, PostgreSQL |
| `tenant-service` | Platform | Node.js | PostgreSQL, Redis |
| `scheduling-engine` | AI/ML | Python | PostgreSQL, MongoDB, Redis, ai-ml-service |
| `ai-ml-service` | AI/ML | Python | PostgreSQL, Elasticsearch, Anthropic API, Redis |
| `faculty-service` | Academic | Node.js | PostgreSQL, S3, notification-service |
| `course-service` | Academic | Node.js | PostgreSQL |
| `resource-service` | Academic | Node.js | PostgreSQL |
| `student-service` | Academic | Node.js | PostgreSQL, Redis, ai-ml-service |
| `fees-service` | Finance | Node.js | PostgreSQL, Razorpay, notification-service, report-service |
| `exam-service` | Academic | Node.js | PostgreSQL, report-service |
| `library-service` | Academic | Node.js | PostgreSQL, notification-service |
| `placement-service` | Academic | Node.js | PostgreSQL, ai-ml-service |
| `results-service` | Academic | Node.js | PostgreSQL, blockchain-service |
| `blockchain-service` | Blockchain | Node.js + ethers.js | Polygon L2 RPC, PostgreSQL |
| `admission-service` | Admissions | Node.js | PostgreSQL, S3, notification-service |
| `communication-service` | Platform | Node.js | PostgreSQL, Redis |
| `notification-service` | Platform | Node.js | Kafka, AWS SES, Twilio |
| `report-service` | Platform | Python | PostgreSQL, S3, BullMQ |
| `analytics-service` | Data | Python | PostgreSQL, Redis, Elasticsearch |
| `realtime-service` | Platform | Node.js (Socket.io) | Redis Pub/Sub, Kafka |
| `public-portal-service` | Platform | Node.js | PostgreSQL (read-only), Redis, blockchain-service |
| `iot-service` | IoT | Node.js | MQTT, Kafka, attendance-service |

---

## 5. Integration Contracts

| Integration | Type | Owned By | Notes |
|---|---|---|---|
| Firebase Authentication | External SaaS | Security team | Firebase Admin SDK in auth-service |
| Keycloak OIDC | Internal (self-hosted) | Security team | Helm chart in k8s/ |
| Claude API (Anthropic) | External API | AI/ML team | temperature=1; per-university RAG context |
| Polygon L2 (Polygon Amoy → Mainnet) | Blockchain | Blockchain team | AcademicRecords.sol + DegreeRegistry.sol |
| Razorpay / PayU | External SaaS | Finance team | Per-university sub-merchant |
| AWS SES | External SaaS | Platform team | University-specific "From" email |
| Twilio / MSG91 | External SaaS | Platform team | Per-university SMS sender ID |
| Cloudflare | External SaaS | Platform team | CNAME + per-university hostname |
| Google Maps API | External SaaS | Frontend team | Bus tracking map |
| AWS S3 | External SaaS | Platform team | PDFs, videos, models, university assets |
| Elasticsearch | Self-managed | AI/ML team | RAG indices; hosted on Elastic Cloud for MVP |
| MQTT Mosquitto | On-premise | IoT team | Campus-side; MQTT bridge to cloud iot-service |

---

## 6. Technical Constraints

| Constraint | Limit | Reason |
|---|---|---|
| Max faculty per timetable generation | 50 | OR-Tools solve time; increase solver_time_limit for larger depts |
| Max courses per batch timetable | 20 | Decompose into sub-problems above this |
| Max batches per generation | 10 | Parallel solver instances for higher counts |
| Concurrent timetable generations per dept | 1 (Redis lock) | Prevents race conditions and conflicting states |
| Max study material file size | 500 MB (video) | S3 multipart upload; CDN delivery |
| AI chatbot context window | 200k tokens (Claude) | RAG reduces to top-k chunks; chat history trimmed to last 3 exchanges |
| IoT devices per university (MVP) | 500 | MQTT broker vertical scaling first; horizontal later |
| Public portal verifications per hour | 1,000 per university | Per-university Redis rate limit pool |
| Blockchain confirmations | ~2 seconds (Polygon L2) | Polygon PoS finality; acceptable latency |
| Max concurrent users (MVP) | 500 | Horizontal pod scaling handles growth to 100K |
| Max universities (MVP) | 10 | Schema automation handles up to 10,000 |

---

## 7. Definition of Done (DoD)

A feature is considered engineering-complete when all of the following are true:

- [ ] Feature logic fully implemented and peer-reviewed
- [ ] Unit tests written with ≥ 80% line coverage
- [ ] Integration test covering the primary happy path
- [ ] API contract matches the spec in `06-api-contracts.md`
- [ ] Prisma migration created and tested
- [ ] Tenant isolation verified (cross-university API call returns 403)
- [ ] Redis caching applied to all read endpoints with > 100ms DB query time
- [ ] Kafka event published for state-changing operations
- [ ] Error responses conform to RFC 7807 format
- [ ] Environment variables documented in `.env.example`
- [ ] Kubernetes manifest updated if a new service is added
- [ ] Feature tested against VNSGU seed data

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
