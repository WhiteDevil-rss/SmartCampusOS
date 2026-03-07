# 12 — Testing Strategy

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Testing Philosophy

The AI Smart University Platform testing strategy follows the **Test Pyramid** model: a large base of fast unit tests, a middle layer of integration tests covering all service boundaries, and a focused top layer of E2E tests for critical user journeys. An additional horizontal layer covers security, performance, and blockchain-specific tests.

```
              ┌──────────────────┐
              │   E2E (Playwright) │  ← 7 complete panel flows
              ├────────────────────┤
              │ Integration Tests  │  ← API + DB + service boundaries
              │   (Supertest)      │
              ├────────────────────┤
              │   Unit Tests       │  ← Business logic, algorithms
              │ (Jest + Vitest)    │
              └────────────────────┘
    ─────────────────────────────────────────────────────
    Security (OWASP ZAP) | Load (k6) | Blockchain (Hardhat) | Isolation
```

---

## 2. Test Coverage Targets

| Test Type | Tool | Coverage Target |
|---|---|---|
| Unit Tests | Jest (Node.js) + Vitest (Python/React) | ≥ 80% line coverage |
| Integration Tests | Supertest | ≥ 70% API endpoint coverage |
| E2E Tests | Playwright | 100% of 7 panel flows |
| Conflict Tests | Jest | 100% of hard constraint coverage |
| Blockchain Tests | Hardhat (Mocha + Chai) | 100% contract function coverage |
| Security Tests | OWASP ZAP + Trivy | 0 Critical / 0 High vulnerabilities |
| Load Tests | k6 | 500 concurrent users; p95 < 500ms |
| Tenant Isolation Tests | Jest + Supertest | 100% cross-tenant API paths |

---

## 3. Unit Tests

### 3.1 Coverage Areas

| Module | Key Tests |
|---|---|
| OR-Tools Scheduler | Hard constraints HC-01 to HC-10; fairness score computation; NEP credit-hour enforcement |
| Blockchain Service | SHA-256 canonical hash computation; hash consistency across object key order |
| AI Chatbot | Claude API mock; RAG context injection; temperature=1 confirmation |
| Tenant Middleware | `SET search_path` called with correct schema; cross-tenant claim mismatch returns 403 |
| Fee Service | Idempotency on duplicate payment; scholarship adjustment calculation |
| Dropout Risk Model | Risk level mapping (score → LOW/MEDIUM/HIGH/CRITICAL); SHAP factor output |
| JWT Middleware | Expired token → 401; wrong role → 403; missing university claim → 403 |
| Result Hash | Same data → same hash; key order irrelevant (sorted keys) |
| Attendance | QR token expiry; duplicate scan prevention; flag workflow |

### 3.2 Example: OR-Tools Hard Constraint Tests

```typescript
// __tests__/unit/scheduler.test.ts

describe('OR-Tools Hard Constraints', () => {
  it('HC-01: should assign no faculty to two simultaneous slots', async () => {
    const result = await scheduleEngine.generate(deptData, config);
    const facultySlotMap: Record<string, string[]> = {};
    result.slots.forEach(slot => {
      const key = `${slot.facultyId}:${slot.day}:${slot.slotIndex}`;
      if (facultySlotMap[key]) throw new Error(`Faculty double-booked: ${key}`);
      facultySlotMap[key] = [slot.courseId];
    });
    expect(true).toBe(true); // No error thrown
  });

  it('HC-06: should not assign batch to room below capacity', async () => {
    const result = await scheduleEngine.generate(deptData, config);
    result.slots.forEach(slot => {
      const room = deptData.rooms.find(r => r.id === slot.roomId);
      const batch = deptData.batches.find(b => b.id === slot.batchId);
      if (room && batch) {
        expect(room.capacity).toBeGreaterThanOrEqual(batch.strength);
      }
    });
  });

  it('HC-08: should assign each course exactly its creditsPerWeek slots', async () => {
    const result = await scheduleEngine.generate(deptData, config);
    deptData.courses.forEach(course => {
      const count = result.slots.filter(s => s.courseId === course.id).length;
      expect(count).toBe(course.creditsPerWeek);
    });
  });

  it('should return 0 conflicts in 100 randomly generated timetables', async () => {
    for (let i = 0; i < 100; i++) {
      const randomDeptData = generateRandomDeptData();
      const result = await scheduleEngine.generate(randomDeptData, config);
      expect(result.conflicts).toBe(0);
    }
  });
});
```

