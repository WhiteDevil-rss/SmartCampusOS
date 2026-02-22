# 12 — Testing Strategy

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Testing Philosophy

NEP-Scheduler's testing strategy prioritizes **constraint correctness above all else**. The fundamental promise of the platform — zero scheduling conflicts — must be provably true across all generated timetables. Secondary priorities are security (cross-tenant isolation), performance (generation time, API latency), and UI correctness across all four panels.

---

## 2. Test Pyramid

```
         /\
        /  \
       / E2E \       Playwright — 4 panel flows
      /________\
     /            \
    / Integration  \   Supertest — full API coverage
   /______________  \
  /                  \
 /     Unit Tests      \  Jest — 80% line coverage
/________________________\
```

---

## 3. Test Types & Coverage Targets

| Test Type | Tool | Coverage Target | Key Test Cases |
|---|---|---|---|
| Unit Tests | Jest + Testing Library | 80% line coverage | OR-Tools constraint validation, auth middleware, API handlers, utility functions |
| Integration Tests | Supertest | 70% API coverage | Full CRUD for all entities, timetable generation end-to-end, authentication flows |
| E2E Tests | Playwright | All 4 panel flows | Login → add data → generate → view → export PDF |
| Load Testing | k6 | 500 concurrent users | Timetable generation under load, API response times |
| Conflict Testing | Jest | 100% constraint coverage | Verify 0 conflicts in 100 randomly generated timetables |
| Security Testing | OWASP ZAP | OWASP Top 10 | Cross-tenant access, SQL injection, JWT manipulation |

---

## 4. Unit Tests

### 4.1 Scheduling Engine Unit Tests

```typescript
// __tests__/scheduler/constraints.test.ts

describe('CP-SAT Hard Constraints', () => {

  describe('HC-01: No faculty double-booking', () => {
    it('should not assign same faculty to two classes at the same time', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      const slots = timetable.slots;

      // For every (faculty, day, slot) combination, at most 1 assignment
      const facultyTimeMap = new Map<string, number>();
      for (const slot of slots) {
        if (!slot.facultyId || slot.isBreak) continue;
        const key = `${slot.facultyId}-${slot.dayOfWeek}-${slot.slotNumber}`;
        const count = (facultyTimeMap.get(key) || 0) + 1;
        facultyTimeMap.set(key, count);
        expect(count).toBe(1);  // Never > 1
      }
    });
  });

  describe('HC-02: No room double-booking', () => {
    it('should not assign same room to two classes at the same time', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      const roomTimeMap = new Map<string, number>();
      for (const slot of timetable.slots) {
        if (!slot.roomId || slot.isBreak) continue;
        const key = `${slot.roomId}-${slot.dayOfWeek}-${slot.slotNumber}`;
        const count = (roomTimeMap.get(key) || 0) + 1;
        roomTimeMap.set(key, count);
        expect(count).toBe(1);
      }
    });
  });

  describe('HC-03: No batch double-booking', () => {
    it('should not assign same batch to two classes at the same time', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      const batchTimeMap = new Map<string, number>();
      for (const slot of timetable.slots) {
        if (!slot.batchId || slot.isBreak) continue;
        const key = `${slot.batchId}-${slot.dayOfWeek}-${slot.slotNumber}`;
        const count = (batchTimeMap.get(key) || 0) + 1;
        batchTimeMap.set(key, count);
        expect(count).toBe(1);
      }
    });
  });

  describe('HC-07/08: Faculty max hours', () => {
    it('should respect faculty max hours per week', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      for (const [facultyId, hrs] of Object.entries(timetable.workloadStats)) {
        const faculty = VNSGU_DEPT_DATA.faculty.find(f => f.id === facultyId);
        expect(hrs).toBeLessThanOrEqual(faculty!.maxHrsPerWeek);
      }
    });

    it('should respect faculty max hours per day', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      const dailyLoads: Record<string, Record<number, number>> = {};
      for (const slot of timetable.slots) {
        if (!slot.facultyId || slot.isBreak) continue;
        if (!dailyLoads[slot.facultyId]) dailyLoads[slot.facultyId] = {};
        dailyLoads[slot.facultyId][slot.dayOfWeek] = (dailyLoads[slot.facultyId][slot.dayOfWeek] || 0) + 1;
      }
      for (const [facultyId, dayMap] of Object.entries(dailyLoads)) {
        const faculty = VNSGU_DEPT_DATA.faculty.find(f => f.id === facultyId);
        for (const [, dayHrs] of Object.entries(dayMap)) {
          expect(dayHrs).toBeLessThanOrEqual(faculty!.maxHrsPerDay);
        }
      }
    });
  });

  describe('HC-05: Room type matching', () => {
    it('should assign lab courses only to lab-type rooms', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      for (const slot of timetable.slots) {
        if (slot.slotType !== 'LAB') continue;
        const room = VNSGU_DEPT_DATA.resources.find(r => r.id === slot.roomId);
        expect(room?.type).toBe('Lab');
      }
    });
  });

  describe('Workload variance', () => {
    it('workload variance across faculty should be < 3 hours', async () => {
      const timetable = await generateTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG);
      const loads = Object.values(timetable.workloadStats) as number[];
      const variance = Math.max(...loads) - Math.min(...loads);
      expect(variance).toBeLessThan(3);
    });
  });
});
```

