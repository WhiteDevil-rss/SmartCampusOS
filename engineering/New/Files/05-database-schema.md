# 05 — Database Schema

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Polyglot Persistence Strategy

| Database | Technology | Data Stored | Justification |
|---|---|---|---|
| Primary OLTP | PostgreSQL 15 (per-schema multi-tenant) | Universities, departments, faculty, students, courses, timetables, fees, results | ACID compliance, complex joins, Row-Level Security |
| Document Store | MongoDB Atlas | Timetable JSON, scheduling configs, AI metadata, chat history | Flexible schema for variable structures |
| Cache | Redis Cluster | Sessions, timetable snapshots, API responses, distributed locks | Sub-millisecond reads |
| Search | Elasticsearch 8 | Audit logs, full-text search, RAG document index per university | Full-text search, vector similarity |
| Time-Series | InfluxDB 2 | IoT sensor data, system metrics, scheduling telemetry | Efficient time-series storage |
| Object Storage | AWS S3 | PDFs, videos, study materials, ML models, university assets | Durable scalable blob storage |
| Blockchain | Polygon L2 | Academic result hashes, degree verification proofs | Immutable tamper-proof records |
| Message Queue | Apache Kafka | All platform events, IoT feeds, notifications, audit streams | High-throughput event streaming |

---

## 2. Multi-Tenant Schema Strategy

Each university receives a dedicated PostgreSQL schema, e.g. `schema: vnsgu`, `schema: spuvvn`.

```sql
-- Provisioning a new university
CREATE SCHEMA IF NOT EXISTS vnsgu;
SET search_path = vnsgu, public;

-- Row-Level Security for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY dept_rls ON departments
  USING (university_id = current_setting('app.current_university_id'));
```

---

## 3. Core Prisma Schema

