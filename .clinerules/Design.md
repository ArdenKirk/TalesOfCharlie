# Tales of Charlie — Technical Design Document (Final)

A tribute to Charlie Kirk.

**Mission**: Build a media aggregation site that exposes corruption and bias in liberal media against conservatives, the white race, and groups often maligned by the left (e.g., cis white men). We copy the headline and the lede exactly, do not use images, and then summarize everything after the lede from an extremely conservative perspective, formatted to look unapologetically professional—like a serious news publication.

This document is the single source of truth for product requirements, technical architecture, stack choices, security, operations, and contributor standards. Everything here is authoritative.

## 1) Purpose, Scope & Editorial Line

**Name & Domain**: Tales of Charlie — talesofcharlie.com

**Purpose**: Aggregate news that either:
- Supports conservative views (facts/events helpful to the right), or
- Reveals left-wing hostility (e.g., content pushing abortion, denigrating white people, praising attacks on the right, calling the right “Nazis”), in order to document bias.

**Editorial execution**:
- Copy the headline verbatim.
- Copy the lede verbatim.
- Do not include an image.
- Summarize the remainder (everything after the lede) from an extremely conservative perspective.
- Format the entire article content (including the lede) nicely—Markdown rendered as professional news typography.
- Link to the original article at the bottom.
- Assign up to 20 tags per post—tags are hard-coded in the codebase (allowlist).
- **Autonomy goal**: Long-term, AI should fully manage intake, validation, domain approvals, and moderation.
- **Open Source**: Public GitHub repository. The README opens with the tribute and explains the intended impact.

## 2) Final Tech Stack (What, Why, and How It Fits)

### 2.1 Host & OS
- **Cloud**: DigitalOcean — Basic Droplet, 2 vCPU / 4 GB RAM / 80 GB SSD, region NYC3 (or another US region).
    - **Why**: Excellent US bandwidth included, simple UI, reliable support, hourly billing with monthly cap.
- **OS**: Ubuntu LTS
    - **Why**: Stable, secure, ubiquitous packages.

### 2.2 Runtime & Orchestration
- **Docker & Docker Compose**
    - **Why**: Perfect local ↔ prod parity. One Compose file declares and runs all services on the VM (and locally).
