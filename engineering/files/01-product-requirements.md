# 01 — Product Requirements Document

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Product Vision & Mission

**Vision:** To become the definitive AI-powered academic scheduling platform for every Indian university — eliminating scheduling conflicts, reducing administrative burden by 90%, and creating fair, NEP 2020-compliant timetables that maximize learning outcomes.

**Mission:** Empower academic institutions with an intelligent, real-time timetable scheduling system that combines the mathematical precision of Constraint Programming with the adaptability of AI/ML — making conflict-free scheduling accessible, transparent, and compliant with NEP 2020 mandates.

### Problem Statement

Indian universities today face critical scheduling challenges:

- **Manual scheduling** takes 2–4 weeks per semester using Excel or paper
- **Conflicts discovered late** — after printing and distribution, causing cascading changes
- **Faculty workload imbalance** — no systematic fairness enforcement across faculty
- **No real-time adaptability** — sudden faculty absence or room unavailability causes chaos
- **NEP 2020 non-compliance** — multidisciplinary and FYUP requirements ignored by legacy tools
- **Zero transparency** — students and faculty have no digital access to schedules

### Value Proposition

| Stakeholder | Value Delivered |
|---|---|
| University Administration | Reduce scheduling time from weeks to minutes; ensure NEP compliance automatically |
| Department HODs | Perfect workload balance; real-time special scheduling for emergencies |
| Faculty Members | Fair, predictable schedules; instant access to personal timetable; transparent changes |
| Students | Digital access to accurate, always-current class schedules |
| Super Admin / Platform | Centralized multi-university management; global visibility and control |

---

## 2. Target Personas

### 2.1 Primary Personas

| Persona | Role | Primary Goals | Key Pain Points |
|---|---|---|---|
| **Superadmin Shreya** | Platform Administrator | Manage all university tenants; monitor system health; control all credentials | No centralized view; manual credential management; no audit trail |
| **VC Dr. Patel** | University Admin / Vice-Chancellor | Generate university-wide timetables; manage departments; ensure NEP compliance | Manual Excel scheduling takes 2 weeks; conflicts discovered only after printing |
| **HOD Dr. Shah** | Department Admin / HOD | Schedule MCA timetable; balance faculty load; handle sudden substitutions | Faculty workload imbalance; last-minute changes cause cascading conflicts |
| **Prof. Rustam** | Faculty Member | View personal weekly schedule; get notified of changes; update profile | No single source of truth; schedule changes communicated via WhatsApp |
| **Student Aryan** | MCA Student (Div A) | See class schedule; know room numbers; get notified of cancellations | Outdated printed timetables; no digital access; room confusion |

### 2.2 Secondary Personas

| Persona | Role | Interaction with System |
|---|---|---|
| University Registrar | Data entry & compliance | Uses University Admin panel to manage records and generate accreditation reports |
| IT Admin | System configuration | Works with Super Admin to configure university tenants and infrastructure |
| NAAC/UGC Auditor | Compliance verification | Reviews exported reports; accesses compliance summaries |

---

## 3. Feature Requirements

### Feature Priority Matrix

