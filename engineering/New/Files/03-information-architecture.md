# 03 — Information Architecture

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Panel Hierarchy Overview

```
Platform Root
│
├── /login                          — Universal login (role selector + Firebase / Keycloak auth)
│
├── /superadmin                     — Global Super Admin Panel
│   ├── /universities               — University CRUD + public portal config
│   ├── /credentials                — Credential management (all roles, all universities)
│   ├── /analytics                  — Platform-wide analytics and KPIs
│   ├── /billing                    — SaaS subscription management
│   └── /timetables                 — All timetables globally (filterable by university/dept)
│
├── /dashboard                      — University Admin Panel
│   ├── /departments                — Department CRUD
│   ├── /programs                   — Academic program management
│   ├── /faculty                    — University-wide faculty pool
│   ├── /students                   — Student management & admission workflow
│   ├── /courses                    — Course catalog
│   ├── /exams                      — Exam timetable, hall tickets, invigilators
│   ├── /finance                    — Fees, payroll, HR billing, budget, BI
│   ├── /results                    — Result publication with blockchain hash
│   ├── /compliance                 — NAAC, NIRF, government compliance dashboards
│   ├── /placement                  — Company partnerships, placement statistics
│   ├── /communication              — Internal announcements, inter-college messaging
│   └── /performance                — University performance dashboard
│
├── /department                     — Department / College Admin Panel
│   ├── /timetable                  — Timetable viewer
│   │   ├── /generate               — Standard timetable generation form
│   │   └── /special                — Special timetable with resource exclusion
│   ├── /faculty                    — Dept-scoped faculty management
│   ├── /students                   — Dept-scoped student management
│   ├── /courses                    — Dept-scoped course management
│   ├── /resources                  — Classrooms and lab management
│   ├── /batches                    — Batch management
│   ├── /exams                      — Dept exam timetable, sitting arrangements, supervision
│   ├── /finance                    — Fee collection, dues, scholarships, payroll
│   ├── /library                    — Full library management system
│   ├── /placement                  — Job postings, placement records, statistics
│   ├── /research                   — Research, conference, patent, FDP tracking
│   ├── /complaints                 — Complaint resolution
│   ├── /vacancies                  — Vacancy publication management
│   └── /analytics                  — Department performance dashboard
│
├── /faculty-panel                  — Faculty Portal
│   ├── /timetable                  — Personal weekly timetable (read-only)
│   ├── /attendance                 — Attendance management (manual + QR + IoT)
│   ├── /marks                      — Marks upload and internal assessment
│   ├── /assignments                — Assignment creation and grading
│   ├── /quiz                       — Quiz creation and MCQ auto-grading
│   ├── /resources                  — Study material upload (PDF, PPT, Notes, Video)
│   ├── /communication              — Messaging students, announcements
│   ├── /complaints                 — Student complaint handling
│   ├── /research                   — Research portfolio, publications, patents, FDP
│   ├── /profile                    — Faculty profile and credentials
│   └── /[timetable-id]             — Individual timetable viewer
│
├── /student                        — Student Portal
│   ├── /timetable                  — AI-generated personal timetable
│   ├── /attendance                 — Attendance records, flags, risk alerts
│   ├── /marks                      — Grade view, performance dashboard, subject analytics
│   ├── /assignments                — Assignment submission and general tasks
│   ├── /materials                  — Study materials by subject (PDF, video, PPT, notes)
│   ├── /fees                       — Fee payment, history, reminders, scholarships
│   ├── /services                   — Bonafide, BRTS, transcript, ID card requests
│   ├── /ai                         — AI chatbot, study planner, career advisor
│   ├── /campus                     — Digital ID card, bus tracking, canteen
│   ├── /library                    — Borrowed books, reservations, due reminders
│   ├── /placement                  — Internship feed, job opportunities, marketplace
│   ├── /communication              — Group messaging, faculty messages, updates feed
│   └── /complaints                 — Anonymous complaint submission
│
└── /public/[university-slug]       — Per-University Public Portal (fully isolated)
    ├── /                           — University home with custom branding
    ├── /results                    — Result lookup and hash verification
    ├── /verify                     — Blockchain degree / certificate verification
    ├── /admissions                 — Online admission application form
    ├── /admissions/status          — Application status tracker
    ├── /scholarships               — Scholarship application portal
    ├── /vacancies                  — Public job / teaching vacancies
    └── /research                   — Public research repository (if enabled)
```

