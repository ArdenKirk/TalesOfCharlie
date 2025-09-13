# Tales Of Charlie - Technical Context

## Technology Stack

### Frontend (Next.js App Router)
- **Framework**: Next.js 15.5.3 with TypeScript
- **React Version**: React 19.1.0
- **UI Framework**: TailwindCSS 4.x
- **State Management**: TanStack Query for server state
- **Styling**: TailwindCSS with PostCSS configuration
- **Routing**: Next.js App Router (server components by default)

### Backend API
- **Framework**: NestJS with Fastify
- **Language**: TypeScript strict mode
- **Validation**: Zod schemas for runtime validation and API contracts
- **Documentation**: OpenAPI generation from Zod schemas
- **Authentication**: NextAuth.js (Google OAuth + magic link)
- **Logging**: Pino for structured logging

### Worker System
- **Queue Management**: BullMQ 5.58.5
- **Runtime**: Node.js with tsx for TypeScript execution
- **Job Types**: Article processing, AI moderation, domain management

### Database Layer
- **ORM**: Prisma ORM with type-safe client
- **Database**: PostgreSQL 16
- **Extensions**: pg_trgm for fuzzy text search, optional pgvector
- **Caching**: Redis 7 for rate limiting and popularity windows

### Data Processing & AI
- **Content Extraction**: Mozilla Readability + JSDOM for article parsing
- **HTML Safety**: sanitize-html for content sanitization
- **HTTP Client**: Undici for fast, secure requests
- **Domain Parsing**: tldts for reliable domain extraction
- **AI Integration**: LiteLLM proxy (production) with rate limiting and caching

### Development & Operations
- **Package Manager**: pnpm 10.16.0 with workspaces
- **Build Tool**: Turbo 2.5.6 for monorepo orchestration
- **Containerization**: Docker Compose for local development
- **Reverse Proxy**: Caddy 2.x with automatic TLS and HTTP/2
- **Development Server**: Hot reload with tsx/ts-node
- **Version Control**: Git with conventional commits

## Development Environment

### Local Setup
- **Script**: `ops/dev.sh` provides comprehensive dev environment
- **Services**: PostgreSQL, Redis, MailHog (email testing), Caddy proxy
- **Auto-Setup**: Automatic Prisma generation/migration/seed on startup
- **Health Checks**: Waits for API health endpoint before declaring ready

### Development Workflow
```bash
# Start complete dev environment
cd ops && ./dev.sh up

# Development mode (hot reload)
pnpm dev    # runs all services in parallel via Turbo

# Database operations
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Apply migrations
pnpm db:seed      # Seed database

# Individual service development
cd apps/web && pnpm dev     # Next.js development server
cd apps/api && pnpx tsx     # API development server
cd apps/worker && pnpx tsx   # Worker development server
```

### Key Development Features
- **AI Mode Toggle**: `AI_MODE=mock` (dev) vs `AI_MODE=real` (prod)
- **Mock UI**: Response Picker for simulating AI decisions in development
- **Docker Parity**: Same containers for local development and production
- **Volume Mounting**: Live code updates without container rebuild

## Production Environment

### Infrastructure
- **Hosting**: DigitalOcean Basic Droplet (2 vCPU / 4 GB RAM / 80 GB SSD)
- **Region**: NYC3 (US East Coast for optimal performance)
- **Container Orchestration**: Docker Compose production config
- **DNS & TLS**: Caddy handles Let's Encrypt certificates

### Deployment
- **Build Process**: GitHub Actions CI/CD
- **Container Registry**: GitHub Container Registry (GHCR)
- **Deployment Script**: `ops/prod.sh` for seamless production updates
- **Zero Downtime**: Rolling updates with health checks

## Database Schema

### Core Entities
- **Users**: Authentication, profiles (Google OAuth + magic links)
- **Posts**: Articles with verbatim headlines/lede + conservative summaries
- **Stars**: User engagement (likes/favorites)
- **Domains**: Whitelist/blacklist management
- **DomainReviews**: Community domain submission workflow