| Feature ID | Feature | Priority | Panel | MVP? |
|---|---|---|---|---|
| F-001 | Super Admin: University provisioning & management | P0 — Critical | Superadmin | ✅ Yes |
| F-002 | Super Admin: Credential management (all levels) | P0 — Critical | Superadmin | ✅ Yes |
| F-003 | Super Admin: Trigger timetable generation per university | P0 — Critical | Superadmin | ✅ Yes |
| F-004 | Super Admin: View all timetables globally | P0 — Critical | Superadmin | ✅ Yes |
| F-005 | Uni Admin: Department & program CRUD | P0 — Critical | University | ✅ Yes |
| F-006 | Uni Admin: Faculty pool management | P0 — Critical | University | ✅ Yes |
| F-007 | Uni Admin: Classroom & lab resource management | P0 — Critical | University | ✅ Yes |
| F-008 | Uni Admin: Batch management | P0 — Critical | University | ✅ Yes |
| F-009 | Uni Admin: Course management | P0 — Critical | University | ✅ Yes |
| F-010 | Dept Admin: Department-scoped faculty/course management | P0 — Critical | Department | ✅ Yes |
| F-011 | Dept Admin: Conflict-free timetable generation | P0 — Critical | Department | ✅ Yes |
| F-012 | Dept Admin: Special timetable (unavailable resources) | P0 — Critical | Department | ✅ Yes |
| F-013 | Dept Admin: View generated timetable in UI grid | P0 — Critical | Department | ✅ Yes |
| F-014 | PDF export of timetable (download + print) | P0 — Critical | All Admin | ✅ Yes |
| F-015 | Faculty: Personal timetable view (weekly grid) | P0 — Critical | Faculty | ✅ Yes |
| F-016 | Faculty: Profile & credential management | P0 — Critical | Faculty | ✅ Yes |
| F-017 | AI workload balancing across faculty | P1 — High | Auto | ✅ Yes |
| F-018 | Real-time timetable updates via WebSocket | P1 — High | All | ✅ Yes |
| F-019 | NEP 2020 compliance validation report | P1 — High | Uni Admin | ✅ Yes |
| F-020 | Configurable time slots (start/end/duration/break) | P0 — Critical | All Admin | ✅ Yes |
| F-021 | AI substitute faculty recommendation | P1 — High | Dept Admin | ❌ No |
| F-022 | Student-facing timetable view (read-only) | P2 — Medium | Student | ❌ No |
| F-023 | Mobile app (iOS + Android) | P2 — Medium | All | ❌ No |
| F-024 | Calendar sync (Google Calendar / Outlook) | P3 — Low | Faculty | ❌ No |
| F-025 | Analytics dashboard (utilization, trends) | P2 — Medium | Uni Admin | ❌ No |
| F-026 | Multi-university comparison reports | P3 — Low | Superadmin | ❌ No |

---

## 4. Four-Panel Specifications

### Panel 1: Global Super Admin (`/superadmin`)

**Access:** Single global superadmin account (username/password set in system config)

| Section | Features |
|---|---|
| **Universities** | List all universities; Add new university with auto-generated admin credentials; Edit/Delete university; View per-university stats |
| **Credentials Management** | View/Change university admin username & password; View/Change all department admin and faculty credentials; Bulk credential reset |
| **All Departments** | View all departments across all universities; View HOD, faculty count, course count per dept |
| **All Faculty** | View all faculty across all universities; Filter by university/department |
| **Timetable Trigger** | Select a university → Select department → Configure time params → Generate timetable |
| **All Timetables** | View all generated timetables globally; Filter by university, department, date |

**Data Scope:** Full global read/write access to all universities, departments, faculty, timetables, and credentials.

---

### Panel 2: University Admin (`/dashboard`)

**Access:** Login with university-specific admin credentials created by Super Admin

| Section | Features |
|---|---|
| **Overview Dashboard** | Stats: dept count, faculty count, course count, timetable count; University profile card |
| **Departments** | Add/Edit/Delete departments; Set department admin credentials |
| **Programs** | Add/Edit/Delete academic programs (MCA, B.Ed., M.Ed., FYUP, ITEP, etc.) |
| **Faculty Pool** | Add/Edit/Delete faculty across all departments; Assign subjects; Set max hours |
| **Classrooms & Labs** | Add/Edit/Delete physical resources; Set type (Classroom/Lab), capacity, floor |
| **Batches** | Add/Edit/Delete student batches; Set program, semester, division, year, strength |
| **Courses** | Add/Edit/Delete courses; Set subject code, program, credits, weekly hours, type |
| **Generate Timetable** | Configure time params → Generate for entire university |
| **View Timetables** | View all timetables; Select batch/dept filter; Download PDF; Print |

**Data Scope:** Own university only. No access to other universities.

---