```prisma
// Full schema — per-university PostgreSQL schema via Prisma multi-schema

model University {
  id            String              @id @default(cuid())
  name          String
  slug          String              @unique
  logoUrl       String?
  established   Int?
  accreditation String?
  publicPortal  PublicPortalConfig?
  departments   Department[]
  faculty       Faculty[]
  students      Student[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

model PublicPortalConfig {
  id           String     @id @default(cuid())
  universityId String     @unique
  university   University @relation(fields: [universityId], references: [id])
  slug         String     @unique
  customDomain String?
  enabled      Boolean    @default(true)
  branding     Json
  // { logoUrl, primaryColor, secondaryColor, heroImageUrl, universityFullName, tagline, headingFont }
  features     Json
  // { resultVerification, blockchainVerification, admissionPortal, admissionStatusTracking,
  //   scholarshipPortal, degreeVerification, certificateVerification,
  //   publicResearchRepo, rankingDashboard, vacancyPublication }
  rateLimits   Json
  // { verificationsPerHour, admissionsPerHour }
  updatedAt    DateTime   @updatedAt
}

model Department {
  id           String     @id @default(cuid())
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  name         String
  code         String
  hodFacultyId String?
  programs     Program[]
  faculty      Faculty[]
  courses      Course[]
  batches      Batch[]
  timetables   Timetable[]
  books        Book[]
  companies    Company[]
}

model Program {
  id              String     @id @default(cuid())
  departmentId    String
  department      Department @relation(fields: [departmentId], references: [id])
  name            String
  type            String     // UNDERGRADUATE | POSTGRADUATE | DOCTORAL | FYUP | BEd | MEd | ITEP | MCA | MBA
  durationYears   Int
  creditsRequired Int
  nepExitPoints   Int[]      // [1, 2, 3, 4] for FYUP
  students        Student[]
  courses         Course[]
  feeStructures   FeeStructure[]
}

model Faculty {
  id              String     @id @default(cuid())
  universityId    String
  university      University @relation(fields: [universityId], references: [id])
  departmentId    String
  department      Department @relation(fields: [departmentId], references: [id])
  name            String
  email           String     @unique
  phone           String?
  designation     String     // PROFESSOR | ASSOCIATE_PROFESSOR | ASSISTANT_PROFESSOR | HOD | LECTURER
  specializations String[]
  maxHrsPerWeek   Int        @default(20)
  photoUrl        String?
  researchProfile Json?
  // { publications[], conferences[], patents[], fdpRecords[] }
  createdAt       DateTime   @default(now())
}

model Student {
  id             String     @id @default(cuid())
  universityId   String
  university     University @relation(fields: [universityId], references: [id])
  departmentId   String
  enrollmentNo   String     @unique
  name           String
  email          String     @unique
  phone          String?
  batchId        String
  batch          Batch      @relation(fields: [batchId], references: [id])
  programId      String
  program        Program    @relation(fields: [programId], references: [id])
  admissionYear  Int
  photoUrl       String?
  status         String     @default("ACTIVE")
  // ACTIVE | DETAINED | LATERAL_ENTRY | DROPPED_OUT | GRADUATED
  attendance     AttendanceRecord[]
  marks          Mark[]
  feePayments    FeePayment[]
  bookLoans      BookLoan[]
  submissions    Submission[]
  placementRecord PlacementRecord?
  results        Result[]
  serviceRequests ServiceRequest[]
  createdAt      DateTime   @default(now())
}

model Batch {
  id           String     @id @default(cuid())
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  programId    String
  program      Program    @relation(fields: [programId], references: [id])
  name         String     // e.g. "MCA Sem 2 Div A 2025-26"
  semester     Int
  year         Int
  division     String?    // A | B | C
  strength     Int
  students     Student[]
  timetables   Timetable[]
}

model Course {
  id           String     @id @default(cuid())
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  programId    String?
  program      Program?   @relation(fields: [programId], references: [id])
  name         String
  code         String
  credits      Int
  type         String     // THEORY | LAB | PROJECT | ELECTIVE
  isLab        Boolean    @default(false)
  nepCategory  String?    // MAJOR | MINOR | MDC | IDC | VAC | SEC | AEC
  creditsPerWeek Int      @default(3)
  qualifiedFaculty Faculty[] @relation("CourseQualifiedFaculty")
  assignments  Assignment[]
  marks        Mark[]
}

model Room {
  id           String   @id @default(cuid())
  universityId String
  departmentId String?
  name         String
  type         String   // CLASSROOM | LAB | SEMINAR_HALL | AUDITORIUM
  capacity     Int
  floor        Int?
  building     String?
  isAvailable  Boolean  @default(true)
}

// ─── TIMETABLE ─────────────────────────────────────────────────

model Timetable {
  id           String          @id @default(cuid())
  departmentId String
  department   Department      @relation(fields: [departmentId], references: [id])
  batchId      String?
  batch        Batch?          @relation(fields: [batchId], references: [id])
  semester     Int
  academicYear String
  type         String          @default("STANDARD") // STANDARD | SPECIAL
  status       String          @default("DRAFT")    // DRAFT | PUBLISHED | ARCHIVED
  generatedAt  DateTime        @default(now())
  metadata     Json?           // solver stats, generation config, constraint violations
  slots        TimetableSlot[]
}

model TimetableSlot {
  id          String    @id @default(cuid())
  timetableId String
  timetable   Timetable @relation(fields: [timetableId], references: [id])
  dayOfWeek   Int       // 1=Mon ... 6=Sat
  slotIndex   Int       // 0-based within the day
  startTime   String    // "09:00"
  endTime     String    // "10:00"
  courseId    String?
  facultyId   String?
  roomId      String?
  batchId     String?
  slotType    String    // THEORY | LAB | BREAK | FREE | UNAVAILABLE
  isHighlighted Boolean @default(false) // for special timetable changes
}

// ─── ATTENDANCE ─────────────────────────────────────────────────

model AttendanceSession {
  id              String             @id @default(cuid())
  timetableSlotId String
  date            DateTime
  method          String             // MANUAL | QR | IOT_BLE | FACE_RECOGNITION
  qrToken         String?            @unique
  openedAt        DateTime
  closedAt        DateTime?
  records         AttendanceRecord[]
}

model AttendanceRecord {
  id          String            @id @default(cuid())
  sessionId   String
  session     AttendanceSession @relation(fields: [sessionId], references: [id])
  studentId   String
  student     Student           @relation(fields: [studentId], references: [id])
  status      String            // PRESENT | ABSENT | LATE | EXCUSED
  method      String            // QR | MANUAL | BLE | FACE
  markedAt    DateTime          @default(now())
  flags       AttendanceFlag[]
}

model AttendanceFlag {
  id           String           @id @default(cuid())
  attendanceId String
  attendance   AttendanceRecord @relation(fields: [attendanceId], references: [id])
  flagType     String           // SPORTS_DAY | HACKATHON | OFFICIAL_EVENT | MEDICAL
  approvedBy   String?
  approvedAt   DateTime?
}

// ─── ACADEMIC RECORDS ───────────────────────────────────────────

model Assignment {
  id          String       @id @default(cuid())
  courseId    String
  course      Course       @relation(fields: [courseId], references: [id])
  facultyId   String
  title       String
  description String?
  dueDate     DateTime
  maxMarks    Float
  fileUrl     String?
  createdAt   DateTime     @default(now())
  submissions Submission[]
}

model Submission {
  id           String     @id @default(cuid())
  assignmentId String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  studentId    String
  student      Student    @relation(fields: [studentId], references: [id])
  fileUrl      String?
  submittedAt  DateTime   @default(now())
  marksObtained Float?
  feedback     String?
  isLate       Boolean    @default(false)
}

model Mark {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id])
  examType      String   // INTERNAL_1 | INTERNAL_2 | MID_TERM | END_TERM | PRACTICAL | VIVA
  marksObtained Float
  maxMarks      Float
  semester      Int
  academicYear  String
  uploadedBy    String
  uploadedAt    DateTime @default(now())
}

model Result {
  id                    String    @id @default(cuid())
  studentId             String
  student               Student   @relation(fields: [studentId], references: [id])
  programId             String
  semester              Int
  academicYear          String
  sgpa                  Float
  cgpa                  Float
  status                String    // PASS | FAIL | DETAINED | WITHHELD | SUPPLEMENTARY
  resultHash            String    // SHA-256 of canonical result JSON
  publishedAt           DateTime?
  blockchainTxHash      String?   // Polygon L2 transaction hash
  blockchainConfirmedAt DateTime?
}

model VerificationRequest {
  id              String   @id @default(cuid())
  universityId    String
  enrollmentNo    String
  requesterIp     String
  requestType     String   // RESULT | DEGREE | CERTIFICATE | BONAFIDE
  verifiedAt      DateTime @default(now())
  blockchainMatch Boolean
  resultSnapshot  Json?
}

// ─── FEES ───────────────────────────────────────────────────────

model FeeStructure {
  id           String       @id @default(cuid())
  universityId String
  programId    String
  program      Program      @relation(fields: [programId], references: [id])
  semester     Int
  academicYear String
  components   Json         // [{ name, amount, optional, category }]
  totalAmount  Float
  payments     FeePayment[]
}

model FeePayment {
  id             String       @id @default(cuid())
  studentId      String
  student        Student      @relation(fields: [studentId], references: [id])
  feeStructureId String
  feeStructure   FeeStructure @relation(fields: [feeStructureId], references: [id])
  amount         Float
  paymentDate    DateTime
  method         String       // ONLINE | CASH | DD | SCHOLARSHIP_ADJUST
  transactionId  String?
  gateway        String?      // RAZORPAY | PAYU
  status         String       // PENDING | COMPLETED | FAILED | REFUNDED
  receiptUrl     String?
}

model Scholarship {
  id           String   @id @default(cuid())
  studentId    String
  type         String   // MERIT | NEED_BASED | GOVT | SPORTS | SC_ST_OBC
  amount       Float
  academicYear String
  status       String   // APPLIED | APPROVED | DISBURSED | REJECTED
  approvedBy   String?
  approvedAt   DateTime?
}

// ─── LIBRARY ────────────────────────────────────────────────────

model Book {
  id              String            @id @default(cuid())
  universityId    String
  departmentId    String?
  isbn            String
  title           String
  author          String
  category        String
  totalCopies     Int
  availableCopies Int
  loans           BookLoan[]
  reservations    BookReservation[]
}

model BookLoan {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id])
  issuedAt   DateTime @default(now())
  dueDate    DateTime
  returnedAt DateTime?
  fineAmount Float?
  finePaid   Boolean  @default(false)
}

model BookReservation {
  id         String   @id @default(cuid())
  studentId  String
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id])
  reservedAt DateTime @default(now())
  expiresAt  DateTime
  status     String   // ACTIVE | FULFILLED | EXPIRED | CANCELLED
}

// ─── PLACEMENT ──────────────────────────────────────────────────

model Company {
  id           String           @id @default(cuid())
  universityId String
  name         String
  type         String           // IT | CORE | FINANCE | STARTUP | MNC | PSU
  hrContact    String?
  website      String?
  ctcRange     String?
  jobPostings  JobPosting[]
  placements   PlacementRecord[]
}

model JobPosting {
  id                 String          @id @default(cuid())
  companyId          String
  company            Company         @relation(fields: [companyId], references: [id])
  departmentId       String?
  title              String
  description        String
  ctc                Float?
  eligibilityCriteria Json
  // { minCgpa, allowedBranches, allowedBatches, maxBacklogs }
  deadline           DateTime
  isPublic           Boolean         @default(false)
  createdAt          DateTime        @default(now())
  placements         PlacementRecord[]
}

model PlacementRecord {
  id           String     @id @default(cuid())
  studentId    String     @unique
  student      Student    @relation(fields: [studentId], references: [id])
  companyId    String
  company      Company    @relation(fields: [companyId], references: [id])
  jobPostingId String?
  jobPosting   JobPosting? @relation(fields: [jobPostingId], references: [id])
  placedAt     DateTime
  ctc          Float
  role         String
  offerLetterUrl String?
}

// ─── SERVICE REQUESTS ───────────────────────────────────────────

model ServiceRequest {
  id          String   @id @default(cuid())
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])
  type        String   // BONAFIDE | BRTS_PASS | TRANSCRIPT | ID_CARD_REPLACEMENT | MIGRATION
  purpose     String?
  status      String   // PENDING | UNDER_REVIEW | APPROVED | REJECTED | DELIVERED
  documentUrl String?
  requestedAt DateTime @default(now())
  processedAt DateTime?
  processedBy String?
  remarks     String?
}

// ─── ADMISSIONS ─────────────────────────────────────────────────

model AdmissionApplication {
  id           String   @id @default(cuid())
  universityId String
  programId    String
  applicantName String
  email        String
  phone        String?
  documents    Json     // { marksheets, photos, certificates, entranceScore }
  status       String   // SUBMITTED | SHORTLISTED | SELECTED | REJECTED | WAITLISTED
  meritRank    Int?
  appliedAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ─── VACANCIES ──────────────────────────────────────────────────

model Vacancy {
  id           String   @id @default(cuid())
  universityId String
  departmentId String?
  title        String
  type         String   // TEACHING | NON_TEACHING | CONTRACT | GUEST
  description  String
  qualifications String
  lastDate     DateTime
  isPublic     Boolean  @default(false)
  applicationLink String?
  postedAt     DateTime @default(now())
}
```