### 3.3 Example: Blockchain Hash Tests

```typescript
// __tests__/unit/blockchain.test.ts

describe('Result Hash Computation', () => {
  it('should produce identical hash regardless of key insertion order', () => {
    const result1 = { sgpa: 8.5, cgpa: 8.2, semester: 2, enrollmentNo: '2025MCA001' };
    const result2 = { enrollmentNo: '2025MCA001', semester: 2, cgpa: 8.2, sgpa: 8.5 };
    expect(computeResultHash(result1)).toBe(computeResultHash(result2));
  });

  it('should produce different hash when any field changes', () => {
    const original = { sgpa: 8.5, cgpa: 8.2, semester: 2 };
    const tampered = { sgpa: 9.9, cgpa: 9.8, semester: 2 }; // tampered
    expect(computeResultHash(original)).not.toBe(computeResultHash(tampered));
  });
});
```

---

## 4. Integration Tests

### 4.1 Coverage Areas

| Endpoint Group | Happy Path | Edge Cases |
|---|---|---|
| Auth | Login all 5 role types; token refresh | Expired token; wrong password; wrong role |
| Timetable | Generate → publish → view | Infeasible config → conflict report; special timetable |
| Attendance | Create session → QR scan → mark | Expired QR; duplicate scan; flag workflow |
| Fees | Create structure → initiate payment → confirm | Duplicate payment idempotency; refund |
| Results | Publish results → blockchain hash → public verify | Tampered result; unverified university |
| Public Portal | Config → results verify → admission apply | Disabled feature → 404; cross-slug → 404 |
| AI Chatbot | Question → RAG retrieval → Claude response | No materials indexed → graceful fallback |
| Library | Add book → checkout → return → fine | Overdue detection; duplicate reservation |
| Placement | Job posting → placement record | Eligibility filter; duplicate placement |

### 4.2 Example: End-to-End Timetable Test

```typescript
// __tests__/integration/timetable.test.ts

describe('Timetable Generation', () => {
  it('should generate and publish a conflict-free timetable', async () => {
    const token = await loginAs('cs_dept');

    // Generate
    const genRes = await request(app)
      .post('/v2/timetables/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        departmentId: 'dept-cs-vnsgu',
        batchIds: ['batch-mca-sem2-a', 'batch-mca-sem2-b'],
        startTime: '09:00', endTime: '17:00',
        lectureDuration: 60, daysPerWeek: 5, solverTimeLimit: 30
      });

    expect(genRes.status).toBe(200);
    expect(genRes.body.conflicts).toBe(0);
    expect(genRes.body.fairnessScore).toBeGreaterThan(80);

    const ttId = genRes.body.timetableId;

    // View
    const viewRes = await request(app)
      .get(`/v2/timetables/${ttId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(viewRes.status).toBe(200);
    expect(viewRes.body.days).toHaveLength(5);
    expect(viewRes.body.days[0].slots.length).toBeGreaterThan(0);

    // Export PDF
    const exportRes = await request(app)
      .get(`/v2/timetables/${ttId}/export/pdf`)
      .set('Authorization', `Bearer ${token}`);
    expect(exportRes.status).toBe(302); // Redirect to S3 signed URL
  });
});
```

### 4.3 Example: Blockchain Publish & Verify

```typescript
// __tests__/integration/blockchain.test.ts

describe('Blockchain Result Verification', () => {
  it('should publish result and verify as authentic', async () => {
    const token = await loginAs('vnsgu_admin');

    const publishRes = await request(app)
      .post('/v2/results/publish')
      .set('Authorization', `Bearer ${token}`)
      .send({
        departmentId: 'dept-cs-vnsgu',
        semester: 1,
        academicYear: '2025-26',
        batchId: 'batch-mca-sem2-a'
      });

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.blockchainTxHash).toMatch(/^0x[0-9a-f]{64}$/);

    // Verify via public portal
    const verifyRes = await request(app)
      .get('/public/v2/vnsgu/results/verify')
      .query({ enrollment: '2025MCA001', semester: '1' });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verified).toBe(true);
  });

  it('should detect a tampered result', async () => {
    await publishSeedResult('2025MCA001', 1);

    // Directly modify the DB to simulate tampering
    await prisma.result.updateMany({
      where: { student: { enrollmentNo: '2025MCA001' }, semester: 1 },
      data: { sgpa: 9.9, cgpa: 9.9 }  // tampered — hash will mismatch
    });

    const verifyRes = await request(app)
      .get('/public/v2/vnsgu/results/verify')
      .query({ enrollment: '2025MCA001', semester: '1' });

    expect(verifyRes.body.verified).toBe(false);
  });
});
```

---

## 5. Tenant Isolation Tests

These tests are **mandatory** before every production release. All cross-tenant access attempts must return 403 or 404.

```typescript
// __tests__/tenant-isolation.test.ts

