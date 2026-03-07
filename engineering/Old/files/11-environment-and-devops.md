# 11 — Environment & DevOps

> **Project:** NEP-Scheduler — AI-Powered Timetable Scheduling Platform
> **Version:** v1.0.0 | **Date:** February 2026 | **Classification:** Confidential — Internal Use Only

---

## 1. Environment Overview

NEP-Scheduler runs across three environments:

| Environment | Purpose | Infrastructure |
|---|---|---|
| **Local** | Developer machines | Docker Compose |
| **Staging** | Integration testing, UAT, pre-production validation | Railway/Render/Vercel (mirrors production) |
| **Production** | Live system serving universities | Vercel + Railway/Render + Supabase/Neon + Upstash |

---

## 2. Environment Variables

### 2.1 API Server (`apps/api/.env`)

```bash
# ── Database ──────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/nepscheduler

# ── Cache & Session ──────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Authentication ───────────────────────────────────────────
JWT_SECRET=your-256-bit-secret-here-use-openssl-rand-base64-32
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12

# ── Internal Services ─────────────────────────────────────────
AI_ENGINE_URL=http://localhost:8003
SOCKET_CORS_ORIGIN=http://localhost:3000

# ── Rate Limiting ─────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX=100               # 100 requests per window

# ── General ───────────────────────────────────────────────────
NODE_ENV=development
PORT=8000
```

### 2.2 AI Engine (`apps/ai-engine/.env`)

```bash
# ── Database ──────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/nepscheduler

# ── Cache ─────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Solver Configuration ──────────────────────────────────────
SOLVER_TIME_LIMIT_SECONDS=30    # Range: 10–120

# ── General ───────────────────────────────────────────────────
ENVIRONMENT=development
PORT=8003
```

### 2.3 Web Frontend (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=NEP-Scheduler
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2.4 Production Variable Differences

| Variable | Development | Production |
|---|---|---|
| `DATABASE_URL` | Local PostgreSQL | Supabase/Neon connection string with SSL |
| `REDIS_URL` | Local Redis | Upstash Redis URL with TLS |
| `JWT_SECRET` | `dev-secret-key` | 256-bit random secret (never commit) |
| `NODE_ENV` | `development` | `production` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://api.nep-scheduler.com` |
| `SOLVER_TIME_LIMIT_SECONDS` | `30` | `30` (tunable per university) |
| `BCRYPT_ROUNDS` | `10` | `12` |

---

## 3. Local Development Setup

### Prerequisites

```bash
# Required tools
node --version    # >= 20 LTS
pnpm --version    # >= 8.x
python --version  # >= 3.11
docker --version  # >= 25.x
```

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/nep-scheduler.git
cd nep-scheduler

# 2. Install all dependencies
pnpm install

# 3. Start infrastructure (PostgreSQL, Redis, Kafka)
docker-compose up -d postgres redis kafka

# 4. Apply database migrations
pnpm --filter api prisma migrate dev

# 5. Seed VNSGU test data
pnpm --filter api prisma db seed

# 6. Start all apps in parallel
pnpm dev
```

### Individual App Commands

```bash
# Web frontend only (port 3000)
pnpm --filter web dev

# API server only (port 8000)
pnpm --filter api dev

# AI engine only (port 8003)
cd apps/ai-engine
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

---

## 4. Docker Compose (Local Development)

```yaml
version: '3.9'

services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_SOCKET_URL: http://localhost:8000
    depends_on: [api]

  api:
    build: ./apps/api
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/nepscheduler
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-key
      JWT_EXPIRES_IN: 8h
      BCRYPT_ROUNDS: 10
      AI_ENGINE_URL: http://ai-engine:8003
      SOCKET_CORS_ORIGIN: http://localhost:3000
      NODE_ENV: development
      PORT: 8000

  ai-engine:
    build: ./apps/ai-engine
    ports: ["8003:8003"]
    depends_on: [postgres]
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/nepscheduler
      REDIS_URL: redis://redis:6379
      SOLVER_TIME_LIMIT_SECONDS: 30
      ENVIRONMENT: development
      PORT: 8003

  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: nepscheduler
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:latest
    ports: ["9092:9092"]
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    ports: ["2181:2181"]
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

volumes:
  pgdata:
```

---

## 5. MVP Hosting Plan (Production)

| Service | Platform | Free Tier? | Estimated Cost | Notes |
|---|---|---|---|---|
| Frontend (Next.js) | Vercel | ✅ Yes | $0–$20/mo | Auto-deploy from GitHub main branch |
| API Server (Node.js) | Railway | ✅ Limited | $5–$20/mo | Dockerfile deploy; 1 vCPU, 512MB |
| AI Engine (Python) | Railway / Render | ✅ Limited | $7–$25/mo | Minimum 1GB RAM for OR-Tools |
| PostgreSQL | Supabase or Neon | ✅ Yes | $0–$25/mo | Managed PostgreSQL with connection pooling |
| Redis | Upstash | ✅ Yes | $0–$10/mo | Serverless Redis with TLS |
| Domain + SSL | Namecheap + Cloudflare | ❌ No | $10–$15/yr | Cloudflare CDN + SSL termination |
| **Total MVP Cost** | | | **~$30–$100/mo** | Scales with traffic |

---

## 6. Production Deployment (Scale — AWS + Kubernetes)

### Infrastructure (AWS)

