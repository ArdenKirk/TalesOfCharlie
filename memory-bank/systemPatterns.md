# Tales Of Charlie - System Patterns

## Architecture Patterns

### Monorepo Structure
```
/tales-of-charlie          # Root workspace
├── apps/                  # Application entry points
│   ├── web/              # Next.js frontend (SSR + client)
│   ├── api/              # NestJS backend (REST API)
│   └── worker/           # BullMQ processors (background jobs)
├── packages/             # Shared libraries
│   ├── db/               # Prisma schema + client
│   ├── types/            # Zod schemas + types
│   ├── ui/               # Reusable UI components
│   ├── config/           # Environment validation
│   ├── ai-mocks/         # Development fixtures
│   └── eslint-config/    # Shared linting rules
└── ops/                  # Operation configurations
```

### Separation of Concerns
- **Frontend (Next.js)**: UI rendering, routing, client state
- **API (NestJS)**: Business logic, authentication, data access
- **Worker (BullMQ)**: Async processing, AI integration, external APIs
- **Database (Prisma)**: Type-safe data access, migrations, queries

### Data Flow Patterns

#### Article Submission Flow
```
User Submit URL
    ↓
Domain Check (Sync)
    ↓ → Blacklisted? → Reject
    ↓
Worker Queue → Content Extraction
    ↓
AI Approval Decision (Mock/Real)
    ↓ → Denied? → Reject with message
    ↓
Generate Conservative Summary
    ↓
Assign Tags → Publish → UI Update
```

#### Content Processing Pipeline
1. **Input Validation**: URL format, domain existence
2. **Domain Gate**: Blacklist/whitelist check
3. **Content Extraction**: Safe scraping with robots.txt compliance
4. **AI Processing**: Approval + summarization (dev mocks/prod real)
5. **Publishing**: Database commit + cache invalidation

## Key Technical Decisions

### Next.js App Router Architecture
```typescript
// Server Components (default)
export default function ArticlePage() {
  const article = await db.post.findUnique() // Direct DB access
  return <ArticleUI data={article} />
}

// Client Components (interactive)
'use client'
export function ArticleActions() {
  const [liked, setLiked] = useState(false) // Client state
  return <LikeButton onClick={() => setLiked(!liked)} />
}
```

### Shared Type System
```typescript
// packages/types/schemas/post.ts
export const PostSchema = z.object({
  id: z.string(),
  headlineExact: z.string(),
  ledeExact: z.string(),
  summaryConservativeMd: z.string()
})

// Generated types and API contracts
export type Post = z.infer<typeof PostSchema>
```

### Environment Configuration
```typescript
// packages/config/index.ts
import { z } from 'zod'

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  AI_MODE: z.enum(['mock', 'real']),
  DATABASE_URL: z.string().url()
})

export const config = ConfigSchema.parse(process.env)
```

## Component Patterns

### UI Component Architecture
```typescript
// packages/ui/components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }))}>
      {children}
    </button>
  )
}
```

### HOC Patterns for Authentication
```typescript
// Higher-Order Component for auth protection
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>
) {
  return function AuthenticatedComponent(props: T) {
    const { data: session } = useSession()

    if (!session) return <LoginPrompt />

    return <Component {...props} />
  }
}

// Usage
const ProtectedArticlePage = withAuth(ArticlePage)
```

### Worker Job Processing
```typescript
// BullMQ job definition
interface ArticleSubmissionJob {
  url: string
  userId: string
  postId: string
}

// Worker processor
export async function processSubmission(job: Job<ArticleSubmissionJob>) {
  const { url, userId, postId } = job.data

  // Content extraction and AI evaluation
  const extractedData = await extractFromUrl(url)

  // Domain validation
  const domain = extractDomain(url)
  const domainStatus = await checkDomainStatus(domain)

  // AI evaluation (mock or real)
  const aiDecision = process.env.AI_MODE === 'real'
    ? await llmService.evaluateArticle(url, extractedData)
    : getMockAiDecision(url, extractedData)

  // Publish or deny based on AI decision
  await publishArticle(postId, extractedData, aiDecision)
}
```

## Data Access Patterns

### Repository Pattern
```typescript
// Repository interface
export interface PostRepository {
  findById(id: string): Promise<Post | null>
  findByUrl(url: string): Promise<Post | null>
  findPopular(window: TimeWindow): Promise<Post[]>
  create(data: CreatePostData): Promise<Post>
  update(id: string, data: UpdatePostData): Promise<Post>
}

// Prisma implementation
export class PrismaPostRepository implements PostRepository {
  findById(id: string) {
    return this.prisma.post.findUnique({ where: { id } })
  }
  // ... implementation
}
```

### Caching Strategy
```typescript
// Redis keys pattern
const CACHE_KEYS = {
  POST_BY_ID: (id: string) => `post:${id}`,
  POPULAR: (window: string) => `popular:${window}`,
  USER_POSTS: (userId: string) => `user:${userId}:posts`
}

// TTL configuration
const CACHE_TTL = {
  POST_DETAIL: 3600,    // 1 hour
  POPULAR_WINDOW: 300,  // 5 minutes
  USER_DATA: 1800       // 30 minutes
}
```

