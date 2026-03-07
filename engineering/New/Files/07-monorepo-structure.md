# 07 — Monorepo Structure

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Monorepo Overview

| Property | Value |
|---|---|
| Monorepo Tool | Turborepo |
| Package Manager | pnpm (workspaces) |
| Repository Name | `ai-smart-university` |
| Root Language | TypeScript (shared config) |
| Build Caching | Turborepo remote cache (Vercel) |
| CI Runner | GitHub Actions |

---

## 2. Full Directory Structure

```
ai-smart-university/
│
├── apps/
│   ├── web/                                  # Next.js 14 — All panels + public portals
│   ├── api/                                  # Node.js Express — Main backend (22 services)
│   ├── ai-engine/                            # Python FastAPI — ML + AI + OR-Tools
│   └── blockchain/                           # Hardhat + Solidity smart contracts
│
├── packages/
│   ├── shared-types/                         # TypeScript types shared across FE + BE
│   ├── ui/                                   # Shared component library (shadcn/ui based)
│   ├── utils/                                # Shared utility functions
│   ├── zod-schemas/                          # Zod schemas shared between FE and BE
│   └── database/                             # Prisma schema + generated client
│
├── k8s/                                      # Kubernetes manifests
├── terraform/                                # AWS infrastructure as code
├── .github/
│   └── workflows/                            # CI/CD pipelines
├── turbo.json                                # Turborepo pipeline config
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## 3. `apps/web/` — Next.js Frontend

```
apps/web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                      # Universal login — role selector + Firebase / Keycloak
│   │
│   ├── superadmin/                           # Global Super Admin Panel
│   │   ├── layout.tsx                        # Superadmin sidebar layout
│   │   ├── page.tsx                          # Platform overview dashboard
│   │   ├── universities/
│   │   │   ├── page.tsx                      # University list + CRUD
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  # University detail
│   │   │       └── portal/page.tsx           # Public portal config (branding + features)
│   │   ├── credentials/page.tsx              # All-role credential management
│   │   ├── analytics/page.tsx                # Platform-wide analytics
│   │   ├── billing/page.tsx                  # SaaS subscription management
│   │   └── timetables/page.tsx               # All timetables globally
│   │
│   ├── dashboard/                            # University Admin Panel
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # University overview
│   │   ├── departments/page.tsx
│   │   ├── programs/page.tsx
│   │   ├── faculty/page.tsx
│   │   ├── students/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── exams/
│   │   │   ├── page.tsx                      # Exam management
│   │   │   ├── timetable/page.tsx
│   │   │   └── hall-tickets/page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx
│   │   │   ├── fees/page.tsx
│   │   │   ├── payroll/page.tsx
│   │   │   └── budget/page.tsx
│   │   ├── results/
│   │   │   ├── page.tsx                      # Result list
│   │   │   └── publish/page.tsx              # Publish results + blockchain
│   │   ├── compliance/
│   │   │   ├── naac/page.tsx                 # NAAC report generation
│   │   │   ├── nirf/page.tsx
│   │   │   └── government/page.tsx
│   │   ├── placement/page.tsx
│   │   ├── communication/page.tsx
│   │   └── performance/page.tsx              # University performance dashboard
│   │
│   ├── department/                           # Department Admin Panel
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Department overview
│   │   ├── timetable/
│   │   │   ├── page.tsx                      # Timetable viewer
│   │   │   ├── generate/page.tsx             # Standard timetable form
│   │   │   └── special/page.tsx              # Special timetable form
│   │   │   └── [id]/page.tsx                 # Individual timetable detail
│   │   ├── faculty/page.tsx
│   │   ├── students/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── resources/page.tsx                # Classrooms and labs
│   │   ├── batches/page.tsx
│   │   ├── exams/page.tsx
│   │   ├── finance/page.tsx
│   │   ├── library/
│   │   │   ├── page.tsx                      # Library dashboard
│   │   │   ├── catalog/page.tsx
│   │   │   └── loans/page.tsx
│   │   ├── placement/page.tsx
│   │   ├── research/page.tsx
│   │   ├── complaints/page.tsx
│   │   ├── vacancies/page.tsx
│   │   └── analytics/page.tsx
│   │
│   ├── faculty-panel/                        # Faculty Portal
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Personal timetable (home)
│   │   ├── attendance/
│   │   │   ├── page.tsx                      # Attendance dashboard
│   │   │   └── session/[id]/page.tsx         # Live QR attendance session
│   │   ├── marks/page.tsx
│   │   ├── assignments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/submissions/page.tsx
│   │   ├── quiz/
│   │   │   ├── page.tsx
│   │   │   └── create/page.tsx
│   │   ├── resources/page.tsx                # Study material upload
│   │   ├── communication/page.tsx
│   │   ├── complaints/page.tsx
│   │   ├── research/page.tsx
│   │   └── profile/page.tsx
│   │
│   ├── student/                              # Student Portal
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Student dashboard
│   │   ├── timetable/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── marks/page.tsx
│   │   ├── assignments/page.tsx
│   │   ├── materials/
│   │   │   ├── page.tsx
│   │   │   └── [subjectId]/page.tsx
│   │   ├── fees/
│   │   │   ├── page.tsx
│   │   │   └── pay/page.tsx
│   │   ├── services/page.tsx                 # Bonafide, BRTS, Transcript, ID card
│   │   ├── ai/
│   │   │   ├── page.tsx                      # AI tools hub
│   │   │   ├── chatbot/page.tsx
│   │   │   ├── study-planner/page.tsx
│   │   │   └── career/page.tsx
│   │   ├── campus/
│   │   │   ├── page.tsx
│   │   │   ├── id/page.tsx                   # Digital ID card
│   │   │   └── bus/page.tsx                  # Bus tracking
│   │   ├── library/page.tsx
│   │   ├── placement/page.tsx
│   │   └── communication/page.tsx
│   │
│   └── public/[slug]/                        # Per-University Public Portal
│       ├── layout.tsx                        # Dynamic branding layout (CSS vars per university)
│       ├── page.tsx                          # University home
│       ├── results/page.tsx                  # Result lookup + hash/blockchain verification
│       ├── verify/page.tsx                   # Degree/certificate blockchain verification
│       ├── admissions/
│       │   ├── page.tsx                      # Admission application form
│       │   └── status/page.tsx               # Application status tracker
│       ├── scholarships/page.tsx
│       ├── vacancies/page.tsx
│       └── research/page.tsx                 # Public research repo (if enabled)
│
├── components/
│   ├── timetable/
│   │   ├── TimetableGrid.tsx                 # Main grid (days × slots)
│   │   ├── TimetableCell.tsx                 # Individual slot cell
│   │   └── TimetableExport.tsx               # PDF / Print controls
│   ├── student/
│   │   ├── DigitalIDCard.tsx                 # QR-coded student ID card
│   │   ├── AttendanceRiskAlert.tsx
│   │   └── FeesDueCard.tsx
│   ├── ai/
│   │   ├── ChatbotWidget.tsx                 # Doubt assistant chat UI
│   │   ├── StudyPlannerView.tsx
│   │   └── CareerAdvisorCard.tsx
│   ├── public-portal/
│   │   ├── UniversityBrandedLayout.tsx       # Injects CSS vars from config
│   │   ├── VerificationWidget.tsx            # Result + blockchain verify
│   │   └── AdmissionStatusTracker.tsx
│   ├── blockchain/
│   │   ├── VerificationBadge.tsx             # ✅ / ❌ badge
│   │   └── PolygonscanLink.tsx
│   ├── forms/
│   │   ├── GenerateForm.tsx                  # Timetable generation config
│   │   ├── SpecialTTForm.tsx                 # Resource exclusion form
│   │   ├── FacultyForm.tsx
│   │   ├── CourseForm.tsx
│   │   └── ResourceForm.tsx
│   ├── layouts/
│   │   └── PanelLayout.tsx                   # Sidebar + topbar wrapper
│   └── shared/
│       ├── DataTable.tsx                     # Reusable data table
│       ├── FileUploader.tsx
│       ├── LoadingSpinner.tsx
│       ├── ConfirmDialog.tsx
│       └── StatusBadge.tsx
│
├── lib/
│   ├── api.ts                                # Axios / fetch client with JWT interceptor
│   ├── firebase.ts                           # Firebase Auth SDK init
│   ├── socket.ts                             # Socket.io client init
│   ├── blockchain.ts                         # ethers.js contract helpers
│   └── public-portal-api.ts                  # Public portal API helpers (no auth)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useTimetable.ts
│   ├── useAttendance.ts
│   ├── useRealtime.ts                        # Socket.io room subscriptions
│   └── usePublicPortalConfig.ts
│
├── store/                                    # Zustand stores
│   ├── authStore.ts
│   ├── timetableStore.ts
│   └── notificationStore.ts
│
├── middleware.ts                             # Next.js edge middleware — public portal slug resolution
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. `apps/api/` — Node.js Backend

