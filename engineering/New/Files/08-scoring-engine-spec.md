# 08 — Scoring Engine Specification

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Overview

The AI Smart University Platform uses multiple scoring and evaluation engines across different domains. Each engine has a defined algorithm, input data model, output schema, and integration points. This document specifies all scoring engines in detail.

| Engine | Domain | Algorithm | Panel |
|---|---|---|---|
| Timetable Fairness Engine | Scheduling | CP-SAT Multi-objective + Fairness Score | Department Admin |
| Constraint Violation Scorer | Scheduling | CP-SAT Hard/Soft Constraint Checker | Department Admin |
| Student Performance Predictor | Academic | XGBoost Gradient Boosted Trees | Faculty / Dept Admin |
| Dropout Risk Scorer | Academic | Random Forest + SHAP Explainability | Dept Admin / HOD |
| AI Slot Preference Model | Scheduling | XGBoost Warm-Start | Scheduling Engine |
| NEP Compliance Checker | Compliance | Rule Engine + NLP | University Admin |
| Resume Analyser | Placement | BERT NLP + Scoring | Placement Officer |
| AI Fraud Detector | Security | Isolation Forest + Rule Engine | System (Automated) |
| Blockchain Result Verifier | Verification | SHA-256 Hash Comparison | Public Portal |
| Substitute Recommender | Scheduling | Cosine Similarity + Availability | Dept Admin |

---

## 2. Timetable Fairness Scoring Engine

### 2.1 Purpose
Quantify how equitably workload is distributed across faculty members in a generated timetable. A fairness score of 100 means zero variance; lower scores indicate skewed allocation.

### 2.2 Formula

```
FairnessScore = 100 × (1 - NormalisedVariance)

NormalisedVariance = (MaxLoad - MinLoad) / MaxLoad

Where:
  MaxLoad = maximum teaching slots assigned to any one faculty
  MinLoad = minimum teaching slots assigned to any faculty
```

### 2.3 Interpretation

| Score Range | Grade | Action |
|---|---|---|
| 95–100 | Excellent | No intervention required |
| 85–94 | Good | Optional manual review |
| 70–84 | Fair | Suggest rebalancing in next generation |
| < 70 | Poor | Alert HOD; recommend regeneration with fairness weight increased |

### 2.4 CP-SAT Implementation

```python
# Soft constraint SC-04 — Minimise workload variance
workloads = []
for faculty in dept_data['faculty']:
    faculty_load = sum(
        v for key, v in slot_vars.items() if key[1] == faculty['id']
    )
    workloads.append(faculty_load)

max_load = model.new_int_var(0, 100, 'max_load')
min_load = model.new_int_var(0, 100, 'min_load')
model.add_max_equality(max_load, workloads)
model.add_min_equality(min_load, workloads)

fairness_penalty = model.new_int_var(0, 100, 'fairness_penalty')
model.add(fairness_penalty == max_load - min_load)

# Include in objective: model.minimize(fairness_penalty * 100 + ...)
```

### 2.5 Output

```json
{
  "fairnessScore": 94.2,
  "grade": "Good",
  "maxLoad": 18,
  "minLoad": 16,
  "facultyBreakdown": [
    { "facultyId": "faculty-rustam", "assignedSlots": 18, "maxHrsWeek": 20 },
    { "facultyId": "faculty-ravi", "assignedSlots": 17, "maxHrsWeek": 18 },
    { "facultyId": "faculty-dharmen", "assignedSlots": 16, "maxHrsWeek": 20 }
  ]
}
```

---

## 3. Constraint Violation Scorer

### 3.1 Hard Constraints (HC) — Must be 0 violations for a valid timetable

| ID | Constraint | CP-SAT Enforcement |
|---|---|---|
| HC-01 | No faculty double-booking — same faculty cannot be in two rooms simultaneously | `add_at_most_one` per faculty per slot |
| HC-02 | No room double-booking — same room cannot host two classes simultaneously | `add_at_most_one` per room per slot |
| HC-03 | No batch double-booking — same batch cannot attend two classes simultaneously | `add_at_most_one` per batch per slot |
| HC-04 | Faculty availability — excluded or unavailable faculty cannot be scheduled | `var == 0` for unavailable (faculty_id, day, slot) |
| HC-05 | Room unavailability — blocked rooms excluded from assignment | `var == 0` for blocked (room_id, day, slot) |
| HC-06 | Room capacity — room capacity must equal or exceed batch strength | `var == 0` if capacity < strength |
| HC-07 | Faculty qualification — only qualified faculty assigned to a course | `var == 0` for unqualified (course, faculty) pairs |
| HC-08 | NEP credit-hours — each course scheduled for exactly its credits-per-week count | `sum(course_slots) == creditsPerWeek` |
| HC-09 | Lab hours continuity — lab sessions scheduled as consecutive double slots | `slot[n] + slot[n+1]` continuity constraint |
| HC-10 | Weekly teaching limit — no faculty exceeds `maxHrsPerWeek` | `sum(faculty_slots) <= maxHrsPerWeek` |

