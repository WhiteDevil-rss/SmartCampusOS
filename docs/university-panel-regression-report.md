# University Panel Regression Report

Date: 2026-04-02

## Automated Checks Completed

- API type safety: passed
- Web type safety: passed

Commands used:

- `pnpm --filter @smartcampus-os/api type-check`
- `pnpm --filter @smartcampus-os/web type-check`

## Regression Areas Covered In Code

- Shared panel shell still resolves role-aware navigation
- Shared session timer remains mounted inside the common dashboard header
- Shared sidebar now supports persisted collapse state without changing route resolution
- University dashboard now consumes live admissions analytics
- University admissions page now consumes the richer university admissions response shape

## Manual Regression Checklist Still Required

- Sidebar open/collapse behavior across:
  - university
  - superadmin
  - department
  - faculty
  - student
  - approval
- University dashboard route transitions after login/logout
- University admissions filters against seeded or production-like records
- Empty states on all university subpages
- Mobile navigation drawer behavior on small screens
- Notification center, session timer, and theme toggle behavior after sidebar changes

## Known Safe Assumptions

- Existing routes using the shared `DashboardLayout` inherit the sidebar persistence improvement automatically.
- University dashboard analytics now depend on live admission records and no longer rely on hardcoded chart arrays.

## Open Follow-Up Work

- Browser-based visual QA for every university subpage
- CRUD regression on university management pages outside dashboard/admissions
- Runtime verification of export/download actions
