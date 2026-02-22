# 10 — Development Phases

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Overview

The NEP-Scheduler MVP is delivered in **6 sequential phases over ~16 weeks**. Each phase has clear deliverables, acceptance criteria, and a team handoff point. Phases are designed so each one produces a testable, demoable increment.

| Phase | Name | Duration | Weeks |
|---|---|---|---|
| Phase 1 | Foundation | 3 weeks | W1–W3 |
| Phase 2 | Core CRUD | 4 weeks | W4–W7 |
| Phase 3 | Scheduling Engine | 3 weeks | W8–W10 |
| Phase 4 | Frontend TT View | 2 weeks | W11–W12 |
| Phase 5 | Special TT + Real-Time | 2 weeks | W13–W14 |
| Phase 6 | Testing & Launch | 2 weeks | W15–W16 |
| **Total** | | **~16 weeks** | |

---

## 2. Phase 1 — Foundation (Weeks 1–3)

### Goal
Establish all infrastructure, developer tooling, authentication, and database schema so the team can build feature work without blockers.

### Deliverables

| Deliverable | Description |
|---|---|
| Monorepo setup (Turborepo + pnpm) | Root structure, apps/web, apps/api, apps/ai-engine, packages/types, packages/validation |
| Docker Compose (local dev) | PostgreSQL 15, Redis 7, Kafka (optional), all apps |
| GitHub Actions CI pipeline | Lint, type-check, unit tests on every PR |
| Database schema + Prisma | All models: University, Department, Faculty, Course, Batch, Resource, Timetable, TimetableSlot, User, AuditLog |
| Prisma migrations | Initial migration applied; schema versioned |
| Auth service | POST /v1/auth/login, JWT generation, bcrypt password hashing, RBAC middleware |
| VNSGU seed script | Pre-load all test data (9 faculty, 7 courses, 2 batches, 5 rooms) |
| Environment configuration | .env files for web, api, ai-engine documented and templated |
| Basic Next.js app | Login page with role selector; authenticated session cookie |
| Route protection middleware | Next.js middleware: redirect unauthenticated users to /login |

### Acceptance Criteria
- All four roles can log in and be redirected to their respective panel routes
- JWT tokens decode correctly with role, entityId, universityId, departmentId
- VNSGU seed data visible in database
- Docker Compose `up` starts all services without errors
- CI pipeline passes on a clean branch

---

## 3. Phase 2 — Core CRUD (Weeks 4–7)

### Goal
Build all four panels with complete Create/Read/Update/Delete operations for every entity. At the end of Phase 2, a user can fully configure a university and department with all required data for timetable generation.

### Deliverables

#### Super Admin Panel (`/superadmin`)
- University listing, add, edit, delete
- Auto-generated admin credentials on university creation (displayed on screen)
- Credentials management page (view/reset any user at any level)
- Global departments view (read-only)
- Global faculty view (read-only)

#### University Admin Panel (`/dashboard`)
- Department CRUD (with auto-generated dept admin credentials)
- Program management (UG, PG, FYUP, Diploma, Ph.D)
- Faculty pool: add, edit, delete, subject assignment
- Resource management: classrooms and labs with type and capacity
- Batch management: program, semester, division, year, strength
- Course management: name, code, credits, weeklyHrs, type (Theory/Lab/Theory+Lab)
- Stats dashboard: counts per department

#### Department Admin Panel (`/department`)
- Department-scoped views of faculty, courses, batches, resources
- Faculty CRUD within own department
- Course assignment within own department
- Batch management within own department
- All pages display correct data scope (own dept only)

#### Faculty Portal (`/faculty-panel`)
- Profile view and edit (name, email, phone, designation)
- Credential change form (current password required)

### Acceptance Criteria
- Full CRUD working for all entities across all panels
- Data scope enforced: Uni Admin cannot see/modify other universities
- Dept Admin cannot see/modify other departments
- Faculty can only see/edit own profile
- Audit log entries created for all write operations
- Password change invalidates existing sessions

---

