# 03 — Information Architecture

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Application Route Map

NEP-Scheduler is organized into four independent panel namespaces, each scoped to a specific user role. All panels share a common login entry point.

```
/ (root)
│
├── /login                          ← Public — role selector + login form
│
├── /superadmin                     ← SUPERADMIN role only
│   ├── /superadmin                 ← Overview dashboard (stats, quick links)
│   ├── /superadmin/universities    ← University CRUD table + add form
│   ├── /superadmin/credentials     ← Credentials management (all levels)
│   ├── /superadmin/departments     ← All departments across all universities
│   ├── /superadmin/faculty         ← All faculty across all universities
│   └── /superadmin/timetables      ← All timetables globally (filterable)
│
├── /dashboard                      ← UNI_ADMIN role only
│   ├── /dashboard                  ← University overview stats
│   ├── /dashboard/departments      ← Department CRUD
│   ├── /dashboard/programs         ← Program CRUD (MCA, B.Ed., FYUP, etc.)
│   ├── /dashboard/faculty          ← Faculty pool management
│   ├── /dashboard/resources        ← Classroom & lab management
│   ├── /dashboard/batches          ← Batch management
│   ├── /dashboard/courses          ← Course catalog management
│   ├── /dashboard/generate         ← Timetable generation form
│   └── /dashboard/timetables
│       ├── /dashboard/timetables            ← Timetable list
│       └── /dashboard/timetables/[id]       ← Timetable viewer + export
│
├── /department                     ← DEPT_ADMIN role only
│   ├── /department                 ← Department overview stats
│   ├── /department/faculty         ← Department faculty management
│   ├── /department/courses         ← Department course management
│   ├── /department/resources       ← Department resource view/manage
│   ├── /department/batches         ← Department batch management
│   ├── /department/generate        ← Standard timetable generation form
│   ├── /department/special         ← Special timetable (resource exclusion) form
│   └── /department/timetables
│       ├── /department/timetables           ← Department timetable list
│       └── /department/timetables/[id]      ← Timetable viewer + export
│
└── /faculty-panel                  ← FACULTY role only
    ├── /faculty-panel              ← Personal weekly timetable grid
    ├── /faculty-panel/profile      ← View & edit personal profile
    └── /faculty-panel/credentials  ← Change username / password
```

---

## 2. Navigation Structure per Panel

### 2.1 Super Admin Sidebar Navigation

```
[ NEP-Scheduler ] ← Logo / Home

MANAGEMENT
  🏛  Universities
  🔑  Credentials
  🏢  All Departments
  👥  All Faculty

SCHEDULING
  📅  All Timetables
  ⚡  Generate Timetable

SYSTEM
  ⚙️  Settings (future)
  📊  Analytics (future)
```

### 2.2 University Admin Sidebar Navigation

```
[ University Name ] ← Contextual header

SETUP
  🏢  Departments
  🎓  Programs
  👥  Faculty Pool
  🚪  Resources (Rooms & Labs)
  📚  Batches
  📖  Courses

SCHEDULING
  📅  Timetables
  ⚡  Generate Timetable

COMPLIANCE
  ✅  NEP 2020 Report (future)
```

### 2.3 Department Admin Sidebar Navigation

```
[ Department Name ] ← Contextual header

MANAGEMENT
  👥  Faculty
  📖  Courses
  🚪  Resources
  📚  Batches

SCHEDULING
  📅  Timetables
  ⚡  Generate Standard
  🔄  Generate Special

EXPORT
  📄  PDF Download
  🖨️  Print
```

### 2.4 Faculty Portal Navigation

```
[ Faculty Name ] ← Contextual header

  📅  My Timetable        ← Default landing page
  👤  My Profile
  🔑  Change Password
```

---

## 3. Panel Feature Access Matrix

| Feature | Superadmin | Uni Admin | Dept Admin | Faculty |
|---|:---:|:---:|:---:|:---:|
| View all universities | ✅ | ❌ | ❌ | ❌ |
| Add/edit/delete universities | ✅ | ❌ | ❌ | ❌ |
| View/reset all credentials | ✅ | Dept+Faculty only | Own Faculty only | Own only |
| View all departments (global) | ✅ | Own uni | Own dept | ❌ |
| Manage departments | ✅ | ✅ | ❌ | ❌ |
| Manage programs | ✅ | ✅ | ❌ | ❌ |
| Manage faculty pool | ✅ | ✅ | Own dept | ❌ |
| Manage classrooms/labs | ✅ | ✅ | Own dept | ❌ |
| Manage batches | ✅ | ✅ | Own dept | ❌ |
| Manage courses | ✅ | ✅ | Own dept | ❌ |
| Generate standard timetable | ✅ | ✅ | ✅ | ❌ |
| Generate special timetable | ❌ | ❌ | ✅ | ❌ |
| View timetables | All globally | Own uni | Own dept | Own schedule |
| Download PDF | ✅ | ✅ | ✅ | ❌ |
| View personal schedule | ❌ | ❌ | ❌ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ |
| Real-time WebSocket updates | ✅ | ✅ | ✅ | ✅ |

---

## 4. Domain Entity Hierarchy

