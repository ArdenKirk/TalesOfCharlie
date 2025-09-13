import { Suspense } from "react";
import { ArticlesFeed } from "@/components/articles-feed";
import { SortControls } from "@/components/sort-controls";
import Link from "next/link";
import { SearchArticlesFeed } from "@/components/search-articles-feed";

export default function SearchPage() {
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
                <p className="text-xs text-news-steel uppercase tracking-wide">Search Results</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-news-charcoal headline-serif mb-2">
                <Suspense fallback="Search Results">Search</Suspense>
              </h2>
              <p className="text-news-steel body-sans">
                Find articles by keywords, headlines, or content
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

        {/* Search Results */}
        <Suspense fallback={<div className="text-center py-12 text-news-steel">Searching...</div>}>
          <SearchArticlesFeed />
        </Suspense>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-news-navy hover:text-conservative-red transition-colors body-sans font-medium"
          >
            ← Back to Latest Stories
          </Link>
        </div>
      </main>
    </div>
  );
}
