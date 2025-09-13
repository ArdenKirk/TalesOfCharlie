'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArticleCard } from './article-card';
import { Post } from '@toc/types';

interface TagArticlesFeedProps {
  tag: string;
}

export function TagArticlesFeed({ tag }: TagArticlesFeedProps) {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchTagArticles();
  }, [tag]);

  const fetchTagArticles = async () => {
    try {
      setLoading(true);
      setError('');

      // Use regular posts API with tag filter
      const params = new URLSearchParams({
        tag: tag,
        limit: '50', // More results for tag pages
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data.data || []);
      } else {
        setError('Failed to load articles for this tag');
      }
    } catch (err) {
      setError('Error loading tag articles');
      console.error('Error fetching tag articles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="animate-pulse bg-news-silver/50 h-4 w-64 rounded mb-2"></div>
          <div className="animate-pulse bg-news-silver/30 h-3 w-48 rounded"></div>
        </div>
        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border-b border-news-silver p-6 sm:p-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-8 bg-news-silver/30 rounded w-4/5"></div>
                <div className="h-5 bg-news-silver/20 rounded w-full"></div>
                <div className="h-5 bg-news-silver/20 rounded w-3/4"></div>
                <div className="h-4 bg-news-silver/30 rounded w-32"></div>
                <div className="h-24 bg-news-silver/10 rounded"></div>
                <div className="flex justify-between items-center pt-4 border-t border-news-silver/20">
                  <div className="flex space-x-4">
                    <div className="h-6 bg-news-silver/30 rounded w-16"></div>
                    <div className="h-6 bg-news-silver/30 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-news-silver/20 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Tag Error</h3>
          <p className="text-red-700 text-sm body-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tag Result Summary */}
      <div className="mb-6 p-4 bg-news-silver/20 rounded-lg">
        <p className="text-news-charcoal body-sans">
          {articles.length === 0
            ? `No articles found with tag "${tag}" yet`
            : `${articles.length} article${articles.length === 1 ? '' : 's'} tagged with "${tag}"`
          }
        </p>
        <p className="text-sm text-news-steel mt-1">
          Exploring conservative perspectives on this topic
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold text-news-charcoal headline-serif mb-2">
            No articles with this tag yet
          </h3>
          <p className="text-news-steel body-sans mb-6 max-w-md mx-auto">
            This tag is ready for articles! Be the first to submit content about "{tag}".
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/submit'}
              className="bg-news-navy text-white px-6 py-3 rounded-sm hover:bg-news-charcoal transition-colors body-sans font-medium"
            >
              Submit First Article
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white text-news-navy border border-news-navy px-6 py-3 rounded-sm hover:bg-news-silver/50 transition-colors body-sans font-medium"
            >
              Back to Latest
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Load More - if more than 50 results */}
      {articles.length >= 50 && (
        <div className="mt-12 text-center">
          <button
            onClick={() => window.location.href = `/?tag=${encodeURIComponent(tag)}&sort=recent`}
            className="text-news-navy hover:text-conservative-red text-sm font-medium hover:underline transition-colors body-sans"
          >
            View all articles with this tag →
          </button>
        </div>
      )}
    </div>
  );
}