### 3.2 Soft Constraints (SC) — Minimised in objective function

| ID | Constraint | Weight | Penalty Logic |
|---|---|---|---|
| SC-01 | Faculty preferred time slots | 50 | Penalise assignment outside preferred window |
| SC-02 | No back-to-back labs for same batch | 80 | Penalise consecutive lab slots same batch |
| SC-03 | Morning slots preferred for core theory subjects | 30 | Penalise core subjects in last 2 slots |
| SC-04 | Workload fairness across faculty | 100 | Penalise max_load - min_load |
| SC-05 | Same subject not on consecutive days | 40 | Penalise same subject adjacent days |
| SC-06 | Elective courses distributed evenly | 60 | Penalise clustering electives |
| SC-07 | AI slot preference warm-start | 100 | XGBoost-predicted preference incorporated as objective hint |

### 3.3 Conflict Report Schema (on generation failure)

```json
{
  "status": "INFEASIBLE",
  "solverStatus": "INFEASIBLE",
  "conflicts": [
    {
      "type": "ROOM_CAPACITY_EXCEEDED",
      "severity": "HARD",
      "batch": "MCA Sem 2 Div A",
      "course": "Android Development",
      "room": "CS Lab A",
      "batchStrength": 30,
      "roomCapacity": 28,
      "recommendation": "Use CS Lab B (capacity: 30) as alternate or split batch into two sections"
    },
    {
      "type": "FACULTY_QUALIFICATION_MISSING",
      "severity": "HARD",
      "course": "iOS Development",
      "batch": "MCA Sem 2 Div B",
      "availableQualifiedFaculty": 0,
      "recommendation": "Add at least one faculty qualified for iOS Development or mark course as elective with pool sharing"
    }
  ],
  "softViolations": [
    {
      "type": "WORKLOAD_IMBALANCE",
      "severity": "SOFT",
      "details": "Faculty Dharmen: 8 slots vs Faculty Vimal: 22 slots (delta: 14)",
      "recommendation": "Reduce Dharmen's elective courses or redistribute shared subjects"
    }
  ]
}
```

---

## 4. Student Performance Prediction Engine

### 4.1 Algorithm
XGBoost Gradient Boosted Trees trained on historical student data.

### 4.2 Input Features

| Feature | Type | Source |
|---|---|---|
| `internal1_marks` | Float (0–100) | Marks table — Internal 1 |
| `internal2_marks` | Float (0–100) | Marks table — Internal 2 |
| `mid_term_marks` | Float (0–100) | Marks table — Mid-Term |
| `attendance_percentage` | Float (0–100) | Attendance records |
| `assignments_submitted_pct` | Float (0–1) | Submissions / total assignments |
| `quizzes_avg_score` | Float (0–100) | Quiz results |
| `program_type` | Categorical | Program — encoded |
| `semester` | Int | Current semester |
| `department_code` | Categorical | Department — encoded |

### 4.3 Output

```json
{
  "studentId": "student_aryan",
  "predictedEndSemesterGrade": 8.4,
  "confidence": 0.82,
  "subjectPredictions": [
    { "courseId": "course-ai", "predictedGrade": 8.8, "trend": "IMPROVING" },
    { "courseId": "course-dotnet", "predictedGrade": 7.2, "trend": "DECLINING" }
  ]
}
```

### 4.4 Retraining Schedule
Model retrained at end of each semester using newly collected marks data. Stored as versioned artifacts in S3: `s3://models/performance_xgb_v{n}.json`.

---

## 5. Dropout Risk Scoring Engine

### 5.1 Algorithm
Random Forest classifier with SHAP (SHapley Additive exPlanations) for human-readable risk factor attribution.

### 5.2 Input Features

| Feature | Weight (SHAP avg) | Risk Indicator |
|---|---|---|
| `attendance_percentage` | 0.41 | < 60% → high risk |
| `assignments_missed_count` | 0.22 | > 3 missed → medium risk |
| `internal_marks_trend` | 0.17 | Declining 3+ consecutive → medium risk |
| `fees_overdue_days` | 0.09 | > 60 days overdue → high risk |
| `library_activity` | 0.05 | 0 borrows last 30 days → low signal |
| `counselling_requests` | 0.04 | 0 but other signals high |
| `semester` | 0.02 | Sem 1 highest risk period |

### 5.3 Risk Levels