## Authentication Flow

### NextAuth.js Integration
```typescript
// API route for NextAuth
export { GET, POST } from 'packages/api/auth/[...nextauth]'

// Provider configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    session({ session, user }) {
      return { ...session, userId: user.id }
    }
  }
}
```

### API Route Protection
```typescript
// Protected API route
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Process authenticated request
  return NextResponse.json({ success: true })
}
```

## Queue Processing Patterns

### BullMQ Job Types
```typescript
export enum JobType {
  PROCESS_ARTICLE = 'process_article',
  GENERATE_SUMMARY = 'generate_summary',
  UPDATE_POPULARITY = 'update_popularity',
  INDEX_CONTENT = 'index_content'
}

// Job data structure
interface ProcessArticleJob {
  url: string
  userId: string
  source: 'manual' | 'api'
}

// Worker registration
await worker.add(
  JobType.PROCESS_ARTICLE,
  jobData,
  { priority: Priority.HIGH }
)
```

### Queue Health Monitoring
```typescript
// Health check for queue status
export async function getQueueHealth(queue: Queue) {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed()
  ])

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length
  }
}
```

## Error Handling Patterns

### API Error Responses
```typescript
// Standardized error responses
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
  }
}

// Usage in controllers
try {
  const result = await processArticle(url)
  return ApiResponse.success(result)
} catch (error) {
  if (error instanceof ApiError) {
    return ApiResponse.error(error.code, error.message, error.statusCode)
  }
  logger.error('Unexpected error', { error })
  return ApiResponse.error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}
```

### User-Friendly Error Messages
```typescript
// Domain-specific error messages
const ERROR_MESSAGES = {
  DOMAIN_BLACKLISTED: 'This source does not meet Tales of Charlie standards.',
  ARTICLE_DENIED: 'This article does not align with our editorial guidelines.',
  CONTENT_EXTRACTION_FAILED: 'Unable to extract content from the provided URL.',
  RATE_LIMIT_EXCEEDED: 'Too many submissions. Please try again later.'
}
```

## State Management

### Server State with TanStack Query
```typescript
// Query key factory
export const queryKeys = {
  posts: {
    all: () => ['posts'] as const,
    detail: (id: string) => ['posts', id] as const,
    popular: (window: string) => ['posts', 'popular', window] as const,
    user: (userId: string) => ['posts', 'user', userId] as const
  }
}

// Hook with optimistic updates
export function useLikePost() {
  return useMutation({
    mutationFn: (postId: string) => api.posts.like(postId),
    onMutate: (postId) => {
      // Optimistic update
      queryClient.setQueryData(
        queryKeys.posts.detail(postId),
        (old) => old && { ...old, likes: old.likes + 1 }
      )
    }
  })
}
```

## Testing Patterns

### Unit Test Structure
```typescript
// Function under test
export function validateArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && isValidDomain(parsed.hostname)
  } catch {
    return false
  }
}

// Unit test
describe('validateArticleUrl', () => {
  it('accepts valid HTTPS URLs', () => {
    expect(validateArticleUrl('https://example.com/article')).toBe(true)
  })

  it('rejects HTTP URLs', () => {
    expect(validateArticleUrl('http://example.com/article')).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(validateArticleUrl('not-a-url')).toBe(false)
  })
})
```

### Integration Test Pattern
```typescript
describe('Article Submission Flow', () => {
  let db: TestDatabase

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  afterEach(async () => {
    await db.cleanup()
  })

  it('processes submitted article successfully', async () => {
    // 1. Create test user
    const user = await db.users.create({ username: 'testuser' })

    // 2. Submit article URL
    const result = await api.posts.submit({
      url: 'https://example.com/test-article',
      userId: user.id
    })

    // 3. Verify processing
    expect(result.status).toBe('published')
    expect(result.headlineExact).toBeDefined()
    expect(result.ledeExact).toBeDefined()
  })
})
```

## Design System Patterns

### TailwindCSS Component Classes
```typescript
// Component variants with Tailwind
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)
```

### Icon System
```typescript
// Lucide icon wrapper with consistent sizing
interface IconProps {
  name: LucideIcon
  size?: 'sm' | 'md' | 'lg'
}

export function Icon({ name: IconComponent, size = 'md' }: IconProps) {
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return <IconComponent size={iconSize[size]} />
}
```

## API Design Patterns

### REST Resource Expansion
```typescript
// API endpoint with optional expansions
app.get('/api/posts', async (req, res) => {
  const { expand, limit = 20 } = req.query

  const posts = await postService.findMany({ limit })

  // Expand related data conditionally
  if (expand?.includes('author')) {
    // Add author data to each post
  }

  if (expand?.includes('stats')) {
    // Add engagement stats
  }

  res.json(posts)
})
```

### Pagination Standards
```typescript
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Usage in API responses
return {
  data: posts,
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false
  }
}
```

*Last Updated: September 2025*
