import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full border-b border-news-steel bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-news-navy rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-news-charcoal">Tales of Charlie</h1>
                  <p className="text-xs text-news-steel uppercase tracking-wide">A Tribute to Charlie Kirk</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* 404 Error */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-news-silver/50 headline-serif mb-4">404</h1>
            <h2 className="text-3xl font-bold text-news-charcoal headline-serif mb-4">Article Not Found</h2>
            <p className="text-lg text-news-steel body-sans max-w-2xl mx-auto leading-relaxed">
              The article you're looking for could not be found. It may have been removed, 
              is still processing, or the link may be incorrect.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="bg-news-navy text-white px-6 py-3 rounded-sm font-medium hover:bg-news-charcoal transition-colors inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" />
                </svg>
                Back to Home
              </Link>
              
              <Link
                href="/submit"
                className="bg-conservative-red text-white px-6 py-3 rounded-sm font-medium hover:bg-conservative-red/90 transition-colors inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit Article
              </Link>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-12 text-left max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-news-charcoal headline-serif mb-4">What you can do:</h3>
            <ul className="space-y-3 text-news-steel body-sans">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-conservative-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Check the URL for any typos or errors
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-conservative-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Browse our latest conservative analysis on the homepage
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-conservative-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Submit a new article URL for conservative analysis
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-conservative-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                The article may still be processing - check back in a few minutes
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-news-silver bg-news-silver/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-news-concrete mb-2">
              © 2025 Tales of Charlie. A tribute to Charlie Kirk.
            </p>
            <p className="text-xs text-news-concrete">
              Professional News Aggregation • Conservative Analysis • Open Source
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
