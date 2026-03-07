# 10 — Development Phases

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. MVP Timeline Overview

| Phase | Name | Duration | Start | End |
|---|---|---|---|---|
| Phase 1 | Foundation & Infrastructure | 3 weeks | Week 1 | Week 3 |
| Phase 2 | Admin Panels | 4 weeks | Week 4 | Week 7 |
| Phase 3 | Faculty & Student Portals | 4 weeks | Week 8 | Week 11 |
| Phase 4 | AI Features | 3 weeks | Week 12 | Week 14 |
| Phase 5 | Blockchain & Public Portal | 3 weeks | Week 15 | Week 17 |
| Phase 6 | Notifications & Real-Time | 2 weeks | Week 18 | Week 19 |
| Phase 7 | Testing, QA & Launch | 2 weeks | Week 20 | Week 21 |
| **Total** | **Full MVP** | **21 weeks** | | |

---

## 2. Phase 1 — Foundation & Infrastructure (Weeks 1–3)

**Goal:** Project scaffold, auth, database, CI/CD, and multi-tenant shell all operational.

### Deliverables

| Task | Owner | Done When |
|---|---|---|
| Monorepo setup (Turborepo + pnpm workspaces) | Platform | `pnpm dev` starts all apps |
| `packages/shared-types`, `packages/utils`, `packages/database` scaffolded | Platform | Types importable across apps |
| Prisma schema v1 (core entities: University, Dept, Faculty, Student, Course, Batch, Room) | Backend | Migrations run on Supabase/Neon |
| PostgreSQL multi-schema provisioning script | Backend | `createSchema('vnsgu')` works end-to-end |
| Row-Level Security policies for department isolation | Backend | RLS verified via integration test |
| `auth-service` — Firebase Auth for students/faculty, Keycloak OIDC for admins | Security | Login returns valid platform JWT |
| JWT middleware + RBAC middleware | Security | Protected route returns 401/403 correctly |
| `tenant-service` — schema routing middleware (`SET search_path`) | Backend | Cross-tenant request returns 403 |
| Redis setup — sessions, rate limiting, distributed locks | Platform | `ioredis` ping returns PONG |
| Kafka setup — producer and base consumers (audit, timetable.events) | Platform | Event produced and consumed in local stack |
| Docker Compose with all services (PostgreSQL, Redis, Kafka, Elasticsearch, MongoDB) | DevOps | `docker-compose up` starts clean |
| GitHub Actions CI — lint, type-check, test, Docker build on PR | DevOps | All checks pass on first PR |
| `.env.example` for all apps | Platform | All required vars documented |
| VNSGU + SPUVVN seed data script | QA | `pnpm db:seed` populates both university schemas |
| Next.js project bootstrapped with route groups per panel | Frontend | All panel routes navigable (blank) |
| Superadmin login → University list (read-only) | Frontend + Backend | First authenticated screen rendered |

### Milestone Exit Criteria
- [ ] Login works for all 5 role types using seed credentials
- [ ] VNSGU university visible in Superadmin panel
- [ ] Cross-tenant API test returns 403

---

## 3. Phase 2 — Admin Panels (Weeks 4–7)

**Goal:** All three admin panels fully functional with complete CRUD and timetable generation.

### Week 4–5: Superadmin + University Admin

| Task | Owner | Done When |
|---|---|---|
| Superadmin: University CRUD (create → auto-provisions PostgreSQL schema) | Backend + Frontend | New university created; schema verified |
| Superadmin: Public portal config form (branding + feature toggles) | Frontend + Backend | Portal config saved; affects public route |
| Superadmin: Credential management (all roles) | Backend | Password reset works cross-university |
| Superadmin: Platform overview dashboard | Frontend | University count, student count rendered |
| University Admin: Department CRUD | Backend + Frontend | Dept created; visible in dept panel |
| University Admin: Program management (type, credits, NEP exit points) | Backend + Frontend | MCA program created |
| University Admin: Faculty pool management | Backend + Frontend | Faculty added; appears in dept panel |
| University Admin: Student management + admission workflow | Backend + Frontend | Student created; enrollment number assigned |
| University Admin: Course catalog | Backend + Frontend | Course linked to dept + program |
| University Admin: Finance dashboard (fees, payroll, budget) | Frontend | Charts load with seed data |
| University Admin: Exam management (timetable, hall tickets, invigilators) | Backend + Frontend | Hall ticket PDF generated for one student |
| University Admin: NAAC report PDF export | Backend (Python report-service) | PDF downloadable with university branding |
| University Admin: Placement panel | Frontend + Backend | Company and job posting CRUD |
| University Admin: University performance dashboard | Frontend + Analytics service | Dashboard renders KPIs from seed data |