```
apps/api/
├── src/
│   ├── index.ts                              # Express app bootstrap
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── university.routes.ts
│   │   ├── department.routes.ts
│   │   ├── faculty.routes.ts
│   │   ├── student.routes.ts
│   │   ├── timetable.routes.ts
│   │   ├── attendance.routes.ts
│   │   ├── marks.routes.ts
│   │   ├── fees.routes.ts
│   │   ├── library.routes.ts
│   │   ├── placement.routes.ts
│   │   ├── exams.routes.ts
│   │   ├── results.routes.ts
│   │   ├── blockchain.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── admission.routes.ts
│   │   ├── communication.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── reports.routes.ts
│   │   └── public-portal.routes.ts           # No-auth public portal endpoints
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── tenant.service.ts
│   │   ├── timetable.service.ts
│   │   ├── blockchain.service.ts             # ethers.js Polygon L2 interactions
│   │   ├── fees.service.ts
│   │   ├── notification.service.ts
│   │   ├── report.service.ts                 # PDF generation, NAAC export
│   │   ├── iot.service.ts                    # MQTT + IoT device management
│   │   └── analytics.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts                # JWT verify (Firebase + Keycloak)
│   │   ├── rbac.middleware.ts                # Role-based access control
│   │   ├── tenant.middleware.ts              # SET search_path per request
│   │   ├── rateLimiter.middleware.ts
│   │   └── audit.middleware.ts               # Kafka audit event publisher
│   │
│   ├── workers/
│   │   ├── pdf.worker.ts                     # BullMQ: async PDF generation
│   │   ├── email.worker.ts                   # BullMQ: email dispatch
│   │   ├── notification.worker.ts            # BullMQ: push/SMS notifications
│   │   └── iot.worker.ts                     # BullMQ: IoT event processing
│   │
│   ├── kafka/
│   │   ├── producer.ts                       # Kafka event producer
│   │   └── consumers/
│   │       ├── timetable.consumer.ts
│   │       ├── result.consumer.ts
│   │       ├── iot.consumer.ts
│   │       └── audit.consumer.ts
│   │
│   └── utils/
│       ├── redis.ts                          # ioredis client
│       ├── s3.ts                             # AWS S3 helpers
│       ├── hash.ts                           # SHA-256 for result hashing
│       └── validators.ts
│
├── prisma/
│   └── schema.prisma                         # Full Prisma schema (from 05-database-schema)
│
├── Dockerfile
└── tsconfig.json
```