- **Caddy (reverse proxy, TLS)**
    - **Why**: Automatic Let’s Encrypt TLS, HTTP/2, Brotli, very clean config.
    - **How**: Public port 443 terminates TLS; routes / to web, /api/* to api, /v1/* to LiteLLM proxy.

### 2.3 Frontend (UI)
- **Next.js (App Router, RSC) + React**
    - **Why**: SSR for SEO, streaming for speed, perfect control over metadata and canonical URLs.
- **Tailwind CSS + Radix UI + shadcn/ui + Lucide icons**
    - **Why**: Accessible, modern, professional news look with minimal custom CSS.
- **Framer Motion**
    - **Why**: Subtle, tasteful micro-interactions.
- **TanStack Query**
    - **Why**: Client-side caching for interactive filters (Popular windows, tags).
- **Markdown pipeline**: remark/rehype + sanitize
    - **Why**: Render conservative summaries safely and beautifully.

### 2.4 Backend API
- **NestJS (Fastify)**
    - **Why**: Strong modularity, DI, performance.
- **Zod DTOs + OpenAPI**
    - **Why**: Agent-friendly contracts and runtime validation. (Zod schemas are the single source; OpenAPI generated from Zod.)
- **Auth**: Auth.js/NextAuth (Google OAuth + Email magic links)
    - **Why**: Battle-tested, integrates cleanly with Next.js; API verifies JWTs.
- **Logging**: pino
- **Observability**: OpenTelemetry (traces, metrics) — spans across web → api → worker → LLM.

### 2.5 Background Jobs
- **BullMQ (Redis) Worker (Node)**
    - **Why**: Simple, reliable job queues for:
        - Fetch + parse articles
        - LLM approval/denial decisions (prod only)
        - Conservative summaries + tag selection (prod only)
        - Popularity rollups, similarity computations
    - **Idempotency**: URL hash keys prevent duplicate processing.

### 2.6 Data & Storage
- **PostgreSQL 16 (Docker volume; source of truth)**
    - **Why**: ACID, rich indexing, trigram & full-text search, optional vectors later.
    - **Extensions**: pg_trgm (similarity), optional pgvector.
- **Prisma ORM**
    - **Why**: Type-safe schema, migrations, and client; superb DX; shared types across API/Worker.
- **Redis 7**
    - **Why**: Rate limiting, job queues, popularity windows (sorted sets). Design treats Redis as ephemeral (rebuildable).

### 2.7 AI Provider (Prod only) — No LLM calls in Development
- **LiteLLM Proxy (self-hosted)** as a multi-model gateway with no markup over vendor pricing.
    - **Why**: One OpenAI-compatible endpoint, aliasing/routing/fallbacks, budgets, per-key limits, logs; we own provider keys.
    - **Vendors we can wire**: OpenAI (GPT-4o family), Anthropic (Claude), Google (Gemini), others as needed.
    - **Toggle**: AI_MODE=mock (dev/CI) vs AI_MODE=real (prod). In dev/CI we always mock with a Response Picker UI.

## 3) Repository Structure (Monorepo)
/tales-of-charlie
/apps
/web        # Next.js (UI, SSR, SEO)
/api        # NestJS (REST API, OpenAPI, Auth)
/worker     # BullMQ jobs: fetch/parse, LLM orchestration, rollups
/packages
/db         # Prisma schema, migrations, generated client, seed scripts
/types      # Shared TS types + Zod schemas (single source for DTOs & OpenAPI)
/ai-mocks   # Deterministic fixtures + Response Picker (dev-only)
/ui         # Reusable UI components (shadcn), markdown styles
/config     # Zod-validated envs, runtime feature flags
/eslint-config
/tsconfig
/ops
docker-compose.yml
Caddyfile
backup_pg_dump.sh
wal-g/ (optional later)

## 4) Core Product Features & UX

### 4.1 Submission & Moderation Flow
- **Logged-in user pastes a URL.**
- **Blacklist domain precheck**:
    - If blacklisted → fail immediately with clear message (“This source does not meet Tales of Charlie standards.”). No LLM call.
- **Whitelist check**:
    - If whitelisted → proceed to article check.
    - If unknown:
        - If not blacklisted → auto-deny article; tell user to submit the domain for review via footer popup.
        - If blacklisted → deny; reiterate domain is not accepted.
- **Article Check (prod LLM; dev mock)**:
    - Accept if either:
        - A right-leaning source reporting facts favorable to conservative views or exposing left misconduct, or
        - A left-leaning source hostile to our views (e.g., pushing abortion, denigrating white people, praising attacks on the right, calling the right “Nazis”), which we want to document.
    - **On approval**:
        - Extract: headline exact, lede exact, body-after-lede (see §6).
        - Summarize body-after-lede from an extremely conservative perspective (Markdown).
        - Assign up to 20 tags from the hard-coded allowlist.
        - Store everything in Postgres and publish.
    - **On denial**: return an error (non-alignment with site standards).
- **Article Page** shows: Headline + Lede (exact), Conservative Markdown summary, Tags, Original Link, Share button, Similar Posts.

### 4.2 Domain Review (Footer)
- Popup form to submit a domain for review.
- **Criteria for approval**:
    - ≥ 100k monthly visitors (report the source/evidence URL).
    - LLM (prod) deems it a legitimate news site.
- On approval → add to whitelist. On denial → add to blacklist.

### 4.3 Accounts & Profiles
- **Auth**: Google OAuth + Email magic links.
- **Usernames**: Custom, globally unique.
- **Profiles**: Public page with authored posts; owner sees Starred tab.

### 4.4 Home Feed
- **Sort**: Recent · Most Starred · Popular.
- **Popular windows**: Hour, Day, Week, Month, Year (stars within window).
- **Filter by Tags**: Multi-select (from allowlist). State synced to URL.

### 4.5 Navigation & Layout
- **Header (left)**: Main site links (Home, Tags, About, Contributing).
- **Header (right)**: Contribute · GitHub icon · Post (+) · Profile picture
- **Footer**: Domain Review popup link; sitemap.

### 4.6 No Object Storage
- No images on posts; no storage buckets. All persisted text lives in the database.

## 5) Data Model (Indicative)
- **User**: id, email, email_verified, google_id?, username (unique), avatar_url?, created_at
- **Post**: id, url (unique), domain, headline_exact, lede_exact, summary_conservative_md, tags[] (allowlist), created_by, created_at, status, star_count_cached
- **Star**: id, user_id, post_id, created_at (unique composite on user+post)
- **WhitelistDomain**: domain (unique), added_at, added_by
- **BlacklistDomain**: domain (unique), reason, added_at, added_by
- **DomainReview**: id, domain, status, monthly_visitors_reported, evidence_url, legitimacy_assessment, decided_by, decided_at
- **AuditLog**: moderation actions; actor_id?, action, entity_type, entity_id, meta, created_at
- **RateLimitCounters**: keys per scope (global/ip/user+action)

**Indexes & Extensions**
- Unique on Post.url
- GIN on tags[] (or join table with appropriate indexes)
- pg_trgm for fuzzy/similarity search on headline & summary
- Optional pgvector for cosine similarity later

## 6) Article Extraction Method (Robust & Polite)

**Goal**: Extract headline, lede, and body-after-lede cleanly and safely.

### Politeness & Safety
- **robots.txt**: obey RFC 9309; cache per host.
- **SSRF protections**: allow only http/https; DNS resolve then reject private/loopback IPs; limit redirects; 10s timeout; 1 MB max.
- **Respect paywalls**—no circumvention. If content isn’t publicly in HTML, we fail gracefully.

### Fetch & Normalize
- Request desktop HTML (no JS execution).
- Normalize URL: strip UTM, anchors; keep canonical if present.
- If AMP exists, consider as a fallback (often cleaner markup).

### Structured Data First
- Parse JSON-LD schema.org/Article: use headline, description (often the dek), articleBody, datePublished.
- **Social Meta Fallback**
    - Open Graph: og:title, og:description; Twitter: twitter:title, twitter:description.

### Readability Heuristics
- Run Mozilla Readability on the DOM to isolate main content.
- Use its title if needed; treat first substantive paragraph as the lede when no dek is present; everything after p₁ is body-after-lede.

### Cleanup & Validation
- Sanitize with sanitize-html; collapse whitespace; keep emphasis marks.
- Validate non-empty, sensible length caps; if paywalled/empty, abort.

### Store & Cache
- Persist headline (exact), lede (exact), and clean body-after-lede.
- Cache by (normalized_url, content_hash, extractor_version) to avoid rework.

### Libraries Used (Worker)
- undici (HTTP client), tldts (domain parsing)
- jsdom + @mozilla/readability (extraction)
- sanitize-html (safety)
- JSON-LD / meta parsing helpers for schema.org + OG/Twitter

## 7) AI Integration (Prod vs Dev)
- **Dev/CI**: No LLM calls.
    - MockAiProvider with deterministic fixtures.
    - Response Picker UI appears when an “AI step” would happen; developer chooses a response which the app uses.
- **Production**: Real LLM via LiteLLM Proxy, server-side only (Worker).
    - Approval/Denial decision (policy prompt).
    - Conservative summary (Markdown) of body-after-lede.
    - Tag selection from the hard-coded allowlist.

### Control & Safety
- **Budget guard**: start with MAX_DAILY_COST_USD=$5 (adjustable). Track tokens in/out and per-day spend; switch to fallback if exceeded.
- **Caching**: cache outputs by (url_norm, model, prompt_version) for 30–90 days.
- **Timeouts**: e.g., 15s per call; 2 retries on 429/5xx with backoff.
- **Kill switch**: LLM_ENABLED=false flips to rule-based short fallback without redeploy.
- **Prompt versioning**: prompts stored in versioned files; version included in cache keys; rollbackable.

## 8) Security & Compliance

### Network & Proxy
- Caddy TLS (Let’s Encrypt), HSTS, strict security headers.
- UFW firewall: 80/443 open; SSH restricted; fail2ban for SSH.

### API Security
- Zod validation at boundaries; sanitize inputs; SSRF protections for fetcher.
- JWT validation; CSRF protections for stateful forms.

### Rate Limiting
- Redis-backed limits (global, per-IP, per-user) for login, submit, star, and filter routes.

### Secrets
- Never in repo/images. Stored as env/secrets on the VM.

### Audit & Governance
- Audit log for moderation/domain decisions.
- Pre-commit secret scanning (gitleaks); CI container scanning (Trivy).

### Legal & Policy
- **Fair use**: headline & lede exactly; conservative summary; link to source. Prepare DMCA/takedown workflow.
- **Defamation/safety**: avoid false claims on private individuals; keep moderation trails.

## 9) Performance & Similarity
- **Popularity windows**: Redis sorted sets for hour/day/week/month/year; periodic compaction to Postgres; cached star_count_cached.
- **Similar posts**: Tags Jaccard + pg_trgm similarity on headline/summary; optional pgvector later.
- **Caching**: Response and route caching in Next.js; prefetch on hover; self-hosted fonts with font-display: swap.

## 10) SEO & Crawlability
- SSR metadata via generateMetadata() per page (title, description, canonical, OG/Twitter tags—no images).
- Structured data: ItemList for feed; Article/Report with isBasedOn for article pages (cautious as aggregator).
- sitemap.xml via next-sitemap; /robots.txt route.
- Clean URLs: /p/{slug-or-id}, /u/{username}, /tag/{tag}, /contribute.

## 11) Backups & Disaster Recovery
- **Postgres (canonical)**
    - Nightly pg_dump compressed dumps to /ops/backups with rotation (e.g., keep 14).
    - Monthly restore drill to verify.
    - Optional: wal-g to DigitalOcean Spaces for weekly base + WAL (PITR).
- **Redis**
    - Treated as ephemeral. Optional AOF everysec for convenience. App recovers if Redis is wiped.
- **Infra**
    - VM snapshots optional; config in repo; secrets off-repo.

## 12) Dev Experience (DX) & Hot Reload
- **Local boot**:
    - docker compose up -d (postgres, redis, mailhog, caddy)
    - pnpm -w prisma migrate dev && pnpm -w db:seed
    - pnpm -w dev (web/api/worker hot-reload)
- **Hot-reload**:
    - Frontend: Next.js Fast Refresh (RSC + client components).
    - Backend: NestJS via nodemon/tsx.
    - Worker: nodemon/tsx.
- **Dev auth**: MailHog at http://localhost:8025 for magic links.
- **Dev AI**: Response Picker UI; no real calls.

## 13) Testing & CI/CD
- **Unit**: Vitest/Jest for utilities and services.
- **Integration**: Testcontainers spins Postgres/Redis; run Prisma migrations; test API endpoints and worker flows.
- **E2E**: Playwright drives login, submit, approval mock, publish, star, filter, domain review.
- **Contracts**: Generate OpenAPI from Zod; snapshot in CI to detect breaking changes.
- **CI (GitHub Actions)**:
    - Typecheck, lint, tests (unit+integration+E2E)
    - Build Docker images (web/api/worker)
    - prisma migrate deploy against a temp DB for safety
    - Publish images to GHCR
- **Deploy (master = prod)**:
    - Pull images on VM; run migrations; health check; restart containers (safe choreography).

## 14) Coding Standards & Governance
- **Style**: TypeScript strict: true; ESLint + Prettier (central config); no ts-ignore in CI.
- **Commits**: Conventional Commits; commitlint; Changesets (if versioning packages).
- **Coverage**: Enforce thresholds; no regressions.
- **Contributing**: Code of Conduct; PR template; issue templates; required CI green.
- **ADRs**: Short Architecture Decision Records for major choices (VM hosting, LiteLLM, Prisma, BullMQ).
- **README**: Opens with “This project is a tribute to Charlie Kirk” and states our intended impact.

## 15) API Surface (High-Level)
- **Auth**: /api/auth/* (NextAuth), /api/session
- **Posts**: POST /api/posts/submit (URL) → handles lists, extraction, LLM (prod), mocks (dev); GET /api/posts (filters: sort/popular window/tags); GET /api/posts/:id
- **Stars**: POST /api/posts/:id/star (toggle)
- **Domains**: GET /api/domains/whitelist/…; POST /api/domains/review (footer form); PATCH /api/domains/review/:id (admin)
- **Profiles**: GET /api/users/:username; GET /api/users/:username/posts; GET /api/users/me/starred
- **Health & Meta**: /api/health, /api/docs (Swagger UI)
- All endpoints validated with Zod; OpenAPI generated from Zod schemas (single source).

## 16) Roll-Out & Scaling
- **Phase 1 (MVP, one VM)**: Current plan — runs comfortably on 2 vCPU / 4 GB.
- **Phase 2 (growth)**: Increase VM size (8 GB RAM), add pgBouncer if needed.
- **Phase 3 (split DB)**: Move Postgres to its own VM or managed service; keep app+worker on original VM.
- **Phase 4 (multi-VM)**: Introduce a load balancer; run web/api/worker on multiple VMs; externalize Redis and Postgres.

## 17) Acceptance Criteria (Go-Live)
- Log in (Google + Email magic link) works locally and in prod.
- Submit URL respects blacklist/whitelist logic; dev uses mock UI; prod uses LLM.
- Approved post shows exact headline & lede, conservative Markdown summary, tags, share link, similar posts.
- Home feed: Recent, Most Starred, Popular with hour/day/week/month/year windows and tag multi-select.
- Profiles: unique usernames, public posts, owner’s Starred tab.
- Footer: Domain Review popup; sitemap; robots.txt and sitemap.xml served.
- Rate limits enforced; CSP/HSTS in place.
- Backups running; monthly restore tested.
- Prod: LiteLLM Proxy live with budget guard ($5/day), caching, and kill switch.
- CI green: typecheck, lint, unit, integration, E2E, OpenAPI snapshot.

## 18) Editorial & Legal Guardrails (Operational)
- **Editorial**: Unflinching extremely conservative summaries; copy headline & lede exactly; link to original.
- No images on posts; text-only presentation.
- **Compliance**: Respect robots.txt; do not bypass paywalls; fair-use posture (headline/lede exact, linked source, our commentary); DMCA/takedown process ready.
- **Safety**: Avoid publishing false claims about private individuals; keep clear moderation trails.

## Final Word
This design puts our worldview front and center with a clean, professional news experience and a ruthlessly developer-friendly stack. It honors local-first development (no LLM in dev), real AI in production (budget-capped, cached, multi-model without markup), and serious engineering standards—so contributors and AI coding agents can move fast without breaking the mission.