describe('Cross-Tenant Data Isolation', () => {
  it('should prevent university A admin from accessing university B data', async () => {
    const tokenUniA = await loginAs('vnsgu_admin');
    const response = await request(app)
      .get('/v2/students')
      .set('Authorization', `Bearer ${tokenUniA}`)
      .set('X-University-Id', 'spuvvn'); // Attempting to access SPUVVN
    expect(response.status).toBe(403);
  });

  it('should prevent public portal slug A from returning university B results', async () => {
    const response = await request(app)
      .get('/public/v2/vnsgu/results/verify')
      .query({ enrollment: 'SPUVVN_STUDENT_ENR', semester: '2' });
    expect(response.status).toBe(404); // Not in VNSGU schema
  });

  it('should serve different branding per university slug', async () => {
    const configA = await getPublicConfig('vnsgu');
    const configB = await getPublicConfig('spuvvn');
    expect(configA.branding.primaryColor).toBe('#003087');   // VNSGU blue
    expect(configB.branding.primaryColor).toBe('#8B0000');   // SPUVVN maroon
    expect(configA.branding.universityFullName).not.toBe(configB.branding.universityFullName);
  });

  it('should not allow a student to access another student\'s data', async () => {
    const tokenAryan = await loginAs('2025mca001');
    const response = await request(app)
      .get('/v2/students/ANOTHER_STUDENT_ID/performance')
      .set('Authorization', `Bearer ${tokenAryan}`);
    expect(response.status).toBe(403);
  });

  it('should not return SPUVVN vacancies on VNSGU public portal', async () => {
    await createVacancy('spuvvn', 'Test Vacancy SPUVVN Only');
    const response = await request(app).get('/public/v2/vnsgu/vacancies');
    const titles = response.body.vacancies.map((v: any) => v.title);
    expect(titles).not.toContain('Test Vacancy SPUVVN Only');
  });
});
```

---

## 6. Blockchain Tests (Hardhat)

```typescript
// apps/blockchain/test/AcademicRecords.test.ts

describe('AcademicRecords Smart Contract', () => {
  it('should publish and retrieve a result record', async () => {
    const { contract, publisher } = await deployContract();
    await contract.connect(publisher).publishResult(
      'uni-vnsgu', '2025MCA001', 2, 'abc123hash'
    );
    const [matches, publishedAt] = await contract.verifyResult(
      'uni-vnsgu', '2025MCA001', 2, 'abc123hash'
    );
    expect(matches).toBe(true);
    expect(publishedAt).toBeGreaterThan(0);
  });

  it('should return false for tampered result hash', async () => {
    const { contract, publisher } = await deployContract();
    await contract.connect(publisher).publishResult(
      'uni-vnsgu', '2025MCA001', 2, 'authentic_hash'
    );
    const [matches] = await contract.verifyResult(
      'uni-vnsgu', '2025MCA001', 2, 'tampered_hash'
    );
    expect(matches).toBe(false);
  });

  it('should emit ResultPublished event on publishResult', async () => {
    const { contract, publisher } = await deployContract();
    await expect(
      contract.connect(publisher).publishResult('uni-vnsgu', '2025MCA001', 2, 'hash_xyz')
    ).to.emit(contract, 'ResultPublished').withArgs(
      'uni-vnsgu', '2025MCA001', 2, 'hash_xyz', expect.anything()
    );
  });

  it('should revert when non-publisher calls publishResult', async () => {
    const { contract, nonPublisher } = await deployContract();
    await expect(
      contract.connect(nonPublisher).publishResult('uni-vnsgu', '2025MCA001', 2, 'hash')
    ).to.be.revertedWithCustomError(contract, 'AccessControlUnauthorizedAccount');
  });
});
```

---

## 7. E2E Tests (Playwright)

### 7.1 Panel Flows Covered

| Flow | Steps |
|---|---|
| Student Full Flow | Login → View timetable → Check attendance → Pay fees → Use AI chatbot → Download ID card |
| Faculty Attendance Flow | Login → Open attendance session → Generate QR → Student scans → Close session → View summary |
| Department Timetable Flow | Login → Configure generation → Generate → View grid → Publish → Export PDF |
| Result Publication Flow | Login (Uni Admin) → Publish result → Blockchain tx confirmed → View Polygonscan link |
| Public Portal Verify Flow | Navigate to `/public/vnsgu` → Enter enrollment → See ✅ Verified + Polygonscan link |
| Admission Application Flow | Navigate to `/public/vnsgu/admissions` → Fill form → Submit → Check status with application ID |
| Superadmin Onboarding Flow | Login → Create university → Configure public portal → Set branding → Verify portal live |

### 7.2 Example: Student Full Flow

```typescript
// e2e/student-flow.spec.ts

