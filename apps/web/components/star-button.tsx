'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface StarButtonProps {
  postId: string;
  initialStarCount: number;
  initialStarred?: boolean;
  onStarChange?: (starred: boolean, starCount: number) => void;
}

export function StarButton({
  postId,
  initialStarCount,
  initialStarred = false,
  onStarChange,
}: StarButtonProps) {
  const { data: session } = useSession();
  const [starCount, setStarCount] = useState(initialStarCount);
  const [isStarred, setIsStarred] = useState(initialStarred);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    setStarCount(initialStarCount);
    setIsStarred(initialStarred);
  }, [initialStarCount, initialStarred]);

  const handleToggleStar = async () => {
    if (!session) {
      // Could show a "login required" modal here
      alert('Please sign in to star articles');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const newIsStarred = result.data; // This is the star object or boolean
        const newStarCount = newIsStarred ? starCount + 1 : starCount - 1;

        setIsStarred(newIsStarred);
        setStarCount(newStarCount);

        // Notify parent about the change
        if (onStarChange) {
          onStarChange(newIsStarred, newStarCount);
        }
      } else {
        console.error('Failed to toggle star');
        // Could show an error message here
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      // Could show an error message here
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show disabled button
  if (!session) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center space-x-2 text-gray-400 cursor-not-allowed opacity-60"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="text-xl">★</span>
          <span>{starCount}</span>
        </button>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
            Sign in to star articles
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggleStar}
      disabled={isLoading}
      className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
        isStarred
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-gray-400 hover:text-gray-500'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <span className={`text-xl ${isStarred ? 'filter drop-shadow-sm' : ''}`}>
          {isStarred ? '⭐' : '☆'}
        </span>
      )}
      <span className="font-medium">{starCount}</span>
    </button>
  );
}

// Simple star count display (read-only)
interface StarDisplayProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StarDisplay({ count, size = 'md', showIcon = true }: StarDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center space-x-1 text-gray-600 ${sizeClasses[size]}`}>
      {showIcon && <span>🦆</span>}
      <span>{count}</span>
      {count === 1 ? 'star' : 'stars'}
    </div>
  );
}

// Hook to check star status (useful for initializing components)
export function useStarCheck(postId: string) {
  const [isStarred, setIsStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStarStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/star`, {
          method: 'GET',
        });

        if (response.ok) {
          const result = await response.json();
          setIsStarred(result.starred || false);
        }
      } catch (error) {
        console.error('Error checking star status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStarStatus();
  }, [postId]);

  return { isStarred, isLoading };
}