---

## 4. MongoDB Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `timetables` | Generated timetable JSON (full structure) | `universityId`, `departmentId`, `batchId`, `slots[]` |
| `scheduling_configs` | OR-Tools solver configs per department | `departmentId`, `timeParams`, `softConstraintWeights` |
| `ai_metadata` | ML prediction audit trail | `modelVersion`, `input`, `prediction`, `timestamp` |
| `chat_sessions` | AI chatbot conversation history | `studentId`, `universityId`, `subjectId`, `messages[]` |
| `study_material_chunks` | RAG document chunks (fallback cache) | `materialId`, `chunkIndex`, `content`, `embedding` |

---

## 5. Redis Cache Key Patterns

| Key Pattern | TTL | Content |
|---|---|---|
| `session:{userId}` | 8 hours | Authenticated session data |
| `timetable:{id}:grid` | 1 hour | Timetable grid JSON |
| `student:{id}:timetable` | 30 min | Student's current timetable |
| `public:{slug}:config` | 60 sec | University public portal config + branding |
| `public:{slug}:results:{enrollmentNo}` | 10 min | Verified result + blockchain match |
| `public:{slug}:vacancies` | 5 min | Active vacancy listings |
| `fees:{studentId}:dues` | 5 min | Outstanding fee dues |
| `attendance:{sessionId}:present` | Session duration | Set of present students |
| `analytics:{uniId}:dashboard` | 15 min | University performance aggregates |
| `blockchain:result:{enrollmentNo}:{sem}` | 24 hours | On-chain verification result (immutable) |
| `lock:timetable:{deptId}` | 120 sec | Distributed lock for generation |
| `ratelimit:{ip}:{route}` | 60 sec | Rate limit counter |