test('Student can view timetable, pay fees, and use AI chatbot', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="username"]', '2025mca001');
  await page.fill('[name="password"]', 'student@123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/student');

  // View timetable
  await page.click('a[href="/student/timetable"]');
  await expect(page.locator('.timetable-grid')).toBeVisible();
  await expect(page.locator('.timetable-cell')).toHaveCountGreaterThan(0);

  // Check attendance
  await page.click('a[href="/student/attendance"]');
  await expect(page.locator('[data-testid="attendance-percentage"]')).toBeVisible();

  // Fee payment (test mode)
  await page.click('a[href="/student/fees"]');
  await expect(page.locator('[data-testid="fees-due-amount"]')).toContainText('₹');
  await page.click('[data-testid="pay-fees-button"]');
  await expect(page.locator('[data-testid="razorpay-modal"]')).toBeVisible();
  await page.keyboard.press('Escape'); // Close modal (test mode)

  // AI Chatbot
  await page.click('a[href="/student/ai/chatbot"]');
  await page.fill('[data-testid="chatbot-input"]', 'What is backpropagation?');
  await page.click('[data-testid="chatbot-send"]');
  await expect(page.locator('[data-testid="chatbot-response"]')).toBeVisible({ timeout: 10000 });
  const response = await page.locator('[data-testid="chatbot-response"]').textContent();
  expect(response?.length).toBeGreaterThan(50);

  // Digital ID
  await page.click('a[href="/student/campus/id"]');
  await expect(page.locator('[data-testid="digital-id-card"]')).toBeVisible();
  await expect(page.locator('[data-testid="id-qr-code"]')).toBeVisible();
});
```

### 7.3 Example: Public Portal Verification

```typescript
// e2e/public-portal.spec.ts

test('Public visitor can verify a result and see blockchain badge', async ({ page }) => {
  await page.goto('/public/vnsgu');
  await expect(page.locator('img[alt="Logo"]')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Veer Narmad South Gujarat University');

  await page.click('a[href="/public/vnsgu/results"]');
  await page.fill('[data-testid="enrollment-input"]', '2025MCA001');
  await page.selectOption('[data-testid="semester-select"]', '1');
  await page.click('[data-testid="verify-button"]');

  await expect(page.locator('[data-testid="verification-badge"]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-testid="verification-badge"]')).toContainText('✅ Verified');
  await expect(page.locator('[data-testid="polygonscan-link"]')).toBeVisible();

  const link = await page.locator('[data-testid="polygonscan-link"]').getAttribute('href');
  expect(link).toContain('polygonscan.com/tx/0x');
});
```

---

## 8. Load Tests (k6)

### 8.1 Scenario: 500 Concurrent Users

```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 500 },   // Hold at 500 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // p95 < 500ms
    http_req_failed: ['rate<0.01'],     // < 1% error rate
  },
};

