# 06 — API Contracts

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. API Design Standards

- **Base URL:** `https://api.nep-scheduler.com/v1`
- **Authentication:** Bearer JWT in `Authorization: Bearer <token>` header
- **Content-Type:** `application/json` for all endpoints
- **Versioning:** URI versioning (`/v1`, `/v2`) with 12-month deprecation window
- **Pagination:** Cursor-based for all list endpoints (`?cursor=<id>&limit=<n>`)
- **Error Format:** RFC 7807 Problem Details JSON
- **HTTPS only:** TLS 1.3 required; HTTP requests are rejected

---

## 2. Authentication Roles

| Role Value | Scope |
|---|---|
| `SUPERADMIN` | Full platform access — all universities, all credentials |
| `UNI_ADMIN` | Own university scope only |
| `DEPT_ADMIN` | Own department scope only |
| `FACULTY` | Own schedule and profile only |

---

## 3. Complete Endpoint Reference

### 3.1 Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Public | Authenticate user, return JWT |
| `POST` | `/v1/auth/logout` | All | Invalidate session token |
| `POST` | `/v1/auth/refresh` | All | Refresh JWT using refresh token |
| `PATCH` | `/v1/users/:id/credentials` | Self or ADMIN | Update username/password |

### 3.2 University Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/universities` | SUPERADMIN | List all universities |
| `POST` | `/v1/universities` | SUPERADMIN | Provision new university |
| `GET` | `/v1/universities/:id` | SUPERADMIN, UNI_ADMIN | Get university details |
| `PATCH` | `/v1/universities/:id` | SUPERADMIN | Update university details |
| `DELETE` | `/v1/universities/:id` | SUPERADMIN | Delete university |
| `GET` | `/v1/universities/:id/departments` | SUPERADMIN, UNI_ADMIN | List university departments |
| `GET` | `/v1/universities/:id/faculty` | SUPERADMIN, UNI_ADMIN | List all faculty |
| `GET` | `/v1/universities/:id/stats` | SUPERADMIN, UNI_ADMIN | Department/faculty/timetable counts |

### 3.3 Department Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/departments` | UNI_ADMIN | List own university's departments |
| `POST` | `/v1/departments` | UNI_ADMIN | Create department |
| `GET` | `/v1/departments/:id` | UNI_ADMIN, DEPT_ADMIN | Get department details |
| `PATCH` | `/v1/departments/:id` | UNI_ADMIN | Update department |
| `DELETE` | `/v1/departments/:id` | UNI_ADMIN | Delete department |
| `GET` | `/v1/departments/:id/faculty` | DEPT_ADMIN, UNI_ADMIN | List department faculty |
| `GET` | `/v1/departments/:id/courses` | DEPT_ADMIN, UNI_ADMIN | List department courses |
| `GET` | `/v1/departments/:id/batches` | DEPT_ADMIN, UNI_ADMIN | List department batches |

### 3.4 Faculty Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/faculty` | DEPT_ADMIN, UNI_ADMIN | List faculty (scoped by role) |
| `POST` | `/v1/faculty` | DEPT_ADMIN, UNI_ADMIN | Create faculty member |
| `GET` | `/v1/faculty/:id` | DEPT_ADMIN, UNI_ADMIN, FACULTY (own) | Get faculty details |
| `PATCH` | `/v1/faculty/:id` | DEPT_ADMIN, UNI_ADMIN | Update faculty |
| `DELETE` | `/v1/faculty/:id` | DEPT_ADMIN, UNI_ADMIN | Delete faculty |
| `GET` | `/v1/faculty/:id/schedule` | FACULTY (own), DEPT_ADMIN | Get personal weekly schedule |
| `POST` | `/v1/faculty/:id/subjects` | DEPT_ADMIN | Assign subjects to faculty |
| `DELETE` | `/v1/faculty/:id/subjects/:courseId` | DEPT_ADMIN | Remove subject assignment |

### 3.5 Course & Batch Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/courses` | DEPT_ADMIN, UNI_ADMIN | List courses (scoped) |
| `POST` | `/v1/courses` | DEPT_ADMIN, UNI_ADMIN | Create course |
| `PATCH` | `/v1/courses/:id` | DEPT_ADMIN, UNI_ADMIN | Update course |
| `DELETE` | `/v1/courses/:id` | DEPT_ADMIN, UNI_ADMIN | Delete course |
| `GET` | `/v1/batches` | DEPT_ADMIN, UNI_ADMIN | List batches (scoped) |
| `POST` | `/v1/batches` | DEPT_ADMIN, UNI_ADMIN | Create batch |
| `PATCH` | `/v1/batches/:id` | DEPT_ADMIN, UNI_ADMIN | Update batch |
| `DELETE` | `/v1/batches/:id` | DEPT_ADMIN, UNI_ADMIN | Delete batch |

