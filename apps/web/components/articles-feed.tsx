'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { ArticleCard } from './article-card';
import { Post } from '@toc/types';

interface ArticlesFeedProps {
  maxItems?: number;
}

export function ArticlesFeed({ maxItems = 8 }: ArticlesFeedProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Get current sort, tag, and popularity window from URL parameters
  const currentSort = searchParams.get('sort') || 'recent';
  const currentTag = searchParams.get('tag');
  const currentWindow = searchParams.get('window') || 'day';

  useEffect(() => {
    fetchArticles();
  }, [currentSort, currentTag, currentWindow, maxItems]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');

      let apiUrl: string;
      const params = new URLSearchParams({
        limit: maxItems.toString(),
      });

      if (currentTag) {
        params.append('tag', currentTag);
      }

      // Use popularity endpoint for popular sort
      if (currentSort === 'popular') {
        apiUrl = `/api/posts/popular/${currentWindow}?${params}`;
      } else {
        // Use regular posts endpoint for recent/stars
        params.append('sort', currentSort);
        apiUrl = `/api/posts?${params}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data.data || []);
      } else {
        setError('Failed to load articles');
      }
    } catch (err) {
      setError('Error loading articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Articles are now visible to all users for better discovery

  if (loading) {
    return (
      <div className="w-full">
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm body-sans">{error}</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-news-silver/10 border border-news-silver rounded-lg p-6 text-center">
          <p className="text-news-steel mb-4 headline-serif">No articles yet!</p>
          <p className="text-sm text-news-concrete body-sans">Submit your first article using the form above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-0">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length >= maxItems && (
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/#articles'}
            className="text-news-navy hover:text-conservative-red text-sm font-medium hover:underline transition-colors body-sans"
          >
            View more articles →
          </button>
        </div>
      )}
    </div>
  );
}
