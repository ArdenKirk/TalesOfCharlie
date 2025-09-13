export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="w-full border-b border-news-steel bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-news-navy rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-news-charcoal">Tales of Charlie</h1>
                <p className="text-xs text-news-steel uppercase tracking-wide">A Tribute to Charlie Kirk</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content Skeleton */}
          <div className="lg:col-span-8">
            <div className="animate-pulse space-y-6">
              {/* Breadcrumb */}
              <div className="h-4 bg-news-silver/30 rounded w-32"></div>
              
              {/* Headline */}
              <div className="space-y-3">
                <div className="h-10 bg-news-silver/30 rounded w-full"></div>
                <div className="h-10 bg-news-silver/30 rounded w-4/5"></div>
              </div>

              {/* Byline */}
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-news-silver/20 rounded w-24"></div>
                <div className="h-4 bg-news-silver/20 rounded w-20"></div>
                <div className="h-4 bg-news-silver/20 rounded w-28"></div>
              </div>

              {/* Lede */}
              <div className="space-y-2">
                <div className="h-6 bg-news-silver/20 rounded w-full"></div>
                <div className="h-6 bg-news-silver/20 rounded w-full"></div>
                <div className="h-6 bg-news-silver/20 rounded w-3/4"></div>
              </div>

              {/* Original article link */}
              <div className="h-5 bg-news-silver/30 rounded w-40"></div>

              {/* Conservative analysis section */}
              <div className="bg-conservative-red/5 border-l-4 border-conservative-red p-4 rounded-r-sm">
                <div className="h-6 bg-conservative-red/20 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-32 bg-news-silver/10 rounded"></div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 bg-news-silver/30 rounded w-20"></div>
                ))}
              </div>

              {/* Star button */}
              <div className="flex items-center justify-between pt-4 border-t border-news-silver/40">
                <div className="h-8 bg-news-silver/30 rounded w-32"></div>
                <div className="h-4 bg-news-silver/20 rounded w-16"></div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4">
            <div className="space-y-8">
              {/* Related articles skeleton */}
              <div className="bg-news-silver/10 rounded-lg p-6">
                <div className="h-6 bg-news-silver/30 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-5 bg-news-silver/20 rounded w-full"></div>
                      <div className="h-4 bg-news-silver/10 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue reading skeleton */}
              <div className="bg-news-silver/10 rounded-lg p-6">
                <div className="h-6 bg-news-silver/30 rounded w-32 mb-4"></div>
                <div className="h-5 bg-news-silver/20 rounded w-40 mb-4"></div>
                <div className="h-8 bg-conservative-red/30 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