### Week 6–7: Department Admin + Timetable Engine

| Task | Owner | Done When |
|---|---|---|
| Department Admin: Faculty management (dept-scoped) | Frontend + Backend | Dept-admin cannot see other dept's faculty |
| Department Admin: Student management | Frontend + Backend | Students filtered to dept and batch |
| Department Admin: Course and batch management | Frontend + Backend | Batches linked to programs |
| Department Admin: Classroom and lab resource management | Frontend + Backend | Rooms created with capacity and type |
| OR-Tools scheduling engine (Python FastAPI, Port 8003) | AI/ML | OR-Tools CP-SAT solver returns timetable JSON |
| Hard constraints HC-01 to HC-10 implemented | AI/ML | 0 conflicts in generated timetable |
| Soft constraints SC-01 to SC-07 implemented | AI/ML | Fairness score computed; XGBoost warm-start |
| Standard timetable generation form (Dept Admin) | Frontend | Form submits; loading state shows; grid renders |
| Timetable grid component (days × slots, color-coded) | Frontend | Weekly grid renders with all slot data |
| Special timetable generation (excluded faculty/rooms) | Frontend + AI/ML | Excluded faculty absent from result |
| Timetable PDF export (A4 landscape, university branding) | Backend (report-service) | PDF downloadable with timetable grid |
| Timetable Excel / JSON / iCal export | Backend | All format downloads working |
| NEP compliance checker | AI/ML | Compliance report returned with timetable |
| Conflict report UI (on generation failure) | Frontend | Conflict details displayed with recommendations |
| Department Admin: Library management (catalog, loans, reservations) | Backend + Frontend | Book loan created; reservation notified |
| Department Admin: Placement records and job postings | Backend + Frontend | Job posting linked to company |
| Department Admin: Fee structure and collection | Backend + Frontend | Fee structure created; linked to program |
| Department Admin: Vacancies (public-portal linked) | Backend + Frontend | Vacancy visible on public portal |
| Department Admin: At-risk student dashboard | Frontend + AI | Dropout risk scores displayed per student |

### Milestone Exit Criteria
- [ ] Timetable generated for VNSGU CS department with 0 conflicts
- [ ] Fairness score ≥ 85 for seed data generation
- [ ] NEP compliance report returns "compliant: true" for MCA Sem 2
- [ ] Hall ticket PDF generated for one student
- [ ] NAAC report PDF generated for VNSGU

---

## 4. Phase 3 — Faculty & Student Portals (Weeks 8–11)

**Goal:** All faculty and student features functional with real-time updates and AI-generated data.

### Week 8–9: Faculty Portal

| Task | Owner | Done When |
|---|---|---|
| Faculty: Personal timetable view (read-only, real-time Socket.io) | Frontend + Realtime | Timetable updates without page refresh |
| Faculty: Manual attendance marking with session creation | Backend + Frontend | Attendance record created in DB |
| Faculty: QR attendance session (generate QR, validate scan) | Backend + Frontend | QR generated; student scan marks attendance |
| Faculty: Marks upload and internal assessment management | Backend + Frontend | Marks saved per student per course |
| Faculty: Assignment creation (title, description, file, due date) | Backend + Frontend | Assignment visible in student portal |
| Faculty: Assignment submission grading and feedback | Backend + Frontend | Grade saved; student sees result |
| Faculty: Online quiz creation with MCQ | Backend + Frontend | Quiz published to students |
| Faculty: MCQ auto-grading | Backend | Scores computed on submission |
| Faculty: Study material upload (PDF, PPT, Notes, Video) | Backend + Frontend | File stored in S3; linked to course |
| AI RAG indexing pipeline (on upload) | AI/ML | Material indexed in Elasticsearch after upload |
| Faculty: Student group messaging | Backend + Frontend | Message delivered to batch students |
| Faculty: Research portfolio (publications, conferences, patents) | Backend + Frontend | Publication record created |
| Faculty: Complaint handling | Backend + Frontend | Complaint updated to "resolved" |