| Score | Level | Action |
|---|---|---|
| 0.00 – 0.30 | LOW | No intervention; routine monitoring |
| 0.31 – 0.60 | MEDIUM | Notify course faculty; suggest academic counselling |
| 0.61 – 0.80 | HIGH | Notify HOD + parents; schedule counselling session; flag in dept dashboard |
| 0.81 – 1.00 | CRITICAL | Immediate HOD intervention; academic probation workflow triggered |

### 5.4 Output

```json
{
  "studentId": "student_aryan",
  "riskScore": 0.68,
  "riskLevel": "HIGH",
  "topRiskFactors": [
    { "factor": "attendance_percentage", "value": 58.3, "impact": 0.41, "threshold": 75.0 },
    { "factor": "assignments_missed_count", "value": 4, "impact": 0.22, "threshold": 2 },
    { "factor": "internal_marks_trend", "value": "DECLINING", "impact": 0.17 }
  ],
  "recommendation": "Schedule counselling session within 5 working days. Notify parent/guardian. Flag for HOD review.",
  "modelVersion": "rf_dropout_v2",
  "computedAt": "2026-03-15T08:00:00Z"
}
```

### 5.5 Batch Computation
Dropout risk is computed nightly via a BullMQ scheduled job for all active students. Results cached in Redis and surfaced on the Department Admin dashboard under "At-Risk Students".

---

## 6. AI Slot Preference Model (Timetable Warm-Start)

### 6.1 Purpose
Pre-populate CP-SAT solver objective hints to guide it toward historically preferred slot assignments, reducing solve time and improving soft constraint satisfaction.

### 6.2 Algorithm
XGBoost regressor, output range 0.0 – 1.0. Higher score = more preferred slot for the given (course, faculty, day, slot_index) combination.

### 6.3 Input Features

| Feature | Description |
|---|---|
| `day_of_week` | 1 (Monday) to 6 (Saturday) |
| `slot_index` | 0-based position in day (e.g. 0 = 09:00) |
| `course_type` | THEORY=0, LAB=1, PROJECT=2 |
| `faculty_seniority` | 0 (junior) to 3 (professor) |
| `department_code` | Encoded department |
| `historical_usage_rate` | % of past timetables using this slot for this course type |

### 6.4 Integration with CP-SAT

```python
def _predict_slot_preference(self, course_id, faculty_id, day, slot_idx) -> float:
    features = [[day, slot_idx,
                 self._get_course_type(course_id),
                 self._get_faculty_seniority(faculty_id)]]
    dmatrix = xgb.DMatrix(features)
    return float(self.preference_model.predict(dmatrix)[0])

# In objective: lower penalty for higher-preference slots
penalties.append(slot_var * (100 - int(preference_score * 100)))
```

---

## 7. NEP 2020 Compliance Checker

### 7.1 Purpose
Validate a generated timetable against NEP 2020 credit distribution requirements and program structure rules.

### 7.2 Rules Checked

| Rule ID | Rule | Method |
|---|---|---|
| NEP-01 | Each course scheduled exactly its `creditsPerWeek` hours | Count scheduled slots |
| NEP-02 | Lab subjects scheduled as consecutive double slots | Continuity check |
| NEP-03 | Total weekly hours within program limits | Sum all slots per batch |
| NEP-04 | FYUP exit point courses scheduled appropriately | Year-wise course categorisation |
| NEP-05 | MDC / IDC electives meet minimum slot count | Elective category counter |
| NEP-06 | Teaching hours per course ≥ minimum contact hours | Ratio check |
| NEP-07 | No scheduling conflicts during FYUP cross-year shared rooms | Cross-batch room check |

### 7.3 Output

```json
{
  "compliant": true,
  "rules": [
    { "ruleId": "NEP-01", "passed": true, "detail": "All 7 courses meet creditsPerWeek requirements" },
    { "ruleId": "NEP-02", "passed": true, "detail": "All lab courses scheduled as double slots" },
    { "ruleId": "NEP-04", "passed": true, "detail": "FYUP exit points for Year 1 and Year 2 correctly configured" }
  ],
  "warnings": [
    { "ruleId": "NEP-05", "detail": "MDC elective has only 2 slots/week; recommendation is 3 for full credit compliance" }
  ]
}
```

---

## 8. Resume Scoring Engine

### 8.1 Algorithm
BERT-based NLP model that scores a student's resume against a job description. Uses cosine similarity of sentence embeddings + keyword matching.

### 8.2 Input

```json
{
  "resumeText": "Aryan Mehta, MCA 2025-27, CGPA 8.2, Skills: Python, React, Node.js, SQL, Git...",
  "jobDescriptionText": "Looking for a Full Stack Developer with 0-1 years experience, strong in React and Node.js..."
}
```

### 8.3 Output

