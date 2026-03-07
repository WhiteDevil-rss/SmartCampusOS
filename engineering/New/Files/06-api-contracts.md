# 06 — API Contracts

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. API Standards

| Convention | Value |
|---|---|
| Base URL (authenticated) | `https://api.smartuniversity.com/v2` |
| Base URL (public portal) | `https://api.smartuniversity.com/public/v2` |
| Authentication | Bearer JWT in `Authorization: Bearer <token>` header |
| Tenant Context | `X-University-Slug` header injected by API gateway |
| Content-Type | `application/json` for all endpoints |
| Versioning | URI versioning (`/v2`); 12-month deprecation window |
| Pagination | Cursor-based; `?cursor=<id>&limit=<n>` |
| Error Format | RFC 7807 Problem Details JSON |
| Timestamps | ISO 8601 UTC (`2026-03-15T09:00:00Z`) |

---

## 2. Authentication Endpoints

### POST `/v2/auth/login`
**Auth:** None

**Request:**
```json
{
  "username": "vnsgu_admin",
  "password": "vnsgu@123",
  "role": "UNI_ADMIN"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800,
  "user": {
    "id": "clx_abc123",
    "name": "Dr. Patel",
    "role": "UNI_ADMIN",
    "universityId": "uni-vnsgu",
    "universitySlug": "vnsgu"
  }
}
```

### POST `/v2/auth/firebase`
**Auth:** None — exchanges Firebase ID token for platform JWT

**Request:**
```json
{
  "firebaseIdToken": "eyJhbGci..."
}
```

**Response 200:** Same as `/v2/auth/login`

### POST `/v2/auth/refresh`
**Request:** `{ "refreshToken": "..." }`
**Response 200:** `{ "accessToken": "...", "expiresIn": 28800 }`

### PATCH `/v2/users/:id/credentials`
**Auth:** Self or ADMIN
**Request:** `{ "currentPassword": "...", "newPassword": "..." }`
**Response 200:** `{ "message": "Password updated. Please log in again." }`

---

## 3. University Endpoints

### GET `/v2/universities`
**Auth:** SUPERADMIN
**Response 200:**
```json
{
  "data": [
    {
      "id": "uni-vnsgu",
      "name": "Veer Narmad South Gujarat University",
      "slug": "vnsgu",
      "departmentCount": 12,
      "facultyCount": 340,
      "studentCount": 8000,
      "timetableCount": 24
    }
  ],
  "nextCursor": "uni-xyz",
  "total": 5
}
```

### POST `/v2/universities`
**Auth:** SUPERADMIN
**Request:**
```json
{
  "name": "Veer Narmad South Gujarat University",
  "slug": "vnsgu",
  "adminEmail": "admin@vnsgu.ac.in",
  "established": 1967
}
```
**Response 201:** Created university object with auto-generated admin credentials

### GET `/v2/universities/:id/departments`
**Auth:** UNI_ADMIN, SUPERADMIN

### POST `/v2/universities/:id/portal-config`
**Auth:** SUPERADMIN, UNI_ADMIN
**Request:**
```json
{
  "slug": "vnsgu",
  "customDomain": "results.vnsgu.ac.in",
  "branding": {
    "logoUrl": "https://cdn.platform.com/vnsgu/logo.png",
    "primaryColor": "#003087",
    "secondaryColor": "#FFD700",
    "universityFullName": "Veer Narmad South Gujarat University",
    "tagline": "Wisdom for Life"
  },
  "features": {
    "resultVerification": true,
    "blockchainVerification": true,
    "admissionPortal": true,
    "scholarshipPortal": true,
    "vacancyPublication": true,
    "publicResearchRepo": false
  },
  "rateLimits": {
    "verificationsPerHour": 1000,
    "admissionsPerHour": 500
  }
}
```
**Response 200:** Updated portal config object

---

## 4. Timetable Endpoints