---

## 2. Navigation Design Per Panel

### 2.1 Super Admin Sidebar

```
🌐 Platform Overview
├── 🏛️  Universities
├── 🔑  Credentials
├── 🌍  Public Portal Configs
├── 📊  Platform Analytics
├── 💳  Billing & Licensing
└── 📋  All Timetables
```

### 2.2 University Admin Sidebar

```
🏛️  University Overview
├── 🏬  Departments
├── 📚  Programs & Curriculum
├── 👩‍🏫  Faculty
├── 👩‍🎓  Students
├── 📖  Courses
├── 📝  Exams
├── 💰  Finance
├── 📊  Results & Blockchain
├── ✅  NAAC / NIRF Compliance
├── 💼  Placement
├── 📣  Communication
└── 📈  Performance Dashboard
```

### 2.3 Department Admin Sidebar

```
🏬  Department Overview
├── 📅  Timetable
│   ├── Generate Standard
│   └── Generate Special
├── 👩‍🏫  Faculty
├── 👩‍🎓  Students
├── 📖  Courses & Batches
├── 🏫  Resources (Rooms / Labs)
├── 📝  Examinations
├── 💰  Finance
├── 📚  Library
├── 💼  Placement
├── 🔬  Research
├── 📣  Complaints
├── 📢  Vacancies
└── 📈  Analytics
```

### 2.4 Faculty Sidebar

```
👤  My Profile
├── 📅  My Timetable
├── ✅  Attendance
├── 📊  Marks & Assessment
├── 📝  Assignments
├── 🧪  Quizzes
├── 📁  Study Materials
├── 💬  Messages
├── 🚨  Complaints
└── 🔬  Research Portfolio
```

### 2.5 Student Sidebar

```
👤  My Profile / Digital ID
├── 📅  Timetable
├── ✅  Attendance
├── 📊  Marks & Performance
├── 📝  Assignments
├── 📁  Study Materials
├── 💰  Fees
├── 🛎️  Services
├── 🤖  AI Tools
│   ├── Doubt Assistant
│   ├── Study Planner
│   └── Career Advisor
├── 🏫  Campus
├── 📚  Library
├── 💼  Internships
└── 💬  Messages & Complaints
```

### 2.6 Public Portal Navigation (Per University)

```
[University Logo + Name + Tagline]
│
├── 🏠  Home
├── 📊  Results Verification
├── 🔐  Blockchain Verify
├── 🎓  Admissions
├── 🏅  Scholarships
├── 💼  Vacancies
└── 🔬  Research (if enabled)
```

---

## 3. URL Routing Structure

| URL Pattern | Panel | Auth Required | Description |
|---|---|---|---|
| `/login` | All | ❌ | Universal login page with role selector |
| `/superadmin` | Super Admin | ✅ Superadmin JWT | Platform overview |
| `/superadmin/universities` | Super Admin | ✅ | University list + CRUD |
| `/superadmin/universities/[id]/portal` | Super Admin | ✅ | Public portal config for university |
| `/dashboard` | Uni Admin | ✅ Uni Admin JWT | University overview |
| `/dashboard/results/publish` | Uni Admin | ✅ | Result publication + blockchain |
| `/department` | Dept Admin | ✅ Dept Admin JWT | Department overview |
| `/department/generate` | Dept Admin | ✅ | Timetable generation form |
| `/department/special` | Dept Admin | ✅ | Special timetable form |
| `/department/timetables/[id]` | Dept Admin | ✅ | Timetable viewer |
| `/faculty-panel` | Faculty | ✅ Faculty JWT | Personal timetable |
| `/faculty-panel/attendance` | Faculty | ✅ | Attendance management |
| `/student` | Student | ✅ Student JWT | Student home |
| `/student/ai` | Student | ✅ | AI tools hub |
| `/student/campus/id` | Student | ✅ | Digital ID card |
| `/public/[slug]` | Public | ❌ | University public portal home |
| `/public/[slug]/results` | Public | ❌ | Result verification |
| `/public/[slug]/verify` | Public | ❌ | Blockchain verification |
| `/public/[slug]/admissions` | Public | ❌ | Admission application |
| `/public/[slug]/admissions/status` | Public | ❌ (App ID) | Application status check |

---

## 4. Per-University Public Portal Isolation

Every university provisioned in the platform automatically receives an isolated public portal. The isolation is enforced at four levels:

