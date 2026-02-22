# 05 — Database Schema

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Database Strategy

NEP-Scheduler uses **PostgreSQL 15** as its primary OLTP store with a **schema-per-tenant** multi-tenancy model. Each university gets a dedicated PostgreSQL schema (e.g., `schema: vnsgu`). Row-Level Security (RLS) enforces department and faculty-level isolation within each schema.

---

## 2. Entity Relationship Overview

```
universities (1)
  ├── (many) departments
  │     ├── (many) faculty
  │     │     └── (many) faculty_subjects ↔ courses
  │     ├── (many) courses
  │     ├── (many) batches
  │     └── (many) timetables
  │           └── (many) timetable_slots
  ├── (many) resources      ← shared across all departments
  ├── (many) programs
  └── (many) users          ← all role types
```

---

## 3. Prisma Schema (ORM Definition)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model University {
  id           String       @id @default(uuid())
  name         String
  shortName    String       @unique
  location     String?
  email        String?
  estYear      Int?
  website      String?
  adminUserId  String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  departments  Department[]
  programs     Program[]
  resources    Resource[]
  faculty      Faculty[]
  batches      Batch[]
  courses      Course[]
  timetables   Timetable[]
  users        User[]

  @@map("universities")
}

model Department {
  id           String      @id @default(uuid())
  universityId String
  university   University  @relation(fields: [universityId], references: [id], onDelete: Cascade)
  name         String
  shortName    String
  hod          String?
  email        String?
  adminUserId  String?
  createdAt    DateTime    @default(now())
  faculty      Faculty[]
  courses      Course[]
  batches      Batch[]
  timetables   Timetable[]

  @@map("departments")
}

model Faculty {
  id              String          @id @default(uuid())
  departmentId    String
  universityId    String
  department      Department      @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  university      University      @relation(fields: [universityId], references: [id])
  name            String
  email           String          @unique
  phone           String?
  designation     String?
  maxHrsPerDay    Int             @default(4)
  maxHrsPerWeek   Int             @default(20)
  userId          String?
  user            User?           @relation(fields: [userId], references: [id])
  createdAt       DateTime        @default(now())
  subjects        FacultySubject[]
  timetableSlots  TimetableSlot[]

  @@map("faculty")
}

model FacultySubject {
  id              String   @id @default(uuid())
  facultyId       String
  courseId        String
  faculty         Faculty  @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  isPrimary       Boolean  @default(true)
  proficiencyLevel Int     @default(5)

  @@unique([facultyId, courseId])
  @@map("faculty_subjects")
}

model Course {
  id             String          @id @default(uuid())
  departmentId   String?
  universityId   String
  department     Department?     @relation(fields: [departmentId], references: [id])
  university     University      @relation(fields: [universityId], references: [id])
  name           String
  code           String
  program        String?
  credits        Int             @default(4)
  weeklyHrs      Int             @default(4)
  type           String          @default("Theory")  // Theory | Lab | Theory+Lab
  createdAt      DateTime        @default(now())
  facultySubjects FacultySubject[]
  timetableSlots TimetableSlot[]

  @@map("courses")
}

model Batch {
  id             String          @id @default(uuid())
  departmentId   String?
  universityId   String
  department     Department?     @relation(fields: [departmentId], references: [id])
  university     University      @relation(fields: [universityId], references: [id])
  name           String
  program        String?
  semester       Int?
  division       String?
  year           String?
  strength       Int             @default(30)
  createdAt      DateTime        @default(now())
  timetableSlots TimetableSlot[]
  timetables     Timetable[]

  @@map("batches")
}

model Resource {
  id             String          @id @default(uuid())
  universityId   String
  university     University      @relation(fields: [universityId], references: [id])
  name           String
  type           String          // Classroom | Lab | Seminar Hall | Auditorium
  capacity       Int             @default(30)
  floor          String?
  building       String?
  createdAt      DateTime        @default(now())
  timetableSlots TimetableSlot[]

  @@map("resources")
}

model Program {
  id           String     @id @default(uuid())
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  name         String
  shortName    String
  type         String     // UG | PG | Diploma | Ph.D
  duration     Int        @default(2)
  totalSems    Int        @default(4)

  @@map("programs")
}

