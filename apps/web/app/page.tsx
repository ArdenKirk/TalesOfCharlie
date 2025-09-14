"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { AuthButton } from "@/components/auth-button";
import { ArticlesFeed } from "@/components/articles-feed";
import { SortControls } from "@/components/sort-controls";
import { DomainReviewModal } from "@/components/domain-review-modal";
import { StarButton } from "@/components/star-button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Post } from "@toc/types";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [featuredArticle, setFeaturedArticle] = useState<Post | null>(null);
  const [popularArticles, setPopularArticles] = useState<Post[]>([]);

  const handleSubmitArticle = () => {
    if (status === "authenticated") {
      router.push("/submit");
    } else {
      router.push("/");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/tag/${encodeURIComponent(tag.toLowerCase())}`);
  };

  // Fetch featured article (most recent)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/posts?limit=1');
        const data = await response.json();
        if (data.success && data.data.data.length > 0) {
          setFeaturedArticle(data.data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching featured article:', error);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch popular articles for sidebar
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch('/api/posts/popular/week?limit=5');
        const data = await response.json();
        if (data.success && data.data.data) {
          setPopularArticles(data.data.data);
        }
      } catch (error) {
        console.error('Error fetching popular articles:', error);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Masthead Header */}
      <header className="w-full border-b border-news-steel bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 bg-news-navy rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-xl masthead-text">TC</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-news-charcoal masthead-text">Tales of Charlie</h1>
                  <p className="text-xs text-news-steel byline-text uppercase tracking-wide">A Tribute to Charlie Kirk</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm">
              <a href="#latest" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Latest</a>
              <a href="#popular" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Popular</a>
              <a href="#conservative" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Conservative Analysis</a>
              <a href="#community" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Community</a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 px-3 py-1.5 pr-8 text-sm border border-news-silver rounded-md focus:outline-none focus:ring-2 focus:ring-news-navy focus:border-transparent"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-news-concrete hover:text-news-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>
              <AuthButton />
            </div>
          </div>
        </div>

            {/* Secondary Navigation Bar */}
        <div className="border-t border-news-silver">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-6">
                <span className="text-conservative-red font-medium uppercase tracking-wide">Breaking Conservative Analysis</span>
                <span className="text-news-silver">•</span>
                <span className="text-news-concrete">
                  {featuredArticle
                    ? `${featuredArticle.headlineExact.substring(0, 60)}${featuredArticle.headlineExact.length > 60 ? '...' : ''}`
                    : 'Latest Conservative Analysis'
                  }
                </span>
              </div>
              <div suppressHydrationWarning className="text-news-concrete">
                {typeof window === 'undefined' ? 'Loading...' :
                  new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Hero Section - Newspaper Front Page Style */}
        <section className="max-w-screen-xl mx-auto py-12 border-b border-news-silver">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Story */}
            <div className="lg:col-span-2 pr-8">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-conservative-red text-white text-sm font-medium uppercase tracking-wide rounded-sm">
                  Featured
                </span>
              </div>
              {featuredArticle ? (
                <>
                  <h2 className="text-4xl lg:text-6xl font-bold text-news-charcoal headline-serif leading-tight mb-4 cursor-pointer hover:text-news-navy transition-colors">
                    <Link href={`/article/${featuredArticle.id}`}>
                      {featuredArticle.headlineExact}
                    </Link>
                  </h2>
                  <p className="text-lg text-news-steel body-sans leading-relaxed mb-6 max-w-2xl">
                    {featuredArticle.ledeExact}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-news-concrete">
                    <span className="byline-text font-medium">by {featuredArticle.createdByUser.username}</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-news-silver/30 text-news-steel rounded-sm text-xs font-medium byline-text uppercase tracking-wide">
                      {featuredArticle.domain}
                    </span>
                    <span>•</span>
                    <time dateTime={new Date(featuredArticle.createdAt).toISOString()} className="byline-text">
                      {new Date(featuredArticle.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <Link
                      href={`/article/${featuredArticle.id}`}
                      className="inline-flex items-center text-sm text-news-navy hover:text-conservative-red font-medium transition-colors"
                    >
                      Read Full Analysis →
                    </Link>
                    <StarButton
                      postId={featuredArticle.id}
                      initialStarCount={featuredArticle.starCountCached}
                      onStarChange={() => {}} // No-op since this is just display
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-4xl lg:text-6xl font-bold text-news-charcoal headline-serif leading-tight mb-4">
                    Loading Featured Article...
                  </h2>
                  <p className="text-lg text-news-steel body-sans leading-relaxed mb-6 max-w-2xl">
                    Fetching the latest conservative analysis for you.
                  </p>
                </>
              )}
            </div>

            {/* Side Stories */}
            <div className="space-y-6">
              <div className="border-b border-news-silver pb-4">
                <span className="inline-block px-2 py-1 bg-news-navy text-white text-xs font-medium uppercase tracking-wide rounded-sm mb-2">
                  Analysis
                </span>
                <h3 className="text-xl font-semibold text-news-charcoal headline-serif mb-2">
                  Election Coverage Failures
                </h3>
                <p className="text-sm text-news-steel body-sans leading-snug">
                  How mainstream outlets missed key voter concerns in recent elections.
                </p>
              </div>
              <div className="border-b border-news-silver pb-4">
                <span className="inline-block px-2 py-1 bg-conservative-red text-white text-xs font-medium uppercase tracking-wide rounded-sm mb-2">
                  Community
                </span>
                <h3 className="text-xl font-semibold text-news-charcoal headline-serif mb-2">
                  Submit Your Story
                </h3>
                <p className="text-sm text-news-steel body-sans leading-snug mb-3">
                  Help document media bias by submitting articles for conservative analysis.
                </p>
                {status === "authenticated" ? (
                  <button
                    onClick={() => router.push('/submit')}
                    className="bg-news-navy text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-news-charcoal transition-colors"
                  >
                    Submit Article
                  </button>
                ) : (
                  <p className="text-xs text-news-concrete">
                    <Link href="/auth/signin" className="text-news-navy hover:underline">Sign in</Link> to submit content
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid - Three Columns like Newspaper */}
        <section className="max-w-screen-xl mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
            {/* Main Column */}
            <div className="lg:col-span-8 xl:col-span-8">
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-news-charcoal headline-serif mb-2">Latest Stories</h3>
                    <p className="text-news-steel body-sans">
                      Conservative perspectives on today's most important news
                    </p>
                  </div>
                  
                  {/* Sort Controls */}
                  <div className="mt-4 sm:mt-0">
                    <Suspense fallback={<div className="h-8 bg-news-silver/30 rounded animate-pulse"></div>}>
                      <SortControls />
                    </Suspense>
                  </div>
                </div>
              </div>
                  <Suspense fallback={<div className="text-center py-12 text-news-steel">Loading articles...</div>}>
                    <ArticlesFeed maxItems={8} />
                  </Suspense>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4">
              {/* Popular Stories */}
              <div className="bg-news-silver/10 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-news-charcoal headline-serif mb-4">Most Popular</h4>
                <div className="space-y-4">
                  {popularArticles.length > 0 ? popularArticles.slice(0, 4).map((article, index) => (
                    <div key={article.id} className="flex items-start space-x-3 pb-3 border-b border-news-silver/30 last:border-0">
                      <div className="w-8 h-8 bg-news-navy rounded-sm flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Link href={`/article/${article.id}`}>
                          <h5 className="text-sm font-medium text-news-charcoal leading-tight mb-1 hover:text-news-navy transition-colors cursor-pointer">
                            {article.headlineExact.substring(0, 50)}{article.headlineExact.length > 50 ? '...' : ''}
                          </h5>
                        </Link>
                        <p className="text-xs text-news-concrete">
                          by {article.createdByUser.username} • {article.starCountCached} stars
                        </p>
                      </div>
                    </div>
                  )) : (
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start space-x-3 pb-3 border-b border-news-silver/30 last:border-0">
                        <div className="w-8 h-8 bg-news-navy rounded-sm flex items-center justify-center text-white text-xs font-bold">
                          {i}
                        </div>
                        <div className="flex-1 animate-pulse">
                          <div className="h-4 bg-news-silver/30 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-news-silver/20 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tags Cloud */}
              <div className="bg-white border border-news-silver rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-news-charcoal headline-serif mb-4">Explore by Topic</h4>
                <div className="flex flex-wrap gap-2">
                  {["Media Bias", "Election Fraud", "Cultural Issues", "Conservative Victory", "Liberal Hypocrisy", "Political Corruption", "Free Speech", "边к Values"].map((tag) => (
                    <span
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1 bg-news-silver/20 text-news-steel text-sm rounded-full hover:bg-news-navy hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-conservative-red rounded-lg p-6 text-center text-white">
                <h4 className="text-lg font-bold mb-2 headline-serif">Join Our Mission</h4>
                <p className="text-sm mb-4 opacity-90 body-sans">
                  Help expose media bias through conservative analysis
                </p>
                <button
                  onClick={() => router.push(status === "authenticated" ? "/submit" : "/")}
                  className="bg-white text-conservative-red px-6 py-2 rounded-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Contribute Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-news-silver bg-news-silver/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-bold text-news-charcoal headline-serif mb-4">Tales of Charlie</h5>
              <p className="text-sm text-news-steel body-sans mb-4">
                A tribute to Charlie Kirk exposing media bias against conservatives through professional news aggregation.
              </p>
              <div className="flex space-x-4">
                <span className="text-news-concrete">📖</span>
                <span className="text-news-concrete">🐦</span>
                <span className="text-news-concrete">💻</span>
              </div>
            </div>
            <div>
              <h6 className="font-semibold text-news-charcoal headline-serif mb-4">Navigation</h6>
              <ul className="space-y-2 text-sm text-news-steel">
                <li><Link href="/" className="hover:text-news-navy transition-colors">Latest Stories</Link></li>
                <li><Link href="/popular" className="hover:text-news-navy transition-colors">Popular</Link></li>
                <li><Link href="/tags" className="hover:text-news-navy transition-colors">Tags</Link></li>
                <li><Link href="/about" className="hover:text-news-navy transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-news-charcoal headline-serif mb-4">Contribute</h6>
              <ul className="space-y-2 text-sm text-news-steel">
                <li><Link href="/submit" className="hover:text-news-navy transition-colors">Submit Article</Link></li>
                <li><button onClick={() => setIsDomainModalOpen(true)} className="hover:text-news-navy transition-colors text-left">Domain Review</button></li>
                <li><Link href="/guidelines" className="hover:text-news-navy transition-colors">Editorial Standards</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-news-charcoal headline-serif mb-4">Community</h6>
              <ul className="space-y-2 text-sm text-news-steel">
                <li><Link href="/open-source" className="hover:text-news-navy transition-colors">Open Source</Link></li>
                <li><Link href="/contact" className="hover:text-news-navy transition-colors">Contact</Link></li>
                <li><Link href="/contribute" className="hover:text-news-navy transition-colors">Join Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-news-silver pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-news-concrete">
                © 2025 Tales of Charlie. A tribute to Charlie Kirk.
              </p>
              <div className="flex items-center space-x-6 text-sm text-news-concrete mt-4 md:mt-0">
                <span>Professional News Aggregation</span>
                <span>•</span>
                <span>Conservative Analysis</span>
                <span>•</span>
                <span>Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Domain Review Modal */}
      <DomainReviewModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
      />
    </div>
  );
}