---

## 5. `apps/ai-engine/` — Python FastAPI

```
apps/ai-engine/
├── main.py                                   # FastAPI app bootstrap
├── routers/
│   ├── scheduling.py                         # OR-Tools CP-SAT timetable endpoints
│   ├── predictions.py                        # Student performance, dropout risk
│   ├── chatbot.py                            # Claude API + RAG doubt assistant
│   ├── recommendations.py                    # Career, substitute, books
│   ├── planner.py                            # AI study planner (RL)
│   ├── analytics.py                          # Resume analyser, campus analytics
│   └── fraud.py                              # Isolation Forest fraud detection
├── scheduling/
│   ├── solver.py                             # OR-Tools CP-SAT main solver
│   ├── constraints.py                        # Hard + soft constraint definitions
│   └── nep_checker.py                        # NEP 2020 compliance validation
├── ml/
│   ├── performance_model.py                  # XGBoost grade prediction
│   ├── dropout_model.py                      # Random Forest + SHAP
│   ├── enrolment_model.py                    # LSTM time-series
│   └── fraud_model.py                        # Isolation Forest
├── rag/
│   ├── indexer.py                            # Study material indexing (sentence-transformers)
│   ├── retriever.py                          # Elasticsearch k-NN retrieval
│   └── pipeline.py                           # LangChain RAG pipeline
├── chatbot/
│   └── doubt_assistant.py                    # Claude API integration (temp=1)
├── models/                                   # Trained model artifacts (loaded from S3)
│   ├── slot_preference_v2.json
│   ├── dropout_risk_rf_v2.pkl
│   └── performance_xgb_v1.json
├── requirements.txt
└── Dockerfile
```