### 4.2 Special Timetable Unit Tests

```typescript
describe('Special Timetable', () => {

  it('should exclude specified faculty from all slots', async () => {
    const excluded = ['faculty-dharmen'];
    const timetable = await generateSpecialTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG, {
      excludedFaculty: excluded
    });
    const dharmenSlots = timetable.slots.filter(s => s.facultyId === 'faculty-dharmen');
    expect(dharmenSlots).toHaveLength(0);
  });

  it('should auto-reassign .Net to Jayshree when Dharmen is excluded', async () => {
    const timetable = await generateSpecialTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG, {
      excludedFaculty: ['faculty-dharmen']
    });
    const dotnetSlots = timetable.slots.filter(s => s.courseId === 'course-dotnet');
    for (const slot of dotnetSlots) {
      expect(slot.facultyId).toBe('faculty-jayshree');
    }
  });

  it('should mark iOS Development as unassignable when Dharmen is excluded', async () => {
    const timetable = await generateSpecialTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG, {
      excludedFaculty: ['faculty-dharmen']
    });
    const unassignable = timetable.unassignableCourses.map(u => u.courseId);
    expect(unassignable).toContain('course-ios');
  });

  it('should still produce 0 conflicts in special timetable', async () => {
    const timetable = await generateSpecialTimetable(VNSGU_DEPT_DATA, DEFAULT_CONFIG, {
      excludedFaculty: ['faculty-dharmen']
    });
    expect(timetable.conflictCount).toBe(0);
  });
});
```

### 4.3 Auth Middleware Unit Tests

```typescript
describe('Auth Middleware', () => {

  it('should reject requests without Authorization header', async () => {
    const res = await request(app).get('/v1/timetables');
    expect(res.status).toBe(401);
  });

  it('should reject expired JWT tokens', async () => {
    const expiredToken = jwt.sign({ sub: 'u-001', role: 'FACULTY' }, JWT_SECRET, { expiresIn: '0s' });
    const res = await request(app)
      .get('/v1/faculty/f-001/schedule')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/expired/i);
  });

  it('should reject FACULTY accessing SUPERADMIN endpoint', async () => {
    const facultyToken = jwt.sign({ sub: 'u-001', role: 'FACULTY' }, JWT_SECRET);
    const res = await request(app)
      .get('/v1/universities')
      .set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(403);
  });

  it('should reject cross-university access for UNI_ADMIN', async () => {
    const uniAdminToken = jwt.sign({
      sub: 'u-002', role: 'UNI_ADMIN', universityId: 'uni-vnsgu'
    }, JWT_SECRET);
    const res = await request(app)
      .get('/v1/universities/OTHER-UNI/departments')
      .set('Authorization', `Bearer ${uniAdminToken}`);
    expect(res.status).toBe(403);
  });
});
```

---

## 5. Integration Tests (Supertest)

```typescript
describe('Timetable Generation API — Integration', () => {

  beforeAll(async () => {
    await seedVNSGUTestData();
  });

  it('POST /v1/timetables/generate — should succeed with VNSGU data', async () => {
    const res = await request(app)
      .post('/v1/timetables/generate')
      .set('Authorization', `Bearer ${deptAdminToken}`)
      .send({
        departmentId: 'dept-cs-001',
        batchIds: ['batch-mca-a', 'batch-mca-b'],
        config: {
          startTime: '09:00',
          endTime: '17:00',
          lectureDuration: 60,
          breakDuration: 60,
          breakAfterLecture: 2,
          daysPerWeek: 5
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.conflictCount).toBe(0);
    expect(res.body.status).toMatch(/OPTIMAL|FEASIBLE/);
    expect(res.body.slots).toBeInstanceOf(Array);
    expect(res.body.slots.length).toBeGreaterThan(0);
    expect(res.body.generationMs).toBeLessThan(30000);
  });

  it('GET /v1/timetables/:id — should return full timetable with slots', async () => {
    const { body: { timetableId } } = await generateTestTimetable();
    const res = await request(app)
      .get(`/v1/timetables/${timetableId}`)
      .set('Authorization', `Bearer ${deptAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.slots).toBeInstanceOf(Array);
    expect(res.body.workloadStats).toBeDefined();
  });

  it('GET /v1/faculty/:id/schedule — should return only own slots for faculty', async () => {
    const res = await request(app)
      .get('/v1/faculty/f-rustam/schedule')
      .set('Authorization', `Bearer ${rustamToken}`);

    expect(res.status).toBe(200);
    for (const slot of res.body.weeklySlots) {
      expect(slot.facultyId).toBe('f-rustam');
    }
  });

  it('POST /v1/timetables/generate — should return 409 when lock is active', async () => {
    // Simulate active lock
    await redis.set('lock:gen:dept-cs-001', '1', { EX: 60 });
    const res = await request(app)
      .post('/v1/timetables/generate')
      .set('Authorization', `Bearer ${deptAdminToken}`)
      .send(GENERATE_PAYLOAD);

    expect(res.status).toBe(409);
    expect(res.body.title).toMatch(/generation already in progress/i);
    await redis.del('lock:gen:dept-cs-001');
  });
});
```

---

## 6. E2E Tests (Playwright)

```typescript
// e2e/dept-admin-generate.spec.ts

