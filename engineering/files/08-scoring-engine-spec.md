# 08 — Scoring Engine Specification

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Overview

The NEP-Scheduler Scoring Engine is a two-layer system:

1. **OR-Tools CP-SAT Solver** — guarantees hard constraint satisfaction (zero conflicts)
2. **ML/AI Pipeline** — scores, ranks, and optimizes solutions for soft constraints (workload fairness, slot quality, room utilization)

The engine is implemented in **Python 3.11 + FastAPI** and exposed as an internal HTTP microservice at port `8003`.

---

## 2. Hard Constraints (Must Never Be Violated)

Hard constraints are encoded directly into the CP-SAT model. If any hard constraint cannot be satisfied, the solver returns `INFEASIBLE` and generation fails with a detailed conflict report.

| ID | Constraint | CP-SAT Implementation |
|---|---|---|
| HC-01 | No faculty member assigned to two classes simultaneously | `AddAtMostOne` over all slots with same `(day, slot, faculty)` |
| HC-02 | No classroom double-booked for the same time slot | `AddAtMostOne` over all slots with same `(day, slot, room)` |
| HC-03 | No batch/division assigned two subjects at the same time | `AddAtMostOne` over all slots with same `(day, slot, batch)` |
| HC-04 | Subject must be taught by a faculty qualified for that subject | Decision variable only created for `(course, faculty)` pairs in `faculty_subjects` |
| HC-05 | Lab sessions must use lab-type rooms; theory uses classrooms | Room type check gates variable creation: `if course.type == 'Lab' and room.type != 'Lab': skip` |
| HC-06 | Room capacity must be ≥ batch strength | Capacity check gates variable creation: `if room.capacity < batch.strength: skip` |
| HC-07 | Daily faculty hours must not exceed `maxHrsPerDay` | `model.Add(sum(daily_vars) <= faculty.max_hrs_per_day)` |
| HC-08 | Weekly faculty hours must not exceed `maxHrsPerWeek` | `model.Add(sum(weekly_vars) <= faculty.max_hrs_per_week)` |
| HC-09 | Each course must be taught exactly `weeklyHrs` times per batch per week | `model.Add(sum(course_vars) == course.weekly_hrs)` |

---

## 3. Soft Constraints (Optimized via Objective Function)

Soft constraints are implemented as an objective function minimized by the CP-SAT solver. Weights are tunable configuration values.

| ID | Constraint | Weight | Optimization Approach |
|---|---|---|---|
| SC-01 | Minimize gaps in faculty daily schedule (back-to-back preference) | High | Penalize non-consecutive slot assignments per faculty per day |
| SC-02 | Distribute subjects evenly across weekdays | Medium | Penalize >2 sessions of same course on same day |
| SC-03 | Prefer morning slots for high-cognitive subjects (AI, Mathematics) | Low | Add cost term for assigning high-cognitive courses to afternoon slots |
| SC-04 | Minimize faculty workload variance (fairness index < 2 hrs/week) | High | `Minimize(max_load - min_load)` across all faculty |
| SC-05 | Lab sessions preferably in 2-hour contiguous blocks | Medium | Reward consecutive slot assignments for Lab-type courses |
| SC-06 | Senior faculty (HOD) gets preferred timing windows | Low | Reduce cost for HOD assignments in preferred slots |

---

## 4. Decision Variable Structure

```
assign[batch_idx][course_idx][day][slot][faculty_idx][room_idx]
  = 1  if that faculty teaches that course to that batch
         in that day/slot in that room
  = 0  otherwise
```

The variable space is pruned aggressively before solving:
- Only `(course, faculty)` pairs valid in `faculty_subjects` are created
- Only `(course, room)` pairs with matching type (Theory/Lab) are created
- Only rooms with `capacity >= batch.strength` are included

---

## 5. Time Slot Generation Algorithm

