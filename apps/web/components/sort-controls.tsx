'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SortControls() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'recent';
  const currentWindow = searchParams.get('window') || 'day';

  const handleSortChange = (sort: string, window?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sort === 'recent') {
      params.delete('sort');
      params.delete('window');
    } else {
      params.set('sort', sort);
      if (window && sort === 'popular') {
        params.set('window', window);
      } else if (sort !== 'popular') {
        params.delete('window');
      }
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';

    router.push(newUrl);
  };

  const sortOptions = [
    { key: 'recent', label: 'Recent', description: 'Latest submissions' },
    { key: 'stars', label: 'Most Starred', description: 'Community favorites' },
    { key: 'popular', label: 'Popular', description: 'Trending now' },
  ];

  const popularityWindows = [
    { key: 'hour', label: 'Hour', description: 'Popular in the last hour' },
    { key: 'day', label: 'Day', description: 'Popular in the last day' },
    { key: 'week', label: 'Week', description: 'Popular in the last week' },
    { key: 'month', label: 'Month', description: 'Popular in the last month' },
    { key: 'year', label: 'Year', description: 'Popular in the last year' },
  ];

  return (
    <div className="flex flex-col space-y-3">
      {/* Sort Options */}
      <div className="flex items-center space-x-1 text-sm">
        <span className="text-news-concrete mr-2 font-medium">Sort by:</span>
        {sortOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => handleSortChange(option.key)}
            className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
              currentSort === option.key
                ? 'bg-news-navy text-white'
                : 'text-news-steel hover:bg-news-silver/50'
            }`}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Popularity Window Options - only show when Popular is selected */}
      {currentSort === 'popular' && (
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-news-concrete mr-2 font-medium">Time window:</span>
          {popularityWindows.map((window) => (
            <button
              key={window.key}
              onClick={() => handleSortChange('popular', window.key)}
              className={`px-2 py-1 rounded-sm text-xs font-medium transition-colors ${
                currentWindow === window.key
                  ? 'bg-conservative-red text-white'
                  : 'text-news-steel hover:bg-news-silver/30 hover:text-news-charcoal'
              }`}
              title={window.description}
            >
              {window.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
