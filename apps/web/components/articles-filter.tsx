'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'stars', label: 'Most Starred' }
];

interface ArticlesFilterProps {
  tags?: string[];
  onFilterChange?: (filters: { tag?: string; sort?: string }) => void;
}

export function ArticlesFilter({ tags = [], onFilterChange }: ArticlesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'recent');

  const allTags = useMemo(() => {
    // Get unique tags from available tags
    const uniqueTags = [...new Set(tags)].sort();
    return uniqueTags;
  }, [tags]);

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    updateURL({ tag, sort: selectedSort });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    updateURL({ tag: selectedTag, sort });
  };

  const updateURL = (params: { tag: string; sort: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (params.tag && params.tag !== '') {
      newParams.set('tag', params.tag);
    } else {
      newParams.delete('tag');
    }

    newParams.set('sort', params.sort);

    // Reset to page 1 when filters change
    newParams.set('page', '1');

    router.push(`?${newParams.toString()}`);
  };

  const clearFilters = () => {
    setSelectedTag('');
    setSelectedSort('recent');
    updateURL({ tag: '', sort: 'recent' });
  };

  const hasActiveFilters = selectedTag !== '' || selectedSort !== 'recent';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
            Sort:
          </label>
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="tag-select" className="text-sm font-medium text-gray-700">
            Filter by Tag:
          </label>
          <select
            id="tag-select"
            value={selectedTag}
            onChange={(e) => handleTagChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Active Filter Summary */}
      {(selectedTag || selectedSort !== 'recent') && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>Active:</span>

          {selectedTag && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tag: {selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1)}
              <button
                onClick={() => handleTagChange('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}

          {selectedSort !== 'recent' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Sort: {SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Popular Tags Display Component
interface PopularTagsProps {
  tags: { tag: string; count: number }[];
  selectedTag?: string;
  onTagSelect?: (tag: string) => void;
}

export function PopularTags({ tags, selectedTag, onTagSelect }: PopularTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-blue-900 mb-3">Popular Tags:</h4>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 12).map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => onTagSelect?.(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
            <span className="ml-1 text-opacity-70">({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
