import React, { useState } from 'react';
import { postsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './PostCreator.css';

interface PostCreatorProps {
  onPostCreated: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const maxLength = 200;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!content.trim()) {
      const errorMsg = 'Post content cannot be empty';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    if (content.length > maxLength) {
      const errorMsg = `Post content cannot exceed ${maxLength} characters`;
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await postsAPI.create({ content: content.trim() });
      setContent('');
      showSuccess('Post created successfully!');
      onPostCreated();
    } catch (err: any) {
      const errorMessage = err.userMessage || err.response?.data?.error || 'Failed to create post. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-creator">
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className={`post-textarea ${error ? 'error' : ''} ${remainingChars < 0 ? 'over-limit' : ''}`}
            disabled={isSubmitting}
            rows={3}
          />
          <div className="character-counter">
            <span className={remainingChars < 0 ? 'over-limit' : remainingChars < 20 ? 'warning' : ''}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="post-button"
          disabled={isSubmitting || !content.trim() || content.length > maxLength}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default PostCreator;