### POST `/v2/timetables/generate`
**Auth:** DEPT_ADMIN, UNI_ADMIN
**Request:**
```json
{
  "departmentId": "dept-cs-vnsgu",
  "batchIds": ["batch-mca-sem2-a", "batch-mca-sem2-b"],
  "startTime": "09:00",
  "endTime": "17:00",
  "lectureDuration": 60,
  "breakDuration": 60,
  "breakAfterLecture": 2,
  "daysPerWeek": 5,
  "solverTimeLimit": 30
}
```
**Response 200:**
```json
{
  "timetableId": "tt_xyz789",
  "status": "GENERATED",
  "conflicts": 0,
  "generationTimeMs": 12430,
  "fairnessScore": 94.2,
  "workloadStats": {
    "faculty-rustam": 18,
    "faculty-ravi": 17,
    "faculty-dharmen": 16
  }
}
```
**Response 422 (Constraint Violation):**
```json
{
  "type": "https://api.smartuniversity.com/errors/constraint-violation",
  "title": "Timetable Generation Failed",
  "status": 422,
  "detail": "CP-SAT solver could not find a feasible solution within 30 seconds.",
  "conflicts": [
    {
      "type": "ROOM_CAPACITY_EXCEEDED",
      "batch": "MCA Sem 2 Div A",
      "course": "Android Development",
      "room": "CS Lab A",
      "batchStrength": 30,
      "roomCapacity": 28,
      "recommendation": "Use CS Lab B as alternate or split batch"
    }
  ]
}
```

### POST `/v2/timetables/special`
**Auth:** DEPT_ADMIN
**Request:**
```json
{
  "departmentId": "dept-cs-vnsgu",
  "batchIds": ["batch-mca-sem2-a"],
  "excludedFaculty": ["faculty-dharmen"],
  "excludedRooms": [],
  "baseConfig": { "startTime": "09:00", "endTime": "17:00", "lectureDuration": 60, "daysPerWeek": 5 }
}
```

### GET `/v2/timetables/:id`
**Auth:** All authenticated roles
**Response 200:**
```json
{
  "id": "tt_xyz789",
  "type": "STANDARD",
  "semester": 2,
  "academicYear": "2025-26",
  "generatedAt": "2026-03-01T10:00:00Z",
  "days": [
    {
      "dayOfWeek": 1,
      "name": "Monday",
      "slots": [
        {
          "slotIndex": 0,
          "startTime": "09:00",
          "endTime": "10:00",
          "slotType": "THEORY",
          "course": { "id": "course-ai", "name": "Artificial Intelligence", "code": "CS201" },
          "faculty": { "id": "faculty-prakash", "name": "Prakash Rana" },
          "room": { "id": "room-101", "name": "CS Classroom 101" },
          "batch": { "id": "batch-mca-sem2-a", "name": "MCA Sem 2 Div A" },
          "isHighlighted": false
        }
      ]
    }
  ]
}
```

### GET `/v2/timetables/:id/export/pdf`
**Auth:** DEPT_ADMIN, UNI_ADMIN
**Response 302:** Redirect to signed S3 URL for PDF download

---

## 5. Attendance Endpoints

### POST `/v2/attendance/session`
**Auth:** FACULTY
**Request:**
```json
{
  "timetableSlotId": "slot_abc",
  "date": "2026-03-15",
  "method": "QR",
  "windowMinutes": 10
}
```
**Response 201:**
```json
{
  "sessionId": "sess_xyz",
  "qrToken": "QR_BASE64_ENCODED_TOKEN",
  "qrImageUrl": "data:image/png;base64,...",
  "expiresAt": "2026-03-15T09:10:00Z"
}
```

### POST `/v2/attendance/mark`
**Auth:** STUDENT (self-mark via QR), FACULTY (manual)
**Request:**
```json
{
  "sessionId": "sess_xyz",
  "qrToken": "QR_BASE64_ENCODED_TOKEN",
  "studentId": "student_aryan"
}
```
**Response 200:** `{ "status": "PRESENT", "markedAt": "2026-03-15T09:04:22Z" }`

### GET `/v2/attendance/student/:studentId`
**Auth:** STUDENT (own), FACULTY, DEPT_ADMIN
**Query:** `?courseId=course-ai&semester=2`
**Response 200:**
```json
{
  "overall": { "attended": 42, "total": 52, "percentage": 80.77 },
  "subjects": [
    {
      "courseId": "course-ai",
      "courseName": "Artificial Intelligence",
      "attended": 14,
      "total": 16,
      "percentage": 87.5,
      "isAtRisk": false
    }
  ]
}
```

### POST `/v2/attendance/flag`
**Auth:** STUDENT
**Request:**
```json
{
  "attendanceRecordId": "att_xyz",
  "flagType": "HACKATHON",
  "evidenceUrl": "https://s3.../hackathon_cert.pdf"
}
```
**Response 201:** Flag record; pending approval by admin

---

## 6. Student Endpoints

### GET `/v2/students/:id/performance`
**Auth:** STUDENT (own), FACULTY, DEPT_ADMIN
**Response 200:**
```json
{
  "studentId": "student_aryan",
  "cgpa": 8.2,
  "sgpa": 8.5,
  "attendanceOverall": 82.4,
  "assignmentsSubmitted": 14,
  "assignmentsTotal": 15,
  "subjectPerformance": [
    { "courseId": "course-ai", "internal": 38, "attendance": 87.5 }
  ],
  "dropoutRisk": { "score": 0.12, "level": "LOW" }
}
```

### GET `/v2/students/:id/digital-id`
**Auth:** STUDENT (own), SUPERADMIN
**Response 200:**
```json
{
  "studentId": "student_aryan",
  "enrollmentNo": "2025MCA001",
  "name": "Aryan Mehta",
  "program": "MCA",
  "batch": "Div A 2025-26",
  "universityName": "VNSGU",
  "photoUrl": "https://s3.../aryan_photo.jpg",
  "qrPayload": "eyJ1bml2ZXJzaXR5SWQiOiJ2bnNndSIsImVucm9sbG1lbnRObyI6IjIwMjVNQ0EwMDEifQ==",
  "validUntil": "2027-06-30"
}
```

---

## 7. Fees Endpoints

### GET `/v2/fees/dues/:studentId`
**Auth:** STUDENT (own), DEPT_ADMIN, UNI_ADMIN
**Response 200:**
```json
{
  "studentId": "student_aryan",
  "totalDue": 45000,
  "components": [
    { "name": "Tuition Fee", "amount": 35000, "dueDate": "2026-04-01", "paid": false },
    { "name": "Exam Fee", "amount": 5000, "dueDate": "2026-04-15", "paid": false },
    { "name": "Library Fee", "amount": 5000, "dueDate": "2026-04-01", "paid": false }
  ]
}
```

### POST `/v2/fees/initiate-payment`
**Auth:** STUDENT
**Request:**
```json
{
  "studentId": "student_aryan",
  "feeStructureId": "fee_mca_y1",
  "amount": 45000,
  "gateway": "RAZORPAY"
}
```
**Response 200:**
```json
{
  "paymentId": "pay_razorpay_abc",
  "orderId": "order_razorpay_xyz",
  "amount": 45000,
  "currency": "INR",
  "razorpayKeyId": "rzp_live_xxx"
}
```

### POST `/v2/fees/confirm-payment`
**Auth:** STUDENT (webhook also)
**Request:** `{ "paymentId": "pay_abc", "razorpayPaymentId": "pay_rzp_123", "razorpaySignature": "..." }`
**Response 200:** `{ "status": "COMPLETED", "receiptUrl": "https://s3.../receipt_xyz.pdf" }`

---

## 8. AI Endpoints

### POST `/v2/ai/chatbot`
**Auth:** STUDENT, FACULTY
**Request:**
```json
{
  "message": "Explain backpropagation in neural networks",
  "subjectId": "course-ai",
  "sessionId": "chat_abc123",
  "history": [
    { "role": "user", "content": "What is gradient descent?" },
    { "role": "assistant", "content": "Gradient descent is an optimisation algorithm..." }
  ]
}
```
**Response 200:**
```json
{
  "response": "Backpropagation is the algorithm used to compute gradients...",
  "sourceMaterials": [
    { "materialId": "mat_unit4_notes", "title": "Unit 4 — Neural Networks", "relevanceScore": 0.94 }
  ],
  "sessionId": "chat_abc123"
}
```

### GET `/v2/ai/study-planner/:studentId`
**Auth:** STUDENT (own), FACULTY
**Response 200:**
```json
{
  "plan": [
    { "date": "2026-03-16", "subject": "Artificial Intelligence", "topics": ["Unit 5 — CNN"], "durationMinutes": 90 },
    { "date": "2026-03-16", "subject": "Python", "topics": ["Unit 3 — OOP"], "durationMinutes": 60 }
  ],
  "examAlerts": [
    { "subject": "Blockchain", "examDate": "2026-03-25", "daysRemaining": 9 }
  ]
}
```

### GET `/v2/ai/career/:studentId`
**Auth:** STUDENT (own)
**Response 200:**
```json
{
  "recommendedPaths": [
    {
      "path": "Full Stack Development",
      "matchScore": 0.87,
      "requiredSkills": ["React", "Node.js", "PostgreSQL"],
      "currentSkillGaps": ["Docker", "CI/CD"],
      "suggestedCertifications": ["AWS Solutions Architect", "Google Cloud Professional"],
      "averageCTC": "₹8–14 LPA"
    }
  ]
}
```

### GET `/v2/ai/dropout-risk/:studentId`
**Auth:** FACULTY, DEPT_ADMIN
**Response 200:**
```json
{
  "riskScore": 0.68,
  "riskLevel": "HIGH",
  "topRiskFactors": [
    { "factor": "attendance_percentage", "impact": 0.41 },
    { "factor": "assignments_missed", "impact": 0.22 },
    { "factor": "internal_marks_trend", "impact": 0.17 }
  ],
  "recommendation": "Schedule a counselling session; notify parents; flag for HOD review"
}
```

---

## 9. Results & Blockchain Endpoints

### POST `/v2/results/publish`
**Auth:** UNI_ADMIN
**Request:**
```json
{
  "departmentId": "dept-cs-vnsgu",
  "semester": 2,
  "academicYear": "2025-26",
  "batchId": "batch-mca-sem2-a"
}
```
**Response 200:**
```json
{
  "resultCount": 30,
  "blockchainTxHash": "0xabc123def456...",
  "blockNumber": 58291047,
  "publishedAt": "2026-03-15T10:00:00Z",
  "polygonscanUrl": "https://polygonscan.com/tx/0xabc123def456"
}
```

### GET `/v2/results/:enrollmentNo`
**Auth:** STUDENT (own), FACULTY, DEPT_ADMIN
**Response 200:** Full result object with SGPA, CGPA, subject-wise marks, blockchain tx hash

---

## 10. Public Portal Endpoints (No Auth Required)

### GET `/public/v2/:slug/config`
**Response 200:** University branding + enabled feature list

### GET `/public/v2/:slug/results/verify`
**Query:** `?enrollment=2025MCA001&semester=2`
**Response 200:**
```json
{
  "verified": true,
  "studentName": "Aryan Mehta",
  "semester": 2,
  "sgpa": 8.5,
  "cgpa": 8.2,
  "programName": "MCA",
  "universityName": "VNSGU",
  "publishedAt": "2026-03-15T10:00:00Z",
  "resultHash": "a1b2c3d4e5f6...",
  "polygonscanUrl": "https://polygonscan.com/tx/0xabc123..."
}
```
**Response 200 (Tampered):**
```json
{
  "verified": false,
  "message": "Result record has been tampered. On-chain hash does not match.",
  "databaseHash": "a1b2c3...",
  "onChainHash": "x9y8z7..."
}
```

### POST `/public/v2/:slug/admissions/apply`
**Request:**
```json
{
  "programId": "prog-mca",
  "applicantName": "Priya Shah",
  "email": "priya@email.com",
  "phone": "9876543210",
  "documents": {
    "marksheet12": "https://s3.../marksheet.pdf",
    "photo": "https://s3.../photo.jpg"
  }
}
```
**Response 201:** `{ "applicationId": "app_xyz", "status": "SUBMITTED", "message": "Application received." }`

### GET `/public/v2/:slug/admissions/status`
**Query:** `?applicationId=app_xyz&email=priya@email.com`
**Response 200:**
```json
{
  "applicationId": "app_xyz",
  "applicantName": "Priya Shah",
  "program": "MCA",
  "status": "SHORTLISTED",
  "meritRank": 14,
  "nextStep": "Document verification scheduled for March 25, 2026"
}
```

### GET `/public/v2/:slug/vacancies`
**Response 200:**
```json
{
  "vacancies": [
    {
      "id": "vac_001",
      "title": "Assistant Professor — Computer Science",
      "type": "TEACHING",
      "lastDate": "2026-04-15",
      "qualifications": "Ph.D. / M.Tech with NET/SLET"
    }
  ]
}
```

---

## 11. Library Endpoints

### GET `/v2/library/catalog`
**Auth:** All authenticated
**Query:** `?q=machine+learning&category=CS&page=1&limit=20`
**Response 200:** List of books with availability count

### POST `/v2/library/reserve`
**Auth:** STUDENT
**Request:** `{ "bookId": "book_xyz", "studentId": "student_aryan" }`
**Response 201:** `{ "reservationId": "res_abc", "expiresAt": "2026-03-17T23:59:59Z" }`

---

## 12. Standard Error Response (RFC 7807)

```json
{
  "type": "https://api.smartuniversity.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "JWT token has expired. Please log in again.",
  "instance": "/v2/students/student_aryan/timetable",
  "traceId": "trace_abc123xyz"
}
```

### Error Code Reference

| HTTP Status | Error Type | When |
|---|---|---|
| 400 | `bad-request` | Validation failure, missing required fields |
| 401 | `unauthorized` | Missing or expired JWT |
| 403 | `forbidden` | Valid JWT but insufficient permissions / cross-tenant attempt |
| 404 | `not-found` | Resource not found in the university's schema |
| 409 | `conflict` | Duplicate enrollment number, slug already taken |
| 422 | `constraint-violation` | Timetable generation failed — includes conflict report |
| 429 | `rate-limit-exceeded` | Too many requests — includes `Retry-After` header |
| 500 | `internal-error` | Unexpected error — includes `traceId` for support |
| 503 | `service-unavailable` | AI engine or blockchain service temporarily down |

---

## 13. Webhook Payloads

| Event | Payload |
|---|---|
| `timetable.generated` | `{ timetableId, deptId, batchIds[], generatedAt, slotsCount }` |
| `timetable.updated` | `{ timetableId, changedSlots[], reason, updatedAt }` |
| `result.published` | `{ resultId, enrollmentNos[], semesterId, txHash, publishedAt }` |
| `admission.status.changed` | `{ applicationId, universityId, oldStatus, newStatus, updatedAt }` |
| `placement.record.added` | `{ studentId, companyId, ctc, role, placedAt }` |
| `fees.payment.completed` | `{ paymentId, studentId, amount, transactionId, gateway }` |

All webhook calls use `POST` with `Content-Type: application/json` and include an `X-Platform-Signature: hmac_sha256_of_payload` header for verification.

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