### Panel 3: Department Admin (`/department`)

**Access:** Login with department-specific credentials created by University Admin or Super Admin

| Section | Features |
|---|---|
| **Department Overview** | Stats: faculty count, courses count, batches count, active timetables |
| **Faculty Management** | Add/Edit/Delete faculty within own department; Assign subjects; Manage credentials |
| **Course Management** | Add/Edit/Delete courses for own department; Set code, credits, type |
| **Resource Management** | View and manage classrooms/labs assigned to own department |
| **Batch Management** | Add/Edit/Delete batches for own department |
| **Generate Timetable** | Configure: time start/end, lecture duration, break → Generate → View → Download PDF → Print |
| **Special Timetable** | Select unavailable faculty/rooms → Generate alternative conflict-free timetable → View → Download PDF |
| **View Timetables** | View all generated timetables for own dept; Switch between standard and special timetables |

**Data Scope:** Own department only. No access to other departments or universities.

---

### Panel 4: Faculty Portal (`/faculty-panel`)

**Access:** Login with individual faculty credentials

| Section | Features |
|---|---|
| **My Timetable** | Weekly grid showing only own classes; Day × Time slot view; Subject, room, batch info; Read-only |
| **My Profile** | View and edit personal details: name, email, phone, designation |
| **Change Password** | Change own username; Change own password (requires current password verification) |

**Data Scope:** Only own scheduled classes and profile. No access to other faculty schedules or management functions.

---

## 5. Non-Functional Requirements

### Performance

| NFR ID | Requirement | Target | Measurement |
|---|---|---|---|
| NFR-P01 | Timetable generation time | < 30 seconds for up to 20 faculty, 10 courses, 2 batches | End-to-end from click to display |
| NFR-P02 | Page load time (initial) | < 3 seconds on 4G connection | Lighthouse Performance Score > 85 |
| NFR-P03 | API response time (p95) | < 500ms for all read endpoints | APM monitoring |
| NFR-P04 | PDF generation time | < 5 seconds for a weekly timetable | Measured from request to download start |
| NFR-P05 | Real-time update propagation | < 2 seconds from event to all connected clients | WebSocket latency measurement |
| NFR-P06 | Concurrent user capacity (MVP) | 500 simultaneous users without degradation | Load testing with k6 |

### Security

| NFR ID | Requirement | Standard |
|---|---|---|
| NFR-S01 | Passwords must be hashed with bcrypt (cost factor ≥ 12) | OWASP Authentication |
| NFR-S02 | All communications must use TLS 1.3 or higher | NIST SP 800-52 |
| NFR-S03 | JWT tokens must expire after 8 hours; refresh tokens after 30 days | RFC 6749 |
| NFR-S04 | All user actions must be logged with timestamp and IP address | Audit Compliance |
| NFR-S05 | Cross-tenant data access must be impossible at the API level | Multi-tenant Security |
| NFR-S06 | VAPT testing before production launch | ISO 27001 |
| NFR-S07 | DPDP Act 2023 compliance for all personal data handling | Indian Data Protection Law |

### Usability

| NFR ID | Requirement |
|---|---|
| NFR-U01 | Timetable grid must be viewable without horizontal scroll on 1366×768 screens |
| NFR-U02 | All primary actions reachable within 3 clicks from login |
| NFR-U03 | PDF download must work without any additional software installation |
| NFR-U04 | Print functionality must use print-optimized CSS layout (A4 landscape) |
| NFR-U05 | Error messages must clearly indicate the problem and suggest remediation |
| NFR-U06 | Loading states must be shown for all operations > 300ms |

---

## 6. NEP 2020 Compliance Requirements

