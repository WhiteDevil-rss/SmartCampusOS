# Agent Context

## Codebase Patterns
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Shadcn UI, Zustand store.
- **Backend**: Node.js 20, Express, Prisma ORM, Socket.io.
- **AI Microservice**: Python 3.10, FastAPI, OR-Tools.

## Gotchas
- Always use `useCallback` for functions passed into dependencies in React components.
- The Python engine runs on port `5000` via Docker.
- Environment variables require mapping through the `docker-compose.yml` network.
- Ensure the Redis instance is running when triggering AI generation.
- Empty states and uninitialized structures (e.g. absent timetables) MUST return HTTP 200 with `null` structurally rather than throwing destructive 404 network errors, allowing the React Router to map Empty States gracefully.
