import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  debounceMs?: number;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
  debounceMs = 300
}: UseInfiniteScrollOptions) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedLoadMore = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (hasMore && !isLoading) {
        onLoadMore();
      }
    }, debounceMs);
  }, [hasMore, isLoading, onLoadMore, debounceMs]);

  const handleScroll = useCallback(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollTop + clientHeight >= scrollHeight - 200) {
      debouncedLoadMore();
    }
  }, [hasMore, isLoading, debouncedLoadMore]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && entry.intersectionRatio > 0.5 && hasMore && !isLoading) {
        debouncedLoadMore();
      }
    },
    [hasMore, isLoading, debouncedLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(handleIntersection, {
        rootMargin: '50px',
        threshold: 0.5
      });

      observer.observe(element);

      return () => {
        observer.unobserve(element);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      const scrollHandler = handleScroll;
      document.addEventListener('scroll', scrollHandler);
      
      return () => {
        document.removeEventListener('scroll', scrollHandler);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [handleIntersection, handleScroll, threshold]);

  return { loadMoreRef };
};