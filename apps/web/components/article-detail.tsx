'use client';

import { Post } from '@toc/types';
import { StarButton } from './star-button';
import Link from 'next/link';

interface ArticleDetailProps {
  article: Post;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <article className="bg-white">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-news-concrete">
        <Link href="/" className="hover:text-news-navy transition-colors">Home</Link>
        <span className="mx-2">•</span>
        <span className="px-2 py-1 bg-news-silver/30 text-news-steel rounded-sm text-xs font-medium uppercase tracking-wide">
          {article.domain}
        </span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        {/* Headline - Newspaper Style Serif */}
        <h1 className="text-4xl lg:text-5xl font-bold text-news-charcoal headline-serif mb-6 leading-tight">
          {article.headlineExact}
        </h1>

        {/* Byline and Metadata */}
        <div className="flex flex-wrap items-center text-sm text-news-concrete mb-6 pb-6 border-b border-news-silver/40">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0 flex-wrap">
            <span className="byline-text font-medium">
              By <Link href={`/user/${article.createdByUser.username}`} className="text-news-navy hover:text-conservative-red transition-colors">{article.createdByUser.username}</Link>
            </span>
            <span className="text-news-silver">•</span>
            <time dateTime={article.createdAt.toISOString()} className="text-news-concrete byline-text">
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </time>
            <span className="text-news-silver">•</span>
            <span className="px-3 py-1 bg-news-silver/50 text-news-steel rounded-sm text-xs font-medium byline-text uppercase tracking-wide">
              {article.domain}
            </span>
          </div>
        </div>

        {/* Lede - Professional newspaper lead paragraph */}
        <div className="mb-8">
          <p className="text-xl lg:text-2xl text-news-charcoal body-sans font-medium mb-6 leading-relaxed border-l-4 border-conservative-red pl-6">
            {article.ledeExact}
          </p>
        </div>
      </header>

      {/* Original Article Link - Prominent placement */}
      <div className="mb-8 p-4 bg-news-silver/10 border border-news-silver rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-news-charcoal mb-2">Read the Original Article</h3>
            <p className="text-sm text-news-steel mb-3">
              View the source material before reading our conservative analysis
            </p>
          </div>
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-news-navy text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-news-charcoal transition-colors inline-flex items-center flex-shrink-0 ml-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Original
          </Link>
        </div>
      </div>

      {/* Conservative Analysis Section */}
      {article.summaryConservativeMd && (
        <div className="mb-8">
          <div className="bg-conservative-red/5 border-l-4 border-conservative-red rounded-r-lg overflow-hidden">
            {/* Section Header */}
            <div className="bg-conservative-red/10 px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-conservative-red rounded-sm flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-conservative-red headline-serif uppercase tracking-wide">
                  Conservative Analysis
                </h2>
              </div>
              <p className="text-sm text-conservative-red/80 mt-2">
                A professional conservative perspective on the story and its implications
              </p>
            </div>

            {/* Analysis Content */}
            <div className="px-6 py-6">
              <div className="text-lg text-news-charcoal body-sans leading-relaxed prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: article.summaryConservativeMd
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-conservative-red font-semibold">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="text-conservative-red/90">$1</em>')
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                      .replace(/^/, '<p class="mb-4">')
                      .replace(/$/, '</p>')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-semibold text-news-charcoal mb-4 headline-serif">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="px-3 py-2 bg-news-silver/50 text-news-steel text-sm rounded-sm border border-news-silver/60 font-medium hover:bg-news-navy hover:text-white hover:border-news-navy transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Article Actions */}
      <div className="flex items-center justify-between py-6 border-t border-news-silver/40 mb-8">
        <div className="flex items-center space-x-4">
          <StarButton
            postId={article.id}
            initialStarCount={article.starCountCached}
          />
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.headlineExact,
                  text: article.ledeExact,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                // Could add a toast notification here
              }
            }}
            className="flex items-center text-news-steel hover:text-news-navy font-medium transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Article
          </button>
        </div>

        <div className="text-news-silver text-xs font-mono">
          ID: {article.id.slice(0, 8)}
        </div>
      </div>

      {/* Editorial Note */}
      <div className="bg-news-silver/5 border border-news-silver/30 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-news-navy rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TC</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-news-charcoal mb-2 headline-serif">Editorial Note</h3>
            <p className="text-sm text-news-steel body-sans leading-relaxed">
              Tales of Charlie provides conservative analysis of media content to document bias and offer alternative perspectives. 
              We reproduce headlines and ledes exactly as published, then provide our own commentary and analysis. 
              This is a tribute to Charlie Kirk and his work exposing liberal media bias.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
