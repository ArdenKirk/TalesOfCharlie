'use client';

import React, { Suspense, use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { SortControls } from "@/components/sort-controls";
import type { Post } from "@toc/types";

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

// Function to fetch user data from the API
async function getUserData(username: string) {
  try {
    const response = await fetch(`/api/users/${username}`);
    const result = await response.json();

    if (result.success && result.data) {
      return {
        username: result.data.username,
        displayName: result.data.username, // For now, displayName is same as username
        joinDate: new Date(result.data.createdAt),
        avatarUrl: result.data.avatarUrl || null,
        emailVerified: result.data.emailVerified,
      };
    } else {
      throw new Error(result.error?.message || 'User not found');
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
}

// Component for user profile tabs
function UserTabs({ username, activeTab, onTabChange }: {
  username: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="border-b border-news-steel">
      <div className="flex space-x-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onTabChange('authored')}
          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'authored'
              ? 'border-news-navy text-news-navy'
              : 'border-transparent text-news-steel hover:text-news-charcoal'
          }`}
        >
          Authored Articles
        </button>
        <button
          onClick={() => onTabChange('starred')}
          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'starred'
              ? 'border-news-navy text-news-navy'
              : 'border-transparent text-news-steel hover:text-news-charcoal'
          }`}
        >
          Starred Articles
        </button>
      </div>
    </div>
  );
}

// Component for user articles/content
function UserArticles({ username, type }: { username: string; type: string }) {
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch user articles from API
  React.useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${username}?type=${type}&page=${page}`);
        const data = await response.json();

        if (data.success) {
          setArticles(data.data.data || []);
          setHasMore(data.data.pagination?.hasNext || false);
        } else {
          setError(data.error?.message || 'Failed to load articles');
        }
      } catch (err) {
        setError('Failed to load articles - check your connection');
        console.error('Error loading user articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [username, type, page]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-news-steel text-lg mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-news-navy text-white px-6 py-2 rounded-sm hover:bg-news-charcoal transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-news-charcoal headline-serif mb-2">
          No {type === 'authored' ? 'authored articles' : 'starred articles'} yet
        </h3>
        <p className="text-news-steel body-sans mb-6">
          {type === 'authored'
            ? 'When this user submits articles, they will appear here.'
            : 'When this user stars articles, they will appear here.'
          }
        </p>
        {type === 'starred' && (
          <Link
            href="/"
            className="bg-news-navy text-white px-6 py-2 rounded-sm hover:bg-news-charcoal transition-colors"
          >
            Browse Articles
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {hasMore && (
        <div className="text-center py-8">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="text-news-navy hover:text-conservative-red transition-colors body-sans font-medium"
          >
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
}

// Main user profile page component
export default function UserProfilePage({ params }: UserPageProps) {
  const { username } = use(params);
  const [activeTab, setActiveTab] = useState('authored');
  const [userData, setUserData] = useState<{ username: string; displayName: string; joinDate: Date; avatarUrl?: string | null } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const searchParams = useSearchParams();

  // Load user data using the mock function
  React.useEffect(() => {
    const loadUserData = async () => {
      setLoadingUser(true);
      try {
        const data = await getUserData(username);
        setUserData(data);
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to basic data
        setUserData({
          username,
          displayName: username,
          joinDate: new Date('2024-01-01'),
        });
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserData();
  }, [username]);

  // Check for tab parameter in URL
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'starred') {
      setActiveTab('starred');
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    if (tab === 'authored') {
      newUrl.searchParams.delete('tab');
    } else {
      newUrl.searchParams.set('tab', tab);
    }
    window.history.replaceState({}, '', newUrl.toString());
  };

  if (loadingUser || !userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-news-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full border-b border-news-steel bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-news-navy rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xl">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-news-charcoal">Tales of Charlie</h1>
                <p className="text-xs text-news-steel uppercase tracking-wide">User Profile</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* User Profile Header */}
      <section className="border-b border-news-steel bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-news-navy flex items-center justify-center">
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={`${userData.displayName}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-news-charcoal headline-serif mb-2">
                {userData.displayName}
              </h1>
              <p className="text-news-steel body-sans mb-1">
                Tales of Charlie Contributor
              </p>
              <p className="text-news-steel text-sm">
                Joined {userData.joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} • Conservative voices matter
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Tabs */}
      <UserTabs username={username} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-news-charcoal headline-serif mb-2">
                {activeTab === 'authored' ? 'Articles by' : 'Articles starred by'} {username}
              </h2>
              <p className="text-news-steel body-sans">
                {activeTab === 'authored'
                  ? 'Articles contributed by this member of the Tales of Charlie community'
                  : 'Articles saved and starred by this member'
                }
              </p>
            </div>

            {/* Show sort controls for authored articles */}
            {activeTab === 'authored' && (
              <div className="mt-4 sm:mt-0">
                <Suspense fallback={<div className="h-8 bg-news-silver/30 rounded animate-pulse"></div>}>
                  <SortControls />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* Articles Content */}
        <UserArticles username={username} type={activeTab} />

        {/* Navigation */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="text-news-navy hover:text-conservative-red transition-colors body-sans text-sm px-4 py-2 rounded bg-news-silver/20 hover:bg-news-silver/30"
            >
              ← Back to Latest Stories
            </Link>
            <Link
              href="/search"
              className="text-news-navy hover:text-conservative-red transition-colors body-sans text-sm px-4 py-2 rounded bg-news-silver/20 hover:bg-news-silver/30"
            >
              🔍 Search All Articles
            </Link>
            {activeTab === 'authored' && (
              <Link
                href="/submit"
                className="text-white bg-news-navy hover:bg-news-charcoal transition-colors body-sans text-sm px-4 py-2 rounded"
              >
                Submit Article
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
