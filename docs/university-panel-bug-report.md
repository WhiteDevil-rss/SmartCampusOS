# University Panel Bug Report

Date: 2026-04-02

## Scope Audited

- Shared dashboard shell used by university, superadmin, department, faculty, student, approval, profile, and history pages
- University panel routes under `apps/web/app/dashboard`
- University admissions analytics API under `apps/api/src/controllers/admission.controller.ts`

## University Panel Pages Identified

- `/dashboard`
- `/dashboard/admissions`
- `/dashboard/courses`
- `/dashboard/departments`
- `/dashboard/faculty`
- `/dashboard/inventory`
- `/dashboard/library`
- `/dashboard/naac`
- `/dashboard/networking`
- `/dashboard/placements`
- `/dashboard/programs`
- `/dashboard/resources`
- `/dashboard/results`
- `/dashboard/security`
- `/dashboard/security/emergency`
- `/dashboard/security/incidents`
- `/dashboard/users`

## Findings Fixed

### P1

- Shared sidebar had no persisted desktop collapse state and no desktop collapse control, causing inconsistent navigation behavior across panels.
- University dashboard used placeholder chart data instead of live admissions analytics, so counts and visuals did not reflect the database.
- University navigation mixed university routes with admin-oriented destinations (`/admin/war-room`, `/admin/governance`, `/admin/maintenance`), creating a confusing IA and cross-panel leakage.
- University admissions view exposed only a simple table with no live scope filters, low contextual awareness, and weak KPI presentation.

### P2

- Shared sidebar information density was too high for narrow layouts and did not adapt to collapsed desktop navigation.
- University dashboard quick actions linked one card to an admin route instead of a university-safe workflow destination.
- Admissions API returned status totals and paginated data, but not the dashboard-grade aggregates needed for trend, program demand, recent applications, or acceptance-rate widgets.

## Implemented Fixes

- Added persistent desktop sidebar collapse/expand behavior to the shared `DashboardLayout`, which now benefits all panels already using the common shell.
- Reworked university navigation so the university panel now routes to university-owned intelligence surfaces: security, resources, and networking.
- Extended the university admissions API to return:
  - total and filtered application totals
  - acceptance rate
  - decision rate
  - status breakdown
  - program demand breakdown
  - recent applications
  - daily trend data
- Rebuilt the university dashboard to consume live admissions analytics instead of placeholder semester/demo data.
- Rebuilt the university admissions page into a filtered analytics surface with:
  - search
  - status filter
  - department filter
  - KPI cards
  - live overview cards
  - recent application feed
  - program demand summary

## Remaining Manual Verification Items

- Cross-browser validation on Chrome, Firefox, Safari, and Edge
- Real mobile/tablet inspection at 375px, 414px, 768px, 1024px, 1366px, 1440px, and 1920px
- Export action behavior on the admissions page
- Runtime verification of every individual dashboard subpage beyond the shared shell improvements
- Full end-to-end CRUD verification for courses, programs, departments, faculty, library, placements, and settings flows

## Files Changed In This Pass

- `apps/api/src/controllers/admission.controller.ts`
- `apps/web/components/dashboard-layout.tsx`
- `apps/web/lib/constants/nav-config.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/admissions/page.tsx`
