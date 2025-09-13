# Tales of Charlie

Tales of Charlie (talesofcharlie.com) is a tribute to Charlie Kirk and a mission-driven, open-source project to document and counter media bias and hatred against conservatives, Americans and every day normal people.

## 📋 What This Project Does

- **News Aggregation**: Collects articles from conservative and left-wing sources
- **Conservative Summaries**: Uses AI to generate extremely conservative interpretations of news content (production only)
- **Moderation**: AI-powered domain approval and content moderation
- **Domain Review**: Community-driven submission of domains for whitelist inclusion
- **User Profiles**: Custom usernames with public profiles and starred posts

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router, RSC) - SSR for SEO and performance
- **React 19** - Modern component library
- **Tailwind CSS** + **Radix UI** + **shadcn/ui** - Accessible, professional UI
- **TypeScript** - Type safety throughout

### Backend
- **NestJS** + **Fastify** - High-performance API server
- **Zod** - Runtime validation and OpenAPI generation
- **Auth.js/NextAuth** - Google OAuth + Email magic links

### Data & Jobs
- **PostgreSQL 16** + **Prisma** - ACID database with migrations
- **Redis 7** - Caching, rate limiting, job queues
- **BullMQ** - Background job processing

### Infrastructure
- **Docker & Compose** - Local ↔ production parity
- **Caddy** - TLS termination and reverse proxy
- **LiteLLM Proxy** - Multi-model AI gateway (production)

### Development
- **pnpm** - Fast package manager
- **Turbo** - Build system optimization
- **Mock AI Provider** - No LLM calls in development

## 🏗️ Project Structure

```
tales-of-charlie/
├── apps/
│   ├── web/         # Next.js application (SSR, SEO)
│   ├── api/         # NestJS REST API (OpenAPI, Auth)
│   └── worker/      # BullMQ background jobs
├── packages/
│   ├── db/          # Prisma schema, migrations, seed
│   ├── types/       # Shared TypeScript + Zod schemas
│   ├── ui/          # Reusable components (shadcn)
│   └── ai-mocks/    # Deterministic AI fixtures (dev-only)
├── ops/             # Docker configs, scripts, deployment
├── docs/            # Technical documentation
└── memory-bank/     # Project context and decisions
```

## 🛠️ Getting Started

### Prerequisites
- **Docker & Docker Compose** (for full stack)
- **pnpm** (recommended) or **npm**
- **Node.js 20+**

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ArdenKirk/TalesOfCharlie.git
   cd TalesOfCharlie
   ```

2. **Start development environment:**
   ```bash
   cd ops
   ./dev.sh up
   ```

   This command will:
   - Start PostgreSQL, Redis, and MailHog containers
   - Run Prisma migrations and seed the database
   - Start the web, API, and worker services
   - Open the application at http://localhost

3. **Access the application:**
   - **Web App**: http://localhost
   - **API Health**: http://localhost/api/health
   - **MailHog**: http://localhost:8025 (for testing email)

### Alternative Commands

```bash
# Individual services
pnpm dev        # Start all services (no containers)
pnpm build      # Build all workspaces
pnpm test       # Run all tests

# Database
pnpm db:migrate # Apply migrations
pnpm db:seed    # Seed database

# Dev environment
cd ops
./dev.sh logs   # View all service logs
./dev.sh ps     # Service status
./dev.sh reset  # Reset containers and data
```

## 🎯 Development Workflow

### AI Integration
- **Development**: Uses mock AI responses via Response Picker UI
- **Production**: Real LLM via LiteLLM proxy ($5 daily budget)
- **No LLM calls** in development environment

### Code Standards
- **TypeScript strict**: No `any` types in business logic
- **ESLint + Prettier**: Automated formatting
- **Conventional commits**: Structured version history
- **Zod schemas**: Single source for API validation and docs

## 📖 Documentation

- **[Technical Design](docs/technical_design.md)** - Complete system architecture
- **[Coding Standards](.clinerules/CodingStandards.md)** - Code style and practices
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute

## 🤝 Contributing

We welcome contributions! Every contributor can participate completely anonymously - no real name required, no email verification, and no git commit signing needed. Use pseudonymous usernames or pseudonymous email addresses if you prefer to remain anonymous.

Please see our [contributing guide](CONTRIBUTING.md) for details on:

- Development setup and workflow
- Code standards and best practices
- Pull request process
- Issue reporting and feature requests

## ⚡ Core Features

### Article Submission & Moderation
- **URL Submission**: User pastes article URLs
- **Domain Pre-check**: Automatic blacklist/whitelist verification
- **AI Moderation**: Content analysis and approval (production)
- **Conservative Summaries**: AI-generated conservative interpretations

### Content Management
- **Exact Headlines & Lede**: Copied verbatim from source
- **Markdown Formatting**: Professional, readable summaries
- **Tag System**: Fixed allowlist with intelligent assignment
- **Original Links**: Prominent links to source articles

### User Experience
- **Popular Windows**: Hour, Day, Week, Month, Year rankings
- **Tag Filtering**: Multi-select content filtering
- **Star System**: User engagement and ranking
- **Domain Reviews**: Community submissions for consideration

## 🔒 Security & Compliance

- **robots.txt Respect**: Honors site crawl directives
- **SSRF Protections**: Secure URL fetching
- **Rate Limiting**: Redis-backed request throttling
- **Input Sanitization**: HTML and content validation
- **Audit Logs**: Complete moderation tracking

## 📄 License

Licensed under [PolyForm Noncommercial 1.0.0](LICENSE.md).

Please see the [Contributor License Agreement](CLA.md) for terms governing contributions.
