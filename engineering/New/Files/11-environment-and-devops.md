# 11 — Environment & DevOps

> **Platform:** AI Smart University Platform
> **Version:** v2.0.0 | **Date:** March 2026
> **Classification:** Confidential — Internal Use Only

---

## 1. Environment Strategy

| Environment | Purpose | Infrastructure | Branch |
|---|---|---|---|
| `local` | Developer workstation | Docker Compose | Any feature branch |
| `development` | Shared integration testing | Railway + Supabase free tier | `develop` |
| `staging` | Pre-production validation | AWS EKS (small cluster) | `staging` |
| `production` | Live universities | AWS EKS (multi-AZ) | `main` |

---

## 2. Complete Environment Variables

### 2.1 `apps/api/.env`

```bash
# ─── Core ────────────────────────────────────────────────────────────
NODE_ENV=development                             # development | staging | production
PORT=8000
LOG_LEVEL=debug                                  # debug | info | warn | error

# ─── Database ────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/smartuniversity
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_SCHEMA_DEFAULT=public

# ─── Redis ───────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
REDIS_SESSION_TTL=28800                          # 8 hours (JWT expiry match)
REDIS_CACHE_TTL=3600                             # 1 hour default cache TTL
REDIS_LOCK_TTL=120                               # 2 min — timetable generation lock

# ─── JWT ─────────────────────────────────────────────────────────────
JWT_SECRET=your-256-bit-secret-openssl-rand-base64-32
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12

# ─── Firebase Admin ──────────────────────────────────────────────────
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ─── Keycloak OIDC ───────────────────────────────────────────────────
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=smart-university
KEYCLOAK_CLIENT_ID=platform-api
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret

# ─── AI Engine ───────────────────────────────────────────────────────
AI_ENGINE_URL=http://localhost:8003
AI_ENGINE_TIMEOUT_MS=60000

# ─── WebSocket ───────────────────────────────────────────────────────
SOCKET_CORS_ORIGIN=http://localhost:3000
SOCKET_REDIS_ADAPTER_URL=redis://localhost:6379

# ─── Kafka ───────────────────────────────────────────────────────────
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=platform-api
KAFKA_GROUP_ID=platform-consumers

# ─── AWS ─────────────────────────────────────────────────────────────
AWS_REGION=ap-south-1
AWS_S3_BUCKET=smart-university-platform-assets
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_SIGNED_URL_EXPIRY=3600

# ─── Blockchain (Polygon L2) ─────────────────────────────────────────
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology      # Testnet: Amoy
# POLYGON_RPC_URL=https://polygon-rpc.com                # Mainnet
BLOCKCHAIN_PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
ACADEMIC_RECORDS_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
DEGREE_REGISTRY_CONTRACT_ADDRESS=0xYOUR_DEGREE_CONTRACT_ADDRESS
POLYGONSCAN_BASE_URL=https://amoy.polygonscan.com        # Testnet
# POLYGONSCAN_BASE_URL=https://polygonscan.com           # Mainnet

# ─── Payments ────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
PAYU_MERCHANT_KEY=your-payu-key
PAYU_MERCHANT_SALT=your-payu-salt

# ─── Email (AWS SES) ─────────────────────────────────────────────────
AWS_SES_REGION=ap-south-1
AWS_SES_FROM_EMAIL=noreply@smartuniversity.com
AWS_SES_FROM_NAME=AI Smart University Platform

# ─── SMS (Twilio / MSG91) ────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1415XXXXXXX
MSG91_AUTH_KEY=your-msg91-key
MSG91_SENDER_ID=SMARTU

# ─── Rate Limiting ───────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
PUBLIC_PORTAL_RATE_LIMIT_PER_HOUR=1000

# ─── MQTT IoT ────────────────────────────────────────────────────────
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=iot-service
MQTT_PASSWORD=your-mqtt-password
```

### 2.2 `apps/ai-engine/.env`