```json
{
  "overallScore": 0.78,
  "sections": {
    "skillsMatch": 0.85,
    "educationMatch": 0.90,
    "experienceMatch": 0.40,
    "keywordCoverage": 0.75
  },
  "missingKeywords": ["Docker", "AWS", "CI/CD"],
  "strengths": ["React", "Node.js", "Python", "SQL"],
  "recommendation": "Strong technical match. Add cloud and DevOps skills to significantly improve placement probability."
}
```

---

## 9. AI Fraud Detection Engine

### 9.1 Purpose
Detect anomalous fee payment patterns and abnormal result verification request volumes using unsupervised anomaly detection.

### 9.2 Algorithm
Isolation Forest — identifies outliers by isolating observations through random feature splits. Combined with a deterministic rule engine for known fraud patterns.

### 9.3 Fee Payment Anomaly Features

| Feature | Description |
|---|---|
| `payment_amount` | Fees paid |
| `payment_frequency_7d` | Number of payments in last 7 days |
| `ip_country` | Country of originating IP |
| `time_of_day` | Hour of payment |
| `gateway` | Payment gateway used |
| `device_fingerprint_hash` | Anonymised device hash |

### 9.4 Verification Request Anomaly Features

| Feature | Description |
|---|---|
| `requests_per_hour_per_ip` | Request rate per IP |
| `university_slug` | Target university |
| `enrollment_patterns` | Sequential vs random enrollment numbers |
| `user_agent` | Browser / bot signal |

### 9.5 Output

```json
{
  "anomalyDetected": true,
  "score": -0.23,
  "type": "BULK_VERIFICATION_SCRAPING",
  "triggeredRules": ["rate_limit_exceeded", "sequential_enrollment_pattern"],
  "action": "RATE_LIMIT_IP",
  "ipAddress": "192.168.x.x",
  "recommendedAction": "Block IP for 24 hours; alert university admin"
}
```

### 9.6 Actions on Detection

| Anomaly Type | Automated Response |
|---|---|
| Duplicate payment attempt | Block transaction; return idempotency response |
| Bulk verification scraping | IP rate-limit → temporary block |
| Fee payment from suspicious IP | Flag for manual review; send alert to finance officer |
| Rapid enrollment lookup | CAPTCHA challenge on next request |

---

## 10. Blockchain Result Verifier

### 10.1 Algorithm
SHA-256 cryptographic hash comparison. The result record is canonicalised (sorted keys, deterministic JSON serialisation) before hashing, ensuring identical data always produces the same hash.

### 10.2 Hash Computation

```typescript
// Hash is computed deterministically using sorted JSON keys
const canonicalJson = JSON.stringify(resultData, Object.keys(resultData).sort());
const resultHash = createHash('sha256').update(canonicalJson).digest('hex');
```

### 10.3 Verification Flow

```
1. Verifier enters enrollment number + semester on public portal
2. public-portal-service fetches result from PostgreSQL
3. Recomputes SHA-256 hash of current result record
4. Calls verifyResult() on AcademicRecords.sol (Polygon L2)
5. On-chain stored hash vs recomputed hash compared
6. Match → ✅ Verified | Mismatch → ❌ Tampered
7. Verification event logged in VerificationRequest table
```

### 10.4 Output Schema

```json
{
  "verified": true,
  "studentName": "Aryan Mehta",
  "enrollmentNo": "2025MCA001",
  "semester": 2,
  "sgpa": 8.5,
  "cgpa": 8.2,
  "resultHash": "a1b2c3d4e5f6...",
  "blockchainTxHash": "0xabc123def456...",
  "publishedAt": "2026-03-15T10:00:00Z",
  "polygonscanUrl": "https://polygonscan.com/tx/0xabc123def456"
}
```

---

## 11. Substitute Faculty Recommender

### 11.1 Algorithm
Cosine similarity between subject specialisation vectors, filtered by real-time availability, then ranked by seniority and past substitution count.

### 11.2 Input

```json
{
  "absentFacultyId": "faculty-dharmen",
  "courseId": "course-dotnet",
  "date": "2026-03-20",
  "slotIndex": 2
}
```

### 11.3 Output

```json
{
  "recommendations": [
    {
      "facultyId": "faculty-mayur",
      "name": "Mayur Patel",
      "similarityScore": 0.89,
      "isAvailable": true,
      "currentLoadToday": 2,
      "specialisations": [".NET", "C#", "ASP.NET Core"]
    },
    {
      "facultyId": "faculty-prakash",
      "name": "Prakash Rana",
      "similarityScore": 0.72,
      "isAvailable": true,
      "currentLoadToday": 3,
      "specialisations": ["Java", "Spring Boot", ".NET basics"]
    }
  ]
}
```

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
