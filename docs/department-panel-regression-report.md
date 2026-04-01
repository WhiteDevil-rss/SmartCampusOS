# Department Panel Regression Report

## Verified In This Pass

- Department dashboard compiles after live-statistics and UI changes.
- Department V2 sidebar compiles after nav-config integration and persisted collapse support.
- Department dashboard no longer crashes when department risk analytics omit arrays or numeric fields.
- Recent application rendering on the dashboard handles empty and partial payload states.

## Commands

- `pnpm --filter @smartcampus-os/web type-check`

## Manual Regression Still Required

- Navigate every department route listed in the bug report and confirm:
  - correct sidebar active state
  - mobile drawer open/close behavior
  - shared account links (`/profile`, `/settings/notifications`)
  - no overlay/z-index conflicts with dropdowns and dialogs
- Re-test admissions, students, faculty, classes, and timetable flows end-to-end.
- Re-test list pagination, searching, filtering, and status updates with realistic seeded data.
- Re-test notification settings and shared history/profile routes from the department shell.

