> **Scope:** Rules for the Cline AI agent working in the **Tales of Charlie** monorepo.
>
> **Repo assumptions:** pnpm workspaces; apps: `apps/web` (Next.js), `apps/api` (NestJS/Fastify), `apps/worker` (BullMQ), shared pkgs under `packages/…`, ops under `ops/`.
>
> **Runtime:** Dockerized dev & prod; parity maintained.
>
> **Start scripts:** `ops/dev.sh`, `ops/prod.sh`.

## Core Efficiency Principles

### Read/Investigate Efficiently (Monorepo-aware)

🚫 **DON’T** open files one-by-one aimlessly.
✅ **DO** start with an overview, then targeted reads/searches.

**Standard flow**:

```bash
# 1) Get oriented
list_files("/")                 # repo root overview
list_files("apps/")             # see web/api/worker
list_files("packages/")         # db/types/ui/config/ai-mocks
list_files("ops/")              # compose, caddy, scripts

# 2) Read only entry points / key configs
read_file("apps/web/app/layout.tsx")
read_file("apps/api/src/main.ts")
read_file("apps/worker/src/index.ts")
read_file("packages/db/prisma/schema.prisma")
read_file("ops/docker-compose.dev.yml")
read_file("ops/dev.sh")

# 3) Pattern and symbol search (fast, wide)
search_files("prisma migrate", "**/*")
search_files("BullMQ", "apps/worker/**/*")
search_files("NextAuth", "apps/**/*")

# 4) Scan code structure quickly
list_code_definition_names("apps/api/src")
```

### Tool Usage Priority

1. **Native codebase tools** (`list_files`, `search_files`, `read_file`, `replace_in_file`)
2. **MCP servers** for specialization (Tavily, Context7, Git MCP, Playwright, AWS Docs, Memory Bank)
3. **CLI commands** (Docker/pnpm) only when necessary, and prefer `ops/dev.sh` & `ops/prod.sh` wrappers

### Memory Bank Integration (MANDATORY)

* Read Memory Bank files when relevant. If you need multiple, read them all at once using one command, not one file at a time.
* **Immediately update** Memory Bank after shipping meaningful changes.
* Use `activeContext.md` to focus work and record current constraints/decisions.
* Record new patterns in `systemPatterns.md`.
* Track progress in `progress.md`.

## Startup / Environment (No Guesswork)

* **Dev:** `cd ops && ./dev.sh` (non-interactive: installs deps, prisma generate/migrate/seed, brings up stack; web at `http://localhost`).
* **Prod:** `cd ops && ./prod.sh` (non-interactive deploy on the DO droplet; reads `ops/.env.prod`).
* **Database tasks:**

    * `./dev.sh migrate` – `prisma migrate dev --name initial_schema`
    * `./dev.sh seed` – seeds local DB via Node script
* **AI toggle:**

    * Dev: `AI_MODE=mock` (Response Picker; no real calls)
    * Prod: `AI_MODE=real` via LiteLLM proxy (when added)

## Task Execution Optimization

### Investigation Tasks

```
1) list_files() → Repo overview
2) read_file() → Only entry points, schemas, ops
3) search_files() → Find references/patterns
4) list_code_definition_names() → Architecture scan
5) Update memory bank with findings
```

### Modification Tasks

```
1) Confirm targets: list_files()/search_files()
2) read_file() → Current state
3) Plan minimal diffs
4) replace_in_file() → Surgical changes (preferred)
5) write_to_file() → Only for new files/large rewrites
6) Run ./dev.sh up (if needed), verify locally
7) Update memory bank (activeContext.md, progress.md)
```

### Writing Strategy

* Prefer `replace_in_file()` for focused updates.
* Use `write_to_file()` for: brand-new files, >50% structural changes, or template scaffolds.
* Enforce **Coding Standards** (see CodingStandards.md).

### Error Handling

```
1) Try the best-fit tool
2) On failure, inspect root cause (search_files, logs)
3) Adjust approach quickly
4) If a systematic pattern emerges, document it in systemPatterns.md
```

## Mode Switching

* **PLAN mode** for non-trivial work: read Memory Bank, draft an approach, note risks/alternatives.
* **ACT mode**: implement, verify, document changes in Memory Bank.

## Context Window Management

* Read **once**, think deeply, then act.
* Avoid re-reading the same files; use `search_files()` or Memory Bank references instead.

## Project-Specific Must-Knows

* **Package manager:** pnpm workspaces (not Yarn).
* **DB:** PostgreSQL + Prisma; migrations are mandatory and must run cleanly in containers.
* **Queues:** BullMQ via Redis.
* **Interfaces:** Zod schemas → OpenAPI generated (single source).
* **AI:** No LLM calls in dev; prod uses LiteLLM proxy with budget/timeout/caching guards.
* **Security:** SSRF protections; robots.txt honored; CSP/HSTS via Caddy; rate limits via Redis.

## Prohibited Anti-Patterns

* Bulk reading the whole repo.
* Sequential single-file reads for “exploration”.
* Rewriting large files without a plan.
* Ignoring coding standards or Memory Bank updates.
* Introducing non-dockerized steps that break parity.

**Efficiency Mantra:** *Read once. Plan thoroughly. Execute surgically. Document immediately.*