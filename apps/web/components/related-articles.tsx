'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@toc/types';

interface RelatedArticlesProps {
  articleId: string;
  limit?: number;
}

export function RelatedArticles({ articleId, limit = 5 }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${articleId}/related?limit=${limit}`);
        const data = await response.json();

        if (data.success) {
          setRelatedArticles(data.data || []);
        } else {
          setError('Failed to load related articles');
        }
      } catch (err) {
        setError('Error loading related articles');
        console.error('Error fetching related articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [articleId, limit]);

  if (loading) {
    return (
      <div className="bg-news-silver/10 rounded-lg p-6">
        <div className="h-6 bg-news-silver/30 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-news-silver/20 rounded w-full"></div>
              <div className="h-3 bg-news-silver/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return (
      <div className="bg-news-silver/10 rounded-lg p-6">
        <h3 className="text-lg font-bold text-news-charcoal headline-serif mb-4">Related Articles</h3>
        <p className="text-sm text-news-concrete">No related articles found.</p>
      </div>
    );
  }

  return (
    <div className="bg-news-silver/10 rounded-lg p-6">
      <h3 className="text-lg font-bold text-news-charcoal headline-serif mb-4">Related Articles</h3>
      <div className="space-y-4">
        {relatedArticles.map((article, index) => (
          <div key={article.id} className="pb-4 border-b border-news-silver/30 last:border-0 last:pb-0">
            <div className="flex items-start space-x-3">
              {/* Article Number */}
              <div className="w-6 h-6 bg-news-navy rounded-sm flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Headline */}
                <h4 className="text-sm font-medium text-news-charcoal leading-tight mb-2 hover:text-news-navy transition-colors">
                  <Link 
                    href={`/article/${article.id}`}
                    className="line-clamp-2"
                  >
                    {article.headlineExact}
                  </Link>
                </h4>
                
                {/* Metadata */}
                <div className="flex items-center text-xs text-news-concrete space-x-2 mb-2">
                  <span className="byline-text">{article.createdByUser.username}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-news-silver/40 rounded-sm font-medium">
                    {article.domain}
                  </span>
                  <span>•</span>
                  <span>{article.starCountCached} stars</span>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-0.5 bg-news-silver/60 text-news-steel text-xs rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-news-concrete text-white text-xs rounded-sm">
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Publication Date */}
                <time 
                  dateTime={article.createdAt.toISOString()}
                  className="text-xs text-news-concrete"
                >
                  {new Date(article.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More */}
      <div className="mt-6 pt-4 border-t border-news-silver/30">
        <Link
          href="/?sort=popular"
          className="text-news-navy hover:text-conservative-red text-sm font-medium hover:underline transition-colors"
        >
          View more popular articles →
        </Link>
      </div>
    </div>
  );
}