test.describe('Dept Admin — Full Timetable Generation Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Department Admin' }).click();
    await page.getByPlaceholder('Username').fill('cs_dept');
    await page.getByPlaceholder('Password').fill('cs@123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/department');
  });

  test('should generate standard timetable and display grid', async ({ page }) => {
    await page.getByRole('link', { name: 'Generate Standard' }).click();
    await expect(page).toHaveURL('/department/generate');

    await page.getByLabel('Start Time').fill('09:00');
    await page.getByLabel('End Time').fill('17:00');
    await page.getByLabel('Lecture Duration').selectOption('60');
    await page.getByLabel('Break Duration').selectOption('60');
    await page.getByLabel('Break After').selectOption('2');
    await page.getByLabel('Days Per Week').selectOption('5');

    const generateBtn = page.getByRole('button', { name: 'Generate Timetable' });
    await generateBtn.click();

    // Wait up to 35 seconds for generation
    await expect(page.getByText('Timetable Generated')).toBeVisible({ timeout: 35000 });

    // Timetable grid should be visible
    await expect(page.locator('[data-testid="timetable-grid"]')).toBeVisible();

    // Conflict count should show 0
    await expect(page.getByText('0 Conflicts')).toBeVisible();
  });

  test('should download PDF', async ({ page }) => {
    await navigateToExistingTimetable(page);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('should generate special timetable excluding Dharmen Shah', async ({ page }) => {
    await page.getByRole('link', { name: 'Generate Special' }).click();
    await expect(page).toHaveURL('/department/special');

    // Check Dharmen Shah as absent
    await page.getByLabel('Dharmen Shah').check();

    // Should show affected courses
    await expect(page.getByText('iOS Development')).toBeVisible();
    await expect(page.getByText('No alternate faculty available')).toBeVisible();

    await page.getByRole('button', { name: 'Generate Special Timetable' }).click();
    await expect(page.getByText('Special Timetable Generated')).toBeVisible({ timeout: 35000 });

    // Unassignable courses should be highlighted
    await expect(page.getByText('No Faculty Available')).toBeVisible();

    // Changed slots should be amber
    const changedSlots = page.locator('[data-changed="true"]');
    await expect(changedSlots.first()).toBeVisible();
  });
});

test.describe('Faculty Portal — Personal Schedule', () => {

  test('should show only own classes', async ({ page }) => {
    await loginAs(page, 'rustam_morena', 'faculty@123', 'FACULTY');
    await expect(page).toHaveURL('/faculty-panel');

    const cells = page.locator('[data-testid="timetable-cell"]:not([data-empty="true"])');
    const count = await cells.count();

    // Rustam teaches Blockchain 3 times/week
    expect(count).toBe(3);
    for (const cell of await cells.all()) {
      await expect(cell).toContainText('Blockchain');
    }
  });
});
```

---

## 7. Load Testing (k6)

```javascript
// k6/load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Hold at 500 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests < 500ms
    http_req_failed:   ['rate<0.01'],   // < 1% error rate
  },
};

const BASE_URL = 'https://api.nep-scheduler.com/v1';

