import React, { useState, useEffect, useCallback } from 'react';
import { Post } from '../types';
import { feedAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import './NewsFeed.css';

interface NewsFeedProps {
  refreshTrigger: number;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const { showError } = useToast();

  const limit = 10;

  const loadFeed = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError('');
      
      const response = await feedAPI.getFeed(page, limit);
      
      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasMore(response.posts.length === limit);
      setCurrentPage(page);
    } catch (err: any) {
      const errorMessage = err.userMessage || err.response?.data?.error || 'Failed to load feed. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [showError]);

  useEffect(() => {
    loadFeed(1, false);
  }, [refreshTrigger, loadFeed]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      loadFeed(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoading, isLoadingMore, loadFeed]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
    threshold: 100,
    debounceMs: 500
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading && posts.length === 0) {
    return <div className="feed-loading">Loading feed...</div>;
  }

  if (error && posts.length === 0) {
    return (
      <div className="feed-error">
        <p>{error}</p>
        <button onClick={() => loadFeed(1, false)} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="feed-empty">
        <h3>Your feed is empty</h3>
        <p>Follow some users to see their posts here!</p>
      </div>
    );
  }

  return (
    <div className="news-feed">
      <h2>News Feed</h2>
      
      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-user">
                <div className="user-avatar">
                  {/* Simple avatar placeholder with first letter of username */}
                  <span>{post.username ? post.username.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div className="user-info">
                  <span className="username">{post.username || `User ${post.userid}`}</span>
                  <span className="post-time">{formatDate(post.createdat)}</span>
                </div>
              </div>
            </div>
            
            <div className="post-content">
              <p>{post.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Infinite scroll trigger element */}
      {hasMore && (
        <div ref={loadMoreRef} className="infinite-scroll-trigger">
          {isLoadingMore && (
            <div className="loading-more">
              <div className="loading-spinner"></div>
              <span>Loading more posts...</span>
            </div>
          )}
        </div>
      )}
      
      {error && posts.length > 0 && (
        <div className="load-error">
          <p>{error}</p>
          <button onClick={() => loadFeed(currentPage + 1, true)} className="retry-button">
            Try Again
          </button>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="end-of-feed">
          <p>You've reached the end of your feed!</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;