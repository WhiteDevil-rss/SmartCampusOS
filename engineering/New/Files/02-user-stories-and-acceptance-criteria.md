# 02 — User Stories & Acceptance Criteria

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## Format

Each story follows: **"As a [persona], I want [action], so that [benefit]"**
Acceptance criteria follow Given / When / Then.

---

## 1. Superadmin Stories

### US-SA-01 — Provision University
**As a Superadmin, I want to create a new university tenant so that the institution can start using the platform.**

**Acceptance Criteria:**
- GIVEN I am on the Universities page WHEN I submit the Create University form with name, slug, admin email THEN a new PostgreSQL schema is provisioned, admin credentials are auto-generated, and the university appears in the list
- GIVEN the slug is already taken WHEN I submit THEN an inline error "Slug already in use" is shown and no record is created
- GIVEN the university is created WHEN I click "View Details" THEN I see department count, faculty count, timetable count all showing 0

### US-SA-02 — Configure Public Portal
**As a Superadmin, I want to configure a per-university public portal so that each institution has a unique branded public presence.**

**Acceptance Criteria:**
- GIVEN I open a university's public portal settings WHEN I upload a logo, set primary/secondary colours, and enter a custom domain THEN the public portal at `/public/{slug}` renders those brand assets
- GIVEN I disable a feature toggle (e.g. "Admission Portal") WHEN a visitor accesses that university's public portal THEN the admission section is completely invisible in the UI and the API returns 404 for admission endpoints
- GIVEN two universities have different configs WHEN both portals are loaded THEN branding, colours, and features are independent with zero cross-contamination

### US-SA-03 — Global Credential Management
**As a Superadmin, I want to reset any user's password across any university so that I can resolve access issues centrally.**

**Acceptance Criteria:**
- GIVEN I search for a faculty member across all universities WHEN I reset their password THEN a new credential is set and the user is forced to re-login
- GIVEN I trigger a bulk reset for a university WHEN the operation completes THEN all admin-level users of that university receive an email with reset links

---

## 2. University Admin Stories

### US-UA-01 — Publish Result with Blockchain Hash
**As a University Admin, I want to publish semester results with blockchain verification so that employers can cryptographically verify academic records.**

**Acceptance Criteria:**
- GIVEN all marks are entered for a batch WHEN I click "Publish Results" THEN a SHA-256 hash of each result record is generated and written to Polygon L2 with a transaction hash
- GIVEN the result is published WHEN a public verifier enters the enrollment number on the public portal THEN they see a ✅ Verified badge and a Polygonscan link
- GIVEN someone modifies the result in the database WHEN verification runs THEN the hash mismatch is detected and the portal shows ❌ Tampered

### US-UA-02 — Generate NAAC Report
**As a University Admin, I want to auto-generate a NAAC report so that I save weeks of manual compilation.**

**Acceptance Criteria:**
- GIVEN academic and placement data exists WHEN I click "Export NAAC Report" THEN a structured PDF is generated in < 1 hour with all filled NAAC criteria sections
- GIVEN the report is generated WHEN I download it THEN it is a print-ready A4 PDF with university branding, timestamp, and digital signature area

### US-UA-03 — Exam Management
**As a University Admin, I want to generate hall tickets and an exam timetable so that students and invigilators know their assignments.**

**Acceptance Criteria:**
- GIVEN enrollment data exists WHEN I configure exam dates and rooms THEN a conflict-free exam timetable is generated
- GIVEN the timetable is set WHEN I click "Generate Hall Tickets" THEN PDF hall tickets are produced for all enrolled students with photo, exam schedule, and QR code
- GIVEN a hall ticket is generated WHEN a student views it in their portal THEN it matches the officially published version

---

## 3. Department Admin Stories

### US-DA-01 — Generate Conflict-Free Timetable
**As a Department Admin, I want to generate a conflict-free timetable using AI so that classes run without overlap.**

**Acceptance Criteria:**
- GIVEN faculty, rooms, courses, and batches are configured WHEN I click "Generate Timetable" with valid time params THEN a timetable is produced with 0 faculty conflicts, 0 room conflicts, and 0 batch conflicts in < 30 seconds
- GIVEN generation completes WHEN I view the timetable THEN it is shown as a weekly grid with days × time slots, each cell displaying subject, faculty, and room
- GIVEN no feasible solution exists WHEN generation runs THEN the system returns a detailed conflict report with specific constraint violations and recommendations

### US-DA-02 — Special Timetable with Resource Exclusion
**As a Department Admin, I want to generate a special timetable excluding absent faculty so that classes continue uninterrupted.**