```bash
# ─── Core ────────────────────────────────────────────────────────────
ENVIRONMENT=development
PORT=8003
LOG_LEVEL=DEBUG

# ─── Database ────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/smartuniversity

# ─── Redis ───────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Elasticsearch (RAG) ─────────────────────────────────────────────
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-elastic-password
ELASTICSEARCH_INDEX_PREFIX=uni_

# ─── Anthropic (Claude API) ──────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=1000
CLAUDE_TEMPERATURE=1                             # Fixed at 1 per ADR-012

# ─── OR-Tools ────────────────────────────────────────────────────────
SOLVER_TIME_LIMIT_SECONDS=30
SOLVER_NUM_WORKERS=8

# ─── ML Models (loaded from S3 at startup) ───────────────────────────
AWS_REGION=ap-south-1
AWS_S3_BUCKET=smart-university-platform-assets
ML_MODEL_PATH=s3://smart-university-platform-assets/models/
SLOT_PREFERENCE_MODEL=slot_preference_v2.json
DROPOUT_RISK_MODEL=dropout_risk_rf_v2.pkl
PERFORMANCE_MODEL=performance_xgb_v1.json

# ─── Sentence Transformers ───────────────────────────────────────────
EMBEDDING_MODEL=all-MiniLM-L6-v2
RAG_TOP_K=5
```

### 2.3 `apps/web/.env.local`

```bash
# ─── API ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8003

# ─── Firebase (Client SDK) ───────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ─── App ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=AI Smart University Platform
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_SUPPORT_EMAIL=support@smartuniversity.com

# ─── Blockchain (frontend verification) ──────────────────────────────
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_ACADEMIC_RECORDS_CONTRACT=0xYOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_POLYGONSCAN_URL=https://amoy.polygonscan.com
```

### 2.4 `apps/blockchain/.env`

```bash
PRIVATE_KEY=0xYOUR_HARDHAT_DEPLOYER_PRIVATE_KEY
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your-polygonscan-api-key
```

---

## 3. Local Development Setup

### 3.1 Docker Compose (All Services)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: smartuni
      POSTGRES_PASSWORD: smartpass
      POSTGRES_DB: smartuniversity
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    command: redis-server --appendonly yes

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    ports: ['9092:9092']
    depends_on: [zookeeper]

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.0
    environment:
      discovery.type: single-node
      ES_JAVA_OPTS: '-Xms512m -Xmx512m'
      xpack.security.enabled: 'false'
    ports: ['9200:9200']

  mongodb:
    image: mongo:7.0
    ports: ['27017:27017']
    volumes: ['mongodata:/data/db']

  mosquitto:
    image: eclipse-mosquitto:2.0
    ports: ['1883:1883', '8883:8883']
    volumes: ['./mosquitto.conf:/mosquitto/config/mosquitto.conf']

volumes:
  pgdata:
  mongodata:
```

### 3.2 First-Time Setup Script

```bash
# 1. Clone and install dependencies
git clone https://github.com/org/ai-smart-university.git
cd ai-smart-university
pnpm install

# 2. Start infrastructure services
docker-compose up -d

# 3. Run Prisma migrations for default schema
pnpm db:migrate

# 4. Seed VNSGU and SPUVVN test data
pnpm db:seed

# 5. Start all apps in dev mode (parallel via Turborepo)
pnpm dev

# 6. Access the platform
# Frontend: http://localhost:3000
# API: http://localhost:8000
# AI Engine: http://localhost:8003
# Swagger API docs: http://localhost:8000/api-docs
```

---

## 4. CI/CD Pipeline (GitHub Actions)

### 4.1 Pull Request Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [develop, staging, main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env: { POSTGRES_PASSWORD: testpass, POSTGRES_DB: testdb }
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v4

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  docker-build:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - run: docker build -t platform-api:test ./apps/api
      - run: docker build -t platform-web:test ./apps/web
      - run: docker build -t platform-ai:test ./apps/ai-engine
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: platform-api:test
          exit-code: '1'
          severity: CRITICAL
```

