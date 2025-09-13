'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { ArticleCard } from './article-card';
import { Post } from '@toc/types';

export function SearchArticlesFeed() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<string>('');

  // Get search query from URL
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    fetchSearchResults(query);
  }, [searchParams]);

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      setLoading(false);
      setResultMessage('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResultMessage(`Searching for "${query}"...`);

      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/posts/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data.data || []);
        const resultCount = data.data.data?.length || 0;
        setResultMessage(
          resultCount === 1
            ? `Found 1 article for "${query}"`
            : `Found ${resultCount} articles for "${query}"`
        );
      } else {
        setError('Search failed. Please try again.');
        setResultMessage('');
      }
    } catch (err) {
      setError('Search error. Please check your connection and try again.');
      setResultMessage('');
      console.error('Error searching articles:', err);
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
          <div className="animate-pulse bg-news-silver/50 h-4 w-48 rounded mb-2"></div>
          <div className="animate-pulse bg-news-silver/30 h-3 w-32 rounded"></div>
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
          <h3 className="text-lg font-medium text-red-900 mb-2">Search Error</h3>
          <p className="text-red-700 text-sm body-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Result Summary */}
      <div className="mb-6 p-4 bg-news-silver/20 rounded-lg">
        <p className="text-news-charcoal body-sans">
          {resultMessage || `No search query specified`}
        </p>
        {searchQuery && (
          <p className="text-sm text-news-steel mt-1">
            Showing results for: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {articles.length === 0 && !loading && !error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-news-charcoal headline-serif mb-2">
            No articles found
          </h3>
          <p className="text-news-steel body-sans mb-6">
            Try different keywords or check your spelling
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-news-navy text-white px-6 py-2 rounded-sm hover:bg-news-charcoal transition-colors"
          >
            Back to Latest Stories
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