```python
def generate_time_slots(config: dict) -> list[dict]:
    """
    Generates daily time slots based on administrator configuration.

    Input config keys:
      start_time        : "09:00"
      end_time          : "17:00"
      lecture_duration  : 60  (minutes)
      break_duration    : 60  (minutes)
      break_after       : 2   (after Nth lecture)
    """
    start = datetime.strptime(config['start_time'], '%H:%M')
    end   = datetime.strptime(config['end_time'],   '%H:%M')
    lecture_dur = timedelta(minutes=config['lecture_duration'])
    break_dur   = timedelta(minutes=config['break_duration'])
    break_after = config['break_after']

    slots = []
    current = start
    lecture_count = 0
    slot_num = 1

    while current + lecture_dur <= end:
        slots.append({
            'slot_number': slot_num,
            'start_time': current.strftime('%H:%M'),
            'end_time':   (current + lecture_dur).strftime('%H:%M'),
            'is_break':   False,
            'slot_type':  'LECTURE'
        })
        current += lecture_dur
        lecture_count += 1
        slot_num += 1

        if lecture_count == break_after and current + break_dur <= end:
            slots.append({
                'slot_number': slot_num,
                'start_time': current.strftime('%H:%M'),
                'end_time':   (current + break_dur).strftime('%H:%M'),
                'is_break':   True,
                'slot_type':  'BREAK'
            })
            current += break_dur
            slot_num += 1

    return slots
```

**Example Output** (start=09:00, end=17:00, lecture=60min, break=60min after 2nd):

| Slot # | Start | End | Type |
|---|---|---|---|
| 1 | 09:00 | 10:00 | LECTURE |
| 2 | 10:00 | 11:00 | LECTURE |
| 3 | 11:00 | 12:00 | BREAK |
| 4 | 12:00 | 13:00 | LECTURE |
| 5 | 13:00 | 14:00 | LECTURE |
| 6 | 14:00 | 15:00 | LECTURE |
| 7 | 15:00 | 16:00 | LECTURE |
| 8 | 16:00 | 17:00 | LECTURE |

---

## 6. CP-SAT Solver Configuration

```python
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = 30.0   # Configurable: 10–120s
solver.parameters.num_search_workers  = 4       # Parallel workers
status = solver.Solve(model)
```

**Solver Status Codes:**

| Status | Meaning | Action |
|---|---|---|
| `OPTIMAL` | Best possible solution found | Return timetable; log generation time |
| `FEASIBLE` | Valid solution within time limit (not necessarily optimal) | Return timetable with warning |
| `INFEASIBLE` | No valid solution exists | Fail with conflict detail report |
| `UNKNOWN` | Time limit reached with no solution | Suggest increasing solver time limit |

---

## 7. ML/AI Pipeline Architecture

The ML layer preprocesses data before passing it to OR-Tools, and post-processes the solver output.

| ML Module | Algorithm | Purpose |
|---|---|---|
| Slot Preference Predictor | Gradient Boosted Trees (XGBoost) | Predict optimal time slots per subject type based on historical schedules |
| Workload Fairness Scorer | Multi-objective LP Relaxation | Score and balance faculty load equity; computes fairness index |
| Conflict Risk Classifier | Random Forest Classifier | Pre-screen high-risk constraint combinations before running solver |
| Substitute Recommender | Collaborative Filtering + Cosine Similarity | Suggest substitutes when faculty absent (v2) |
| Room Utilization Optimizer | Bin Packing Heuristic + RL | Maximize room utilization efficiency |
| Schedule Quality Ranker | Learning to Rank (LambdaMART) | Rank alternative timetable solutions when solver returns multiple FEASIBLE solutions |
| Anomaly Detector | Isolation Forest | Detect unusual workload or scheduling patterns |
| NEP Compliance Checker | Rule-based + NLP | Validate generated schedule against NEP 2020 hour requirements |

---

## 8. Workload Fairness Scoring

The fairness objective is encoded in the CP-SAT model:

```python
# For each faculty, compute total teaching hours (decision variables)
faculty_loads = []
for fi in range(len(self.faculty)):
    load = sum(v for k, v in assignments.items() if k[4] == fi)
    faculty_loads.append(load)

if len(faculty_loads) >= 2:
    max_load = model.NewIntVar(0, 30, 'max_load')
    min_load = model.NewIntVar(0, 30, 'min_load')
    for load in faculty_loads:
        model.Add(load <= max_load)
        model.Add(load >= min_load)
    variance = model.NewIntVar(0, 30, 'variance')
    model.Add(variance == max_load - min_load)
    model.Minimize(variance)
```

**Target:** Workload variance across all faculty in a department < 2 hours/week.

---

## 9. Solution Extraction & Output

After solving, the solution is extracted into a structured format:

```python
def _extract_solution(self, solver, assignments, status) -> dict:
    timetable_slots = []
    for key, var in assignments.items():
        if solver.Value(var) == 1:
            bi, ci, d, si, fi, ri = key
            slot = self.slots[si]
            timetable_slots.append({
                'batch_id':    self.batches[bi]['id'],
                'course_id':   self.courses[ci]['id'],
                'faculty_id':  self.faculty[fi]['id'],
                'room_id':     self.rooms[ri]['id'],
                'day_of_week': d + 1,
                'slot_number': si + 1,
                'start_time':  slot['start_time'],
                'end_time':    slot['end_time'],
                'is_break':    False,
                'slot_type':   'LAB' if self.courses[ci]['type'] == 'Lab' else 'THEORY'
            })

    # Compute workload stats
    workload = {}
    for s in timetable_slots:
        fid = s['faculty_id']
        workload[fid] = workload.get(fid, 0) + 1

    # Identify unassignable courses
    unassignable = [
        {'course_id': cid, 'reason': 'No available qualified faculty'}
        for cid, fids in self.faculty_subject_map.items()
        if not fids
    ]

    return {
        'success':             True,
        'status':              solver.StatusName(status),
        'conflict_count':      0,   # Guaranteed by hard constraints
        'generation_ms':       int(solver.WallTime() * 1000),
        'slots':               timetable_slots,
        'workload_stats':      workload,
        'unassignable_courses': unassignable,
        'time_slots':          self.slots
    }
```

---

## 10. Special Timetable Mode

The `TimetableScheduler` accepts exclusion lists for both faculty and rooms:

```python
class TimetableScheduler:
    def __init__(self, dept_data, config,
                 excluded_faculty: list[str] = None,
                 excluded_rooms: list[str] = None):

        self.excluded_faculty = excluded_faculty or []
        self.excluded_rooms   = excluded_rooms   or []

        # Filter before building decision variables
        self.faculty = [f for f in dept_data['faculty']
                        if f['id'] not in self.excluded_faculty]
        self.rooms   = [r for r in dept_data['resources']
                        if r['id'] not in self.excluded_rooms]
```

**Special TT Behavior:**
- Excluded faculty are completely removed from decision variable space
- Courses where no remaining faculty is qualified → added to `unassignable_courses[]`
- Courses with alternate qualified faculty → auto-reassigned
- Resulting timetable has `isSpecial: true` flag and stores `excluded_faculty_ids` in `configJson`

---

## 11. Performance Budget

| Step | Time Budget |
|---|---|
| JWT validation | < 50ms |
| Redis lock acquisition | < 10ms |
| PostgreSQL data fetch | < 200ms |
| ML preprocessing (XGBoost slot predictor) | < 2,000ms |
| OR-Tools CP-SAT solving | < 30,000ms (dominates) |
| PostgreSQL INSERT (timetable + slots) | < 300ms |
| Response marshaling | < 100ms |
| **Total target** | **< 35 seconds** |

---

## 12. FastAPI Endpoint Contract

### POST `/solve`

**Request (from Node.js API):**
```json
{
  "department_id": "dept-cs-001",
  "faculty": [ { "id": "f-rustam", "name": "Rustam Morena", "max_hrs_per_week": 20, ... } ],
  "courses": [ { "id": "c-blockchain", "name": "Blockchain", "weekly_hrs": 3, "type": "Theory" } ],
  "batches": [ { "id": "b-mca-a", "name": "MCA Sem 2 Div A", "strength": 30 } ],
  "resources": [ { "id": "r-101", "name": "CS Classroom 101", "type": "Classroom", "capacity": 60 } ],
  "faculty_subjects": [ { "faculty_id": "f-rustam", "course_id": "c-blockchain", "is_primary": true } ],
  "config": { "start_time": "09:00", "end_time": "17:00", "lecture_duration": 60, "break_duration": 60, "break_after": 2, "days_per_week": 5 },
  "excluded_faculty": [],
  "excluded_rooms": []
}
```

**Response:**
```json
{
  "success": true,
  "status": "OPTIMAL",
  "conflict_count": 0,
  "generation_ms": 4250,
  "slots": [ ... ],
  "workload_stats": { "f-rustam": 3 },
  "unassignable_courses": [],
  "time_slots": [ ... ]
}
```

---

## 13. MVP Constraints & Limits

| Constraint | Limit | Notes |
|---|---|---|
| Max faculty per department | 50 | OR-Tools scales linearly; increase solver time for larger sets |
| Max courses per timetable | 20 | Decompose into sub-problems for larger course sets |
| Max batches per generation | 10 | Parallel solver instances per batch group for scale |
| Max time slots per day | 12 | UI renders up to 12 without horizontal scroll |
| Concurrent generations per dept | 1 (Redis lock) | Intentional: prevents inconsistent state |
| Solver time limit | 30 seconds | Configurable per department (range: 10–120 seconds) |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