**Acceptance Criteria:**
- GIVEN I select one or more faculty to exclude WHEN I generate the special timetable THEN zero slots are assigned to the excluded faculty
- GIVEN an excluded faculty has a course with no other qualified faculty WHEN the timetable generates THEN that slot is marked "⚠️ No Faculty Available" and visually differentiated
- GIVEN a special timetable exists WHEN I export it to PDF THEN it is clearly labelled "Special Timetable" with the excluded faculty names and date

### US-DA-03 — Library Management
**As a Department Admin, I want to manage the library catalog and track loans so that students have accurate book availability.**

**Acceptance Criteria:**
- GIVEN I add a book WHEN a student searches the catalog THEN the book appears with available copy count
- GIVEN a student checks out a book WHEN the due date passes THEN the student receives an automated reminder and a late fee is computed
- GIVEN a student returns a book WHEN the librarian marks it returned THEN available copies increment and reservations are notified

### US-DA-04 — Placement Records
**As a Department Admin, I want to track placement records so that I can report accurate placement statistics.**

**Acceptance Criteria:**
- GIVEN a company posts a job WHEN a student is placed THEN a placement record is created with company, role, and CTC
- GIVEN placement records exist WHEN I view the placement dashboard THEN I see total placements, average CTC, top recruiters, and batch-wise breakdown

---

## 4. Faculty Stories

### US-FA-01 — QR Attendance
**As a Faculty Member, I want to take attendance via QR code so that I eliminate proxy marking.**

**Acceptance Criteria:**
- GIVEN I open an attendance session for a class WHEN I click "Generate QR" THEN a unique QR token is created valid for a configurable window (default 10 minutes)
- GIVEN the QR is active WHEN a student scans it from their app THEN their attendance is marked PRESENT with timestamp and method = QR
- GIVEN the session window closes WHEN a student tries to scan THEN they receive "Session Expired" and their attendance is not marked

### US-FA-02 — Upload Study Materials
**As a Faculty Member, I want to upload study materials to courses so that students can access them anytime.**

**Acceptance Criteria:**
- GIVEN I upload a PDF/PPT/video WHEN the upload completes THEN the file is stored in S3 and linked to the course
- GIVEN a material is uploaded WHEN the AI indexing pipeline runs THEN the content is indexed in Elasticsearch for the AI chatbot to reference
- GIVEN a student opens Study Materials for a course WHEN they select a PDF THEN it renders in-browser without downloading

### US-FA-03 — Online Quiz with Auto-Grading
**As a Faculty Member, I want to create a quiz with MCQ auto-grading so that I don't manually correct every answer.**

**Acceptance Criteria:**
- GIVEN I create a quiz with MCQ questions and correct answers WHEN a student submits THEN the system auto-computes marks within 2 seconds
- GIVEN the quiz is submitted WHEN I view the results dashboard THEN I see per-student score, question-wise accuracy, and class average
- GIVEN auto-grading runs WHEN I review a student's answers THEN I can manually override individual marks

### US-FA-04 — View Personal Timetable
**As a Faculty Member, I want to view my weekly timetable so that I know exactly where I need to be each day.**

**Acceptance Criteria:**
- GIVEN I am logged in WHEN I open My Timetable THEN I see only the classes assigned to me in a weekly grid (days × time slots)
- GIVEN the timetable changes via a special schedule WHEN changes are published THEN I receive a real-time notification and the grid updates without page refresh

---

## 5. Student Stories

### US-ST-01 — View AI-Generated Timetable
**As a Student, I want to view my AI-generated timetable so that I know exactly where to be each day.**

**Acceptance Criteria:**
- GIVEN I am enrolled in a batch WHEN I open Timetable THEN I see my full weekly schedule including subject, faculty, room, and time slot
- GIVEN a class is cancelled WHEN I open the timetable THEN the cancelled slot is visually marked and I have already received a notification

### US-ST-02 — Pay Fees Online
**As a Student, I want to pay my fees online so that I don't need to visit the accounts office.**

**Acceptance Criteria:**
- GIVEN my fees are due WHEN I navigate to Fees THEN I see an itemised breakdown of all dues with due dates
- GIVEN I complete payment via Razorpay WHEN payment is confirmed THEN a downloadable receipt is generated and fees history is updated instantly
- GIVEN a payment fails WHEN I retry THEN no duplicate payment is created (idempotency enforced)

### US-ST-03 — Use AI Doubt Chatbot
**As a Student, I want to ask the AI chatbot subject questions so that I can clarify doubts instantly.**

