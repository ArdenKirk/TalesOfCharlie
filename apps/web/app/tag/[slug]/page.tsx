import { Suspense, use } from "react";
import { SortControls } from "@/components/sort-controls";
import Link from "next/link";
import { TagArticlesFeed } from "@/components/tag-articles-feed";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TagPage({ params }: TagPageProps) {
  const { slug } = use(params);
  const decodedTag = decodeURIComponent(slug);

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
                <p className="text-xs text-news-steel uppercase tracking-wide">Topic: {decodedTag}</p>
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
                <Suspense fallback={`Tag: ${decodedTag}`}>
                  {`Tag: ${decodedTag}`}
                </Suspense>
              </h2>
              <p className="text-news-steel body-sans">
                Articles exploring {decodedTag.toLowerCase()} and conservative perspectives
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

        {/* Tag Articles */}
        <Suspense fallback={<div className="text-center py-12 text-news-steel">Loading articles...</div>}>
          <TagArticlesFeed tag={decodedTag} />
        </Suspense>

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
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="mt-16 bg-news-silver/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-news-charcoal headline-serif mb-4">
            Explore Related Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              "Media Bias", "Election Fraud", "Cultural Issues",
              "Conservative Victory", "Liberal Hypocrisy", "Political Corruption",
              "Free Speech", "Traditional Values"
            ].filter(tag => tag !== decodedTag).slice(0, 6).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                className="px-4 py-2 bg-white border border-news-silver rounded hover:bg-news-navy hover:text-white hover:border-news-navy transition-all text-sm body-sans"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