### 4.2 Production Deploy Pipeline (`.github/workflows/deploy.yml`)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & push Docker images
        run: |
          docker build -t ${{ steps.login-ecr.outputs.registry }}/platform-api:$GITHUB_SHA ./apps/api
          docker build -t ${{ steps.login-ecr.outputs.registry }}/platform-web:$GITHUB_SHA ./apps/web
          docker build -t ${{ steps.login-ecr.outputs.registry }}/platform-ai:$GITHUB_SHA ./apps/ai-engine
          docker push ${{ steps.login-ecr.outputs.registry }}/platform-api:$GITHUB_SHA
          docker push ${{ steps.login-ecr.outputs.registry }}/platform-web:$GITHUB_SHA
          docker push ${{ steps.login-ecr.outputs.registry }}/platform-ai:$GITHUB_SHA

      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --region ap-south-1 --name smart-university-prod
          kubectl set image deployment/platform-api platform-api=${{ steps.login-ecr.outputs.registry }}/platform-api:$GITHUB_SHA
          kubectl set image deployment/platform-ai platform-ai=${{ steps.login-ecr.outputs.registry }}/platform-ai:$GITHUB_SHA
          kubectl rollout status deployment/platform-api --timeout=300s

      - name: Run smoke tests
        run: |
          pnpm test:smoke --env=production
```

---

## 5. Kubernetes Configuration

### 5.1 API Server Deployment

```yaml
# k8s/platform-api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platform-api
  namespace: smart-university
spec:
  replicas: 3
  selector:
    matchLabels: { app: platform-api }
  template:
    metadata:
      labels: { app: platform-api }
    spec:
      containers:
        - name: platform-api
          image: ECR_REGISTRY/platform-api:latest
          ports: [{ containerPort: 8000 }]
          envFrom:
            - secretRef: { name: platform-api-secrets }
          resources:
            requests: { memory: "256Mi", cpu: "250m" }
            limits: { memory: "512Mi", cpu: "500m" }
          livenessProbe:
            httpGet: { path: /health, port: 8000 }
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet: { path: /ready, port: 8000 }
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: platform-api-hpa
  namespace: smart-university
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: platform-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
```

### 5.2 Public Portal Service HPA

```yaml
# Public portal receives highest unauthenticated traffic
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: public-portal-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: public-portal-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 60 }
```

### 5.3 AI Engine KEDA Autoscaler

```yaml
# Event-driven scaling based on AI request queue depth
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: ai-engine-scaler
spec:
  scaleTargetRef:
    name: platform-ai
  minReplicaCount: 2
  maxReplicaCount: 10
  triggers:
    - type: redis
      metadata:
        address: redis-service:6379
        listName: ai-task-queue
        listLength: "5"
