'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArticleCard } from './article-card';
import { Post } from '@toc/types';

interface ArticlesFeedProps {
  maxItems?: number;
}

export function ArticlesFeed({ maxItems = 5 }: ArticlesFeedProps) {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (session) {
      fetchArticles();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?limit=${maxItems}`);
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

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-700 mb-4">No articles yet!</p>
          <p className="text-sm text-blue-600">Submit your first article using the form below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Articles ({articles.length})
      </h3>

      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length >= maxItems && (
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/#articles'}
            className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
          >
            View more articles →
          </button>
        </div>
      )}
    </div>
  );
}
