# Contributing to Tales of Charlie

Thank you for your interest in contributing to Tales of Charlie! This document provides guidelines and information for contributors.

## 🙏 Code of Conduct

This project follows a strict code of conduct. All contributors must agree to our [Contributor License Agreement (CLA)](CLA.md) which grants the project owner broad rights to use and distribute contributions.

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (for full stack development)
- **pnpm** (recommended) or **npm**
- **Node.js 20+**
- **Git**

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/TalesOfCharlie.git
   cd TalesOfCharlie
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development environment:**
   ```bash
   cd ops
   ./dev.sh up
   ```
   This starts all services and makes the app available at http://localhost

4. **Verify setup:**
   - Visit http://localhost (web app)
   - Check http://localhost/api/health (API health)
   - Visit http://localhost:8025 (MailHog for email testing)

## 🎯 Ways to Contribute

### 🐛 Work on Existing Issues
- Browse our [GitHub Issues](../../issues)
- Look for issues labeled `good first issue`, `help wanted`, or `beginner-friendly`
- Comment on the issue to indicate you're working on it

### 💡 Share Independent Ideas
Have a great idea for improving Tales of Charlie? We love creative contributions!

**How to share your idea:**
- **Start a Discussion**: Use [GitHub Discussions](../../discussions) to share your concept
- **Create a Feature Issue**: Open a new feature request with your idea
- **Prototype it**: Build a working prototype and submit it
- **No requirement to get approval first** - if you have a strong vision, show us what you've built!

We're flexible and welcome all kinds of ideas that align with our mission of providing high-quality conservative news commentary.

## 🏗️ Development Workflow