### 3.6 Resource Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/resources` | DEPT_ADMIN, UNI_ADMIN | List resources (classrooms & labs) |
| `POST` | `/v1/resources` | UNI_ADMIN | Create resource |
| `PATCH` | `/v1/resources/:id` | UNI_ADMIN | Update resource |
| `DELETE` | `/v1/resources/:id` | UNI_ADMIN | Delete resource |

### 3.7 Timetable Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/timetables/generate` | DEPT_ADMIN, UNI_ADMIN, SUPERADMIN | Trigger AI timetable generation |
| `POST` | `/v1/timetables/special` | DEPT_ADMIN | Generate special timetable (resource exclusion) |
| `GET` | `/v1/timetables` | All authenticated (scoped) | List timetables |
| `GET` | `/v1/timetables/:id` | All authenticated | Get timetable with all slots |
| `DELETE` | `/v1/timetables/:id` | DEPT_ADMIN, UNI_ADMIN | Archive timetable |
| `GET` | `/v1/timetables/:id/export/pdf` | DEPT_ADMIN, UNI_ADMIN, SUPERADMIN | Download timetable as PDF |

### 3.8 Analytics Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/analytics/dashboard` | UNI_ADMIN, SUPERADMIN | Dashboard stats |
| `GET` | `/v1/analytics/workload` | DEPT_ADMIN, UNI_ADMIN | Faculty workload report |

---

## 4. Detailed Request/Response Contracts

### 4.1 POST `/v1/auth/login`

**Request:**
```json
{
  "username": "rustam_morena",
  "password": "faculty@123",
  "role": "FACULTY"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_abc123...",
  "expiresIn": 28800,
  "user": {
    "id": "u-001",
    "name": "Rustam Morena",
    "role": "FACULTY",
    "entityId": "f-rustam",
    "universityId": "u-vnsgu",
    "departmentId": "dept-cs"
  }
}
```

**JWT Payload:**
```json
{
  "sub": "u-001",
  "role": "FACULTY",
  "facultyId": "f-rustam",
  "departmentId": "dept-cs",
  "universityId": "u-vnsgu",
  "exp": 1740000000
}
```

---

### 4.2 POST `/v1/universities`

**Request:**
```json
{
  "name": "Veer Narmad South Gujarat University",
  "shortName": "VNSGU",
  "location": "Surat, Gujarat",
  "email": "admin@vnsgu.ac.in",
  "estYear": 1967,
  "adminUser": "vnsgu_admin",
  "adminPass": "vnsgu@123"
}
```

**Response 201:**
```json
{
  "university": {
    "id": "uni-vnsgu-001",
    "name": "Veer Narmad South Gujarat University",
    "shortName": "VNSGU",
    "createdAt": "2026-02-01T09:00:00Z"
  },
  "adminCredentials": {
    "username": "vnsgu_admin",
    "password": "vnsgu@123",
    "note": "Please share these credentials securely. Password must be changed on first login."
  }
}
```

---

### 4.3 POST `/v1/timetables/generate`

**Request:**
```json
{
  "departmentId": "dept-cs-001",
  "batchIds": ["batch-mca-a", "batch-mca-b"],
  "config": {
    "startTime": "09:00",
    "endTime": "17:00",
    "lectureDuration": 60,
    "breakDuration": 60,
    "breakAfterLecture": 2,
    "daysPerWeek": 5,
    "semesterStartDate": "2025-07-01",
    "semesterEndDate": "2025-11-30"
  }
}
```

**Response 201:**
```json
{
  "timetableId": "tt-abc-123",
  "status": "OPTIMAL",
  "conflictCount": 0,
  "generationMs": 4250,
  "workloadStats": {
    "faculty-rustam": { "weeklyHrs": 3, "maxAllowed": 20, "utilizationPct": 15 },
    "faculty-dharmen": { "weeklyHrs": 6, "maxAllowed": 18, "utilizationPct": 33 }
  },
  "slots": [
    {
      "dayOfWeek": 1,
      "slotNumber": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "courseName": "Artificial Intelligence",
      "courseCode": "201",
      "facultyName": "Prakash Rana",
      "roomName": "CS Classroom 101",
      "batchName": "MCA Sem 2 Div A 2025-26",
      "slotType": "THEORY"
    }
  ],
  "timeSlots": [
    { "slotNumber": 1, "startTime": "09:00", "endTime": "10:00", "isBreak": false },
    { "slotNumber": 2, "startTime": "10:00", "endTime": "11:00", "isBreak": false },
    { "slotNumber": 3, "startTime": "11:00", "endTime": "12:00", "isBreak": true },
    { "slotNumber": 4, "startTime": "12:00", "endTime": "13:00", "isBreak": false }
  ]
}
```