### Week 10–11: Student Portal

| Task | Owner | Done When |
|---|---|---|
| Student: Timetable view (AI-generated, real-time) | Frontend | Student sees their batch's timetable |
| Student: Attendance view with subject-wise breakdown | Frontend | Percentage shown per subject |
| Student: Attendance flag submission (sports, hackathon) | Backend + Frontend | Flag submitted; pending admin approval |
| Student: Attendance risk alert (< 80%) | Frontend + Backend | Red alert shown; affected subjects listed |
| Student: Marks and grades view | Frontend | Internal marks displayed per subject |
| Student: Performance dashboard (charts, subject analytics) | Frontend | Recharts render attendance + marks trends |
| Student: Assignment submission | Frontend + Backend | File uploaded to S3; submission recorded |
| Student: Study materials (PDF viewer, video player) | Frontend | In-browser PDF renders; video streams from S3 |
| Student: Fee payment (Razorpay integration) | Backend + Frontend | Payment completed; receipt generated |
| Student: Fee history and downloadable receipt | Frontend | Receipt PDF downloadable |
| Student: Fee reminders and scholarship adjustment | Backend | Reminder sent when 7 days from due date |
| Student: Service requests (Bonafide, BRTS, Transcript, ID card) | Backend + Frontend | Request created; admin notified |
| Student: Digital ID card with QR code | Frontend | Card rendered with student photo and QR |
| Student: Library (borrowed books, due reminders, catalog search) | Frontend + Backend | Books visible; overdue shown |
| Student: Internship feed from placement portal | Frontend | Job postings visible |
| Student: Anonymous complaint submission | Backend + Frontend | Complaint stored anonymously (no studentId) |
| Student: University updates feed | Frontend + Backend | Announcements rendered from communication-service |

### Milestone Exit Criteria
- [ ] Aryan (seed student) can view timetable, attendance, marks, and fees
- [ ] QR attendance session complete end-to-end for one class
- [ ] Study material uploaded by faculty → visible in student portal
- [ ] Fee payment flow (Razorpay test mode) completes; receipt generated
- [ ] Digital ID card renders with QR scannable

---

## 5. Phase 4 — AI Features (Weeks 12–14)

**Goal:** All AI-powered features live and integrated — chatbot, study planner, career advisor, dropout risk.

| Task | Owner | Done When |
|---|---|---|
| Claude API integration (Anthropic SDK, temperature=1) | AI/ML | API call returns response |
| LangChain RAG pipeline (Elasticsearch + sentence-transformers) | AI/ML | Top-5 relevant chunks retrieved per query |
| AI Doubt Chatbot endpoint (`/v2/ai/chatbot`) | AI/ML + Backend | Chatbot answers questions from uploaded materials |
| Chatbot UI (ChatbotWidget component) | Frontend | Chat interface renders in student portal |
| Per-university knowledge base isolation (index scoping) | AI/ML | VNSGU query only returns VNSGU material |
| AI Study Planner (RL + calendar-based) | AI/ML | Plan generated with daily tasks and exam alerts |
| Study Planner UI | Frontend | StudyPlannerView renders with day-wise plan |
| Career Recommendation (Claude + collaborative filtering) | AI/ML | 3 career paths returned with skill gap analysis |
| Career Advisor UI | Frontend | CareerAdvisorCard renders in student/ai panel |
| Dropout Risk Scorer (Random Forest + SHAP) | AI/ML | Risk score computed for all VNSGU students |
| Dropout risk feed in Dept Admin dashboard | Frontend | At-risk students sorted by risk level |
| Student performance prediction (XGBoost) | AI/ML | Predicted end-semester grade displayed |
| Resume analyser (BERT NLP) | AI/ML | Resume score returned against job description |
| Substitute faculty recommender | AI/ML + Backend | Top 2 substitutes listed for absent faculty |
| Book recommendation (collaborative filtering) | AI/ML + Library | 3 book recommendations shown in student library |
| AI fraud detection (Isolation Forest) | AI/ML | Anomaly flagged for test bulk-verification request |