export function setup() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    username: 'cs_dept', password: 'cs@123', role: 'DEPT_ADMIN'
  }), { headers: { 'Content-Type': 'application/json' } });
  return { token: res.json('token') };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // GET timetable (most frequent operation)
  const ttRes = http.get(`${BASE_URL}/timetables/tt-abc-123`, { headers });
  check(ttRes, {
    'timetable status 200': (r) => r.status === 200,
    'timetable response < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // GET faculty schedule
  const schedRes = http.get(`${BASE_URL}/faculty/f-rustam/schedule`, { headers });
  check(schedRes, {
    'schedule status 200': (r) => r.status === 200,
  });

  sleep(2);
}
```

**Load Test Targets:**
- p95 API response time: < 500ms ✅
- Error rate: < 1% ✅
- 500 concurrent users without degradation ✅

---

## 8. Conflict Validation Test Suite

```typescript
// __tests__/scheduler/conflict-validation.test.ts

describe('100 Random Timetable Generations — Zero Conflicts', () => {

  it('should produce 0 faculty conflicts across 100 random configurations', async () => {
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        generateTimetable(VNSGU_DEPT_DATA, randomConfig())
      )
    );
    for (const tt of results) {
      const conflicts = detectFacultyConflicts(tt.slots);
      expect(conflicts).toHaveLength(0);
    }
  });

  it('should produce 0 room conflicts across 100 random configurations', async () => {
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        generateTimetable(VNSGU_DEPT_DATA, randomConfig())
      )
    );
    for (const tt of results) {
      const conflicts = detectRoomConflicts(tt.slots);
      expect(conflicts).toHaveLength(0);
    }
  });

  it('should produce 0 batch conflicts across 100 random configurations', async () => {
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        generateTimetable(VNSGU_DEPT_DATA, randomConfig())
      )
    );
    for (const tt of results) {
      const conflicts = detectBatchConflicts(tt.slots);
      expect(conflicts).toHaveLength(0);
    }
  });
});

function randomConfig() {
  const startHour = 8 + Math.floor(Math.random() * 2);
  const endHour = 16 + Math.floor(Math.random() * 2);
  return {
    startTime: `${startHour.toString().padStart(2, '0')}:00`,
    endTime: `${endHour.toString().padStart(2, '0')}:00`,
    lectureDuration: [50, 60, 75][Math.floor(Math.random() * 3)],
    breakDuration: 60,
    breakAfterLecture: 2 + Math.floor(Math.random() * 2),
    daysPerWeek: 5,
  };
}
```

---

## 9. Security Testing

### OWASP ZAP Automated Scan

```bash
# Run OWASP ZAP against staging environment
docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.nep-scheduler.com \
  -r zap-report.html

# Active scan (more thorough, run in staging only)
docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://staging.nep-scheduler.com \
  -r zap-full-report.html
```

### Manual Security Test Cases

| Test Case | Expected Result |
|---|---|
| Access `/v1/universities` as FACULTY role | 403 Forbidden |
| Access Uni A's departments as Uni B's admin | 403 Forbidden |
| Access Faculty A's schedule as Faculty B | 403 Forbidden |
| SQL injection in username field | Parameterized query; 400 or sanitized |
| JWT with tampered payload (role elevated) | 401 — signature verification fails |
| JWT with role=SUPERADMIN but wrong secret | 401 — invalid signature |
| Request without TLS (HTTP) | 301 redirect to HTTPS |
| Password stored in plaintext in DB | bcrypt hash confirmed in DB |
| Rate limit: 101 requests in 15 minutes | 429 Too Many Requests |

---

## 10. VNSGU Demo Test Scenario (Full Acceptance Test)

```
STEP 1: Login as superadmin / super@admin123
  → Navigate to /superadmin
  → Verify VNSGU appears in universities list
  → Verify CS Department appears in All Departments

STEP 2: Login as vnsgu_admin / vnsgu@123
  → Navigate to /dashboard
  → Verify stats: 1 department, 9 faculty, 7 courses, 2 batches, 5 resources

STEP 3: Login as cs_dept / cs@123
  → Navigate to /department
  → Navigate to Generate Standard
  → Set: 09:00–17:00, 60min lectures, 60min break after 2nd
  → Click Generate Timetable
  → Wait < 30 seconds for result
  → Verify: conflict count = 0
  → Verify: Dharmen Shah assigned iOS (one batch) + .Net (other batch) — no overlap
  → Verify: Workload variance < 2 hours
  → Click Download PDF → verify file downloads correctly

STEP 4: Navigate to Generate Special
  → Check Dharmen Shah as absent
  → Verify: ".Net — Jayshree Patel available" shown
  → Verify: "iOS — No alternate faculty" warning shown
  → Click Generate Special Timetable
  → Wait < 35 seconds
  → Verify: .Net slots show Jayshree Patel as faculty
  → Verify: iOS slot shows "No Faculty Available"
  → Verify: Changed slots highlighted in amber

STEP 5: Login as rustam_morena / faculty@123
  → Navigate to /faculty-panel
  → Verify: only Blockchain classes visible (3 slots/week)
  → Verify: no other faculty's classes visible

STEP 6: Trigger timetable regeneration as cs_dept
  → Verify: rustam_morena's panel updates automatically (WebSocket) within 2 seconds
```

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
