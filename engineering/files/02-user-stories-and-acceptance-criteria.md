# 02 — User Stories & Acceptance Criteria

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## Overview

This document defines all user stories for NEP-Scheduler across the four user roles: Super Admin, University Admin, Department Admin, and Faculty. Each story is written in standard format with Given/When/Then acceptance criteria.

---

## Super Admin Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-001 | As a Superadmin, I want to add a new university so that it can use the platform | GIVEN valid university details WHEN I submit the form THEN a new university tenant is created with admin credentials and appears in the list |
| US-002 | As a Superadmin, I want to change any user's password so I can help locked-out users | GIVEN a valid user ID WHEN I update credentials THEN the new credentials work on next login and an audit entry is created |
| US-003 | As a Superadmin, I want to trigger timetable generation for a specific university without logging into that university | GIVEN a university is selected WHEN I configure time params and click Generate THEN the timetable is generated for that university's department |
| US-013 | As a Superadmin, I want to view all timetables across all universities | GIVEN timetables exist WHEN I navigate to All Timetables THEN I see all timetables filterable by university and department |

---

## University Admin Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-004 | As a Uni Admin, I want to add departments so that I can structure the university | GIVEN valid dept details WHEN I submit THEN dept appears in list with its own auto-generated login credentials |
| US-005 | As a Uni Admin, I want to manage classrooms and labs so the timetable can assign rooms correctly | GIVEN I add a room with type=Lab and capacity=30 WHEN timetable is generated THEN lab courses are assigned to this room only if batch strength ≤ 30 |
| US-012 | As a Uni Admin, I want to see department-wise statistics so I can monitor workload | GIVEN at least one timetable exists WHEN I view dashboard THEN I see faculty count, course count, timetable count per dept |

---

## Department Admin Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-006 | As a Dept Admin, I want to generate a timetable so that my department has a schedule | GIVEN faculty, courses, batches, and rooms are configured WHEN I click Generate THEN a conflict-free timetable is shown within 30 seconds |
| US-007 | As a Dept Admin, I want to handle faculty absence so schedules still run | GIVEN faculty X is marked absent WHEN I generate Special TT excluding X THEN a valid schedule is produced for remaining faculty with 0 conflicts |
| US-008 | As a Dept Admin, I want to download the timetable as PDF so I can print and distribute it | GIVEN a timetable is generated WHEN I click Download PDF THEN a formatted PDF downloads within 5 seconds |
| US-009 | As a Dept Admin, I want to configure daily start time, end time, lecture duration and break settings | GIVEN I set start=09:00, end=17:00, lecture=60min, break=60min after 2nd lecture THEN the engine generates slots: 09:00–10:00, 10:00–11:00, BREAK 11:00–12:00, 12:00–13:00... |
| US-014 | As a Dept Admin, I want to generate a timetable with specific selected resources only | GIVEN I check specific faculty and rooms WHEN I click Generate Special Timetable THEN only those selected resources are included in the schedule |

---

## Faculty Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-010 | As a Faculty, I want to view only my classes so I know where to be each day | GIVEN I am logged in as Prof. Rustam WHEN I view My Timetable THEN only Blockchain classes assigned to me are shown |
| US-011 | As a Faculty, I want to change my password so I can keep my account secure | GIVEN I know my current password WHEN I submit the change form THEN my password is updated and I am prompted to log in again |

---

## Extended Acceptance Criteria (Detailed)

### US-001 — University Provisioning

**Given** I am logged in as Super Admin  
**And** I navigate to the Universities section  
**When** I fill in university name, shortName, location, email, and click "Add University"  
**Then** a new university record is created in the database  
**And** a University Admin user is auto-provisioned with system-generated username and password  
**And** the generated credentials are shown on-screen for handover  
**And** the new university appears in the universities list with stats (0 departments, 0 faculty, 0 timetables)

**Edge Cases:**
- Duplicate `shortName` → rejected with clear validation error
- Missing required fields → form prevents submission with inline error messages

---

### US-006 — Standard Timetable Generation