## 4. Phase 3 — Scheduling Engine (Weeks 8–10)

### Goal
Implement the Python OR-Tools CP-SAT scheduling engine and integrate it with the Node.js API. At the end of Phase 3, a department admin can generate a conflict-free timetable with a single click.

### Deliverables

#### AI Engine (apps/ai-engine)
- FastAPI app with `POST /solve` endpoint
- `generate_time_slots()` function based on config parameters
- `TimetableScheduler` class with all 9 hard constraints implemented
- Soft constraint: workload variance minimization (`Minimize(max_load - min_load)`)
- Solution extractor: convert solver output to structured slot list
- Unassignable course detection and reporting
- Solver time limit: 30 seconds (configurable)
- `GET /health` endpoint for health checks

#### Node.js API Integration
- `POST /v1/timetables/generate` endpoint
- Redis distributed lock (TTL 60s) to prevent concurrent generation
- Fetch dept data from PostgreSQL → call AI Engine → save result to DB
- Publish `timetable.generated` event (Redis pub/sub for MVP)
- Response: timetableId, slots[], workloadStats, timeSlots[]
- Error handling: solver infeasible → 422 with conflict details

#### Database
- Timetable and TimetableSlot records persisted after generation
- `configJson` stores generation parameters for reproducibility

### Acceptance Criteria
- VNSGU CS test case generates successfully (7 courses, 9 faculty, 2 batches) in < 30 seconds
- Zero hard constraint violations (no faculty/room/batch double-booking)
- Workload variance across 9 faculty < 2 hours/week
- Redis lock prevents duplicate generation for same department
- Dharmen Shah assigned iOS (Div A) and .Net (Div B) without overlap — HC-01 verified

---

## 5. Phase 4 — Frontend Timetable View (Weeks 11–12)

### Goal
Build the visual timetable display components, PDF export, and print functionality. At the end of Phase 4, users can view, download, and print fully formatted timetables.

### Deliverables

#### Timetable Grid Component
- `TimetableGrid.tsx`: responsive Day × Time Slot grid
- `TimetableCell.tsx`: individual slot display (course, faculty, room, batch)
- Color coding: THEORY (blue), LAB (purple), BREAK (amber)
- Batch selector: filter grid per batch/division
- Faculty view mode: show batch+room (for faculty personal schedule)
- Empty slots render as clean empty cells

#### PDF Export
- `TimetableExport.tsx`: Download PDF and Print buttons
- jsPDF + html2canvas: capture rendered grid as PDF
- A4 Landscape format with university name and generation date header
- PDF generation < 5 seconds target

#### Print Support
- `@media print` CSS: hide sidebar, topbar, export buttons
- Print-ready layout on A4 landscape

#### Workload Display
- `WorkloadBadge.tsx`: faculty workload indicator (hours/max)
- Workload summary table below timetable grid
- Color-coded: green (under 70%), amber (70–90%), red (>90%)

#### Faculty Personal Schedule View
- `/faculty-panel` page renders `TimetableGrid` in faculty mode
- Shows only own slots; correct time slot rendering

### Acceptance Criteria
- Timetable grid renders correctly for VNSGU MCA Sem 2 (5 days × 7 slots)
- No horizontal scroll on 1366×768 screens
- PDF downloads with correct formatting within 5 seconds
- Print dialog produces clean A4 landscape output
- Faculty panel shows only own slots (Rustam sees only Blockchain classes)
- All 4 panels display timetables from their correct data scope

---

## 6. Phase 5 — Special Timetable & Real-Time (Weeks 13–14)

### Goal
Implement the Special Timetable feature (resource exclusion) and all real-time WebSocket functionality. At the end of Phase 5, the system handles faculty absence scenarios and pushes live updates to connected users.

### Deliverables

#### Special Timetable

**Frontend (`/department/special`)**
- Faculty checkbox list with subject assignments shown
- Room checkbox list
- On faculty exclusion: preview affected courses + alternate faculty availability
- Generate button triggers special timetable request
- Result display: amber highlighting for changed slots; red "No Faculty Available" for unassignable
- PDF export and print for special timetable