model Timetable {
  id              String          @id @default(uuid())
  universityId    String
  departmentId    String?
  batchId         String?
  university      University      @relation(fields: [universityId], references: [id])
  department      Department?     @relation(fields: [departmentId], references: [id])
  batch           Batch?          @relation(fields: [batchId], references: [id])
  name            String?
  isSpecial       Boolean         @default(false)
  status          String          @default("ACTIVE")  // ACTIVE | ARCHIVED | DRAFT
  configJson      Json?
  generatedBy     String          @default("AI")
  version         Int             @default(1)
  conflictCount   Int             @default(0)
  generationMs    Int?
  createdAt       DateTime        @default(now())
  slots           TimetableSlot[]

  @@map("timetables")
}

model TimetableSlot {
  id           String     @id @default(uuid())
  timetableId  String
  timetable    Timetable  @relation(fields: [timetableId], references: [id], onDelete: Cascade)
  dayOfWeek    Int        // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  slotNumber   Int
  startTime    String     // "09:00"
  endTime      String     // "10:00"
  courseId     String?
  facultyId    String?
  roomId       String?
  batchId      String
  course       Course?    @relation(fields: [courseId], references: [id])
  faculty      Faculty?   @relation(fields: [facultyId], references: [id])
  room         Resource?  @relation(fields: [roomId], references: [id])
  batch        Batch      @relation(fields: [batchId], references: [id])
  isBreak      Boolean    @default(false)
  slotType     String     @default("THEORY")  // THEORY | LAB | BREAK

  @@map("timetable_slots")
}

model User {
  id           String     @id @default(uuid())
  username     String     @unique
  email        String?    @unique
  passwordHash String
  role         String     // SUPERADMIN | UNI_ADMIN | DEPT_ADMIN | FACULTY
  entityId     String?    // universityId | departmentId | facultyId
  universityId String?
  university   University? @relation(fields: [universityId], references: [id])
  faculty      Faculty[]
  createdAt    DateTime   @default(now())
  lastLogin    DateTime?

  @@map("users")
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String
  entityType String?
  entityId   String?
  changes    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@map("audit_logs")
}
```

---

## 4. Raw SQL Schema (PostgreSQL)

```sql
-- Core tables per university schema

CREATE TABLE universities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  short_name    TEXT UNIQUE NOT NULL,
  schema_name   TEXT UNIQUE NOT NULL,
  location      TEXT,
  email         TEXT,
  est_year      INT,
  admin_user_id UUID,
  config_json   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  short_name    TEXT NOT NULL,
  hod           TEXT,
  email         TEXT,
  admin_user_id UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faculty (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id    UUID REFERENCES departments(id) ON DELETE CASCADE,
  university_id    UUID REFERENCES universities(id),
  name             TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  designation      TEXT,
  max_hrs_per_day  INT DEFAULT 4,
  max_hrs_per_week INT DEFAULT 20,
  user_id          UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faculty_subjects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id       UUID REFERENCES faculty(id) ON DELETE CASCADE,
  course_id        UUID REFERENCES courses(id) ON DELETE CASCADE,
  is_primary       BOOLEAN DEFAULT TRUE,
  proficiency_level INT DEFAULT 5,
  UNIQUE (faculty_id, course_id)
);

CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  university_id UUID REFERENCES universities(id),
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,
  program       TEXT,
  credits       INT DEFAULT 4,
  weekly_hrs    INT DEFAULT 4,
  type          TEXT CHECK (type IN ('Theory','Lab','Theory+Lab')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  university_id UUID REFERENCES universities(id),
  name          TEXT NOT NULL,
  program       TEXT,
  semester      INT,
  division      TEXT,
  year          TEXT,
  strength      INT DEFAULT 30
);

CREATE TABLE resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id),
  name          TEXT NOT NULL,
  type          TEXT CHECK (type IN ('Classroom','Lab','Seminar Hall','Auditorium')),
  capacity      INT,
  floor         TEXT,
  building      TEXT
);

