# 09 — Engineering Scope Definition

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. MVP Scope Summary

The NEP-Scheduler MVP is a **fully functional web platform** delivering all four user panels (Superadmin, University Admin, Department Admin, Faculty) with complete CRUD operations, conflict-free timetable generation using OR-Tools CP-SAT, special timetable with resource exclusion, PDF export, and real-time updates via WebSocket.

The MVP is designed to fully support the **VNSGU Computer Science Department use case** out-of-the-box.

---

## 2. In-Scope for MVP (v1.0)

### 2.1 Authentication & Authorization

| Feature | Details |
|---|---|
| JWT-based login for all 4 roles | Role selector on login page; JWT with 8-hour expiry |
| Role-Based Access Control (RBAC) | Per-panel route guards; API middleware enforcement |
| Password management (self + admin) | bcrypt hashing (cost 12); admin reset without current password |
| Session management | Redis-backed sessions; logout invalidates all sessions for user |
| Audit logging | All user actions logged with timestamp, IP, and user agent |

### 2.2 Super Admin Panel

| Feature | Details |
|---|---|
| University CRUD | Create with auto-generated admin credentials; edit; delete |
| Credentials management | View/change credentials for any user at any level |
| Cross-university timetable trigger | Generate timetables for any university/department from superadmin |
| Global timetable view | View all timetables across all universities with filtering |
| Global department/faculty view | Read access to all departments and faculty |

### 2.3 University Admin Panel

| Feature | Details |
|---|---|
| Department CRUD | Create departments with auto-generated dept admin credentials |
| Program management | UG, PG, Diploma, Ph.D, FYUP program types |
| Faculty pool management | Add faculty, assign subjects, set max hours per day/week |
| Resource management | Classrooms and labs with type and capacity |
| Batch management | Student groups with program, semester, division, strength |
| Course management | Theory, Lab, Theory+Lab types with credits and weekly hours |
| University timetable view | View all timetables within own university |
| Stats dashboard | Department-wise faculty count, course count, timetable count |

### 2.4 Department Admin Panel

| Feature | Details |
|---|---|
| Department-scoped CRUD | Faculty, courses, batches, resources within own dept |
| Standard timetable generation | Configurable time params; OR-Tools CP-SAT generation; conflict-free guarantee |
| Special timetable generation | Exclude specific faculty/rooms; auto-reassign; mark unassignable courses |
| Timetable grid view | Day × slot grid per batch with color-coded slot types |
| PDF export | Client-side jsPDF + html2canvas; A4 landscape; university branding |
| Print support | Print-optimized CSS layout |
| Workload summary | Hours per faculty vs. max allowed; utilization percentage |

### 2.5 Faculty Portal

| Feature | Details |
|---|---|
| Personal timetable view | Weekly grid showing only own assigned classes |
| Profile management | Edit name, email, phone, designation |
| Credential management | Change own username and password |
| Real-time schedule updates | WebSocket subscription for live changes |

### 2.6 Timetable Engine

| Feature | Details |
|---|---|
| OR-Tools CP-SAT solver | Google OR-Tools 9.9.x; CP-SAT (Constraint Programming + SAT) |
| All 8 hard constraints | HC-01 through HC-09 (faculty, room, batch, capacity, type, hours) |
| Soft constraint optimization | Workload variance minimization via objective function |
| Configurable time slots | Start/end time, lecture duration, break duration, break position, days per week |
| Special timetable mode | Faculty and room exclusion; unassignable course identification |
| Conflict guarantee | Generation fails (422) if any hard constraint violated; 0 conflicts guaranteed |
| Generation locking | Redis distributed lock prevents concurrent generation for same department |

### 2.7 Real-Time Updates

| Feature | Details |
|---|---|
| WebSocket (Socket.io) | Rooms per: university, department, faculty, superadmin |
| Timetable generated event | All connected users in dept room notified |
| Timetable updated event | Personal schedule updated in real-time |
| < 2 second latency | Event propagation target from server event to browser |

### 2.8 PDF Export & Print

| Feature | Details |
|---|---|
| Client-side PDF generation | jsPDF + html2canvas captures rendered timetable grid |
| A4 Landscape format | Standard print-ready format with university name and generation date |
| Print CSS | `@media print` styles; hide UI controls; optimize for paper |
| Download within 5 seconds | Performance target for complete PDF generation and download |

---

## 3. Out of Scope for MVP (v1.0)

The following features are explicitly excluded from the MVP and documented for v2.0 roadmap:

| Feature | Reason | Target Version |
|---|---|---|
| Student self-registration portal | Not required for core admin/faculty workflow | v2.0 |
| Student-facing timetable view | Students receive PDF from admin in v1 | v2.0 |
| Mobile native apps (iOS/Android) | Web-responsive UI sufficient for MVP | v2.0 |
| ERP/HRMS integration | Manual data entry acceptable for first 5 universities | v2.0 |
| AI substitute faculty recommendation | Special TT shows gaps; admin selects manually | v2.0 |
| Email/SMS push notifications | WebSocket sufficient for v1 | v2.0 |
| Excel export (.xlsx) | PDF export covers MVP needs | v2.0 |
| iCal/Google Calendar sync | Low priority for initial rollout | v3.0 |
| Analytics dashboard | Basic stats on dashboard sufficient | v2.0 |
| Multi-university comparison reports | Superadmin global view sufficient | v2.0 |
| Multi-language support (Hindi/Gujarati) | English only for v1 | v2.0 |
| Examination scheduling | Separate product area | Future |
| Fee/payroll/HR management | Out of product scope | Never |
| SSO / OAuth social login | Username/password sufficient for enterprise use case | v2.0 |
| MFA (Multi-Factor Authentication) | Basic security sufficient for MVP | v2.0 |
| NEP compliance accreditation reports | Basic NEP validation available; formatted reports deferred | v2.0 |

