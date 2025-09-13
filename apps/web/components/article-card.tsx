'use client';

import { Post } from '@toc/types';
import { StarButton } from './star-button';
import Link from 'next/link';

interface ArticleCardProps {
  article: Post;
  onStarChange?: (articleId: string, starred: boolean, starCount: number) => void;
}

export function ArticleCard({ article, onStarChange }: ArticleCardProps) {
  const handleStarChange = (starred: boolean, starCount: number) => {
    if (onStarChange) {
      onStarChange(article.id, starred, starCount);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {article.headlineExact}
        </h2>

        <p className="text-gray-600 text-sm font-medium mb-3">
          {article.ledeExact}
        </p>

        <div className="mb-4">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Read Original Article →
          </Link>
        </div>
      </div>

      {article.summaryConservativeMd && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Conservative Analysis:</h3>
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: article.summaryConservativeMd.replace(/\n/g, '<br>')
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>by {article.createdByUser.username}</span>
          <span>{article.domain}</span>
          <time dateTime={article.createdAt.toISOString()}>
            {new Date(article.createdAt).toLocaleDateString()}
          </time>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <StarButton
            postId={article.id}
            initialStarCount={article.starCountCached}
            onStarChange={handleStarChange}
          />

          <div className="text-gray-400 text-xs">
            ID: {article.id.slice(0, 8)}...
          </div>
        </div>
      </div>
    </article>
  );
}