---

## 6. Blockchain Data Model

```solidity
// AcademicRecords.sol — Polygon L2

struct ResultRecord {
    string universityId;
    string enrollmentNo;
    uint8 semester;
    string resultHash;       // SHA-256 of canonical result JSON
    uint256 publishedAt;
    address publishedBy;
}

// Key: keccak256(universityId + enrollmentNo + semester)
mapping(bytes32 => ResultRecord) private results;

event ResultPublished(
    string indexed universityId,
    string indexed enrollmentNo,
    uint8 semester,
    string resultHash,
    uint256 timestamp
);
```

---

## 7. Elasticsearch Indices

| Index Pattern | Content | Used By |
|---|---|---|
| `audit-{yyyy.mm}` | All platform audit events | Kibana security dashboard |
| `idx_{slug}_subject_{subjectId}` | Study material chunks per course per university | AI chatbot RAG |
| `idx_{slug}_research` | Research papers per university | Public research repository |
| `idx_global_faculty` | Faculty profiles (searchable) | Substitute recommender |
| `idx_{slug}_books` | Book catalog per university | Library search |

---

## 8. Test Seed Data (VNSGU)

| Entity | Count | Key Values |
|---|---|---|
| University | 1 | VNSGU — slug: `vnsgu`, schema: `vnsgu` |
| University (2nd) | 1 | SPUVVN — slug: `spuvvn`, schema: `spuvvn` |
| Department | 1 | Computer Science, VNSGU |
| Program | 1 | MCA — 2 years, credits: 120 |
| Faculty | 9 | Rustam, Ravi, Dharmen, Nimisha, Jayshree, Mayur, Prakash, Vimal, Rinku |
| Students | 60 | Div A (30) + Div B (30) — MCA Sem 2 |
| Courses | 7 | AI (201), Frontend (202), .Net (203), Blockchain (204), Python (204), iOS (205), Android (205) |
| Rooms | 5 | CS 101 (cap 60), CS 102 (cap 60), CS 201 (cap 40), Lab A (cap 30), Lab B (cap 30) |
| Results (published) | 60 | Sem 1 results with blockchain hashes |
| Fee Structures | 2 | MCA Year 1 ₹45,000, Year 2 ₹45,000 |
| Library Books | 50 | CS department catalog |
| Companies | 5 | TCS, Infosys, Wipro, L&T Infotech, Jaro Education |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