---

## 4. Technology Stack In-Scope for MVP

### Frontend (apps/web)

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.x | SSR + App Router + API routes as BFF |
| React | 18.3.x | Component model, hooks, concurrent features |
| TypeScript | 5.4.x | Type safety, shared types via monorepo |
| Tailwind CSS | 3.4.x | Utility-first styling |
| shadcn/ui + Radix | Latest | Accessible UI components |
| Zustand | 4.5.x | Lightweight global state management |
| TanStack Query | 5.x | Server state caching and invalidation |
| React Hook Form + Zod | Latest | Form validation |
| Socket.io Client | 4.7.x | WebSocket with fallback |
| jsPDF + html2canvas | Latest | Client-side PDF generation |

### Backend API (apps/api)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express.js | 4.18.x | HTTP framework |
| TypeScript | 5.4.x | Type safety |
| Prisma ORM | 5.x | Type-safe database access |
| jsonwebtoken | 9.x | JWT issuance and verification |
| bcrypt | 5.x | Password hashing (cost factor 12) |
| Socket.io Server | 4.7.x | WebSocket server |
| BullMQ | 5.x | Background job queue (PDF generation) |
| ioredis | 5.x | Redis client |
| helmet | 7.x | Security headers |
| express-rate-limit | 7.x | API rate limiting (100 req/15min) |

### AI Engine (apps/ai-engine)

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11.x | Runtime |
| FastAPI | 0.110.x | HTTP framework |
| Google OR-Tools | 9.9.x | CP-SAT constraint solver |
| scikit-learn | 1.4.x | ML models |
| XGBoost | 2.0.x | Slot preference prediction |
| Pydantic | 2.6.x | Request/response validation |

### Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15.x | Primary OLTP database |
| Redis | 7.x | Cache, sessions, locks |
| Docker + Docker Compose | 25.x / 2.x | Local development |
| GitHub Actions | — | CI/CD |
| Vercel | — | Frontend hosting (MVP) |
| Railway / Render | — | API + AI Engine hosting (MVP) |

---

## 5. Known System Limits (MVP)

| Constraint | Limit | Scalability Path |
|---|---|---|
| Max faculty per department | 50 | Increase solver time limit |
| Max courses per timetable | 20 | Decompose into sub-problems |
| Max batches per generation | 10 | Parallel solver instances |
| Max time slots per day | 12 | Configurable; UI renders 12 cleanly |
| Concurrent generations per dept | 1 (Redis lock) | Intentional design decision |
| PDF max size | 5 MB | Compress images for larger departments |
| WebSocket connections per pod | 1,000 | Redis adapter enables horizontal scaling |
| Solver time limit | 30 seconds | Configurable: 10–120 seconds |
| Max universities | 10 (MVP) | 10,000 with schema-per-tenant automation |

---

## 6. Technical Debt Logged for v2

| Item | Priority | Estimated Effort |
|---|---|---|
| Migrate from Redis Pub/Sub to Kafka for all events | Medium | 2 weeks |
| Add comprehensive ML model retraining pipeline | High | 4 weeks |
| Implement AI substitute faculty recommendation | High | 3 weeks |
| Add Excel export format | Medium | 1 week |
| Build student-facing read-only portal | High | 3 weeks |
| Add multi-language support (Hindi + Gujarati) | Medium | 4 weeks |
| Implement mobile-responsive PWA | High | 3 weeks |
| Add comprehensive analytics dashboard | Medium | 3 weeks |
| Add iCal export for calendar sync | Low | 1 week |
| Implement Google Calendar / Outlook integration | Low | 2 weeks |

---

## 7. Definition of Done (MVP Launch)

The MVP is considered launch-ready when all of the following are verified:

- [ ] All four panels (Superadmin, Uni Admin, Dept Admin, Faculty) fully functional
- [ ] CRUD operations for all entities: universities, departments, programs, faculty, courses, batches, resources
- [ ] Faculty-to-course subject assignment working
- [ ] Standard timetable generation with 0 conflicts for VNSGU CS Department test case
- [ ] Special timetable correctly handles Dharmen Shah absent scenario
- [ ] PDF download working and formatted correctly (A4 Landscape)
- [ ] Print functionality working with print-optimized CSS
- [ ] Real-time WebSocket updates propagating to connected faculty
- [ ] JWT authentication with role-based access control enforced on all endpoints
- [ ] Cross-tenant data isolation verified (Uni Admin cannot see other university's data)
- [ ] Passwords hashed with bcrypt cost factor 12
- [ ] All actions logged in audit_logs table
- [ ] 500 concurrent users supported without degradation (k6 load test passing)
- [ ] Generation time < 30 seconds for VNSGU test dataset
- [ ] PDF generation < 5 seconds
- [ ] API response times p95 < 500ms
- [ ] OWASP ZAP security scan completed; critical findings resolved
- [ ] VNSGU demo environment seeded and accessible

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
