# ---------- base with pnpm ----------
FROM node:22-bullseye-slim AS base
ENV NODE_ENV=production
WORKDIR /app
# enable corepack (pnpm)
RUN corepack enable

# ---------- deps (install workspace deps once) ----------
FROM base AS deps
ENV NODE_ENV=development
# copy workspace manifests for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# copy all package.jsons so pnpm can resolve workspace graph
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/
COPY packages/types/package.json packages/types/
COPY packages/ai-mocks/package.json packages/ai-mocks/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/
# install all workspace deps
RUN pnpm install --frozen-lockfile

# ---------- dev runner (hot-reload) ----------
FROM deps AS dev
ENV NODE_ENV=development
# we will bind-mount the whole repo at /app in compose
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm","dev","-p","3000"]

# ---------- builder (prod build) ----------
FROM deps AS builder
ENV NODE_ENV=production
# copy full source for build
COPY . .
WORKDIR /app/apps/web
# Next.js standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------- prod runner (minimal image) ----------
FROM base AS prod
ENV NODE_ENV=production
WORKDIR /app
# copy standalone build output
# .next/standalone contains a self-contained server (including node_modules)
COPY --from=builder /app/apps/web/.next/standalone ./
# static assets
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
# server.js is emitted by Next standalone
CMD ["node","apps/web/server.js"]
