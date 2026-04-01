# SmartCampus OS: Developer Guide

This guide provides everything you need to know to start contributing to the **SmartCampus OS** monorepo.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20.x
- **Python**: 3.10+
- **PNPM**: v8.x+
- **Docker**: For running Redis and PostgreSQL locally.

### 2. Environment Setup
Copy the example environment files in each app:
```bash
# Root
cp .env.example .env

# Apps
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

### 3. Local Development
We use **Turborepo** to manage the monorepo. Start all services (Web, API, AI) with:
```bash
pnpm run dev:all
```

---

## 🛠️ Service Architecture

| Service | Technology | Port | URL |
|---|---|---|---|
| **Web Frontend** | Next.js 14 | 3000 | `http://localhost:3000` |
| **Node.js API** | Express | 4000 | `http://localhost:4000` |
| **AI Service** | FastAPI | 5000 | `http://localhost:5000` |

### Database Management
To migrate the database or open the Prisma Studio:
```bash
# Run Migrations
pnpm --filter api prisma migrate dev

# Open Studio
pnpm --filter api prisma studio
```

---

## 🧪 Testing and Quality
Every PR must pass the following checks:
1. **Linting**: `pnpm run lint`
2. **Type Check**: `pnpm run typecheck`
3. **API Tests**: `pnpm --filter api test`
4. **AI Tests**: `pytest apps/ai-service`

---

## 📖 Key Directories
- `/apps/web`: The Next.js dashboard and public portals.
- `/apps/api`: The primary backend and Prisma ORM logic.
- `/apps/ai-service`: The Python-based scheduling and prediction engine.
- `/packages`: Shared UI components and utility libraries.

---

*For architectural details, see [docs/WIKI.md](file:///Users/shivam/Downloads/Current%20Projects/SmartCampusOS/docs/WIKI.md)*