### Milestone Exit Criteria
- [ ] AI chatbot answers "Explain backpropagation" using uploaded AI notes
- [ ] Different responses returned for same question across VNSGU vs SPUVVN (temperature=1 test)
- [ ] Dropout risk score computed for all 60 seed students
- [ ] Study planner generated for Aryan student

---

## 6. Phase 5 — Blockchain & Public Portal (Weeks 15–17)

**Goal:** Blockchain result verification live on Polygon Amoy; per-university public portals fully operational with unique branding.

### Week 15: Blockchain

| Task | Owner | Done When |
|---|---|---|
| `AcademicRecords.sol` smart contract development | Blockchain | Contract compiles with Hardhat |
| `DegreeRegistry.sol` smart contract development | Blockchain | Contract compiles |
| Hardhat tests for publishResult, verifyResult, tamper detection | Blockchain | All tests pass (100% contract coverage) |
| Deploy to Polygon Amoy testnet | Blockchain | Contract address live on Amoy |
| `blockchain-service` Node.js service (ethers.js) | Backend | publishResult + verifyResult end-to-end tested |
| Result publication endpoint (`POST /v2/results/publish`) | Backend | SHA-256 hash + tx_hash stored in DB |
| Polygon testnet transaction for VNSGU seed results (60 results) | Blockchain | 60 tx hashes stored in results table |
| Polygonscan link integration | Frontend | Link renders on verification result |

### Week 16–17: Public Portal

| Task | Owner | Done When |
|---|---|---|
| `public-portal-service` (read-only, tenant-scoped) | Backend | Queries scoped to university schema |
| Dynamic public portal layout (Next.js dynamic route `/public/[slug]`) | Frontend | VNSGU portal loads with blue branding |
| Per-university CSS variable injection (primaryColor, logo) | Frontend | SPUVVN portal loads with maroon branding |
| Feature toggle rendering (nav items hide/show) | Frontend | Admission tab hidden when toggle = false |
| Result verification UI (enrollment input + blockchain check) | Frontend | VerificationWidget renders; QR supported |
| Blockchain verification badge (✅ / ❌) | Frontend | VerificationBadge component renders correctly |
| Admission application form (public, no auth) | Frontend + Backend | Application saved; confirmation email sent |
| Admission status tracker | Frontend + Backend | Status visible with application ID lookup |
| Scholarship portal | Frontend + Backend | Application submitted via public portal |
| Vacancy public listing | Frontend | Vacancies fetched from dept admin entries |
| Per-university custom domain via Cloudflare CNAME | DevOps | `results.vnsgu.ac.in` resolves to platform |
| ISR (Incremental Static Regeneration, 60s) for public pages | Frontend | CDN-cached; revalidates every 60 seconds |
| Tenant isolation test: SPUVVN slug cannot return VNSGU results | QA | `expect(response.status).toBe(404)` |

### Milestone Exit Criteria
- [ ] Verification of Aryan's result at `/public/vnsgu/results/verify` returns ✅ Verified
- [ ] Tampered result returns ❌ Tampered
- [ ] Polygonscan link resolves to actual transaction
- [ ] VNSGU portal shows blue branding; SPUVVN shows maroon branding
- [ ] Cross-slug API test returns 404 or 403

---

## 7. Phase 6 — Notifications & Real-Time (Weeks 18–19)

**Goal:** All real-time updates and notification channels live.

| Task | Owner | Done When |
|---|---|---|
| Socket.io namespaces: `/timetables`, `/campus` | Realtime | WebSocket connects; ping-pong works |
| Socket.io rooms: per-student, per-faculty, per-dept | Realtime | Message delivered to correct room |
| Real-time timetable update broadcast (Kafka → Socket.io) | Realtime + Kafka | Student sees update without page refresh in < 2s |
| Real-time attendance update | Realtime | Faculty sees present count update live |
| Fee due reminder job (BullMQ cron, daily) | Backend (fees-service) | Reminder email + in-app generated for test student |
| Attendance risk alert notification | Backend (student-service) | Alert shown when attendance < 80% |
| Result published notification (email + in-app) | notification-service | Notification delivered within 5 seconds |
| Admission status change notification | notification-service | Applicant email sent on SHORTLISTED status |
| Assignment due-in-24h reminder | notification-service | Reminder generated for test assignment |
| AWS SES email templates (fee reminder, result, admission) | Platform | All 3 email templates render correctly |
| Twilio SMS for fee reminders (opt-in) | Platform | SMS delivered to test number |
| Dropout risk HOD notification | notification-service | HOD alerted when student risk > 0.6 |
| WebSocket reconnection and offline summary | Frontend | Client reconnects; change summary displayed |

