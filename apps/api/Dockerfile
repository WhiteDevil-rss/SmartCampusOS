# Stage 1: Build
FROM node:20-slim AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

# Copy root workspace configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
# Copy shared packages strictly for dependencies
COPY packages/types/package.json ./packages/types/
COPY packages/validation/package.json ./packages/validation/
# Copy API package JSON
COPY apps/api/package.json ./apps/api/

# Fetch dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source maps
# COPY tsconfig.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build internal shared packages and generate Prisma Client
WORKDIR /usr/src/app/apps/api
RUN pnpm exec prisma generate
RUN pnpm run build

# Stage 2: Production
FROM node:20-slim AS runner

# Install OpenSSL dynamically for Prisma engines
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8000

# Copy necessary monorepo structures
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/packages ./packages
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/prisma ./apps/api/prisma

# Copy fully resolved node_modules including Prisma binaries from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 8000

# Entry Command
WORKDIR /usr/src/app/apps/api
CMD ["node", "dist/app.js"]