| Isolation Level | Mechanism |
|---|---|
| **Domain** | Custom subdomain or domain per university configured via DNS CNAME |
| **Data** | All queries scoped to the university's PostgreSQL schema via `SET search_path` |
| **Branding** | Logo, colours, fonts, hero image loaded from university-specific S3 path |
| **Features** | Feature toggles stored per university; nav items conditionally rendered |

### Feature Toggle Mapping to UI

| Feature Toggle Key | UI Outcome When Disabled |
|---|---|
| `resultVerification` | "Results" tab hidden; `/results` returns 404 |
| `admissionPortal` | "Admissions" tab hidden; `/admissions` returns 404 |
| `scholarshipPortal` | "Scholarships" tab hidden; `/scholarships` returns 404 |
| `vacancyPublication` | "Vacancies" tab hidden; `/vacancies` returns 404 |
| `publicResearchRepo` | "Research" tab hidden; `/research` returns 404 |
| `blockchainVerification` | Blockchain badge hidden on result page; verify tab hidden |
| `rankingDashboard` | Ranking section hidden from public home |

---

## 5. Role-Based Access Control Matrix

| Resource | SUPERADMIN | UNI_ADMIN | DEPT_ADMIN | FACULTY | STUDENT | PUBLIC |
|---|---|---|---|---|---|---|
| All universities | ✅ CRUD | ❌ | ❌ | ❌ | ❌ | ❌ |
| Own university data | ✅ | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| Own department data | ✅ | ✅ | ✅ CRUD | 👁️ Read | ❌ | ❌ |
| Timetable generate | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Student personal data | ✅ | ✅ | ✅ | 👁️ Read | ✅ Own only | ❌ |
| Attendance mark | ✅ | ✅ | ✅ | ✅ Own classes | ✅ Self-mark | ❌ |
| Marks upload | ✅ | ✅ | ✅ | ✅ Own courses | 👁️ View only | ❌ |
| Result publish | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Blockchain verify | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fee payment | ✅ | ✅ | ✅ | ❌ | ✅ Own only | ❌ |
| Public portal config | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| NAAC report export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI chatbot | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Study materials upload | ✅ | ✅ | ✅ | ✅ Own courses | 👁️ View only | ❌ |
| Public result view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (verify only) |

---

## 6. Content Types & Data Entities

| Content Type | Primary Panel | Linked Panels | Storage |
|---|---|---|---|
| Timetable | Department | Faculty, Student | PostgreSQL + MongoDB (JSON) |
| Attendance Record | Faculty | Student, Dept Admin | PostgreSQL |
| Study Material | Faculty | Student, AI Engine | AWS S3 + Elasticsearch index |
| Assignment | Faculty | Student | PostgreSQL + S3 |
| Result | University Admin | Student, Public Portal, Blockchain | PostgreSQL + Polygon L2 |
| Fee Payment | Student | Dept Admin, University Admin | PostgreSQL |
| Digital ID Card | Student | Library, Security, Campus | Rendered from PostgreSQL data + QR |
| Research Publication | Faculty | Dept Admin, University Admin | PostgreSQL |
| Admission Application | Public Portal | University Admin | PostgreSQL |
| Verification Request | Public Portal | Audit Log | PostgreSQL |
| Vacancy | Dept Admin | Public Portal | PostgreSQL |
| Book Loan | Library (Dept Admin) | Student | PostgreSQL |
| Placement Record | Dept Admin | University Admin, Student | PostgreSQL |

---

## 7. Notification Architecture

| Trigger Event | Notification Channel | Recipients |
|---|---|---|
| Timetable generated | In-app + Email | Dept Admin, affected Faculty, Students |
| Timetable updated (real-time) | WebSocket + In-app | Affected Faculty, Students |
| Class cancelled | Push + In-app + SMS | Affected Students |
| Attendance session opened | In-app | Students in the batch |
| Attendance below 80% | In-app + Email | Student + Parent (if configured) |
| Fee due in 7 days | Email + SMS + In-app | Student |
| Fee payment confirmed | Email + In-app | Student |
| Result published | Email + In-app + Blockchain QR | Student |
| Admission status changed | Email + In-app | Applicant |
| Assignment due in 24h | In-app | Students |
| Dropout risk flagged | In-app (Dept Admin + Faculty) | HOD, Course Faculty |
| Service request approved | In-app + Email | Student |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