| NEP 2020 Mandate | System Support | Implementation |
|---|---|---|
| Multidisciplinary learning | Cross-department elective scheduling | Courses can span multiple departments; interdisciplinary batch support |
| FYUP (4-year UG program) | Multi-year program tracking | Program type selector with FYUP; exit point management |
| Credit-based system | Credit-hour enforcement | Weekly hours derived from credits; soft constraint for credit alignment |
| Flexible curriculum | Dynamic elective slots | Elective pools in batch configuration; AI assigns based on preference |
| Faculty workload norms | Max hours per week enforcement | Hard constraint: no faculty exceeds UGC-mandated teaching hours (14–16 hrs/week for PG) |
| Academic calendar alignment | Semester-based scheduling | Start/end dates, working days, holiday exclusion configuration |
| B.Ed./M.Ed./ITEP support | Program-specific constraints | Configurable constraints per program type |
| FYUP exit points | Year-wise scheduling support | Separate timetable configurations for Year 1, 2, 3, 4 with shared resource pool |

---

## 7. Timetable Generation Requirements

### Input Parameters

| Parameter | Description | Example | Validation |
|---|---|---|---|
| `departmentId` | Target department | `dept-cs-vnsgu` | Must exist and have faculty + courses |
| `batchIds` | One or more batches to schedule | `[b1, b2]` | Must have ≥ 1 batch |
| `startTime` | Daily schedule start | `09:00` | 24h format, must be before endTime |
| `endTime` | Daily schedule end | `17:00` | 24h format, must be after startTime |
| `lectureDuration` | Minutes per lecture slot | `60` | 50, 60, 75, or 90 minutes |
| `breakDuration` | Minutes for break | `60` | 15, 30, 45, or 60 minutes |
| `breakAfterLecture` | Break position | `2` | After 2nd, 3rd, or 4th lecture |
| `daysPerWeek` | Working days | `5` | 5 (Mon–Fri) or 6 (Mon–Sat) |

### Output Requirements

| Output | Description |
|---|---|
| Timetable Grid | Visual grid: days (columns) × time slots (rows) per batch |
| Faculty View | Personal weekly schedule per faculty member |
| Conflict Report | Must show 0 conflicts; if any found, generation fails with detailed report |
| Workload Summary | Hours assigned per faculty per week vs. max allowed |
| Room Utilization | Percentage utilization per classroom/lab |
| JSON Export | Machine-readable format for API consumers |
| PDF Export | Printable A4 Landscape format with university branding |

### Special Timetable Requirements

| Requirement | Description |
|---|---|
| Faculty exclusion | Admin can select 1 or more faculty to exclude from schedule |
| Room exclusion | Admin can select 1 or more rooms/labs to exclude |
| Conflict indicator | Courses that cannot be covered (no alternate faculty) must be clearly marked |
| Alternate assignment | Subjects with multiple qualified faculty must be auto-reassigned |
| Visual differentiation | Changed slots highlighted differently from original timetable |
| Download/Print | Same PDF export capability as standard timetable |

---

## 8. Out of Scope (v1.0)

- Student self-registration and student-facing portal
- Mobile native applications (iOS/Android)
- Integration with University ERP/HRMS systems
- Fee management or examination scheduling
- Video conferencing integration (Zoom/Teams)
- AI-based student performance prediction
- Multi-language support (English only in v1)
- Payroll or HR management features
- Alumni management
- Library management integration

---

## 9. Success Metrics & KPIs

| Metric | Baseline (Manual) | MVP Target (6 months) | Scale Target (12 months) |
|---|---|---|---|
| Time to generate timetable | 2–4 weeks | < 2 minutes | < 30 seconds |
| Scheduling conflicts at launch | 10–30 conflicts typical | 0 conflicts guaranteed | 0 conflicts guaranteed |
| Faculty workload variance | High (no control) | < 2 hrs/week difference | < 1 hr/week difference |
| Universities onboarded | N/A | 5 universities | 50 universities |
| Active faculty users | N/A | 200 faculty | 5,000 faculty |
| Timetables generated/month | N/A | 50 | 2,000 |
| NPS Score (Admin users) | N/A | > 40 | > 60 |
| PDF download usage | N/A | > 80% of timetables | > 90% of timetables |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