### 1. Choose an Issue
- Browse our [GitHub Issues](../../issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Development Process

#### Frontend (Next.js)
```bash
pnpm dev:web       # Start web app only
pnpm build:web     # Build web app
pnpm lint:web      # Lint web app
```

#### Backend (NestJS)
```bash
pnpm dev:api       # Start API server only
pnpm build:api     # Build API
pnpm lint:api      # Lint API
```

#### Database
```bash
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Create and apply migrations
pnpm db:seed       # Seed database with test data
```

#### Background Jobs (Worker)
```bash
pnpm dev:worker    # Start worker for background jobs
```

### 4. Testing

#### Run All Tests
```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode for development
```

#### Coverage
```bash
pnpm test:coverage # Generate coverage reports
```

### 5. Commit Standards

We use [Conventional Commits](https://conventionalcommits.org/):

```bash
# Feature commits
feat(web): add user authentication flow
feat(api): add article submission endpoint

# Bug fixes
fix(web): resolve tag filtering bug
fix(api): handle null domain validation

# Documentation
docs: update setup instructions
docs(readme): clarify installation process

# Refactoring
refactor(api): simplify error handling logic
refactor(db): optimize query performance

# Tests
test: add article submission integration tests
test(web): add e2e tests for login flow
```

### 6. Create Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub:**
   - Use our [Pull Request Template](../../pull_request_template.md)
   - Provide clear description of changes
   - Reference the issue number (e.g., "Closes #123")
   - Request review from maintainers

3. **CLA Agreement:**
   - All PRs require agreement to the CLA
   - Check the CLA checkbox in the PR template

## 📋 Code Standards

### TypeScript
- **Strict mode**: `strict: true` required
- **No `any` types** without documented justification
- **Explicit return types** on exported functions
- **Zod schemas** as single source for runtime validation

### Code Quality
- **ESLint + Prettier**: No exceptions
- **Logical, readable names**: `userId` over `uid`
- **Small functions**: Under 50 lines preferred
- **Single responsibility** per module

### Formatting (Auto-enforced)
```javascript
// ✅ Good
const getUserById = async (userId: string): Promise<User> => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  });
};

// ❌ Bad
const async function(uid){
  return prisma.user.findUnique({where:{id:uid}})
}
```

### Architecture Patterns

#### Data Flow
- **TypeScript types** → **Zod schemas** → **Prisma models** → **API endpoints**
- Single source of truth for all contracts

#### Error Handling
```typescript
// ✅ Consistent error handling
try {
  const result = await processArticle(url);
  return result;
} catch (error) {
  logger.error('Article processing failed', { url, error });
  throw new BadRequestException('Invalid article URL');
}
```

## 🧪 Testing Guidelines

### Unit Tests
- **Business logic** → Unit tests required
- **Utilities** → Unit tests required
- **Mock external dependencies**

### Integration Tests
- **Database operations** → Integration tests
- **API endpoints** → Test with real DB
- **Use Testcontainers** for isolated testing

### E2E Tests
- **Critical user flows** only
- **Playwright** for browser automation
- Limited scope to prevent brittleness

### Test Coverage
- **Target**: >80% coverage
- **Business logic**: Must be fully covered
- **Critical paths**: Must be covered

## 🐛 Bug Reports vs Feature Requests

### Bug Reports
**Do:**
- Use bug report template
- Include reproduction steps
- Provide screenshots/error messages
- Specify browser/OS
- Link to specific URLs

**Don't:**
- Open issues without clear reproduction steps
- Report expected behavior as bugs

### Feature Requests
**Do:**
- Use feature request template
- Explain user benefit
- Provide mockups if possible
- Check for existing discussions

**Don't:**
- Request breaking changes without justification
- Ignore existing issue/discussion processes

## 🔄 Pull Request Process

### Before Submitting
- [ ] **CLA Agreement** checked
- [ ] **Tests passing** (`pnpm test`)
- [ ] **Linting passing** (`pnpm lint`)
- [ ] **Type checking** (`pnpm typecheck`)
- [ ] **Changes documented** in relevant files
- [ ] **Migration files** if database schema changed
- [ ] **Environment variables** documented if added

### Review Process
1. **CI Checks** run automatically
2. **Code review** by maintainers
3. **Testing** in staging environment if needed
4. **Merge** with rebase (no merge commits)

### After Submission
- **Respond to feedback** within 3 business days
- **Re-request review** after changes
- **Update documentation** as needed

## 🛠️ Development Tools

### Essential Commands
```bash
# Full development start
cd ops && ./dev.sh up

# Individual services
pnpm dev:web     # Frontend only
pnpm dev:api     # Backend only
pnpm dev:worker  # Jobs only

# Database management
pnpm db:migrate  # Apply migrations
pnpm db:seed     # Seed test data
pnpm db:studio   # Prisma Studio GUI

# Quality assurance
pnpm lint        # Code linting
pnpm format      # Auto-format code
pnpm test        # Run tests
pnpm typecheck   # TypeScript checking

# Deployment
pnpm build       # Build all workspaces
cd ops && ./dev.sh reset  # Reset development environment
```

### Environment Overview
- **Development**: Mock AI responses, no real LLM calls
- **Staging**: Mirrors production environment
- **Production**: Real AI via LiteLLM proxy

### Useful Resources
- **[Technical Design](docs/technical_design.md)**: System architecture
- **[Coding Standards](.clinerules/CodingStandards.md)**: Style guide
- **[API Documentation](http://localhost/api/docs)**: OpenAPI spec (when running)

## 📞 Getting Help

### Discussion Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and design discussions
- **Pull Request comments**: Specific implementation questions

### When to Ask for Help
- **Documentation unclear**: Create issue or suggestion
- **Setup problems**: Check existing issues first
- **Architecture questions**: Use GitHub Discussions
- **Code review feedback**: Comment on PR

## 🎯 Areas for Contribution

### High Impact Areas
- **Performance optimization**
- **Accessibility improvements**
- **Security enhancements**
- **AI prompt engineering**
- **Database query optimization**

### Beginner Friendly
- **UI component improvements**
- **Test coverage expansion**
- **Documentation improvement**
- **Configuration optimization**
- **Error message clarity**

### Advanced
- **Infrastructure scaling**
- **AI integration improvements**
- **Database schema changes**
- **Multi-region deployment**

## ⚖️ Legal & Licensing

- **License**: PolyForm Noncommercial 1.0.0
- **CLA Required**: All contributions require CLA agreement
- **Patent Grant**: Contributors grant patent rights to owner
- **Ownership**: Owner receives full copyright for all contributions

Thank you for contributing to Tales of Charlie! Your work helps build a platform that serves our shared mission of conservative news aggregation and commentary.