**Given** I am logged in as a Department Admin  
**And** my department has at least 1 faculty, 1 course assigned to that faculty, 1 batch, and 1 room  
**When** I configure start time, end time, lecture duration, break settings, and click "Generate Timetable"  
**Then** the system calls the scheduling engine  
**And** a conflict-free timetable is returned within 30 seconds  
**And** the timetable grid is displayed with all days and time slots  
**And** each cell shows: course name, faculty name, room name  
**And** the workload summary shows hours per faculty vs. max allowed  
**And** conflict count is guaranteed to be 0

**Edge Cases:**
- No qualified faculty for a course → generation fails with descriptive error listing the unassignable course
- Room capacity < batch strength → that room excluded automatically; generation fails if no alternate room exists
- Redis lock active (concurrent generation attempt) → second request receives 409 "Generation already in progress"

---

### US-007 — Special Timetable (Faculty Absence)

**Given** I am logged in as a Department Admin  
**And** a standard timetable exists for the department  
**When** I navigate to Special Timetable  
**And** I select Dharmen Shah as unavailable  
**And** I click "Generate Special Timetable"  
**Then** the system runs CP-SAT solver excluding Dharmen Shah from all decision variables  
**And** courses with alternate faculty (e.g., .Net using C# → Jayshree Patel) are auto-reassigned  
**And** courses where no alternate faculty exists (e.g., iOS Development) are marked "No Faculty Available"  
**And** the resulting timetable shows 0 hard constraint violations  
**And** changed slots are visually highlighted in amber/orange  
**And** unchanged slots remain in their original colors

---

### US-009 — Time Slot Configuration

**Given** I set:
- Start time: `09:00`
- End time: `17:00`
- Lecture duration: `60 minutes`
- Break duration: `60 minutes`
- Break after: `2nd lecture`

**When** timetable generation runs  
**Then** the following daily slot sequence is produced:

| Slot | Start | End | Type |
|---|---|---|---|
| 1 | 09:00 | 10:00 | LECTURE |
| 2 | 10:00 | 11:00 | LECTURE |
| — | 11:00 | 12:00 | BREAK |
| 3 | 12:00 | 13:00 | LECTURE |
| 4 | 13:00 | 14:00 | LECTURE |
| 5 | 14:00 | 15:00 | LECTURE |
| 6 | 15:00 | 16:00 | LECTURE |
| 7 | 16:00 | 17:00 | LECTURE |

---

### US-011 — Password Change

**Given** I am logged in as a Faculty member  
**When** I navigate to Change Password  
**And** I enter my current password, new password, and confirm new password  
**And** I click "Update Password"  
**Then** the server validates current password using bcrypt.compare  
**And** if valid, hashes the new password with bcrypt (cost 12)  
**And** updates the user record in the database  
**And** invalidates all active Redis sessions for my user ID  
**And** returns 200 success  
**And** the client clears the session cookie  
**And** I am redirected to the login page to authenticate again with new credentials

**Edge Cases:**
- Current password incorrect → 401 response; password is NOT changed
- New username already taken by another user → 409 conflict error
- New password shorter than 8 characters → client-side and server-side validation rejection

---

## VNSGU Reference Test Case — Special Timetable

For MCA Sem 2 with Dharmen Shah absent, the expected special timetable resolution is:

| Subject | Original Faculty | Special TT Resolution |
|---|---|---|
| Artificial Intelligence | Prakash Rana | Prakash Rana (unchanged) |
| Frontend Technologies | Vimal / Rinku | Vimal / Rinku (unchanged) |
| .Net using C# | Dharmen Shah / Jayshree | Jayshree Patel covers both Div A and Div B |
| Blockchain | Rustam Morena | Rustam Morena (unchanged) |
| Python | Ravi Gulati | Ravi Gulati (unchanged) |
| iOS Development | Dharmen Shah ONLY | ⚠️ Marked "No Faculty Available" — slot left free |
| Android Development | Nimisha / Mayur | Nimisha / Mayur (unchanged) |

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