```bash
# Provision AWS infrastructure with Terraform
cd terraform/
terraform init
terraform plan -var-file="prod.tfvars"
terraform apply

# Deploy to EKS
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml

# Verify all pods running
kubectl get pods -n nep-scheduler

# Check service health
kubectl get svc -n nep-scheduler
```

### Kubernetes HPA Example (AI Engine)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-engine-hpa
  namespace: nep-scheduler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-engine
  minReplicas: 1
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
      - type: Pods
        value: 2
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
```

---

## 7. CI/CD Pipeline (GitHub Actions)

### `ci.yml` — Runs on every Pull Request

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: nepscheduler_test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api prisma migrate deploy
      - run: pnpm --filter api test:integration

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### `deploy.yml` — Runs on merge to `main`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker images
        run: |
          docker build -t $ECR_REGISTRY/api:$GITHUB_SHA apps/api/
          docker build -t $ECR_REGISTRY/ai-engine:$GITHUB_SHA apps/ai-engine/
          docker push $ECR_REGISTRY/api:$GITHUB_SHA
          docker push $ECR_REGISTRY/ai-engine:$GITHUB_SHA
      - name: Deploy to staging (ArgoCD)
        run: |
          argocd app set nep-scheduler-staging \
            --helm-set api.image.tag=$GITHUB_SHA \
            --helm-set ai-engine.image.tag=$GITHUB_SHA
          argocd app sync nep-scheduler-staging

  deploy-production:
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    environment: production   # Requires manual approval in GitHub
    steps:
      - name: Deploy to production (Blue-Green)
        run: |
          argocd app set nep-scheduler-prod \
            --helm-set api.image.tag=$GITHUB_SHA
          argocd app sync nep-scheduler-prod --strategy blueGreen
```

---

## 8. Database Migrations

```bash
# Development: create and apply new migration
pnpm --filter api prisma migrate dev --name "add_faculty_phone"

# Production: apply pending migrations
pnpm --filter api prisma migrate deploy

# Reset development database (DESTRUCTIVE — dev only)
pnpm --filter api prisma migrate reset

# Seed test data
pnpm --filter api prisma db seed

# View migration history
pnpm --filter api prisma migrate status
```

---

## 9. Monitoring & Observability

| Signal | Tool | Key Metrics | Alert Threshold |
|---|---|---|---|
| Infrastructure Metrics | Prometheus + Grafana | CPU, Memory, Disk, Network | CPU > 85% for 5 min |
| Application Metrics | Custom Prometheus metrics | Request rate, p50/p95/p99 latency, error rate | Error rate > 1% or p95 > 1s |
| AI Engine Metrics | Custom metrics | Generation time, solver status, infeasibility count | Generation > 25s |
| Database Metrics | PgBouncer + pg_stat_statements | Query latency, connection pool, deadlocks | Pool saturation > 80% |
| Error Tracking | Sentry | JS + Python exceptions with stack traces | Any new error type |
| Distributed Tracing | Jaeger / AWS X-Ray | Request trace across microservices | Total trace > 30s |
| Log Aggregation | ELK Stack | Structured JSON logs, audit trail | Error log rate spike |

### Custom Prometheus Metrics

```typescript
// Key business metrics emitted by API server
tt_generation_duration_seconds    // Histogram: timetable generation time
tt_conflict_count_total           // Counter: constraint violations (target: always 0)

active_panel_sessions             // Gauge: active sessions per panel type
pdf_export_duration_seconds       // Histogram: PDF generation time
```

---

## 10. Disaster Recovery

| Scenario | RTO | RPO | Strategy |
|---|---|---|---|
| API pod crash | < 30 seconds | 0 | Kubernetes auto-restarts pod |
| Database failure (primary) | < 5 minutes | < 30 seconds | PostgreSQL automatic failover to read replica |
| Redis failure | < 2 minutes | Session data only | Redis Sentinel promotes replica; users re-login |
| AI Engine crash during generation | < 60 seconds | Partial generation | Redis lock TTL releases; retry queue picks up |
| Full AZ outage (AWS) | < 10 minutes | < 60 seconds | ALB routes to healthy AZ; Multi-AZ RDS failover |
| Deployment failure | < 5 minutes | 0 | ArgoCD rollback to previous Helm release |

### Backup Strategy

```
PostgreSQL:
  - Automated daily full backup (AWS RDS) → retained 30 days
  - WAL streaming → Point-in-Time Recovery up to 5 minutes
  - Weekly manual snapshot before major migrations
  - Cross-region replication (async, RPO < 1 hour)

Redis:
  - RDB snapshot every 15 minutes
  - Acceptable loss: active sessions (users must re-login)

S3 (PDFs, ML Models):
  - Cross-region replication (automatic)
  - Object versioning enabled (recoverable for 90 days)
  - Lifecycle: archive to Glacier after 90 days
```

---

## 11. Security Configuration

### Security Headers (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      connectSrc:  ["'self'", "https://api.nep-scheduler.com", "wss://api.nep-scheduler.com"],
      imgSrc:      ["'self'", "data:", "https://s3.amazonaws.com"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
    }
  },
  hsts:           { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff:        true,
  frameguard:     { action: 'deny' },
  referrerPolicy: { policy: 'same-origin' }
}));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' }
});

app.use('/v1/', limiter);
```

---

*© 2026 NEP-Scheduler. All rights reserved. — Confidential: Internal Use Only*
