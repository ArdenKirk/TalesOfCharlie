import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { parse as parseUrl } from 'node:url';
import sanitizeHtml from 'sanitize-html';
import pino from 'pino';

const log = pino({ name: 'extractor' });

export interface ExtractedArticle {
  headline: string;
  lede: string;
  rest: string;
  domain: string;
}

export async function fromUrlExtract(url: string): Promise<ExtractedArticle> {
  const logContext = { url };

  try {
    log.info(logContext, 'starting article extraction');

    // Step 1: Fetch with security and politeness considerations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'TalesOfCharlie/1.0 (bot@talesofcharlie.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('text/html')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      // Step 2: Parse HTML and clean up
      const dom = new JSDOM(html, { url });

      // Remove common ads and UI elements
      const elementsToRemove = [
        'nav', 'header', 'footer', '.ad', '.advertisement', '.sidebar',
        '.social-share', '.comments', '.newsletter', '.related-posts',
        '.nav', '.footer', '.ads', '#footer', '#header', '#nav'
      ];

      elementsToRemove.forEach(selector => {
        dom.window.document.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Step 3: Readability extraction
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article) {
        throw new Error('Could not parse article content');
      }

      log.info({ ...logContext, title: article.title }, 'readability extraction completed');

      // Step 4: Extract components
      const headline = extractHeadline(article, html);
      const lede = extractLede(article);
      const rest = extractRest(article, lede);
      const domain = extractDomain(url);

      // Step 5: Validation
      if (!headline || headline.trim().length < 2) {
        throw new Error('Could not extract valid headline');
      }

      if (!lede || lede.trim().length < 5) {
        throw new Error('Could not extract valid lede');
      }

      const result = { headline, lede, rest, domain };
      log.info({ ...logContext, headlineLength: headline.length }, 'article extraction successful');

      return result;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      log.error({ ...logContext, error: (fetchError as Error).message }, 'fetch failed');
      throw fetchError;
    }
  } catch (error) {
    log.error({ ...logContext, error: (error as Error).message }, 'article extraction failed');
    throw error;
  }
}

function extractHeadline(article: any, html: string): string {
  // Try Readability title first
  if (article.title && article.title.trim().length > 0) {
    return sanitizeHtml(article.title, { allowedTags: [], allowedAttributes: {} })
      .trim()
      .slice(0, 200); // Reasonable limit
  }

  // Fallback to common selectors
  const fallbackSelectors = [
    'h1', '.headline', '.title', 'title',
    '[property="og:title"]', '[name="twitter:title"]'
  ];

  const dom = new JSDOM(html);
  for (const selector of fallbackSelectors) {
    const element = dom.window.document.querySelector(selector);
    if (element) {
      const text = element.textContent || (element as HTMLElement).getAttribute('content') || '';
      if (text.trim().length > 0) {
        return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} })
          .trim()
          .slice(0, 200);
      }
    }
  }

  return 'No headline found';
}

function extractLede(article: any): string {
  // Try article.byline or first paragraph after title
  if (article.byline) {
    return sanitizeHtml(article.byline, { allowedTags: [], allowedAttributes: {} })
      .trim()
      .slice(0, 300);
  }

  // Extract first substantive paragraph from content
  const content = article.content || '';
  const paragraphs = content.split(/<\/?p[^>]*>/);

  for (const paragraph of paragraphs) {
    const cleanPara = sanitizeHtml(paragraph, { allowedTags: [], allowedAttributes: {} })
      .trim();

    // Good lede candidates: not too short, not too long, starts with capital
    if (cleanPara.length >= 20 && cleanPara.length <= 500 &&
        /^[A-Z]/.test(cleanPara)) {
      return cleanPara;
    }
  }

  // Fallback: excerpt from beginning of content
  const cleanContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })
    .trim();

  return cleanContent.slice(0, 300) + (cleanContent.length > 300 ? '...' : '');
}

function extractRest(article: any, lede: string): string {
  const content = article.content || '';

  // Remove the lede from the content to get "rest"
  const contentWithoutLede = content.replace(new RegExp(`^.*?${sanitizeHtml(lede.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), { allowedTags: [], allowedAttributes: {} }).slice(0, 100)}.*?(\\s*<)`,
                                                       'i'), '');

  return sanitizeHtml(contentWithoutLede, {
    allowedTags: ['em', 'strong', 'a'],
    allowedAttributes: { 'a': ['href'] }
  }).trim();
}

function extractDomain(url: string): string {
  try {
    const parsed = parseUrl(url);
    return parsed.hostname || '';
  } catch {
    return '';
  }
}
