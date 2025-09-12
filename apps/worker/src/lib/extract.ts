import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { parse as parseUrl } from 'node:url';
import sanitizeHtml from 'sanitize-html';

export async function fromUrlExtract(url: string) {
    // TODO: robots.txt & SSRF checks; AMP fallback; JSON-LD & OG first
    const res = await fetch(url, { redirect: 'follow' });
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const headline = article?.title || '';
    // crude: first paragraph = lede; refine later
    const paragraphs = (article?.content || '').split('</p>');
    const lede = sanitizeHtml(paragraphs[0] || '', { allowedTags: [], allowedAttributes: {} }).trim();
    const rest = sanitizeHtml(paragraphs.slice(1).join('</p>'), { allowedTags: [], allowedAttributes: {} }).trim();
    const domain = parseUrl(url).hostname || '';
    return { headline, lede, rest, domain };
}
