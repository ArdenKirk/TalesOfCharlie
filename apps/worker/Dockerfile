# ---------- base with pnpm ----------
FROM node:22-bullseye-slim AS base
WORKDIR /app
RUN corepack enable

# ---------- deps ----------
FROM base AS deps
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/types/package.json packages/types/
COPY packages/ai-mocks/package.json packages/ai-mocks/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile

# ---------- dev runner ----------
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /app/apps/worker
CMD ["pnpm","dev"]

# ---------- builder (ts -> js) ----------
FROM deps AS builder
ENV NODE_ENV=production
COPY . .
WORKDIR /app/apps/worker
RUN pnpm build

# ---------- prod runner ----------
FROM base AS prod
ENV NODE_ENV=production
WORKDIR /app/apps/worker
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/worker/node_modules ./node_modules
CMD ["node","dist/index.js"]
