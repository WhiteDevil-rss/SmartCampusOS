# University Panel Performance Report

Date: 2026-04-02

## Goal

Improve the perceived and actual performance of the university panel by removing fake analytics paths, reducing unnecessary navigation friction, and consolidating admissions analytics into fewer requests.

## Optimizations Applied

### Data Flow

- Consolidated university admissions analytics into a single backend response for the university dashboard and admissions surface.
- Removed placeholder analytics from the dashboard and replaced them with live data, reducing mismatch-driven reloads and manual refresh confusion.
- Added near-real-time polling on the university dashboard to refresh analytics every 30 seconds without a full page reload.

### Navigation and Layout

- Added persistent desktop sidebar collapse state to reduce layout thrash and improve high-density navigation usability.
- Re-routed university quick actions and sidebar links away from mixed admin destinations to relevant university-owned destinations.

### Rendering

- Kept chart rendering on measured containers to avoid negative-width layout warnings and unstable chart mounts.
- Reused shared `GlassCard` and `StatCard` primitives so the dashboard and admissions page render with more consistent structure and fewer one-off styling branches.

## Verification Completed

- `pnpm --filter @smartcampus-os/api type-check`
- `pnpm --filter @smartcampus-os/web type-check`

## Metrics Status

The following were not captured in this environment and still need manual measurement in a browser:

- Lighthouse scores
- FCP
- LCP
- TTI
- bundle analyzer output
- network waterfall timings

## Recommended Next Performance Pass

- Run Lighthouse on `/dashboard` and `/dashboard/admissions`
- Capture bundle analysis for the web app
- Audit slow API routes beyond admissions
- Add endpoint-level caching strategy where real-time freshness is not required
- Review image and font payloads on non-dashboard university pages