CREATE TABLE timetables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  batch_id      UUID REFERENCES batches(id),
  name          TEXT,
  status        TEXT DEFAULT 'ACTIVE',
  is_special    BOOLEAN DEFAULT FALSE,
  config_json   JSONB,
  generated_by  TEXT DEFAULT 'AI',
  version       INT DEFAULT 1,
  conflict_count INT DEFAULT 0,
  generation_ms INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timetable_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id  UUID REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week   INT CHECK (day_of_week BETWEEN 1 AND 6),  -- 1=Mon
  slot_number   INT,
  start_time    TEXT,   -- "09:00"
  end_time      TEXT,   -- "10:00"
  course_id     UUID REFERENCES courses(id),
  faculty_id    UUID REFERENCES faculty(id),
  room_id       UUID REFERENCES resources(id),
  batch_id      UUID REFERENCES batches(id),
  is_break      BOOLEAN DEFAULT FALSE,
  slot_type     TEXT DEFAULT 'THEORY'  -- THEORY | LAB | BREAK
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT CHECK (role IN ('SUPERADMIN','UNI_ADMIN','DEPT_ADMIN','FACULTY')),
  entity_id     UUID,
  university_id UUID REFERENCES universities(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  changes     JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Key Indexes

```sql
-- Timetable slot lookups (most frequent queries)
CREATE INDEX idx_slots_timetable ON timetable_slots (timetable_id, day_of_week, slot_number);
CREATE INDEX idx_slots_faculty   ON timetable_slots (faculty_id, timetable_id);
CREATE INDEX idx_slots_batch     ON timetable_slots (batch_id, day_of_week, slot_number);
CREATE INDEX idx_slots_room      ON timetable_slots (room_id, day_of_week, slot_number);

-- Faculty lookups
CREATE INDEX idx_faculty_dept ON faculty (department_id, university_id);
CREATE INDEX idx_faculty_user ON faculty (user_id);

-- Timetable status queries
CREATE INDEX idx_timetables_active ON timetables (department_id, status) WHERE status = 'ACTIVE';

-- Audit log time-range queries
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_user    ON audit_logs (user_id, created_at DESC);
```

---

## 6. Row Level Security (RLS) Policies

```sql
-- Enable RLS on tenant tables
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty         ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches         ENABLE ROW LEVEL SECURITY;

-- SUPERADMIN: full access
CREATE POLICY superadmin_all ON timetable_slots
  USING (current_setting('app.role', true) = 'SUPERADMIN');

-- UNI_ADMIN: own university only
CREATE POLICY uni_admin_policy ON faculty
  USING (university_id::text = current_setting('app.university_id', true));

-- DEPT_ADMIN: own department only
CREATE POLICY dept_admin_policy ON timetable_slots
  USING (
    timetable_id IN (
      SELECT id FROM timetables
      WHERE department_id::text = current_setting('app.department_id', true)
    )
  );

-- FACULTY: own slots only
CREATE POLICY faculty_policy ON timetable_slots
  USING (faculty_id::text = current_setting('app.faculty_id', true));
```

---

## 7. Field Definitions & Constraints

### User Roles Enum
| Value | Description |
|---|---|
| `SUPERADMIN` | Platform-level global admin |
| `UNI_ADMIN` | University-scoped admin |
| `DEPT_ADMIN` | Department-scoped admin / HOD |
| `FACULTY` | Individual faculty member |

### Course Types Enum
| Value | Description |
|---|---|
| `Theory` | Lecture-based; assigned to classrooms |
| `Lab` | Lab-based; assigned to lab rooms only |
| `Theory+Lab` | Combined; may have both classroom and lab slots |

### Timetable Status Enum
| Value | Description |
|---|---|
| `ACTIVE` | Current valid timetable for the department |
| `ARCHIVED` | Replaced by a newer version |
| `DRAFT` | Generated but not yet published |

### Slot Types Enum
| Value | Description |
|---|---|
| `THEORY` | Regular lecture slot |
| `LAB` | Lab session slot |
| `BREAK` | Break/lunch slot (no assignment) |

### Resource Types Enum
| Value | Description |
|---|---|
| `Classroom` | Regular theory lecture room |
| `Lab` | Computer/Science lab |
| `Seminar Hall` | Large presentation room |
| `Auditorium` | Venue for large events |

---

## 8. VNSGU Seed Data Reference

| Entity | Sample Data |
|---|---|
| University | Veer Narmad South Gujarat University (VNSGU) |
| Department | Department of Computer Science |
| Faculty | 9 members: Rustam, Ravi, Dharmen, Nimisha, Jayshree, Mayur, Prakash, Vimal, Rinku |
| Courses (MCA Sem 2) | AI (201), Frontend (202), .Net (203), Blockchain (204), Python (204), iOS (205), Android (205) |
| Batches | MCA Sem 2 Div A 2025-26, MCA Sem 2 Div B 2025-26 |
| Classrooms | CS Classroom 101 (cap 60), CS Classroom 102 (cap 60), CS Classroom 201 (cap 40) |
| Labs | CS Lab A (cap 30), CS Lab B (cap 30) |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