```

---

## 6. Production Hosting (MVP)

| Service | Platform | Free Tier | Est. Cost |
|---|---|---|---|
| Frontend (Next.js) | Vercel | ✅ | $0–$20/mo |
| API Server (Node.js) | Railway | Limited | $10–$30/mo |
| AI Engine (Python) | Railway / Render | Limited | $15–$40/mo |
| PostgreSQL | Supabase / Neon | ✅ | $0–$25/mo |
| Redis | Upstash | ✅ | $0–$10/mo |
| Elasticsearch | Elastic Cloud | ❌ | $15–$50/mo |
| MongoDB | Atlas M0 | ✅ | $0/mo |
| Blockchain (Polygon Amoy) | Polygon testnet | ✅ | $0 (testnet) / ~$10/mo (mainnet gas) |
| Firebase Auth | Spark plan | ✅ | $0–$25/mo |
| Domain + SSL | Namecheap + Cloudflare | — | $10–$15/yr |
| **Total MVP Cost** | | | **~$60–$200/mo** |

---

## 7. Production Scale Hosting (AWS EKS)

| Component | AWS Service | Config |
|---|---|---|
| Kubernetes | EKS | Multi-AZ; node groups: t3.medium (general) + c5.2xlarge (AI engine) |
| PostgreSQL | RDS PostgreSQL 15 | Multi-AZ; db.r6g.large; PgBouncer connection pooling |
| Redis | ElastiCache | Redis 7; cluster mode; 3 nodes |
| Kafka | MSK (Managed Streaming) | 3 brokers; 6 partitions per topic |
| Elasticsearch | Elastic Cloud / OpenSearch | 2 data nodes; 8GB RAM |
| MongoDB | Atlas M30 | 3-node replica set |
| InfluxDB | InfluxDB Cloud | IoT time-series |
| CDN | Cloudflare | All static assets + public portal pages |
| Load Balancer | AWS ALB | Ingress with SSL termination |
| Container Registry | AWS ECR | All platform images |
| Object Storage | AWS S3 | Multi-region replication; lifecycle to Glacier after 90 days |
| DNS | Route 53 + Cloudflare | Platform domain + per-university CNAME |
| Monitoring | Prometheus + Grafana | On-cluster; dashboards for all 22 services |
| Logging | ELK Stack (Elasticsearch + Kibana) | Centralised logs + audit trail |
| Alerting | PagerDuty | On-call escalation for P0/P1 incidents |

---

## 8. Monitoring & Observability

### 8.1 Key Metrics (Prometheus)

| Metric | Alert Threshold | Action |
|---|---|---|
| `api_response_time_p95` | > 1000ms for 5 min | Alert on-call; check DB + cache |
| `timetable_generation_duration` | > 45s | Alert AI team; check OR-Tools CPU |
| `public_portal_error_rate` | > 1% errors/min | Alert platform team; check tenant routing |
| `kafka_consumer_lag` | > 1000 messages | Scale consumer instances |
| `postgres_connection_pool_exhausted` | Pool > 90% used | Scale DB read replicas |
| `blockchain_tx_failure_rate` | > 5% failures | Alert blockchain team; check Polygon RPC |
| `redis_memory_usage` | > 80% | Eviction risk; scale Redis |
| `dropout_risk_job_failure` | Any failure | Alert AI team; re-queue job |

### 8.2 Distributed Tracing
Jaeger (OpenTelemetry) for tracing requests across all 22 microservices. TraceId included in all error responses for support lookups.

### 8.3 Smart Contract Deployment

```bash
# Deploy to Polygon Amoy Testnet
cd apps/blockchain
npx hardhat run scripts/deploy.ts --network amoy

# Verify on Polygonscan
npx hardhat verify --network amoy 0xYOUR_CONTRACT_ADDRESS

# Deploy to Polygon Mainnet
npx hardhat run scripts/deploy.ts --network polygon

# Grant PUBLISHER_ROLE to blockchain-service wallet
npx hardhat run scripts/grantPublisherRole.ts --network polygon
```

---

## 9. Backup & Disaster Recovery

| Data Store | Backup Strategy | RPO | RTO |
|---|---|---|---|
| PostgreSQL | AWS RDS automated daily backup (30-day retention) + WAL streaming PITR | 5 min | < 1 hour |
| Redis | RDB snapshot every 15 minutes | 15 min | < 5 min (re-login required) |
| S3 (PDFs / Videos / Models) | Cross-region replication + object versioning (90-day recovery) | Near-zero | < 10 min |
| MongoDB | Atlas automated daily backup (7-day PITR) | 4 hours | < 30 min |
| Blockchain | Immutable by design; PostgreSQL mirrors all tx hashes | N/A | N/A |
| Elasticsearch | Snapshot to S3 daily | 24 hours | < 1 hour |

---

*© 2026 AI Smart University Platform. All rights reserved. — Confidential: Internal Use Only*