---

### 4.4 POST `/v1/timetables/special`

**Request:**
```json
{
  "departmentId": "dept-cs-001",
  "unavailableFacultyIds": ["faculty-dharmen"],
  "unavailableRoomIds": ["lab-a"],
  "config": {
    "startTime": "09:00",
    "endTime": "17:00",
    "lectureDuration": 60,
    "breakDuration": 60,
    "breakAfterLecture": 2,
    "daysPerWeek": 5
  }
}
```

**Response 201:**
```json
{
  "timetableId": "tt-special-456",
  "isSpecial": true,
  "status": "FEASIBLE",
  "conflictCount": 0,
  "generationMs": 6100,
  "slots": [ ... ],
  "unassignableCourses": [
    {
      "courseId": "course-ios-001",
      "courseName": "iOS Development",
      "reason": "No available qualified faculty after exclusions"
    }
  ],
  "reassignedSlots": [
    {
      "courseId": "course-dotnet-001",
      "courseName": ".Net using C#",
      "originalFacultyId": "faculty-dharmen",
      "newFacultyId": "faculty-jayshree",
      "newFacultyName": "Jayshree Patel"
    }
  ]
}
```

---

### 4.5 GET `/v1/faculty/:id/schedule`

**Response 200:**
```json
{
  "faculty": {
    "id": "f-rustam",
    "name": "Rustam Morena",
    "designation": "Associate Professor"
  },
  "weeklyHrs": 3,
  "maxHrsPerWeek": 20,
  "weeklySlots": [
    {
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "courseName": "Blockchain",
      "roomName": "CS Classroom 101",
      "batchName": "MCA Sem 2 Div A 2025-26",
      "slotType": "THEORY"
    }
  ]
}
```

---

### 4.6 PATCH `/v1/users/:id/credentials`

**Request (self-change):**
```json
{
  "currentPassword": "faculty@123",
  "newUsername": "rustam.morena",
  "newPassword": "NewSecure@456"
}
```

**Request (admin change — no currentPassword required):**
```json
{
  "newPassword": "Reset@789"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Credentials updated. Please log in again with new credentials."
}
```

---

## 5. Standard Error Response (RFC 7807)

```json
{
  "type": "https://api.nep-scheduler.com/errors/constraint-violation",
  "title": "Timetable Generation Failed",
  "status": 422,
  "detail": "CP-SAT solver could not find a feasible solution within 30 seconds.",
  "instance": "/v1/timetables/generate",
  "traceId": "abc-123-def-456",
  "conflicts": [
    {
      "type": "ROOM_CAPACITY_EXCEEDED",
      "batch": "MCA Sem 2 Div A",
      "course": "Android Development",
      "room": "CS Lab A",
      "batchStrength": 30,
      "roomCapacity": 30,
      "recommendation": "Use CS Lab B as alternate or split batch"
    }
  ]
}
```

### HTTP Status Code Guide

| Status | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST (new resource) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed JSON |
| 401 | Unauthorized | Missing/invalid/expired JWT |
| 403 | Forbidden | Valid JWT but insufficient role/scope |
| 404 | Not Found | Entity does not exist |
| 409 | Conflict | Duplicate resource; generation lock active |
| 422 | Unprocessable Entity | Solver failed; constraint violation |
| 429 | Too Many Requests | Rate limit exceeded (100 req/15 min) |
| 500 | Internal Server Error | Unexpected server failure |

---

## 6. Authentication Middleware (Implementation Reference)

```typescript
// src/middlewares/auth.middleware.ts

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };

export const requireSameUniversity = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'SUPERADMIN') return next(); // Superadmin bypasses all tenant checks
  const requestedUniId = req.params.universityId || req.body.universityId;
  if (requestedUniId && requestedUniId !== req.user?.universityId) {
    return res.status(403).json({ error: 'Cross-university access denied' });
  }
  next();
};
```

---

## 7. WebSocket Events

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join:dept` | `{ departmentId }` | Subscribe to department timetable room |
| `join:faculty` | `{ facultyId }` | Subscribe to personal schedule room |
| `join:university` | `{ universityId }` | Subscribe to university-wide updates |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `timetable:generated` | `{ timetableId, deptId, generatedAt }` | New timetable ready |
| `timetable:updated` | `{ timetableId, changedSlots[], reason }` | Timetable slots changed |
| `schedule:updated` | `{ facultyId, newSlots[] }` | Personal schedule changed |
| `class:cancelled` | `{ slotId, course, date }` | Class cancelled |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