export default function () {
  const token = getAuthToken();

  // Student timetable (most common request)
  const ttRes = http.get(`${BASE_URL}/v2/students/student_aryan/timetable`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  check(ttRes, { 'timetable 200': r => r.status === 200 });

  // AI chatbot query
  const chatRes = http.post(`${BASE_URL}/v2/ai/chatbot`, JSON.stringify({
    message: 'Explain neural networks',
    subjectId: 'course-ai',
    sessionId: 'load-test-session'
  }), { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  check(chatRes, { 'chatbot 200': r => r.status === 200 });

  // Public portal verification (unauthenticated — highest traffic)
  const verifyRes = http.get(`${BASE_URL}/public/v2/vnsgu/results/verify?enrollment=2025MCA001&semester=1`);
  check(verifyRes, { 'verify 200': r => r.status === 200 });

  sleep(1);
}
```

### 8.2 Load Test Targets

| Test Scenario | Concurrent Users | Pass Criteria |
|---|---|---|
| Student portal (timetable, marks, attendance) | 500 | p95 < 500ms; error rate < 1% |
| AI chatbot concurrent queries | 100 | p95 < 5s; error rate < 2% |
| Public portal verifications burst | 1000 req/min | Rate limiting triggers cleanly; no data leakage |
| Timetable generation concurrent | 5 departments | Each generation < 30s; no race conditions |
| Fee payment concurrent | 200 | 0 duplicate payments; idempotency holds |

---

## 9. Security Tests

### 9.1 OWASP ZAP Scan Coverage

| OWASP Category | Test | Expected Result |
|---|---|---|
| A01: Broken Access Control | Cross-tenant API call (uni A token → uni B data) | 403 |
| A01: Broken Access Control | Student accessing another student's marks | 403 |
| A02: Cryptographic Failures | Check JWT signed with strong secret | RSA/HS256 verified |
| A03: Injection | SQL injection in enrollment number param | Parameterised query; no data leak |
| A03: Injection | NoSQL injection in MongoDB queries | Input validation; no injection |
| A05: Security Misconfiguration | Check HTTP headers (CSP, HSTS, X-Frame) | All headers present |
| A06: Vulnerable Components | Trivy scan of all Docker images | 0 Critical CVEs |
| A07: Auth Failures | Expired JWT on protected endpoint | 401 |
| A07: Auth Failures | JWT with wrong university claim | 403 |
| A07: Auth Failures | Brute-force login (> 10 attempts) | Rate limit triggers |
| A10: SSRF | Public portal URL parameter injection | Rejected; no internal requests |

### 9.2 Trivy Container Scan

```bash
# Run before every production deploy
trivy image --severity CRITICAL,HIGH platform-api:latest
trivy image --severity CRITICAL,HIGH platform-ai:latest
trivy image --severity CRITICAL,HIGH platform-web:latest
# Must exit with code 0 (no Critical/High CVEs)
```

---

## 10. Test Data Reference

All tests run against the VNSGU + SPUVVN seed data.

| Entity | Test Value |
|---|---|
| Uni Admin token | `loginAs('vnsgu_admin')` — password: `vnsgu@123` |
| Dept Admin token | `loginAs('cs_dept')` — password: `cs@123` |
| Faculty token | `loginAs('rustam_morena')` — password: `faculty@123` |
| Student token | `loginAs('2025mca001')` — password: `student@123` |
| Public portal slug (VNSGU) | `vnsgu` |
| Public portal slug (SPUVVN) | `spuvvn` |
| Known blockchain enrollment | `2025MCA001` (Aryan Mehta) — Sem 1 result on-chain |
| Cross-tenant test student | `SPUVVN_STUDENT_001` — must NOT be visible on VNSGU portal |
| Test department | `dept-cs-vnsgu` |
| Test batch IDs | `batch-mca-sem2-a`, `batch-mca-sem2-b` |

---

## 11. Test Execution Commands

```bash
# Unit tests — all apps
pnpm test

# Unit tests with coverage
pnpm test --coverage

# Integration tests only
pnpm test:integration

# E2E tests (headless)
pnpm test:e2e

# E2E tests (headed, debug)
pnpm test:e2e --headed

# Blockchain tests
cd apps/blockchain && npx hardhat test

# Tenant isolation tests only
pnpm test --testPathPattern="tenant-isolation"

# Load tests (k6)
k6 run k6/load-test.js

# Security scan (OWASP ZAP)
zap-baseline.py -t http://localhost:3000 -r zap-report.html

# Container security scan
trivy image platform-api:latest
```

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