**Backend API**
- `POST /v1/timetables/special` endpoint
- Passes `excluded_faculty_ids` and `excluded_room_ids` to AI engine
- AI engine filters decision variables accordingly
- Returns `unassignableCourses[]` and `reassignedSlots[]` in response
- `isSpecial: true` flag stored on Timetable record

**AI Engine**
- `TimetableScheduler` special mode (exclusion lists passed to constructor)
- Unassignable course detection
- Solver runs on reduced variable space

#### Real-Time WebSocket

**Socket.io Setup**
- `/timetables` namespace on Node.js API server
- Rooms: `uni-{universityId}`, `dept-{departmentId}`, `faculty-{facultyId}`, `superadmin`
- Redis adapter for horizontal Socket.io scaling

**Events**
- `timetable:generated` → broadcast to dept room on new timetable
- `timetable:updated` → broadcast to dept room on changes
- `schedule:updated` → broadcast to individual faculty room

**Frontend**
- `useRealtimeUpdates.ts` hook: auto-join correct room based on user role
- Toast notification on `timetable:generated` / `schedule:updated`
- Automatic TanStack Query cache invalidation on WebSocket event

### Acceptance Criteria
- VNSGU special timetable: Dharmen Shah excluded → Jayshree assigned to .Net; iOS marked "No Faculty Available"
- Changed slots visually differentiated (amber) from unchanged slots
- PDF export works for special timetable
- Faculty portal auto-updates schedule when timetable is regenerated (< 2 second latency)
- Dept Admin receives WebSocket notification when superadmin triggers generation for their dept

---

## 7. Phase 6 — Testing & Launch (Weeks 15–16)

### Goal
Complete QA testing, performance validation, security testing, and production deployment. Ship MVP.

### Deliverables

#### Test Execution
- Unit tests passing (≥ 80% line coverage) — Jest
- Integration tests passing (≥ 70% API coverage) — Supertest
- E2E tests passing for all 4 panel flows — Playwright
- Load test: 500 concurrent users, generation + API response time targets — k6
- Conflict validation: 0 conflicts in 100 randomly generated timetables
- Security scan: OWASP ZAP against staging environment; critical findings resolved

#### Production Deployment
- Frontend deployed to Vercel with production environment variables
- API deployed to Railway/Render with production environment variables
- AI Engine deployed to Railway/Render (1GB RAM minimum)
- PostgreSQL on Supabase or Neon with production credentials
- Redis on Upstash
- Cloudflare CDN + SSL configured on custom domain
- Production seed data: VNSGU demo environment live

#### Documentation
- README.md with setup instructions
- Demo video walkthrough (Loom / recorded screencast)
- Admin handover document with demo credentials

#### Go-Live Checklist
- [ ] All Phase 1–5 acceptance criteria verified on staging
- [ ] Production environment variables set and secrets secured
- [ ] Database migrations applied to production
- [ ] VNSGU demo data seeded in production
- [ ] SSL/TLS configured; HTTP → HTTPS redirect active
- [ ] Health check endpoints responding on all services
- [ ] Rate limiting active (100 req/15min per IP)
- [ ] Audit logging writing to production database
- [ ] Monitoring alerts configured (API errors, generation failures)
- [ ] Rollback procedure documented and tested

---

## 8. Milestone Summary

| Milestone | Target Date | Criteria |
|---|---|---|
| M1: Auth + DB Ready | End of W3 | Login works for all 4 roles; VNSGU seed data loaded |
| M2: All CRUD Panels Live | End of W7 | Full CRUD for all entities across all 4 panels |
| M3: Engine Working | End of W10 | VNSGU standard TT generates in < 30s with 0 conflicts |
| M4: TT View + PDF | End of W12 | Grid renders; PDF downloads; faculty views own schedule |
| M5: Special TT + WS | End of W14 | Special TT works; real-time updates propagate |
| M6: MVP Launch | End of W16 | All tests passing; deployed to production; VNSGU live |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