### Milestone Exit Criteria
- [ ] Timetable change by Dept Admin → student sees update in < 2 seconds (observed in browser)
- [ ] Fee reminder email arrives in test inbox
- [ ] Dropout risk notification appears in Dept Admin dashboard

---

## 8. Phase 7 — Testing, QA & Launch (Weeks 20–21)

**Goal:** Platform is production-hardened, load-tested, security-scanned, and ready for 5 universities.

### Week 20: Full QA

| Task | Owner | Done When |
|---|---|---|
| Unit test coverage ≥ 80% (Jest + Vitest) | All | Coverage report shows ≥ 80% |
| Integration test coverage ≥ 70% (Supertest) | QA | API test suite passes |
| Playwright E2E: all 7 panel flows | QA | All flows pass in headless Chrome |
| Blockchain tests (Hardhat): publishResult, verifyResult, tamper | Blockchain | 100% contract function coverage |
| Tenant isolation tests: 100% cross-tenant paths | QA | All cross-tenant attempts return 403/404 |
| Load test — k6: 500 concurrent users | DevOps | p95 API latency < 500ms under load |
| Load test — k6: timetable generation under load | DevOps | Generation completes < 30s under concurrent requests |
| Load test — k6: public portal verification burst (1000 req/min) | DevOps | Rate limiting triggers; no data leakage |
| OWASP ZAP security scan | Security | No Critical/High OWASP Top 10 vulnerabilities |
| Trivy container image scan | DevOps | No Critical CVEs in production images |
| JWT manipulation tests | Security | Manipulated JWT returns 401 |
| SQL injection tests | Security | All parameterised queries; 0 injections |

### Week 21: Production Deploy

| Task | Owner | Done When |
|---|---|---|
| Terraform apply — AWS EKS cluster + RDS + ElastiCache | DevOps | Infrastructure provisioned |
| Deploy all 22 services to EKS | DevOps | All pods Running; health checks pass |
| Deploy smart contract to Polygon Mainnet | Blockchain | Contract live; grantPublisherRole complete |
| Configure Cloudflare CNAME for VNSGU + SPUVVN | DevOps | Custom domains resolve |
| Seed VNSGU + SPUVVN data in production | QA | Both university portals functional |
| Smoke test all 7 panels in production | QA | All panels accessible; no 500 errors |
| Set up Prometheus + Grafana dashboards | DevOps | CPU, memory, API latency visible |
| Set up PagerDuty alerting rules | DevOps | Alert fires on simulated 503 |
| Documentation update and handoff | Platform | All 12 engineering docs published |

### Milestone Exit Criteria
- [ ] Unit test coverage ≥ 80%
- [ ] 0 Critical/High security vulnerabilities (OWASP ZAP)
- [ ] Load test: 500 concurrent users; p95 < 500ms
- [ ] Timetable generation < 30s for VNSGU CS dept
- [ ] All 7 panels accessible in production
- [ ] Smart contract deployed to Polygon Mainnet
- [ ] Both university public portals live on custom domains

---

## 9. Post-MVP Roadmap

| Version | Target Date | Key Features |
|---|---|---|
| v2.1 | 3 months post-launch | Alumni management, hostel management, full bus tracking (IoT GPS), behaviour ratings, canteen module |
| v2.2 | 6 months post-launch | Face recognition attendance (on-premise), BLE beacon integration, smart hostel RFID |
| v2.3 | 9 months post-launch | Predictive enrolment (LSTM), multi-objective scheduling (NSGA-II), AI campus analytics |
| v3.0 | 12 months post-launch | Native iOS / Android apps, multi-language (Hindi + Gujarati), ERP integration (SAP/Oracle), Decentralised Identity (DID), Multi-chain blockchain |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