---

## 6. `apps/blockchain/` — Smart Contracts

```
apps/blockchain/
├── contracts/
│   ├── AcademicRecords.sol                   # Result hash publishing + verification
│   └── DegreeRegistry.sol                    # Degree issuance + verification
├── scripts/
│   ├── deploy.ts                             # Deploy to Polygon Amoy / mainnet
│   └── grantPublisherRole.ts                 # Grant PUBLISHER_ROLE to blockchain-service wallet
├── test/
│   ├── AcademicRecords.test.ts               # publishResult, verifyResult, tamper detection
│   └── DegreeRegistry.test.ts
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

---

## 7. `packages/` — Shared Code

```
packages/
├── shared-types/
│   ├── src/
│   │   ├── user.types.ts                     # User, Role, JWT payload
│   │   ├── timetable.types.ts                # Timetable, Slot, TimetableConfig
│   │   ├── student.types.ts                  # Student, Batch, Program
│   │   ├── faculty.types.ts                  # Faculty, Availability
│   │   ├── result.types.ts                   # Result, VerificationResponse
│   │   ├── portal.types.ts                   # PublicPortalConfig, Branding, Features
│   │   └── api.types.ts                      # API request/response shapes
│   └── package.json
│
├── zod-schemas/
│   ├── src/
│   │   ├── auth.schema.ts
│   │   ├── timetable.schema.ts
│   │   ├── student.schema.ts
│   │   ├── fees.schema.ts
│   │   └── portal.schema.ts
│   └── package.json
│
├── ui/
│   ├── src/
│   │   ├── components/                       # Re-exported shadcn/ui components
│   │   ├── hooks/                            # Shared hooks
│   │   └── styles/                           # Base Tailwind config + CSS variables
│   └── package.json
│
├── utils/
│   ├── src/
│   │   ├── date.ts                           # Date formatting, semester calculation
│   │   ├── hash.ts                           # SHA-256 for result hashing
│   │   ├── currency.ts                       # INR formatting
│   │   ├── attendance.ts                     # Attendance percentage calculation
│   │   └── blockchain.ts                     # Hash canonicalisation
│   └── package.json
│
└── database/
    ├── prisma/
    │   └── schema.prisma                     # Canonical Prisma schema
    ├── src/
    │   ├── client.ts                         # Prisma client export
    │   └── migrations/                       # Prisma migration files
    └── package.json
```

---

## 8. Turborepo Pipeline Config

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

---

## 9. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Component files | PascalCase | `TimetableGrid.tsx` |
| Hook files | camelCase with `use` prefix | `useTimetable.ts` |
| Service files | camelCase with `.service` suffix | `blockchain.service.ts` |
| Route files | camelCase with `.routes` suffix | `timetable.routes.ts` |
| API paths | kebab-case | `/v2/timetables/generate` |
| Database tables | snake_case | `timetable_slots` |
| Prisma models | PascalCase | `TimetableSlot` |
| Kafka topics | dot-separated | `timetable.events` |
| Redis keys | colon-separated | `public:{slug}:config` |
| Environment vars | SCREAMING_SNAKE_CASE | `POLYGON_RPC_URL` |
| Blockchain events | PascalCase | `ResultPublished` |

---

## 10. Key Scripts

```bash
# Root monorepo
pnpm install                                  # Install all dependencies
pnpm build                                    # Build all apps in dependency order
pnpm dev                                      # Start all apps in dev mode (parallel)
pnpm lint                                     # Lint all apps
pnpm test                                     # Run all tests

# Database
pnpm db:generate                              # Generate Prisma client
pnpm db:migrate                               # Run migrations (dev)
pnpm db:seed                                  # Seed test data (VNSGU + SPUVVN)
pnpm db:studio                                # Open Prisma Studio

# Blockchain
cd apps/blockchain
npx hardhat test                              # Run contract tests
npx hardhat run scripts/deploy.ts --network amoy    # Deploy to testnet
npx hardhat run scripts/deploy.ts --network polygon  # Deploy to mainnet

# AI Engine (Python)
cd apps/ai-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8003

# Docker Compose (full local stack)
docker-compose up --build                     # Start all services locally
```

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
