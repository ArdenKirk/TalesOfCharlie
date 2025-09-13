import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleDetail } from '@/components/article-detail';
import { RelatedArticles } from '@/components/related-articles';
import { AuthButton } from '@/components/auth-button';

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getArticle(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/posts/${id}`, {
      cache: 'no-store', // For now, disable caching for development
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: 'Article Not Found | Tales of Charlie',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: `${article.headlineExact} | Tales of Charlie`,
    description: article.ledeExact,
    openGraph: {
      title: article.headlineExact,
      description: article.ledeExact,
      type: 'article',
      publishedTime: article.createdAt,
      authors: [article.createdByUser.username],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.headlineExact,
      description: article.ledeExact,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full border-b border-news-steel bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-news-navy rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-lg masthead-text">TC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-news-charcoal masthead-text">Tales of Charlie</h1>
                  <p className="text-xs text-news-steel byline-text uppercase tracking-wide">A Tribute to Charlie Kirk</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <Link href="/" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Home</Link>
              <Link href="/#popular" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Popular</Link>
              <Link href="/submit" className="text-news-charcoal hover:text-news-navy font-medium transition-colors">Submit</Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-8">
            <ArticleDetail article={article} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Related Articles */}
              <RelatedArticles articleId={id} />

              {/* Back to Home */}
              <div className="bg-news-silver/10 rounded-lg p-6">
                <h3 className="text-lg font-bold text-news-charcoal headline-serif mb-4">Continue Reading</h3>
                <Link 
                  href="/"
                  className="inline-flex items-center text-news-navy hover:text-conservative-red font-medium transition-colors group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Latest Stories
                </Link>
                
                <div className="mt-4 pt-4 border-t border-news-silver/30">
                  <p className="text-sm text-news-concrete mb-3">
                    Discover more conservative analysis and media bias documentation.
                  </p>
                  <Link
                    href="/submit"
                    className="bg-conservative-red text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-conservative-red/90 transition-colors inline-block"
                  >
                    Submit Article
                  </Link>
                </div>
              </div>
            </div>
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
