> **Goal:** Ruthless consistency, zero tech debt, agent-friendly DX.
> **Stack anchors:** TypeScript strict, pnpm, Next.js (App Router), NestJS, BullMQ, Prisma, Postgres, Redis, Docker, Caddy.

## Absolute Zero-Tolerance Code Smells

* **Duplication:** Extract to shared utilities (e.g., `packages/ui`, `packages/types`, `packages/config`).
* **Primitive Obsession:** Prefer domain types/enums over raw strings/numbers.
* **Feature Envy / God Objects:** Small, focused modules/components; break down >200 LOC; SRP always.
* **Data Clumps:** Inline interfaces/types for parameters that travel together.
* **Comments:** Code must be self-documenting. Favor clear names, small functions, strong types.
* **Magic Values:** Centralize constants; no literals in business logic.

## TypeScript Standards

* `"strict": true` across all packages.
* No `any` without an explicit, localized `// TODO: narrow type` and immediate follow-up.
* All exported functions/types/interfaces must be explicitly typed.
* Zod schemas are the **single source** for API contracts; OpenAPI is generated from Zod (no DTO drift).

## Naming & File Conventions

* **Components:** `PascalCase` (`ArticleCard.tsx`).
* **Hooks/Functions/Vars:** `camelCase` (`usePopularWindow`).
* **Constants/Enums:** `UPPER_CASE` (`POPULAR_WINDOWS`).
* **Interfaces/Types:** `PascalCase`; prefer `Type` suffix over `I` prefix.
* **Files:** `kebab-case.ts/tsx` for modules, aligned to folder purpose.

## Imports (Order & Hygiene)

* React/Next first, third-party libs next, then absolute aliases (`@/…`), then relative.
* Alphabetize within groups; no unused imports; no wildcard imports for local code.

## Component Architecture (Next.js App Router)

* Prefer **Server Components** by default; promote to Client only when needed (event handlers, stateful UI).
* Keep components small; one clear responsibility.
* UI primitives live in `packages/ui`; compose rather than duplicate.

## API Architecture (NestJS + Fastify)

* **Modules** per domain (`PostsModule`, `AuthModule`, `DomainsModule`).
* **Zod** for validation at the edges; no duplicate DTO schemas.
* **OpenAPI** is generated from Zod schemas; keep swagger UI up to date.
* Log with **pino**; propagate **request-id** for tracing.

## Worker Patterns (BullMQ)

* One job type per file; pure functions for business logic.
* **Idempotency keys** (e.g., normalized URL hash) to avoid duplicate processing.
* Explicit retry/backoff; dead-letter queue monitoring.

## Data Layer (Prisma + Postgres)

* Prisma schema is single source; review migrations in PRs.
* Indexes for hot queries (tags array, `pg_trgm` similarity).
* Transactional integrity for multi-step operations (submit → approve → publish).

## Error Handling

* No silent failures. Every async call accounted for with try/catch or result types.
* Bubble actionable messages to UI; log structured errors with context.

## Package Manager Standards (pnpm)

* Use **pnpm** across the workspace.
* Install via `pnpm install`; build via `pnpm build`; dev via `./ops/dev.sh` (which runs in containers).
* Lockfile (`pnpm-lock.yaml`) is source of truth; no ad-hoc npm/yarn.

## Linting / Formatting

* ESLint + Prettier; CI must pass.
* No `console.log` in non-test code (use `pino`).

## Testing

* **Unit/Integration:** Vitest/Jest + Testcontainers for DB/Redis.
* **E2E:** Playwright (auth, submit, approve mock, publish, star, filter).

## Security & Accessibility

* SSRF hardening in fetchers; sanitize HTML; obey robots.txt.
* CSP/HSTS headers via Caddy.
* Radix/shadcn for accessible primitives; axe checks in E2E.

## Git & CI

* Conventional commits; PR required; no push to `main`.
* CI runs type/lint/test/build, Prisma migrate diff, OpenAPI snapshot.

**Enforcement:** Any violation is refactored before merge.