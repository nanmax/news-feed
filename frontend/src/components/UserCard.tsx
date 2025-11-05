import React, { useState, useEffect, useCallback } from 'react';
import { UserWithFollowStatus } from '../types';
import { usersAPI, followAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './UserCard.css';

interface UserCardProps {
  onFollowUpdate?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ onFollowUpdate }) => {
  const [users, setUsers] = useState<UserWithFollowStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await usersAPI.getUsers();
      setUsers(response.users);
    } catch (err: any) {
      const errorMessage = err.userMessage || err.response?.data?.error || 'Failed to load users. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFollowToggle = async (userId: number, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await followAPI.unfollow(userId);
        showSuccess('Unfollowed successfully!');
      } else {
        await followAPI.follow(userId);
        showSuccess('Following successfully!');
      }

      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        )
      );

      if (onFollowUpdate) {
        onFollowUpdate();
      }
    } catch (err: any) {
      const errorMessage = err.userMessage || err.response?.data?.error || 'Failed to update follow status. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="user-card">
        <div className="user-card-header">
          <div className="header-left">
            <h3>Discover Users</h3>
            <span className="user-count">Loading...</span>
          </div>
          <button 
            className="refresh-icon-button"
            disabled
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="spinning"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        <div className="user-card-loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-card">
        <div className="user-card-header">
          <div className="header-left">
            <h3>Discover Users</h3>
            <span className="user-count">Error</span>
          </div>
          <button 
            onClick={loadUsers} 
            className="refresh-icon-button"
            title="Retry loading users"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        <div className="user-card-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="user-card">
        <div className="user-card-header">
          <div className="header-left">
            <h3>Discover Users</h3>
            <span className="user-count">0 users</span>
          </div>
          <button 
            onClick={loadUsers} 
            className="refresh-icon-button"
            title="Refresh users list"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        <div className="user-card-empty">
          <p>No other users found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="header-left">
          <h3>Discover Users</h3>
          <span className="user-count">{users.length} users</span>
        </div>
        <button 
          onClick={loadUsers} 
          className="refresh-icon-button"
          title="Refresh users list"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
      
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-avatar">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            
            <div className="user-info">
              <div className="user-details">
                <span className="username">{user.username}</span>
                <span className="join-date">Joined {formatJoinDate(user.joinedAt)}</span>
              </div>
            </div>
            
            <button
              onClick={() => handleFollowToggle(user.id, user.isFollowing)}
              className={`follow-button ${user.isFollowing ? 'following' : 'not-following'}`}
            >
              {user.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCard;