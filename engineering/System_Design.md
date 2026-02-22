# NEP-SCHEDULER — System Design Document

> **Document Type:** System Design Document | **Version:** v1.0.0 | **Date:** February 2026
> **Product:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Classification:** Confidential — Internal Use Only

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Interaction Map](#2-component-interaction-map)
3. [Detailed Data Flow Designs](#3-detailed-data-flow-designs)
4. [Caching Strategy](#4-caching-strategy)
5. [Error Handling Design](#5-error-handling-design)
6. [Security Design](#6-security-design)
7. [Scalability Design](#7-scalability-design)
8. [Monitoring & Observability](#8-monitoring--observability)
9. [Disaster Recovery & Business Continuity](#9-disaster-recovery--business-continuity)
10. [Integration Design](#10-integration-design)
11. [System Constraints & Limitations](#11-system-constraints--limitations)

---

## 1. System Overview

> **Scope:** This document provides implementation-level system design for NEP-Scheduler, covering component interactions, data flows, sequence diagrams, caching strategies, error handling, security patterns, and operational considerations.

### 1.1 System Context Diagram

```
                          ┌─────────────────────────────────────┐
                          │          INTERNET / CLIENTS          │
                          │                                      │
                          │  🌐 Browser     📱 Mobile (future)  │
                          └─────────────┬───────────────────────┘
                                        │ HTTPS / WSS
                                        ▼
                          ┌─────────────────────────────────────┐
                          │         CLOUDFLARE / AWS CDN        │
                          │   WAF + DDoS Protection + SSL/TLS   │
                          └─────────────┬───────────────────────┘
                                        │
                                        ▼
              ┌──────────────────────────────────────────────────────┐
              │                    AWS CLOUD (VPC)                   │
              │                                                      │
              │  ┌─────────────┐    ┌───────────────────────────┐   │
              │  │  Next.js    │    │      Kong API Gateway     │   │
              │  │  (Vercel /  │───▶│   Auth Validation,        │   │
              │  │   ECS)      │    │   Rate Limiting, Routing   │   │
              │  └─────────────┘    └──────────┬────────────────┘   │
              │                               │                      │
              │         ┌─────────────────────┼──────────────────┐  │
              │         ▼                     ▼                  ▼  │
              │  ┌─────────────┐   ┌─────────────────┐  ┌──────────┐│
              │  │Auth Service │   │  Node.js API    │  │Socket.io ││
              │  │(Keycloak +  │   │  (Scheduling,   │  │ Server   ││
              │  │ JWT)        │   │   CRUD ops)     │  │(Real-time)││
              │  └─────────────┘   └────────┬────────┘  └──────────┘│
              │                            │                         │
              │                            ▼                         │
              │                  ┌─────────────────┐                 │
              │                  │  Python FastAPI  │                 │
              │                  │  (AI/ML Engine  │                 │
              │                  │  + OR-Tools)    │                 │
              │                  └─────────────────┘                 │
              │                                                      │
              │  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌────────┐  │
              │  │PostgreSQL│  │  MongoDB │  │Redis │  │ Kafka  │  │
              │  │(Primary) │  │(TT JSON) │  │Cache │  │(Events)│  │
              │  └──────────┘  └──────────┘  └──────┘  └────────┘  │
              └──────────────────────────────────────────────────────┘
```

### 1.2 Key Design Principles

| Principle | Implementation |
|---|---|
| **Zero Trust** | Every service-to-service call is authenticated; no implicit trust |
| **Fail Fast** | Validation at API gateway before hitting business logic |
| **Idempotency** | Timetable generation uses Redis lock to prevent duplicates |
| **Event Sourcing** | All state changes published to Kafka; full audit trail |
| **Defense in Depth** | Multiple security layers: WAF → Gateway → Auth → RLS → Audit |
| **Circuit Breaking** | Istio circuit breakers prevent cascade failures between services |

---

## 2. Component Interaction Map

### 2.1 Synchronous Interactions

| From | To | Protocol | Data | Frequency |
|---|---|---|---|---|
| Browser (Next.js) | Kong API Gateway | HTTPS/REST | API requests with JWT Bearer token | Per user action |
| Browser | Socket.io Server | WSS (WebSocket) | Subscribe to timetable room; receive updates | Persistent connection |
| Kong Gateway | Auth Service | HTTP (internal mTLS) | JWT validation, user claims extraction | Every authenticated request |
| Kong Gateway | Microservices | HTTP (internal mTLS) | Proxied, enriched requests with user context | Per request |
| Scheduling Service | AI Engine (FastAPI) | HTTP/REST | Dept data, config; receive solved timetable JSON | Per generation request |
| AI Engine | PostgreSQL | pg driver | Read faculty/course/room/batch data | Per generation |
| Scheduling Service | Redis | redis-client | Distributed lock (prevent concurrent generation) | Per generation |
| Report Service | S3 | AWS SDK | Upload generated PDFs; return signed URL | Per export request |
| All Services | PostgreSQL | Prisma/pg | CRUD operations within tenant schema | Per business operation |
| All Services | Redis | redis-client | Session, rate limit counters, cache | Per request |

### 2.2 Asynchronous Interactions (Kafka Events)

| Event | Producer | Consumers | Payload |
|---|---|---|---|
| `timetable.generated` | Scheduling Service | Socket.io Server, Report Service, Analytics | `{ timetableId, deptId, uniId, batchIds, generatedAt }` |
| `timetable.updated` | Scheduling Service | Socket.io Server, Notification Service | `{ timetableId, changedSlots[], reason, updatedAt }` |
| `faculty.absent` | Dept Admin API | Scheduling Service, Notification Service | `{ facultyId, date, affectedCourses[] }` |
| `room.unavailable` | Resource Service | Scheduling Service, Notification Service | `{ roomId, fromDate, toDate, reason }` |
| `class.cancelled` | Scheduling Service | Notification Service, Socket.io Server | `{ slotId, course, faculty, room, date }` |
| `user.login` | Auth Service | Audit Service | `{ userId, role, ip, timestamp }` |
| `credentials.changed` | Auth Service | Notification Service, Audit Service | `{ userId, changedBy, timestamp }` |

---

## 3. Detailed Data Flow Designs

### 3.1 Timetable Generation Flow (14 Steps)

```
Dept Admin          Browser          API Gateway        Scheduling         AI Engine          PostgreSQL        Redis            Kafka
    │                  │                  │                Service              │                  │               │               │
    │──Click Generate─▶│                  │                  │                  │                  │               │               │
    │                  │──POST /generate─▶│                  │                  │                  │               │               │
    │                  │                  │──Validate JWT────▶│                  │                  │               │               │
    │                  │                  │                  │──LOCK dept_id────────────────────────────────────▶│               │
    │                  │                  │                  │◀─Lock Acquired────────────────────────────────────│               │
    │                  │                  │                  │──SELECT faculty,courses,rooms────────────────────▶│               │               
    │                  │                  │                  │◀─Dept Data────────────────────────────────────────│               │
    │                  │                  │                  │──POST /solve──────▶│                  │               │               │
    │                  │                  │                  │                  │──ML preprocess    │               │               │
    │                  │                  │                  │                  │──CP-SAT solve     │               │               │
    │                  │                  │                  │◀─solution JSON────│                  │               │               │
    │                  │                  │                  │──INSERT timetable + slots────────────────────────▶│               │
    │                  │                  │                  │──RELEASE lock──────────────────────────────────────────────────▶│
    │                  │                  │                  │──Publish timetable.generated───────────────────────────────────────────────────▶│
    │                  │◀─201 {id,ms}─────│◀─Return response─│                  │                  │               │               │
    │◀─TT Grid Renders─│                  │                  │                  │                  │               │               │
```

**Time Budget Breakdown:**
- JWT validation: < 50ms
- Redis lock acquisition: < 10ms
- PostgreSQL data fetch: < 200ms
- AI Engine ML preprocessing: < 2,000ms
- OR-Tools CP-SAT solving: < 30,000ms ← dominates
- PostgreSQL insert: < 300ms
- Response to browser: < 100ms
- **Total target: < 35 seconds**

### 3.2 Special Timetable Flow

```
Step 1: Dept Admin opens Special Timetable panel
        → System displays faculty list (checkboxes) + room list (checkboxes)

Step 2: Admin selects unavailable faculty
        → Example: Dharmen Shah [✓ absent]
        → System highlights affected courses: iOS Development, .Net using C#
        → System queries alternate faculty:
          - .Net using C#: Jayshree Patel available ✅
          - iOS Development: NO alternate faculty ⚠️

Step 3: Admin optionally marks unavailable rooms
        → Example: CS Lab A [✓ unavailable]
        → System shows CS Lab B as available alternative

Step 4: Admin clicks "Generate Special Timetable"
        → POST /v1/timetables/special
          {
            "departmentId": "...",
            "unavailableFacultyIds": ["faculty-dharmen"],
            "unavailableRoomIds": ["lab-a"],
            "config": { ...standard config... }
          }

Step 5: AI Engine runs CP-SAT with modified variable set
        → Dharmen Shah completely excluded from decision variables
        → CS Lab A excluded from room assignments
        → .Net: Jayshree Patel assigned to both Div A and Div B
        → iOS: Marked as UNASSIGNABLE (no alternate) → slot left empty

Step 6: Solution returned to API
        → slots[] with Dharmen's classes replaced by Jayshree / empty
        → unassignableCourses: [{ courseId: ios-id, reason: "No available faculty" }]

Step 7: Response rendered in browser
        → Changed slots highlighted in amber
        → iOS slot shows "No Faculty Available — Class Cancelled"
        → Download PDF / Broadcast to faculty buttons available

Step 8: Admin broadcasts via WebSocket
        → All connected faculty receive updated schedule notification
        → Jayshree sees additional .Net slots for both Div A and Div B
        → Dharmen sees empty schedule (absent day)
```

### 3.3 Faculty Login & Personal Schedule Flow

```
1. Faculty navigates to /faculty-panel
   └─ Next.js middleware checks cookies for existing JWT
   └─ If no JWT → redirect to /login?role=faculty

2. Faculty enters: username=rustam_morena, password=faculty@123
   └─ POST /v1/auth/login { username, password, role: "faculty" }

3. Auth Service:
   └─ SELECT user WHERE username = 'rustam_morena'
   └─ bcrypt.compare(password, user.passwordHash)
   └─ Generate JWT payload:
      {
        sub: userId,
        role: "FACULTY",
        facultyId: "f-rustam",
        departmentId: "dept-cs",
        universityId: "u-vnsgu",
        exp: now + 8h
      }
   └─ Return JWT + set HttpOnly SameSite=Strict cookie

4. Redirect to /faculty-panel/timetable
   └─ Middleware validates JWT role === FACULTY

5. GET /v1/faculty/f-rustam/schedule
   └─ PostgreSQL query:
      SELECT ts.*, c.name as course_name, r.name as room_name, b.name as batch_name
      FROM timetable_slots ts
      JOIN timetables t ON ts.timetable_id = t.id
      JOIN courses c ON ts.course_id = c.id
      JOIN resources r ON ts.room_id = r.id
      JOIN batches b ON ts.batch_id = b.id
      WHERE ts.faculty_id = 'f-rustam'
        AND t.status = 'ACTIVE'
      ORDER BY ts.day_of_week, ts.slot_number

6. Response: Prof. Rustam sees ONLY:
   - Monday 09:00–10:00: Blockchain | MCA Sem 2 Div A | CS Classroom 101
   - Wednesday 09:00–10:00: Blockchain | MCA Sem 2 Div B | CS Classroom 102
   - Friday 09:00–10:00: Blockchain | MCA Sem 2 Div A | CS Classroom 101
   (3 weekly slots matching blockchain's weekly_hrs = 3)

7. Socket.io subscribes: room faculty-f-rustam
   └─ Any timetable change triggers instant UI update
```

### 3.4 Password Change Flow

```
1. Faculty submits: { currentPassword, newUsername?, newPassword }
   POST /v1/users/{userId}/credentials

2. Auth Service:
   └─ Fetch user from DB
   └─ bcrypt.compare(currentPassword, user.passwordHash)
   └─ If wrong → 401 "Current password incorrect"
   └─ If newUsername provided → check uniqueness in users table
   └─ If duplicate → 409 "Username already taken"
   └─ Hash new password: bcrypt.hash(newPassword, 12)
   └─ UPDATE users SET username=?, password_hash=?, updated_at=NOW()
   └─ DELETE all active sessions for this userId from Redis
   └─ Publish credentials.changed to Kafka (audit trail)

3. Return: 200 { success: true }
4. Client: Clear session cookie, redirect to /login
   → Faculty must log in again with new credentials

Note: Superadmin and Uni/Dept Admin can change others' passwords
      via PATCH /v1/users/{targetUserId}/credentials (no currentPassword required)
      This is authorized by role check: if requester is ADMIN → skip current pass check
```

---

## 4. Caching Strategy

### 4.1 Redis Cache Patterns

| Data | Cache Layer | TTL | Invalidation Trigger | Key Pattern |
|---|---|---|---|---|
| Active user session | Redis String | 8 hours | Logout, password change | `session:{userId}` |
| Department faculty list | Redis JSON | 5 minutes | Faculty CRUD operation | `dept:{deptId}:faculty` |
| Course list per department | Redis JSON | 10 minutes | Course CRUD | `dept:{deptId}:courses` |
| Active timetable per department | Redis JSON | 30 minutes | New timetable generated | `tt:{deptId}:active` |
| Faculty personal schedule | Redis JSON | 30 minutes | Timetable regenerated | `sched:{facultyId}` |
| University overview stats | Redis JSON | 1 hour | Any entity count change | `stats:{uniId}:overview` |
| Generated PDF export | S3 URL in Redis | 24 hours | Timetable regenerated | `pdf:{timetableId}` |
| Room availability matrix | Redis JSON | 5 minutes | Resource CRUD | `rooms:{uniId}:avail` |
| API rate limit counters | Redis Counter | 15 minutes | Automatic expiry | `rl:{ip}:{endpoint}` |
| OR-Tools warm-start hints | Redis JSON | 2 hours | Faculty/course config change | `ws:{deptId}:hints` |
| Distributed generation lock | Redis String | 60 seconds | Generation completes | `lock:gen:{deptId}` |

### 4.2 Cache-Aside Pattern Implementation

```typescript
// services/timetable.service.ts

class TimetableService {
  async getActiveTimetable(deptId: string): Promise<Timetable | null> {
    const cacheKey = `tt:${deptId}:active`;

    // Step 1: Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Timetable;
    }

    // Step 2: Fetch from PostgreSQL
    const timetable = await prisma.timetable.findFirst({
      where: { departmentId: deptId, status: 'ACTIVE' },
      include: { slots: { include: { course: true, faculty: true, room: true, batch: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Step 3: Populate cache
    if (timetable) {
      await redis.setex(cacheKey, 1800, JSON.stringify(timetable)); // 30 min TTL
    }

    return timetable;
  }

  async invalidateTimetableCache(deptId: string, facultyIds: string[] = []): Promise<void> {
    const keys = [
      `tt:${deptId}:active`,
      ...facultyIds.map(fid => `sched:${fid}`)
    ];
    if (keys.length > 0) await redis.del(...keys);
  }
}
```

---

## 5. Error Handling Design

### 5.1 Error Taxonomy

| Error Category | HTTP Status | Retry? | User Action |
|---|---|---|---|
| Authentication failure (wrong credentials) | 401 Unauthorized | No | Re-enter correct credentials |
| Authentication expired (JWT expired) | 401 Unauthorized | No (re-login) | Login again |
| Authorization failure (wrong role) | 403 Forbidden | No | Contact admin for access |
| Resource not found | 404 Not Found | No | Verify the resource ID |
| Validation error (missing/invalid fields) | 422 Unprocessable Entity | No | Fill required fields correctly |
| CP-SAT constraint infeasibility | 422 Unprocessable Entity | Yes (after config change) | Adjust constraints or add resources |
| Concurrent generation lock | 409 Conflict | Yes (after 60s) | Wait for current generation to complete |
| Rate limit exceeded | 429 Too Many Requests | Yes (after window) | Wait 15 minutes and retry |
| Internal server error | 500 Internal Server Error | Yes (max 3 retries) | Contact support if persists |
| AI Engine timeout (> 30s) | 504 Gateway Timeout | Yes (increase time limit) | Simplify constraints or increase solver time |
| Database unavailable | 503 Service Unavailable | Yes (with exponential backoff) | Automatic recovery |

### 5.2 Standard Error Response (RFC 7807)

```json
// Constraint infeasibility error
{
  "type": "https://api.nep-scheduler.com/errors/constraint-infeasible",
  "title": "Timetable Generation Failed — No Feasible Solution",
  "status": 422,
  "detail": "The CP-SAT solver could not find a conflict-free schedule within the 30-second time limit. Common causes: insufficient rooms for batch strength, faculty weekly hours too restrictive, or conflicting subject-faculty assignments.",
  "instance": "/v1/timetables/generate",
  "traceId": "trace-abc-123-def-456",
  "timestamp": "2026-02-21T09:30:00Z",
  "diagnostics": {
    "solverStatus": "INFEASIBLE",
    "solverTimeMs": 30000,
    "possibleCauses": [
      {
        "type": "ROOM_CAPACITY_INSUFFICIENT",
        "description": "No lab has capacity >= 30 (MCA Sem 2 Div A strength) for Android Development",
        "affectedCourse": "Android Development",
        "affectedBatch": "MCA Sem 2 Div A 2025-26",
        "batchStrength": 30,
        "availableLabCapacity": 25,
        "recommendation": "Increase CS Lab A capacity to 30 or split batch into two sub-divisions"
      }
    ]
  }
}
```

### 5.3 Frontend Error Handling

```typescript
// lib/api.ts — Axios interceptor for global error handling

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { status, data } = error.response ?? {};

    switch (status) {
      case 401:
        // Clear session and redirect to login
        authStore.getState().clearAuth();
        window.location.href = '/login';
        break;

      case 403:
        toast.error('You do not have permission to perform this action.');
        break;

      case 409:
        // Concurrent generation — show retry message
        if (data?.type?.includes('concurrent')) {
          toast.warning('Timetable generation already in progress. Please wait 60 seconds and try again.');
        }
        break;

      case 422:
        // Show detailed constraint error
        if (data?.diagnostics?.possibleCauses) {
          showConstraintErrorModal(data);
        } else {
          toast.error(data?.detail || 'Validation failed. Please check your inputs.');
        }
        break;

      case 429:
        toast.warning('Too many requests. Please wait a moment before trying again.');
        break;

      case 500:
      case 503:
      case 504:
        toast.error('A server error occurred. Our team has been notified. Please try again.');
        // Log to Sentry
        Sentry.captureException(error, { extra: { url: error.config.url } });
        break;
    }

    return Promise.reject(error);
  }
);
```

---

## 6. Security Design

### 6.1 Authentication Architecture

```
Browser                Auth Service           PostgreSQL         Redis
   │                       │                      │               │
   │──POST /auth/login──▶  │                      │               │
   │  { username, pass }   │──SELECT user─────────▶│               │
   │                       │◀─{ hash, role }───────│               │
   │                       │──bcrypt.compare()     │               │
   │                       │──gen JWT RS256────────────────────────▶│
   │                       │  payload: {           │  SET session  │
   │                       │    sub: userId,       │  EX 8h        │
   │                       │    role: FACULTY,     │               │
   │                       │    facultyId,         │               │
   │                       │    deptId, uniId,     │               │
   │                       │    exp: now+8h        │               │
   │                       │  }                    │               │
   │◀─Set-Cookie (JWT)─────│                       │               │
   │  HttpOnly;Secure;     │                       │               │
   │  SameSite=Strict      │                       │               │
```

### 6.2 Authorization Flow per Panel

```typescript
// RBAC Middleware Chain
// Each panel has its own middleware stack

// Super Admin: requires SUPERADMIN role only
router.use('/superadmin', authenticate, requireRole('SUPERADMIN'));

// University Admin: requires UNI_ADMIN, validates universityId matches JWT
router.use('/dashboard', authenticate, requireRole('UNI_ADMIN'), requireSameUniversity);

// Department Admin: requires DEPT_ADMIN, validates deptId matches JWT
router.use('/department', authenticate, requireRole('DEPT_ADMIN'), requireSameDepartment);

// Faculty: requires FACULTY, can only access own facultyId
router.use('/faculty-panel', authenticate, requireRole('FACULTY'), requireSameFaculty);

// Cross-role: Some routes allow multiple roles
router.get('/timetables/:id', authenticate,
  requireRole('SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY'),
  validateTimetableAccess  // Custom: FACULTY can only see their own slots
);
```

### 6.3 Multi-Tenant Data Isolation (PostgreSQL RLS)

```sql
-- Enable Row Level Security on all tenant tables
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Superadmin bypass (full access)
CREATE POLICY superadmin_all ON timetable_slots
  USING (current_setting('app.role', true) = 'SUPERADMIN');

-- University Admin: own university only
CREATE POLICY uni_admin_policy ON faculty
  USING (university_id::text = current_setting('app.university_id', true));

-- Department Admin: own department only
CREATE POLICY dept_admin_policy ON timetable_slots
  USING (
    timetable_id IN (
      SELECT id FROM timetables
      WHERE department_id::text = current_setting('app.department_id', true)
    )
  );

-- Faculty: own slots only
CREATE POLICY faculty_policy ON timetable_slots
  USING (faculty_id::text = current_setting('app.faculty_id', true));

-- Set context on every connection (in Prisma middleware)
-- prisma.$use(async (params, next) => {
--   await prisma.$executeRaw`SET LOCAL app.role = ${user.role}`;
--   await prisma.$executeRaw`SET LOCAL app.university_id = ${user.universityId}`;
--   await prisma.$executeRaw`SET LOCAL app.department_id = ${user.departmentId}`;
--   return next(params);
-- });
```

### 6.4 API Security Headers (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.nep-scheduler.com", "wss://api.nep-scheduler.com"],
      imgSrc: ["'self'", "data:", "https://s3.amazonaws.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Required for Tailwind
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
}));
```

---

## 7. Scalability Design

### 7.1 Horizontal Scaling Strategy

| Service | Scaling Trigger | Min Replicas | Max Replicas | Stateless? |
|---|---|---|---|---|
| Next.js Frontend | CPU > 70% or 1000 req/min | 2 | 10 | ✅ Yes (Vercel manages) |
| API Gateway (Kong) | CPU > 60% or 2000 req/min | 2 | 20 | ✅ Yes |
| Scheduling Service | CPU > 70% or queue depth > 5 | 2 | 10 | ✅ Yes (Redis lock) |
| AI Engine (FastAPI) | CPU > 80% or generation queue > 3 | 1 | 8 | ✅ Yes (stateless solve) |
| Auth Service | CPU > 60% or latency > 200ms | 2 | 10 | ✅ Yes |
| Socket.io Service | Connection count > 1000/pod | 2 | 20 | ❌ No (Redis adapter) |
| Notification Service | Kafka consumer lag > 1000 msgs | 1 | 5 | ✅ Yes |
| Report Service | Queue depth > 10 jobs | 1 | 5 | ✅ Yes |

### 7.2 Database Scaling

```
                    ┌──────────────────────────────────────┐
                    │       PgBouncer Connection Pool        │
                    │       (Transaction Mode, max 100)      │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────┴───────────────────────┐
                    │                                       │
              ┌─────▼──────┐                    ┌──────────▼──────┐
              │  Primary   │ Streaming Replica  │  Read Replica 1  │
              │ PostgreSQL │ ─────────────────▶ │  (READ queries)  │
              │  (Writes)  │                    └──────────────────┘
              └────────────┘                    ┌──────────▼──────┐
                                                │  Read Replica 2  │
                                                │  (READ queries)  │
                                                └──────────────────┘

Query Routing:
  - All INSERT/UPDATE/DELETE → Primary
  - All SELECT (non-session) → Read Replicas (round-robin)
  - Session-sensitive SELECT → Primary (after write within transaction)
```

**Key Indexes:**

```sql
-- Timetable slot lookups (most frequent query)
CREATE INDEX idx_slots_timetable ON timetable_slots (timetable_id, day_of_week, slot_number);
CREATE INDEX idx_slots_faculty ON timetable_slots (faculty_id, timetable_id);
CREATE INDEX idx_slots_batch ON timetable_slots (batch_id, day_of_week, slot_number);
CREATE INDEX idx_slots_room ON timetable_slots (room_id, day_of_week, slot_number);

-- Faculty lookups
CREATE INDEX idx_faculty_dept ON faculty (department_id, university_id);
CREATE INDEX idx_faculty_user ON faculty (user_id);

-- Timetable status queries
CREATE INDEX idx_timetables_active ON timetables (department_id, status) WHERE status = 'ACTIVE';
```

### 7.3 Kubernetes HPA Configuration

```yaml
# k8s/hpa/ai-engine.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-engine-hpa
  namespace: nep-scheduler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-engine
  minReplicas: 1
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
  - type: External
    external:
      metric:
        name: kafka_consumer_lag
        selector:
          matchLabels:
            topic: scheduling.events
      target:
        type: AverageValue
        averageValue: "3"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
      - type: Pods
        value: 2
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
```

---

## 8. Monitoring & Observability

### 8.1 Observability Stack

| Signal | Tool | Key Metrics | Alert Threshold |
|---|---|---|---|
| Infrastructure Metrics | Prometheus + Grafana | CPU, Memory, Disk I/O, Network I/O | CPU > 85% for 5 min |
| Application Metrics | Custom Prometheus metrics | Request rate, latency p50/p95/p99, error rate | Error rate > 1% or p95 > 1s |
| AI Engine Metrics | Custom metrics | Generation time, solver status, infeasibility count | Generation > 25s |
| Database Metrics | PgBouncer + pg_stat_statements | Query latency, connection pool usage, deadlocks | Pool saturation > 80% |
| Kafka Metrics | Kafka Exporter | Consumer lag, throughput, partition offset | Consumer lag > 10,000 msgs |
| Real-time Metrics | Socket.io metrics | Connected clients, event rate, room sizes | Disconnect spike > 50%/min |
| Business Metrics | Custom + Grafana | Timetables/day, universities active, PDF exports | Anomaly detection |
| Error Tracking | Sentry | JS + Python exception tracking, stack traces | New error type appears |
| Distributed Tracing | Jaeger / AWS X-Ray | Request trace across microservices, bottlenecks | Trace total > 30s |
| Log Aggregation | ELK Stack (Elasticsearch + Kibana) | Structured JSON logs, audit trail, search | Error log rate spike |

### 8.2 Custom Business Metrics

```typescript
// Prometheus custom metrics
const timetableGenerationDuration = new Histogram({
  name: 'tt_generation_duration_seconds',
  help: 'Timetable generation duration in seconds',
  labelNames: ['department_id', 'status', 'is_special'],
  buckets: [1, 5, 10, 15, 20, 25, 30, 60]
});

const timetableConflictCount = new Counter({
  name: 'tt_conflict_count_total',
  help: 'Total constraint violations detected (should always be 0)',
  labelNames: ['department_id', 'conflict_type']
});

const facultyWorkloadVariance = new Gauge({
  name: 'faculty_workload_variance_hours',
  help: 'Variance in faculty weekly teaching hours within a department',
  labelNames: ['department_id']
});

const activePanelSessions = new Gauge({
  name: 'active_panel_sessions',
  help: 'Active authenticated sessions per panel',
  labelNames: ['panel']  // superadmin | university | department | faculty
});
```

---

## 9. Disaster Recovery & Business Continuity

### 9.1 Recovery Scenarios

| Scenario | RTO (Recovery Time) | RPO (Data Loss) | Recovery Strategy |
|---|---|---|---|
| API Service pod crash | < 30 seconds | 0 (stateless) | Kubernetes restarts pod automatically |
| Database failure (primary) | < 5 minutes | < 30 seconds | PostgreSQL automatic failover to read replica |
| Redis failure | < 2 minutes | Session data only | Redis Sentinel promotes replica; users re-login |
| Kafka broker failure | < 5 minutes | 0 (replicated) | Kafka leader election for affected partitions |
| AI Engine crash during generation | < 60 seconds | Partial generation | Redis lock TTL releases; retry queue picks up |
| Full AZ outage (AWS) | < 10 minutes | < 60 seconds | ALB routes to healthy AZ; Multi-AZ RDS failover |
| Full region outage | < 4 hours | < 1 hour | Manual failover to DR region; S3 cross-region |
| Accidental bulk delete | < 1 hour | < 24 hours | PostgreSQL PITR from automated backup |
| AI Engine model corruption | < 15 minutes | 0 (models in S3) | Pull latest model artifact from S3 |
| Deployment failure | < 5 minutes | 0 | ArgoCD rollback to previous Helm release |

### 9.2 Backup Strategy

```
PostgreSQL Backups:
  - Automated daily full backup (AWS RDS) → retained 30 days
  - Transaction log (WAL) streaming → Point-in-Time Recovery up to 5 minutes
  - Weekly manual snapshot before major schema migrations
  - Cross-region replication to DR region (async, RPO < 1 hour)

Redis Backups:
  - RDB snapshot every 15 minutes (sessions are re-creatable; low priority)
  - AOF persistence disabled for performance (acceptable data loss: re-login)

S3 (PDF/Model) Backups:
  - Cross-region replication (automatic)
  - Object versioning enabled (deleted files recoverable for 90 days)
  - Lifecycle policy: archive to Glacier after 90 days
```

---

## 10. Integration Design

### 10.1 Webhook System (v2.0 Roadmap)

| Webhook Event | Payload | Consumer Use Case |
|---|---|---|
| `timetable.generated` | `{ timetableId, deptId, slots[], generatedAt }` | University ERP auto-imports schedule |
| `timetable.updated` | `{ timetableId, changedSlots[], reason }` | Sync changes to campus digital display boards |
| `faculty.workload.exceeded` | `{ facultyId, currentHrs, maxHrs, weekDate }` | HR system alert for regulatory compliance |
| `class.cancelled` | `{ slotId, course, faculty, room, date }` | Student notification apps (WhatsApp/Email) |
| `substitute.assigned` | `{ originalFacultyId, substituteFacultyId, slotId }` | HR records management system |

### 10.2 Export Format Specifications

| Format | Structure | Target Consumers |
|---|---|---|
| **PDF (A4 Landscape)** | Days × Time Slots grid; faculty and room labels per cell; color-coded by subject type; university branding header | Print, notice boards, accreditation |
| **JSON REST API** | Nested: `timetable → days → slots` with full metadata including faculty, room, batch details | Third-party apps, student portals, ERP |
| **iCal (.ics)** | Individual events per lecture with `RRULE:FREQ=WEEKLY` for recurrence | Google Calendar, Outlook, Apple Calendar |
| **Excel (.xlsx)** | Multiple sheets: one per batch + faculty workload summary sheet | Admin reporting, manual review |
| **CSV** | Flat: `day, time, subject, faculty, room, batch, slot_type` columns | Data warehouse import, analytics pipelines |

### 10.3 PDF Generation Architecture

```
Client Request                API Server              Report Service          S3
     │                            │                       │                   │
     │──GET /timetables/id/pdf────▶│                       │                   │
     │                            │──CHECK Redis cache────▶│                   │
     │                            │◀─MISS────────────────────────────────────│
     │                            │──Queue PDF job────────▶│                   │
     │                            │                       │──Fetch TT data    │
     │                            │                       │──Render HTML TT   │
     │                            │                       │──Puppeteer → PDF  │
     │                            │                       │──Upload to S3─────▶│
     │                            │◀─signed S3 URL─────────│                   │
     │                            │──Cache URL in Redis   │                   │
     │◀─302 Redirect to S3 URL────│                       │                   │
     │──GET PDF from S3──────────────────────────────────────────────────────▶│
     │◀─PDF Binary────────────────────────────────────────────────────────────│
```

---

## 11. System Constraints & Limitations

### 11.1 MVP Constraints

| Constraint | Current Limit | Scalability Path |
|---|---|---|
| Max faculty per department (MVP) | 50 faculty | OR-Tools scales linearly; increase solver time limit |
| Max courses per timetable | 20 courses | Decompose into sub-problems for larger course sets |
| Max batches per generation | 10 batches | Parallel solver instances per batch group |
| Max time slots per day | 12 slots | Configurable; UI renders up to 12 without scroll |
| Concurrent generations per dept | 1 (Redis lock) | Intentional: prevents inconsistent state |
| PDF max size | 5 MB | Compress images; paginate for large departments |
| WebSocket connections per pod | 1,000 | Redis adapter enables horizontal Socket.io scaling |
| File storage per university | Unlimited (S3) | Lifecycle policies delete old PDFs after 90 days |
| Solver time limit | 30 seconds | Configurable per department (range: 10–120 seconds) |
| Max universities | 10 (MVP) | 10,000 with schema-per-tenant automation |

### 11.2 Known Limitations (MVP)

1. **No student portal:** Students cannot log in directly; schedules must be shared by admins
2. **No mobile app:** Web-only; mobile-responsive design but no native apps
3. **No ERP integration:** Manual data entry required; no HRMS/ERP sync
4. **English only:** No multi-language support in v1
5. **No examination scheduling:** Only regular academic timetables; no exam boards
6. **No historical analytics:** Current timetable only; no multi-semester trend analysis
7. **No AI substitute recommendation:** Special timetable shows gaps but doesn't auto-suggest substitutes (v2 feature)
8. **Solver time ceiling:** If department has > 50 faculty or > 20 courses, solution quality may degrade with 30s limit

### 11.3 Technical Debt Logged for v2

| Item | Priority | Effort |
|---|---|---|
| Migrate from Redis Pub/Sub to Kafka for all events | Medium | 2 weeks |
| Add comprehensive ML model retraining pipeline | High | 4 weeks |
| Implement AI substitute faculty recommendation | High | 3 weeks |
| Add Excel export format | Medium | 1 week |
| Build student-facing read-only portal | High | 3 weeks |
| Add multi-language support (Hindi + Gujarati) | Medium | 4 weeks |
| Implement mobile-responsive PWA | High | 3 weeks |
| Add comprehensive analytics dashboard | Medium | 3 weeks |
| Add iCal export for calendar sync | Low | 1 week |
| Implement Google Calendar / Outlook integration | Low | 2 weeks |

---

*This System Design Document is maintained by the NEP-Scheduler Engineering Team and is subject to revision as the system evolves.*

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
