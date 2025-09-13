'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SortControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'recent';
  
  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (sort === 'recent') {
      params.delete('sort'); // Default is recent, so no need for URL param
    } else {
      params.set('sort', sort);
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

  return (
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
  );
}