### Key Relationships
- User ↔ Posts: One-to-many (creator relationship)
- User ↔ Stars: One-to-many (engagement relationship)
- Post ↔ Stars: One-to-many (popularity tracking)

## AI Integration Architecture

### Development Mode
- **Response Picker UI**: Manual selection from predefined response sets
- **Mock Provider**: Deterministic fixtures for consistent testing
- **No External Calls**: Completely offline AI simulation

### Production Mode
- **LiteLLM Proxy**: Single endpoint for multiple LLM providers
- **Caching**: Results cached by URL + content hash + model version
- **Rate Limiting**: Budget controls with fallback strategies
- **Worker Processing**: Async article evaluation and summarization

## Content Processing Pipeline

### Article Intake
1. **URL Submission**: User pastes article URL
2. **Domain Check**: Quick blacklist/whitelist validation
3. **Content Extraction**: Safe, polite scraping respect robots.txt
4. **Text Processing**: Verbatim headline/lede capture
5. **AI Evaluation**: Approval/denial decision + conservative summary
6. **Tag Assignment**: Automatic categorization from allowlist
7. **Publishing**: Database storage and user feed update

### Key Processing Features
- **Idempotency**: URL hash prevents duplicate processing
- **Safety**: SSRF protection, robots.txt compliance
- **Performance**: Fast async processing without blocking UI
- **Reliability**: Error handling and retry mechanisms

## Performance & Scalability

### Current Architecture Scales To
- **Users**: Thousands of daily active users
- **Articles**: Hundreds per day through worker queues
- **Concurrency**: Multiple workers processing simultaneously
- **Database**: PostgreSQL optimizations for text search and tags

### Future Scale Considerations
- **Vertical Scaling**: Increase droplet capacity (8GB RAM target)
- **Database Separation**: External PostgreSQL service
- **Worker Scaling**: Multiple worker instances
- **CDN Integration**: Static asset optimization

## Security Architecture

### Network Layer
- **SSL/TLS**: Automatic Let's Encrypt via Caddy
- **Firewall**: UFW with minimal required ports
- **Rate Limiting**: Redis-based per-user/IP limits
- **Security Headers**: CSP, HSTS, XSS protection

### API Security
- **Authentication**: JWT tokens with refresh rotation
- **Authorization**: Role-based access for moderation
- **Input Validation**: Zod schemas prevent injection attacks
- **Audit Logging**: All moderation actions tracked

### Content Security
- **HTML Sanitization**: All user content passed through sanitize-html
- **Domain Validation**: Approved source lists prevent malicious content
- **YOLO Moderation**: AI + community review workflow

## Development Standards

### Code Quality
- **TypeScript**: Strict mode with no `any` without explicit TODO
- **Linting**: ESLint + Prettier with monorepo configuration
- **Imports**: Organized by type (external, internal, relative)
- **Architecture**: Domain-driven design with shared types

### Testing Strategy
- **Unit Tests**: Vitest for utility functions and business logic
- **Integration Tests**: Testcontainers for API/database workflow
- **E2E Tests**: Playwright for complete user journeys
- **Contract Tests**: OpenAPI snapshots verify API stability

### CI/CD Pipeline
- **Build**: Typecheck, lint, unit tests (parallel turbo jobs)
- **Integration**: Database setup with migrations and seeding
- **Deployment**: Image build and registry push
- **Monitoring**: Health checks and performance baselines

## Container Architecture

### Service Decomposition
- **web**: Next.js server with SSR and static assets
- **api**: NestJS API server with business logic
- **worker**: Queue processor for background tasks
- **postgres**: Database with pg_trgm for fuzzy search
- **redis**: Cache and queue storage
- **caddy**: Reverse proxy and SSL termination

### Docker Optimization
- **Multi-stage Builds**: Optimized for small production images
- **Layer Caching**: Dependencies cached separately from source
- **Volume Mounting**: Live updates without rebuild in development
- **Health Checks**: Graceful shutdown and startup coordination

*Last Updated: September 2025*
