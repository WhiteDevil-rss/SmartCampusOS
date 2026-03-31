# SmartCampus OS Sitemap & UI Architecture

## Root Routes (Public)
- `/` - **Landing Page**: Hero section, features, solutions overview.
- `/about-us` - Mission and vision.
- `/contact` - Support and inquiries.
- `/admissions` - Public portal for student applications.
- `/verify` - Blockchain-based certificate/hash verification.
- `/careers` - Job openings and faculty recruitment.
- `/legal`
    - `/privacy-policy`
    - `/terms-of-service`

## Authentication (`/app/auth`)
- `/login` - Unified login for all roles (Superadmin, University Admin, Student, Faculty).
- `/register` - Student registration and onboarding.

## Dashboards (Internal Panels)

### Superadmin Panel (`/superadmin`)
- `/superadmin` - Global statistics overview (Bento Grid).
- `/superadmin/universities` - University management and configuration.
- `/superadmin/users` - Global user management (RBAC).
- `/superadmin/settings` - System-wide configurations.
- `/superadmin/logs` - Detailed audit trailing.
- `/superadmin/broadcasts` - Global announcements.

### Student Portal (`/student`)
- `/student` - Personal dashboard, course progress, results.
- `/profile` - Profile management.
- `/security` - Account security and MFA.

### Faculty Portal (`/faculty-panel`)
- `/faculty-panel` - Course management, grading, and schedules.

### Department Dashboard (`/department`)
- `/department` - Departmental statistics and student tracking.

## Shared UI Components (V1)
- `navbar.tsx` - Public navigation.
- `role-sidebar.tsx` - Dynamic sidebar based on user permissions.
- `bento-grid.tsx` - Statistics and layout distribution.
- `glass-card.tsx` - Glassmorphism container for data.
- `data-table.tsx` - Reusable table for users and logs.
- `header-greeting.tsx` - Dynamic welcome message with time-of-day awareness.

## V2 Design Strategy (Premium Overhaul)
- **Aesthetic**: Modern AI-SaaS / Industrial / Minimalist.
- **Components**: Transitioning to Typesafe React components in `components/v2`.
- **Motion**: Implementing View Transitions API and springy sidebar interactions.
