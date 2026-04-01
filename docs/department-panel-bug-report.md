# Department Panel Bug Report

## Scope Reviewed

Department routes discovered in the current web app:

- `/department`
- `/department/admissions`
- `/department/analytics`
- `/department/batches`
- `/department/classes`
- `/department/courses`
- `/department/divisions`
- `/department/electives`
- `/department/faculty`
- `/department/faculty/performance`
- `/department/finance`
- `/department/helpdesk`
- `/department/inquiries`
- `/department/iot`
- `/department/leave`
- `/department/marks`
- `/department/resources`
- `/department/results`
- `/department/results/trends`
- `/department/special`
- `/department/student-transfers`
- `/department/students`
- `/department/students/risk`
- `/department/subjects`
- `/department/timetables`
- `/department/timetables/create`
- `/department/timetables/view`
- `/department/timetables/view/[id]`

## Fixed

### Critical

- Fixed duplicate sidebar definitions causing department navigation drift between the V2 shell and shared nav config.
- Fixed non-persistent desktop sidebar behavior in the V2 shell. Department users now get explicit collapse/expand state that persists across navigations.
- Fixed unsafe dashboard analytics rendering in `CampusPulse` where missing arrays and invalid numeric fields could crash the department home page.

### High

- Replaced mostly static department overview metrics with live department-scoped counts for faculty, courses, batches, students, applications, pending review, reviewed, and approved states.
- Added recent applications feed to the department dashboard using the real department admissions endpoint.
- Added live polling and manual refresh behavior to the department dashboard, plus visible last-updated metadata.
- Fixed department V2 sidebar active-state matching for nested routes and shared account routes.

### Medium

- Removed hardcoded V2 sidebar account links that were inconsistent with central nav config.
- Improved operations snapshot/empty-state handling on the department dashboard when timetable or admissions data is missing.
- Aligned department dashboard card hierarchy and section spacing for better readability and scanability.

## Still Open / Manual Verification Needed

### High

- Page-by-page CRUD verification is still required for department submodules such as faculty, students, subjects, batches, divisions, classes, and timetable flows.
- Cross-browser checks are still required for the V2 shell, especially Safari and Edge.
- Mobile behavior still needs manual verification on real breakpoints for all department routes, not just the dashboard shell.

### Medium

- Some department inner pages still use the older `DashboardLayout` shell instead of the V2 shell, so visual consistency is not yet fully unified.
- Department analytics charts should be migrated to the measured chart-container pattern used elsewhere to reduce Recharts sizing warnings on fragile layouts.
- Export flows, file uploads, and document-management paths still need end-to-end runtime validation with realistic data.

### Low

- Additional breadcrumb/page-header normalization is still needed across all department subroutes.
- Empty-state illustrations and richer skeleton states are not yet standardized across every department page.

## Verification Notes

- Core compile verification completed after this pass:
  - `pnpm --filter @smartcampus-os/web type-check`