**Acceptance Criteria:**
- GIVEN I open the chatbot for a course WHEN I type a question about the subject THEN a contextually accurate answer is returned in < 5 seconds, citing content from uploaded study materials
- GIVEN a question is outside the uploaded materials WHEN I ask THEN the bot clearly says "This topic isn't covered in uploaded materials" rather than hallucinating
- GIVEN I ask the same question to two students from different universities WHEN the chatbot responds THEN answers are contextually varied per university's material (temperature=1)

### US-ST-04 — Request Service (Bonafide Certificate)
**As a Student, I want to request a bonafide certificate online so that I don't need to visit the admin office.**

**Acceptance Criteria:**
- GIVEN I submit a service request WHEN the admin approves it THEN a PDF bonafide certificate is generated with university seal, student details, and purpose
- GIVEN the request is processed WHEN I open My Services THEN I see the request status and can download the certificate directly

### US-ST-05 — View Digital ID Card
**As a Student, I want a digital ID card with QR code so that I can use it for campus access.**

**Acceptance Criteria:**
- GIVEN I am enrolled WHEN I open Digital ID THEN I see a card with my photo, name, enrollment number, and a scannable QR code
- GIVEN I scan the QR at a library entry point WHEN the QR is read THEN the library system confirms identity and grants access
- GIVEN my enrollment status changes WHEN the ID is refreshed THEN it reflects current academic year and batch

### US-ST-06 — View Attendance Risk Alert
**As a Student, I want attendance risk alerts so that I don't fall below the minimum threshold.**

**Acceptance Criteria:**
- GIVEN my attendance in a subject drops below 80% WHEN I open the student portal THEN I see a red alert banner listing the at-risk subjects and sessions needed
- GIVEN I flag an absence as "Hackathon / Sports Day" WHEN the admin approves it THEN the attendance percentage is recalculated excluding the flagged session

---

## 6. Public Portal Stories

### US-PP-01 — Verify Result via Hash
**As a Public Verifier (Employer / Bank), I want to verify a student's result so that I can confirm its authenticity without contacting the university.**

**Acceptance Criteria:**
- GIVEN I navigate to the university's public portal WHEN I enter the enrollment number and semester THEN the result record is displayed with a blockchain verification badge
- GIVEN the result is authentic WHEN verification runs THEN a ✅ Verified badge and Polygonscan transaction link are shown
- GIVEN someone has tampered with the result WHEN verification runs THEN a ❌ Tampered badge is shown and the mismatched hashes are displayed

### US-PP-02 — Apply for Admission Online
**As an Applicant, I want to apply for admission online so that I don't need to visit the campus.**

**Acceptance Criteria:**
- GIVEN the admission portal is open WHEN I fill the application form and upload documents THEN I receive an application ID and confirmation email
- GIVEN the application is submitted WHEN I check status with my application ID THEN I see the current stage (Submitted → Shortlisted → Selected / Rejected)
- GIVEN I am shortlisted WHEN the merit list is published THEN I see my rank and next steps on the status page

### US-PP-03 — University Portal Shows Only Its Own Data
**As any Public Visitor, I want each university's portal to show only that university's data so that I am never confused by data from another institution.**

**Acceptance Criteria:**
- GIVEN I navigate to `vnsgu` public portal WHEN I search a student THEN only VNSGU students are returned
- GIVEN I navigate to `spuvvn` public portal WHEN I load the page THEN SPUVVN branding, colors, and features are shown with zero VNSGU data
- GIVEN I attempt a cross-tenant API call directly WHEN the server processes it THEN it returns 403 and nothing from the other university's schema is exposed

---

## 7. Real-Time & Notifications

### US-RT-01 — Real-Time Timetable Update
**As a Student or Faculty Member, I want to receive real-time updates when the timetable changes so that I am never working from outdated information.**

**Acceptance Criteria:**
- GIVEN the timetable is updated by a Dept Admin WHEN the change is saved THEN all affected students and faculty receive an in-app notification and the timetable grid updates without page refresh within 2 seconds
- GIVEN I am offline WHEN I come back online THEN I receive a summary of changes that occurred while I was offline

### US-RT-02 — Fee Due Reminder
**As a Student, I want an automated fee due reminder so that I don't miss payment deadlines.**

**Acceptance Criteria:**
- GIVEN a fee is due in 7 days WHEN the daily reminder job runs THEN I receive an email, SMS, and in-app notification
- GIVEN the fee is paid WHEN reminders next run THEN no duplicate reminder is sent

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