```
PLATFORM (Global)
│
└── UNIVERSITY (Tenant)
    │   - name, shortName, location, email, estYear
    │   - adminUser → User(UNI_ADMIN)
    │
    ├── DEPARTMENT (1 university → many departments)
    │   │   - name, shortName, hod, email
    │   │   - adminUser → User(DEPT_ADMIN)
    │   │
    │   ├── FACULTY (1 department → many faculty)
    │   │   │   - name, email, designation
    │   │   │   - maxHrsPerDay, maxHrsPerWeek
    │   │   │   - userId → User(FACULTY)
    │   │   │
    │   │   └── FACULTY_SUBJECTS (many-to-many: Faculty ↔ Course)
    │   │           - isPrimary, proficiencyLevel
    │   │
    │   ├── COURSE (belongs to university, optionally dept)
    │   │       - name, code, credits, weeklyHrs
    │   │       - type: Theory | Lab | Theory+Lab
    │   │
    │   ├── BATCH (1 department → many batches)
    │   │       - name, program, semester, division, year, strength
    │   │
    │   └── TIMETABLE (1 department, 1 or more batches)
    │       │   - isSpecial, status, configJson, version, conflictCount
    │       │
    │       └── TIMETABLE_SLOT (many per timetable)
    │               - dayOfWeek (1–6), slotNumber, startTime, endTime
    │               - courseId, facultyId, roomId, batchId
    │               - isBreak, slotType (THEORY | LAB | BREAK)
    │
    ├── RESOURCE (belongs to university, used across departments)
    │       - name, type (Classroom | Lab | Seminar Hall | Auditorium)
    │       - capacity, floor, building
    │
    └── PROGRAM (1 university → many programs)
            - name, shortName, type (UG | PG | Diploma | Ph.D)
            - duration, totalSems
```

---

## 5. Key User Flows

### 5.1 First-Time Setup Flow (Super Admin → Uni Admin → Dept Admin)

```
1. Super Admin logs in → /superadmin
2. Adds new university → auto-generates Uni Admin credentials
3. Uni Admin logs in → /dashboard
4. Creates departments (with auto-generated Dept Admin credentials)
5. Adds faculty pool
6. Adds classrooms and labs
7. Adds programs
8. Adds courses
9. Creates batches
10. Assigns faculty to courses (subjects)
11. Dept Admin logs in → /department
12. Verifies faculty, courses, batches, resources
13. Configures time parameters
14. Clicks "Generate Timetable"
15. Views and downloads PDF
```

### 5.2 Special Timetable Flow (Dept Admin — Emergency)

```
1. Dept Admin logs in → /department
2. Navigates to Generate Special → /department/special
3. System displays checkboxes for all faculty and rooms
4. Admin checks absent faculty (e.g., Dharmen Shah)
5. System highlights affected courses; shows alternate availability
6. Admin optionally checks unavailable rooms
7. Admin clicks "Generate Special Timetable"
8. Engine runs with excluded resources
9. Result shows: reassigned slots (amber) + unassignable slots (red)
10. Admin downloads PDF and/or broadcasts via WebSocket
```

### 5.3 Faculty Daily Routine Flow

```
1. Faculty logs in → /faculty-panel (auto-redirected)
2. Views personal weekly timetable grid
3. Each slot shows: course, batch, room, time
4. Any real-time updates received via WebSocket → UI refreshes instantly
5. Faculty can navigate to profile to update contact info
```

---

## 6. Page-Level Component Inventory

| Page | Key Components |
|---|---|
| `/login` | RoleSelector, LoginForm, ErrorAlert |
| `/superadmin/universities` | DataTable, UniversityFormModal, CredentialDisplay, StatsCard |
| `/superadmin/credentials` | CredentialTable, PasswordResetModal, BulkResetButton |
| `/superadmin/timetables` | TimetableListTable, UniversityFilter, DeptFilter, DateFilter |
| `/dashboard` | StatsCard ×4, DeptBreakdownTable, QuickActions |
| `/dashboard/faculty` | DataTable, FacultyFormModal, SubjectAssignment |
| `/dashboard/timetables/[id]` | TimetableGrid, BatchSelector, WorkloadBadge, TimetableExport |
| `/department/generate` | GenerateForm (time config), GenerateButton, ProgressIndicator |
| `/department/special` | FacultyCheckboxList, RoomCheckboxList, SpecialTTForm, ConflictPreview |
| `/department/timetables/[id]` | TimetableGrid, TimetableExport, WorkloadSummary, UnassignableAlert |
| `/faculty-panel` | TimetableGrid (faculty view), RealtimeUpdateBanner |
| `/faculty-panel/profile` | ProfileCard, EditProfileForm |
| `/faculty-panel/credentials` | PasswordChangeForm |

---

## 7. Data Flow Between Panels

```
SUPERADMIN creates University
     ↓
SUPERADMIN hands credentials to UNI_ADMIN
     ↓
UNI_ADMIN creates:
  - Departments (with DEPT_ADMIN credentials)
  - Faculty (with FACULTY credentials)
  - Resources, Programs, Courses, Batches
     ↓
DEPT_ADMIN:
  - Assigns faculty to courses
  - Generates timetable
  - Downloads/shares PDF
     ↓
FACULTY:
  - Logs in and sees personal schedule
  - Receives real-time WebSocket updates
```

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
