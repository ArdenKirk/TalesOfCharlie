'use client';

import { Post } from '@toc/types';
import { StarButton } from './star-button';
import Link from 'next/link';

interface ArticleCardProps {
  article: Post;
  onStarChange?: (articleId: string, starred: boolean, starCount: number) => void;
}

export function ArticleCard({ article, onStarChange }: ArticleCardProps) {
  const handleStarChange = (starred: boolean, starCount: number) => {
    if (onStarChange) {
      onStarChange(article.id, starred, starCount);
    }
  };

  return (
    <article className="bg-white border-b border-news-silver hover:bg-news-silver/5 transition-colors duration-200 p-6 sm:p-8">
      <div className="mb-6">
        {/* Headline - Newspaper Style Serif */}
        <h2 className="text-2xl lg:text-3xl font-bold text-news-charcoal headline-serif mb-4 leading-tight">
          <Link 
            href={`/article/${article.id}`}
            className="hover:text-news-navy transition-colors cursor-pointer"
          >
            {article.headlineExact}
          </Link>
        </h2>

        {/* Lede - Bolder, more prominent */}
        <p className="text-lg text-news-steel body-sans font-medium mb-6 leading-relaxed">
          {article.ledeExact}
        </p>

        {/* Source Link - Professional styling */}
        <div className="mb-6">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-news-navy hover:text-conservative-red font-medium transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Read Original Article
          </Link>
        </div>
      </div>

      {/* Conservative Analysis Section */}
      {article.summaryConservativeMd && (
        <div className="mb-8 bg-conservative-red/5 border-l-4 border-conservative-red p-4 rounded-r-sm">
          <div className="flex items-center mb-3">
            <span className="text-conservative-red">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            <h3 className="text-base font-bold text-conservative-red headline-serif ml-2 uppercase tracking-wide">
              Conservative Analysis
            </h3>
          </div>
          <div className="text-base text-news-charcoal body-sans leading-relaxed prose prose-headings:text-conservative-red prose-p:text-news-charcoal max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: article.summaryConservativeMd
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-conservative-red font-semibold">$1</strong>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
              }}
            />
          </div>
        </div>
      )}

      {/* Byline and Metadata - Professional Newspaper Style */}
      <div className="flex flex-wrap items-center justify-between text-sm text-news-concrete mb-6">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <span className="byline-text font-medium">by {article.createdByUser.username}</span>
          <span className="text-news-silver">•</span>
          <span className="px-2 py-1 bg-news-silver/30 text-news-steel rounded-sm text-xs font-medium byline-text uppercase tracking-wide">
            {article.domain}
          </span>
          <span className="text-news-silver">•</span>
          <time dateTime={article.createdAt.toISOString()} className="text-news-concrete byline-text">
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
        </div>
      </div>

      {/* Tags - News Site Style */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.slice(0, 10).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-news-silver/50 text-news-steel text-xs rounded-sm border border-news-silver/60 font-medium hover:bg-news-navy hover:text-white hover:border-news-navy transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 10 && (
            <span className="px-3 py-1 bg-news-concrete text-white text-xs rounded-sm font-medium">
              +{article.tags.length - 10} more
            </span>
          )}
        </div>
      )}

      {/* Star Button and Meta */}
      <div className="flex items-center justify-between pt-4 border-t border-news-silver/40">
        <StarButton
          postId={article.id}
          initialStarCount={article.starCountCached}
          onStarChange={handleStarChange}
        />

        <div className="text-news-silver text-xs font-mono">
          {article.id.slice(0, 8)}
        </div>
      </div>
    </article>
  );
}
