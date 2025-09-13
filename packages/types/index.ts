import { z } from 'zod';

// Post Status Enum
export const PostStatusSchema = z.enum(['PUBLISHED', 'DENIED', 'PENDING']);
export type PostStatus = z.infer<typeof PostStatusSchema>;

// Review Status Enum
export const ReviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'DENIED']);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

// Post Schema - matches our Prisma schema exactly
export const PostSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  domain: z.string(),
  headlineExact: z.string(),
  ledeExact: z.string(),
  summaryConservativeMd: z.string(),
  tags: z.array(z.string()),
  status: PostStatusSchema,
  createdAt: z.date(),
  createdByUserId: z.string().cuid(),
  createdByUser: z.object({
    id: z.string(),
    username: z.string(),
  }),
  starCountCached: z.number().int().min(0),
});

export type Post = z.infer<typeof PostSchema>;

// Create Post Input Schema - for submission endpoint
export const CreatePostInputSchema = z.object({
  url: z.string().url('Must be a valid URL').refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    'URL must use HTTP or HTTPS protocol'
  ),
  // We'll derive domain server-side from normalize-url
});

export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;

// Get Posts Input Schema - for query parameters
export const GetPostsInputSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
  sort: z.enum(['recent', 'popular', 'stars']).optional().default('recent'),
  tag: z.string().optional(),
});

export type GetPostsInput = z.infer<typeof GetPostsInputSchema>;

// Normalize and validate URL - this is a utility function
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.toString(); // Ensures consistent format
  } catch {
    throw new Error('Invalid URL format');
  }
}

// Extract domain utility
export function extractDomain(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Extract the domain without www or subdomains for consistent grouping
    const hostParts = url.hostname.split('.');
    const domain = hostParts.length >= 2
      ? `${hostParts[hostParts.length - 2]}.${hostParts[hostParts.length - 1]}`
      : url.hostname;
    return domain;
  } catch {
    throw new Error('Could not extract domain from URL');
  }
}

// Domain Management Schemas
export const WhitelistDomainSchema = z.object({
  domain: z.string(),
  addedAt: z.date(),
  addedBy: z.string().optional(),
});

export type WhitelistDomain = z.infer<typeof WhitelistDomainSchema>;

export const BlacklistDomainSchema = z.object({
  domain: z.string(),
  reason: z.string().optional(),
  addedAt: z.date(),
  addedBy: z.string().optional(),
});

export type BlacklistDomain = z.infer<typeof BlacklistDomainSchema>;

// Domain Review Schema
export const DomainReviewSchema = z.object({
  id: z.string(),
  domain: z.string(),
  status: ReviewStatusSchema,
  monthlyVisitorsReported: z.number().int().optional(),
  evidenceUrl: z.string().url().optional(),
  legitimacyAssessment: z.string().optional(),
  decidedBy: z.string().optional(),
  decidedAt: z.date().optional(),
  createdAt: z.date(),
});

export type DomainReview = z.infer<typeof DomainReviewSchema>;

// Create Domain Review Input
export const CreateDomainReviewInputSchema = z.object({
  domain: z.string(),
  monthlyVisitorsReported: z.number().int().min(100, 'Must report at least 100k monthly visitors'),
  evidenceUrl: z.string().url('Must provide evidence URL'),
});

export type CreateDomainReviewInput = z.infer<typeof CreateDomainReviewInputSchema>;

// Star Schema
export const StarSchema = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
  createdAt: z.date(),
});

export type Star = z.infer<typeof StarSchema>;

// API Response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

const DefaultPaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Basic paginated response type for API responses
export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: DefaultPaginationSchema,
});

// Helper to create specific paginated schemas  
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: DefaultPaginationSchema,
  });
}

// Brand types for Type Safety
export type Brand<T, B extends string> = T & { __brand: B };
export type Url = Brand<string, 'Url'>
export type Domain = Brand<string, 'Domain'>

// Validation helpers
export const isValidUrl = (url: string): url is Url => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

export const isConservativeDomain = (domain: string): boolean => {
  const knownConservativeDomains = [
    'foxnews.com',
    'nypost.com',
    'breitbart.com',
    'dailywire.com',
    'dailymail.co.uk',
    'nro.com',
    'townhall.com',
  ];
  return knownConservativeDomains.includes(domain);
};

export const isLeftLeanDomain = (domain: string): boolean => {
  const knownLeftDomains = [
    'cnn.com',
    'nytimes.com',
    'washingtonpost.com',
    'huffpost.com',
    'buzzfeed.com',
    'msnbc.com',
    'yahoonews.com',
  ];
  return knownLeftDomains.includes(domain);
};
