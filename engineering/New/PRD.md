# AI SMART UNIVERSITY PLATFORM — Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document | **Version:** v2.0.0 | **Date:** March 2026
> **Product:** AI Smart University Platform — Full-Stack Intelligent University Operating System
> **Classification:** Confidential — Internal Use Only
> **Previous Version:** v1.0.0 (NEP-Scheduler — Timetable Scheduling Platform)
> **Upgrade Notice:** This document supersedes v1.0.0 and expands scope from timetable scheduling to a complete AI-powered university operating system.

---

## Table of Contents

1. [Product Vision & Mission](#1-product-vision--mission)
2. [Target Personas](#2-target-personas)
3. [Feature Requirements](#3-feature-requirements)
4. [Seven-Panel Specifications](#4-seven-panel-specifications)
5. [Per-University Public Panel Architecture](#5-per-university-public-panel-architecture)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [NEP 2020 Compliance Requirements](#8-nep-2020-compliance-requirements)
9. [AI Smart Features Specification](#9-ai-smart-features-specification)
10. [Smart Campus Integration Requirements](#10-smart-campus-integration-requirements)
11. [Out of Scope (v2.0)](#11-out-of-scope-v20)
12. [Success Metrics & KPIs](#12-success-metrics--kpis)

---

## 1. Product Vision & Mission

### Vision

> To become the definitive AI-powered university operating system for every Indian institution — eliminating administrative inefficiency, empowering every stakeholder with intelligent insights, and building a fully connected smart campus ecosystem aligned with NEP 2020.

### Mission Statement

> Deliver an integrated, multi-tenant, AI-driven academic and administrative platform that unifies student lifecycle management, faculty operations, departmental governance, university administration, and a unique per-institution public portal — all under a single, secure, scalable SaaS infrastructure.

### Problem Statement

Indian universities today face systemic digital fragmentation:

- **Manual scheduling** takes 2–4 weeks per semester using Excel or paper
- **Disconnected systems** — attendance, fees, library, placement, HR, and exams run in silos
- **No student intelligence** — institutions cannot predict dropout risk or personalize learning paths
- **Public transparency gap** — result verification, admissions, and scholarship status are opaque
- **NEP 2020 non-compliance** — multidisciplinary, FYUP, and credit-flexibility requirements ignored
- **Zero smart campus readiness** — IoT, face recognition, and digital identity not integrated
- **Plagued by paperwork** — bonafide certificates, transcripts, NAAC reports generated manually

### Value Proposition

| Stakeholder | Value Delivered |
|---|---|
| University Administration | Unified ERP + AI analytics + NAAC/NIRF automated reporting; full digital governance |
| Department HODs | Optimized timetables; AI-assisted faculty allocation; research management; placement tracking |
| Faculty Members | Smart attendance tools; research portfolio; automated grading; career development tracking |
| Students | AI-powered study planner, doubt chatbot, career advisor, attendance alerts, digital ID, transport tracking |
| Public / Applicants | Per-university transparent portal: results, admissions, degrees, scholarships, vacancies |
| Super Admin / Platform | Centralized multi-university SaaS management; global analytics; billing; compliance |

---

## 2. Target Personas

### 2.1 Primary Personas

| Persona | Role | Primary Goals | Key Pain Points |
|---|---|---|---|
| **Superadmin Shreya** | Platform Administrator | Manage all university tenants; monitor system health; configure public portals per university | No centralized view; manual credential management; no audit trail |
| **VC Dr. Patel** | University Admin / Vice-Chancellor | Govern the full university digitally; generate NAAC reports; track placement and research | Siloed systems; manual compliance reports; no performance dashboard |
| **HOD Dr. Shah** | Department Admin / HOD | Schedule timetables; manage faculty research; drive placement; allocate courses | Manual scheduling; no visibility into faculty workload or student risk |
| **Prof. Rustam** | Faculty Member | Manage attendance, grades, assignments, research; interact with students | WhatsApp-based communication; no unified workflow tool |
| **Student Aryan** | MCA Student (Div A) | Access schedule, materials, assignments, fees, AI tools, career guidance | Disconnected apps; no personalized academic insights; outdated notice boards |
| **Applicant Priya** | Prospective Student | Check admission status, scholarships, results; verify degree authenticity | Opaque processes; physical visits required; no online tracking |
| **Public Verifier** | Employer / Bank / Authority | Verify degrees, results, certificates with cryptographic proof | Manual verification letters; risk of forgery; slow turnaround |

### 2.2 Secondary Personas

| Persona | Role | Interaction with System |
|---|---|---|
| University Registrar | Data entry & compliance | Manages admission workflows, exam records, NAAC report generation |
| Finance Officer | Fees & payroll | Manages fee structures, scholarships, payroll, vouchers, reconciliation |
| IT Admin | System configuration | Configures university tenants, public portal themes, IoT integrations |
| Library Staff | Resource management | Manages catalog, reservations, digital access, analytics |
| Placement Officer | Industry connect | Posts opportunities, schedules interviews, tracks placement records |
| Security Staff | Campus safety | Uses visitor management, campus security dashboard, IoT access control |
| NAAC/UGC Auditor | Compliance verification | Accesses exported reports and accreditation dashboards |

---

## 3. Feature Requirements

### 3.1 Feature Priority Matrix

#### Student Panel Features

| Feature ID | Feature | Priority | MVP? |
|---|---|---|---|
| SP-001 | AI-Generated Timetable View | P0 | ✅ Yes |
| SP-002 | Attendance Tracking & Flag System | P0 | ✅ Yes |
| SP-003 | Marks and Grade View | P0 | ✅ Yes |
| SP-004 | Assignment Submission | P0 | ✅ Yes |
| SP-005 | Study Material Access (PDF, PPT, Notes, Video) | P0 | ✅ Yes |
| SP-006 | Fees Payment & History | P0 | ✅ Yes |
| SP-007 | Service Request System (Bonafide, BRTS, Transcript, ID Card) | P1 | ✅ Yes |
| SP-008 | Anonymous Complaint System | P1 | ✅ Yes |
| SP-009 | University & College Updates Feed | P1 | ✅ Yes |
| SP-010 | Student Group & Faculty Messaging | P1 | ✅ Yes |
| SP-011 | Library: Borrowed Books & Due Reminders | P1 | ✅ Yes |
| SP-012 | Digital Student ID Card (QR Code) | P1 | ✅ Yes |
| SP-013 | Performance Dashboard & Subject Analytics | P1 | ✅ Yes |
| SP-014 | AI Study Planner | P1 | ✅ Yes |
| SP-015 | AI Doubt Assistant Chatbot | P1 | ✅ Yes |
| SP-016 | AI Career Recommendation | P2 | ❌ No |
| SP-017 | Internship Opportunities Feed | P1 | ✅ Yes |
| SP-018 | Certification & Hackathon Tracker | P2 | ❌ No |
| SP-019 | Transport (Bus) Tracking | P2 | ❌ No |
| SP-020 | Canteen Menu & Feedback | P3 | ❌ No |
| SP-021 | Lost and Found Portal | P3 | ❌ No |
| SP-022 | Student Marketplace (Buy/Sell Books) | P3 | ❌ No |
| SP-023 | Attendance Risk Alerts | P1 | ✅ Yes |
| SP-024 | Behaviour Ratings View | P2 | ❌ No |
| SP-025 | Fees Reminders & Scholarship Adjustment | P0 | ✅ Yes |

#### Faculty Panel Features

| Feature ID | Feature | Priority | MVP? |
|---|---|---|---|
| FP-001 | Marks Upload & Internal Assessment | P0 | ✅ Yes |
| FP-002 | Attendance Management (Manual + QR) | P0 | ✅ Yes |
| FP-003 | Assignment Creation & Grading | P0 | ✅ Yes |
| FP-004 | Resource Upload (PDF, PPT, Notes, Videos) | P0 | ✅ Yes |
| FP-005 | Quiz Creation & Automatic MCQ Grading | P1 | ✅ Yes |
| FP-006 | Personal Timetable View | P0 | ✅ Yes |
| FP-007 | Message to Students | P0 | ✅ Yes |
| FP-008 | Complaint Handling from Students | P1 | ✅ Yes |
| FP-009 | Research Portfolio & Publication Tracking | P1 | ✅ Yes |
| FP-010 | Faculty Portfolio Builder | P2 | ❌ No |
| FP-011 | Grant Proposal Management | P2 | ❌ No |
| FP-012 | Live Classroom Polls | P2 | ❌ No |
| FP-013 | Conference & Patent Tracking | P2 | ❌ No |
| FP-014 | FDP Participation Tracking | P2 | ❌ No |
| FP-015 | Smart Attendance Options (Face/QR/IoT) | P2 | ❌ No |
| FP-016 | Research Impact Dashboard | P3 | ❌ No |

#### Department / College Panel Features

| Feature ID | Feature | Priority | MVP? |
|---|---|---|---|
| DC-001 | Timetable Generation (AI / OR-Tools) | P0 | ✅ Yes |
| DC-002 | Complaint Management | P0 | ✅ Yes |
| DC-003 | Result Publication | P0 | ✅ Yes |
| DC-004 | Fees Management (Structure, Collection, Dues) | P0 | ✅ Yes |
| DC-005 | Student & Faculty Management | P0 | ✅ Yes |
| DC-006 | Exam Management (Timetable, Sitting, Supervision) | P1 | ✅ Yes |
| DC-007 | Financial Management (GL, Vouchers, Bank Recon) | P1 | ✅ Yes |
| DC-008 | Payroll Management (Salary, Payslips, Leave-adjusted) | P1 | ✅ Yes |
| DC-009 | Library Management System | P1 | ✅ Yes |
| DC-010 | Alumni Management | P2 | ❌ No |
| DC-011 | Hostel Management | P2 | ❌ No |
| DC-012 | Placement Management | P1 | ✅ Yes |
| DC-013 | Research Management | P2 | ❌ No |
| DC-014 | Course Planning & Credit Distribution | P1 | ✅ Yes |
| DC-015 | Faculty Allocation Assistant | P1 | ✅ Yes |
| DC-016 | Department Performance Dashboard | P1 | ✅ Yes |
| DC-017 | BI Analytics & Strategic Reporting | P2 | ❌ No |
| DC-018 | Asset & Inventory Management | P2 | ❌ No |
| DC-019 | Vacancy Publication | P1 | ✅ Yes |
| DC-020 | Procurement & Vendor Management | P3 | ❌ No |

#### University Panel Features

| Feature ID | Feature | Priority | MVP? |
|---|---|---|---|
| UP-001 | Result Publication with Blockchain Verification | P0 | ✅ Yes |
| UP-002 | Admission Backend (Merit List, Approval Workflow) | P0 | ✅ Yes |
| UP-003 | Exam Management (Hall Tickets, Timetable, QP, Invigilators) | P0 | ✅ Yes |
| UP-004 | Financial Management (Fees, HR Billing, Budget) | P0 | ✅ Yes |
| UP-005 | Payroll Management | P0 | ✅ Yes |
| UP-006 | Event & Extracurricular Management | P1 | ✅ Yes |
| UP-007 | Syllabus & Curriculum Version Control | P1 | ✅ Yes |
| UP-008 | NAAC Report Generation | P1 | ✅ Yes |
| UP-009 | NIRF Reporting Tools | P1 | ✅ Yes |
| UP-010 | Government Compliance Dashboard | P1 | ✅ Yes |
| UP-011 | Digital Document & Policy Management | P1 | ✅ Yes |
| UP-012 | Campus Security Dashboard & Visitor Management | P2 | ❌ No |
| UP-013 | Competitive Exam Preparation Portal | P3 | ❌ No |
| UP-014 | Research & Patent Management | P2 | ❌ No |
| UP-015 | Placement & Company Partnerships | P1 | ✅ Yes |
| UP-016 | University Performance Dashboard | P0 | ✅ Yes |
| UP-017 | Internal Communication System | P1 | ✅ Yes |
| UP-018 | Alumni Management | P2 | ❌ No |

#### Public Panel Features (Per-University Instance)

| Feature ID | Feature | Priority | MVP? |
|---|---|---|---|
| PP-001 | Result Verification via Hash Code | P0 | ✅ Yes |
| PP-002 | Blockchain Result Verification | P0 | ✅ Yes |
| PP-003 | Spam Filter for Verification Requests | P1 | ✅ Yes |
| PP-004 | Verification Request Tracking | P1 | ✅ Yes |
| PP-005 | Online Admission Portal | P0 | ✅ Yes |
| PP-006 | Admission Status Tracking | P0 | ✅ Yes |
| PP-007 | Scholarship Application Portal | P1 | ✅ Yes |
| PP-008 | Degree Verification Portal | P0 | ✅ Yes |
| PP-009 | Certificate Verification System | P0 | ✅ Yes |
| PP-010 | Public Research Repository | P2 | ❌ No |
| PP-011 | University Ranking Dashboard | P2 | ❌ No |
| PP-012 | Vacancy Publication (Public View) | P1 | ✅ Yes |
| PP-013 | Migration Progress Tracking | P2 | ❌ No |
| PP-014 | Per-University Custom Branding & Domain | P0 | ✅ Yes |

---

## 4. Seven-Panel Specifications

### 4.1 Panel 0: Global Super Admin (`/superadmin`)

**Access:** Single global superadmin account (username/password set in system config)

| Section | Features |
|---|---|
| **Universities** | List, provision, edit, delete universities; view per-university stats; configure public portal per university |
| **Credentials Management** | View/change all admin, faculty, student credentials; bulk credential reset |
| **All Departments** | View all departments globally; HOD, faculty, course counts |
| **Public Portal Config** | Toggle features per university's public panel; set custom domain; upload branding assets |
| **All Timetables** | View all generated timetables; filter by university, department, date |
| **Billing & Licensing** | Manage SaaS subscription per university; feature tier controls |
| **Platform Analytics** | Cross-university KPIs; system health; AI usage metrics |

---

### 4.2 Panel 1: University Admin (`/dashboard`)

**Access:** University-specific admin credentials created by Super Admin

| Section | Features |
|---|---|
| **Academic Management** | Department CRUD; program management; course catalog; curriculum version control |
| **Faculty Management** | Faculty pool; subject assignments; workload analytics; FDP tracking |
| **Student Management** | Admission workflow; merit lists; enrollment; bulk import |
| **Exam Management** | Hall ticket generation; exam timetable; question paper settings; invigilator management |
| **Financial Management** | Fee structures; payroll; HR billing; budget allocation; BI analytics |
| **Result Publication** | Publish results with blockchain hash; NAAC/NIRF export |
| **Compliance & Reporting** | NAAC report generation; NIRF tools; government compliance dashboard |
| **Communication** | Internal communication system; college-to-college announcements |
| **University Performance** | Placement statistics; research publications; university ranking dashboard |

---

### 4.3 Panel 2: Department / College Admin (`/department`)

**Access:** Department-specific admin credentials

| Section | Features |
|---|---|
| **Timetable** | AI/OR-Tools timetable generation; special timetable; sitting arrangement; supervision management |
| **Academic** | Course planning; credit distribution; faculty allocation assistant; exam timetable |
| **Student Panel** | Student management; marks upload; attendance oversight; complaint resolution |
| **Faculty Panel** | Faculty CRUD; workload tracking; research tracking; conference & patent records |
| **Finance** | Fees collection; dues management; scholarships; voucher management; payslip generation |
| **Library** | Library management; book catalog; digital access; late fee automation |
| **Placement** | Company tie-ups; student placement records; placement statistics dashboard |
| **Research** | Conference records; patent management; FDP/MDP tracking; research collaboration tools |
| **Assets** | Fixed asset management; inventory; maintenance logs |
| **Vacancies** | Job vacancy publication; application management |

---

### 4.4 Panel 3: Faculty Portal (`/faculty-panel`)

**Access:** Faculty credentials

| Section | Features |
|---|---|
| **Timetable** | Personal timetable view (weekly grid); real-time schedule updates |
| **Attendance** | Attendance management; QR attendance option; face recognition attendance (IoT) |
| **Academic** | Marks upload; internal assessment; assignment creation & grading; online quiz creation; MCQ auto-grading |
| **Resources** | Upload PDFs, notes, PPTs, lecture videos |
| **Communication** | Messaging students; complaint handling; live classroom polls |
| **Research** | Research portfolio; publication tracking; conference & patent records; FDP tracking; grant proposal management |
| **Profile** | Faculty portfolio builder; credential management; research impact dashboard |

---

### 4.5 Panel 4: Student Portal (`/student`)

**Access:** Student credentials

| Section | Features |
|---|---|
| **Academics** | AI-generated timetable; attendance tracking with flag system; marks & grades; behaviour ratings |
| **Assignments** | Assignment submission; general tasks; AI study planner |
| **Study Materials** | PDFs, notes, PPTs, recorded lectures per subject |
| **Fees** | Online fees payment; fees history; reminders; scholarship adjustment |
| **Services** | Bonafide certificate; BRTS pass; transcript request; ID card replacement |
| **Communication** | Anonymous complaint system; university/college updates; student group messaging; faculty-to-student messaging |
| **Library** | Borrowed book details; library due reminders; book reservation |
| **Campus** | Digital student ID card (QR); transport (bus) tracking; canteen menu & feedback |
| **Marketplace** | Student marketplace (buy/sell books) |
| **Career** | Internship opportunities feed; AI career recommendation; certification tracker; hackathon tracker |
| **Analytics** | Performance dashboard; subject analytics; attendance risk alerts; AI doubt assistant chatbot |

---

### 4.6 Panel 5: Public Portal (`/public/{university-slug}`)

> **Critical Design Principle:** Each university has its own **completely independent public portal instance**, isolated at tenant level. A visitor to `public.vnsgu.ac.in` sees only VNSGU data. A visitor to `public.spuvvn.edu.in` sees only SPUVVN data. There is zero cross-university data leakage.

See Section 5 for full per-university public panel architecture specification.

---

## 5. Per-University Public Panel Architecture

### 5.1 Isolation Principle

Every university provisioned in the platform automatically receives a dedicated public portal. This is not a shared multi-tenant view — it is a **completely independent, university-branded public-facing application** with the following properties:

| Property | Implementation |
|---|---|
| **Domain Isolation** | Custom subdomain or domain per university (e.g., `results.vnsgu.ac.in`), configured by Super Admin |
| **Branding Isolation** | University logo, color scheme, typography, and banner configured per tenant; stored in S3 per university bucket |
| **Data Isolation** | Public portal queries only the university's PostgreSQL schema; no cross-tenant queries ever allowed |
| **Feature Toggle** | Super Admin and University Admin can independently enable/disable public features per university |
| **Rate Limiting** | Per-university rate limiting pool; abuse on one university's portal cannot affect another |
| **Search Indexing** | SEO metadata unique per university; Google-indexable result and admission pages |

### 5.2 Per-University Public Portal Features

| Feature | Description | Configurable? |
|---|---|---|
| **Result Verification (Hash)** | Enter enrollment number + date of birth → view official result with hash code | ✅ Toggle per university |
| **Blockchain Verification** | QR-code scan or hash entry → cryptographic proof of result authenticity against on-chain record | ✅ Toggle per university |
| **Spam Filter** | AI-powered spam/bot detection on verification requests; CAPTCHA + rate limiting per IP | ✅ Threshold configurable |
| **Verification Request Tracking** | Employer or authority can track status of formal verification request | ✅ Toggle per university |
| **Online Admission Portal** | Program-wise application forms; document upload; application fee payment | ✅ Toggle per university |
| **Admission Status Tracking** | Applicant logs in with application number to see merit list position and status | ✅ Toggle per university |
| **Scholarship Application** | Online scholarship application with eligibility checker | ✅ Toggle per university |
| **Degree Verification** | Graduates can request degree verification for employers/embassies | ✅ Toggle per university |
| **Certificate Verification** | Verify bonafide, migration, TC, marksheets digitally | ✅ Toggle per university |
| **Public Research Repository** | Browse published research papers from the university | ✅ Toggle per university |
| **University Ranking Dashboard** | NAAC/NIRF scores, NBA accreditation status, placement stats (public view) | ✅ Toggle per university |
| **Vacancy Publication** | Teaching and non-teaching vacancies with application links | ✅ Toggle per university |

### 5.3 Public Panel Tenant Configuration Schema

```json
{
  "universityId": "uni-vnsgu",
  "publicPortal": {
    "enabled": true,
    "slug": "vnsgu",
    "customDomain": "results.vnsgu.ac.in",
    "branding": {
      "logoUrl": "https://cdn.platform.com/uni-vnsgu/logo.png",
      "primaryColor": "#003087",
      "secondaryColor": "#FFD700",
      "heroImageUrl": "https://cdn.platform.com/uni-vnsgu/hero.jpg",
      "universityFullName": "Veer Narmad South Gujarat University",
      "tagline": "Wisdom for Life"
    },
    "features": {
      "resultVerification": true,
      "blockchainVerification": true,
      "admissionPortal": true,
      "admissionStatusTracking": true,
      "scholarshipPortal": true,
      "degreeVerification": true,
      "certificateVerification": true,
      "publicResearchRepo": false,
      "rankingDashboard": true,
      "vacancyPublication": true
    },
    "rateLimiting": {
      "verificationRequestsPerHour": 1000,
      "admissionFormsPerHour": 500
    }
  }
}
```

### 5.4 Blockchain Result Verification Flow

1. University Admin publishes result → system generates SHA-256 hash of result record
2. Hash is stored on-chain (Ethereum / Polygon L2) with `universityId`, `enrollmentNumber`, `programId`, `semesterId`, `resultHash`, `publishedAt`
3. Public portal user enters enrollment number → system fetches result from PostgreSQL + on-chain hash
4. System compares live hash with stored hash → displays "✅ Verified" or "❌ Tampered" with chain explorer link
5. Verification event is logged (timestamp, requester IP, result of verification) for audit

---

## 6. User Stories & Acceptance Criteria

| US-ID | Story | Acceptance Criteria |
|---|---|---|
| US-001 | As a Dept Admin, I want to generate a conflict-free timetable so classes run without overlap | GIVEN faculty/rooms/courses are configured WHEN I click Generate THEN a timetable with 0 conflicts is produced in < 30 seconds |
| US-002 | As a Student, I want to see my AI-generated timetable so I know where to be | GIVEN I am enrolled WHEN I open Timetable THEN I see my personal schedule updated in real-time |
| US-003 | As a Student, I want to pay fees online so I don't need to visit the counter | GIVEN my fees are due WHEN I complete payment THEN receipt is generated and fees history updated |
| US-004 | As a Student, I want AI career recommendations so I can plan my future | GIVEN my academic profile exists WHEN I open Career THEN I see AI-recommended career paths with resource links |
| US-005 | As a Faculty, I want QR-based attendance so I eliminate proxy marking | GIVEN I generate a QR for a session WHEN students scan it THEN attendance is marked within the session window |
| US-006 | As a Faculty, I want to upload lecture recordings so absent students can catch up | GIVEN I upload a video WHEN a student opens Study Materials THEN the video is accessible in-browser |
| US-007 | As a University Admin, I want NAAC report exported automatically so I save 2 weeks of manual work | GIVEN academic data exists WHEN I click Export NAAC Report THEN a formatted PDF with all NAAC criteria is produced |
| US-008 | As a Public Verifier, I want to verify a degree cryptographically so I can trust the result | GIVEN I enter an enrollment number on the public portal WHEN result is found THEN blockchain hash is compared and a verified badge shown |
| US-009 | As a University Admin, I want each university's public portal to look and feel different so our brand is maintained | GIVEN I upload logos/colors/domain WHEN a visitor accesses the portal THEN they see only our university's branding and data |
| US-010 | As a Superadmin, I want to toggle features per university's public portal so institutions with no research portal don't see irrelevant sections | GIVEN feature toggles exist WHEN I disable "publicResearchRepo" for a university THEN that section is invisible on their public portal |
| US-011 | As a Student, I want attendance risk alerts so I don't fall below the minimum | GIVEN my attendance drops below 80% WHEN I open the app THEN I see an alert showing subjects at risk |
| US-012 | As a Faculty, I want automatic MCQ grading so I don't waste time correcting quizzes | GIVEN quiz is submitted WHEN grading runs THEN all MCQ responses are auto-scored and results visible to students immediately |
| US-013 | As a Department Admin, I want to publish vacancies publicly so eligible candidates can apply | GIVEN a vacancy is created WHEN I set it to "Public" THEN it appears on the university's public portal vacancy section |
| US-014 | As a Student, I want a digital ID card with QR so I can use it for library access and campus entry | GIVEN I am enrolled WHEN I open Digital ID THEN I see a QR-coded card that integrates with IoT entry systems |
| US-015 | As a University Admin, I want result publication with blockchain so employers can verify without calling us | GIVEN results are finalized WHEN I publish THEN each result receives an on-chain hash and verification link |

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

| NFR ID | Requirement | Target | Measurement |
|---|---|---|---|
| NFR-P01 | Timetable generation time | < 30 seconds for ≤ 20 faculty, ≤ 10 courses, ≤ 2 batches | End-to-end from click to display |
| NFR-P02 | Page load time (initial) | < 3 seconds on 4G | Lighthouse Performance > 85 |
| NFR-P03 | API response time (p95) | < 500ms read, < 1s write | APM monitoring |
| NFR-P04 | PDF generation time | < 5 seconds | Request to download start |
| NFR-P05 | Real-time update propagation | < 2 seconds | WebSocket latency |
| NFR-P06 | Concurrent user capacity (MVP) | 500 simultaneous users | k6 load testing |
| NFR-P07 | Concurrent user capacity (Scale) | 50,000 simultaneous users | Horizontal scaling |
| NFR-P08 | Blockchain hash verification | < 3 seconds | On-chain read latency |
| NFR-P09 | AI chatbot response time | < 5 seconds | End-to-end LLM call |
| NFR-P10 | Public portal load (unauthenticated) | < 2 seconds | CDN-served static pages |

### 7.2 Security Requirements

| NFR ID | Requirement | Standard |
|---|---|---|
| NFR-S01 | Passwords hashed with bcrypt (cost ≥ 12) | OWASP Authentication |
| NFR-S02 | All communications must use TLS 1.3 | NIST SP 800-52 |
| NFR-S03 | JWT tokens expire after 8 hours; refresh tokens after 30 days | RFC 6749 |
| NFR-S04 | All user actions logged with timestamp and IP | Audit Compliance |
| NFR-S05 | Cross-tenant data access impossible at API level | Multi-tenant Security |
| NFR-S06 | Firebase Authentication for student/faculty login (MFA optional) | Firebase Security |
| NFR-S07 | Role-Based Access Control (RBAC) with fine-grained permission matrix | RBAC Standard |
| NFR-S08 | End-to-end encryption for all messaging | E2EE Standard |
| NFR-S09 | Blockchain academic records — immutable on-chain | Ethereum / Polygon |
| NFR-S10 | Zero Trust security architecture across all microservices | Zero Trust NIST |
| NFR-S11 | DPDP Act 2023 compliance for all personal data | Indian Data Protection Law |
| NFR-S12 | AI fraud detection on fee payments and verification requests | In-house ML |
| NFR-S13 | VAPT testing before every major release | ISO 27001 |

### 7.3 Usability Requirements

| NFR ID | Requirement |
|---|---|
| NFR-U01 | Timetable grid viewable without horizontal scroll on 1366×768 screens |
| NFR-U02 | All primary actions reachable within 3 clicks from login |
| NFR-U03 | Student mobile app — all core features accessible on 4-inch screen |
| NFR-U04 | Public portal — WCAG 2.1 AA accessibility compliant |
| NFR-U05 | Error messages must clearly indicate the problem and suggest remediation |
| NFR-U06 | Loading states shown for all operations > 300ms |
| NFR-U07 | Offline mode for student timetable and study materials (PWA cache) |

---

## 8. NEP 2020 Compliance Requirements

| NEP 2020 Mandate | System Support | Implementation |
|---|---|---|
| Multidisciplinary learning | Cross-department elective scheduling | Courses span multiple departments; interdisciplinary batch support |
| FYUP (4-year UG program) | Multi-year program tracking | Program type selector with FYUP; exit point management per year |
| Credit-based system | Credit-hour enforcement | Weekly hours derived from credits; soft constraint for credit alignment |
| Flexible curriculum | Dynamic elective slots | Elective pools in batch configuration; AI assigns based on preference |
| Academic calendar alignment | Semester-based scheduling | Start/end, working days, holiday exclusion configuration |
| B.Ed./M.Ed./ITEP support | Program-specific constraints | Configurable constraints per program type |
| FYUP exit points | Year-wise scheduling support | Separate configs for Year 1–4 with shared resource pool |
| Multiple entry/exit options | Student lifecycle tracking | Status management for dropouts, re-entries, lateral entries |
| Holistic assessment | Behaviour ratings + AI analytics | Behaviour rating system + multi-dimensional performance dashboard |
| Internationalisation | Multi-language support (v3) | Hindi, Gujarati, Tamil planned post-v2 launch |

---

## 9. AI Smart Features Specification

| AI Feature | Algorithm / Model | Panel | Description |
|---|---|---|---|
| AI Timetable Generation | OR-Tools CP-SAT + XGBoost warm-start | Department | Constraint programming with ML slot preference prediction |
| Constraint Programming Solver | Google OR-Tools CP-SAT | Department | Hard/soft constraint satisfaction; mathematical optimality |
| AI Workload Balancing | Linear Programming + Fairness Score | Department/University | Balance teaching hours across faculty within variance threshold |
| Elective Conflict Resolution | Graph Coloring Algorithm | University | Resolve scheduling conflicts for shared elective courses |
| Predictive Enrolment Forecasting | Time-Series (LSTM) | University | Forecast next-semester enrolment per program |
| Student Performance Prediction | Gradient Boosted Trees (XGBoost) | Faculty/Department | Predict end-semester grades from mid-term indicators |
| Dropout Risk Prediction | Random Forest + SHAP | Department | Flag at-risk students with explainable risk factors |
| Course Demand Prediction | Prophet + Regression | University | Predict future course demand for resource planning |
| AI Academic Advisor | LLM (Claude / GPT) + RAG | Student | Context-aware academic planning chatbot |
| AI Career Recommendation | Collaborative Filtering + LLM | Student | Personalised career path recommendations |
| AI Study Planner | Reinforcement Learning + Calendar | Student | Adaptive study schedule based on syllabus and exams |
| AI Campus Analytics | Clustering + Anomaly Detection | University | Campus usage patterns; identify inefficiencies |
| AI Scheduling Optimisation | Multi-objective Optimisation (NSGA-II) | University | Optimize across all departments simultaneously |
| AI Resume Analyser | NLP (BERT) + Scoring | Placement | Score student resumes against job requirements |
| AI Fraud Detection | Isolation Forest + Rule Engine | Security | Detect anomalous fee payments and verification requests |
| AI Doubt Chatbot | LLM with subject-specific RAG | Student | Answer subject-related questions using uploaded materials |
| Book Recommendation System | Collaborative Filtering | Library | Suggest relevant books based on student's subject enrollment |
| NEP Compliance Checker | Rule-based + NLP | University | Validate timetable against NEP 2020 hour requirements |
| Substitute Recommender | Cosine Similarity + Availability | Department | Suggest best substitute when faculty is absent |
| Fairness Scoring Engine | Multi-criteria scoring | Department | Score timetable fairness across faculty preferences |

---

## 10. Smart Campus Integration Requirements

| Integration | Technology | Panel | Description |
|---|---|---|---|
| Smart Classroom | IoT Sensor Network + MQTT | Faculty/Student | Classroom occupancy, projector, AC control |
| IoT Attendance Tracking | BLE Beacons + Mobile SDK | Faculty/Student | Proximity-based automatic attendance |
| Face Recognition Attendance | OpenCV + DeepFace (on-premise) | Faculty | Privacy-safe on-device face recognition for attendance |
| Smart Parking System | IoT + Camera Vision | Student/Public | Real-time parking availability on campus map |
| Campus Energy Monitoring | Smart Meters + Dashboard | University | Track and optimize campus energy consumption |
| Smart Hostel Access | RFID + Digital ID QR | Student | QR-based hostel room access linked to digital ID |
| Digital Campus ID Access | NFC + QR Code | Student | Single digital ID for library, labs, hostel, parking |
| IoT Lab Equipment Monitoring | MQTT + Asset Tags | Department | Track lab equipment usage and availability |
| Bus Tracking | GPS + GTFS | Student | Real-time transport tracking on student app |
| Visitor Management | QR Check-in + Camera | Security | Digital visitor log with auto-expiry |

---

## 11. Out of Scope (v2.0)

The following items are deferred to v3.0 or remain permanently out of scope:

- Native mobile applications (iOS/Android) — PWA in v2.0, native in v3.0
- Multi-language support beyond English — planned for v3.0 (Hindi + Gujarati)
- Full ERP/HRMS integration with SAP or Oracle — webhook-based export available
- Video conferencing integration (Zoom/Teams) — link embedding only
- Competitive exam preparation portal — v3.0 roadmap
- Decentralised identity (DID) for student credentials — research phase
- Metaverse / virtual campus features — long-term vision only

---

## 12. Success Metrics & KPIs

| Metric | Baseline (Manual) | MVP Target (6 months) | Scale Target (18 months) |
|---|---|---|---|
| Time to generate timetable | 2–4 weeks | < 2 minutes | < 30 seconds |
| Scheduling conflicts at launch | 10–30 typical | 0 guaranteed | 0 guaranteed |
| Universities onboarded | N/A | 5 universities | 100 universities |
| Active student users | N/A | 2,000 students | 500,000 students |
| Active faculty users | N/A | 200 faculty | 10,000 faculty |
| Public portal verifications/month | N/A | 500 | 100,000 |
| Admission applications via portal | N/A | 1,000 | 500,000 |
| Student app DAU | N/A | 60% enrolled students | 75% enrolled students |
| AI chatbot queries/day | N/A | 500 | 100,000 |
| Attendance processed via QR | N/A | 50% sessions | 90% sessions |
| NPS Score (Admin users) | N/A | > 40 | > 65 |
| NPS Score (Students) | N/A | > 35 | > 60 |
| Blockchain verifications/month | N/A | 200 | 50,000 |
| NAAC report generation time | 2–3 months manual | < 1 hour | < 15 minutes |
| Student dropout prediction accuracy | N/A | 75% | 90% |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
*Supersedes NEP-Scheduler PRD v1.0.0 — February 2026*
