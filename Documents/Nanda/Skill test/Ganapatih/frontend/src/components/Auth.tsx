import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Auth.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!username.trim() || !password.trim()) {
      const errorMsg = 'Username and password are required';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isLogin) {
        await login({ username, password });
        showSuccess('Login successful!');
      } else {
        await register({ username, password });
        showSuccess('Registration and login successful! Welcome!');
      }
    } catch (err: any) {
      const errorMessage = err.userMessage || err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      
      if (username) {
        setTimeout(() => {
          const usernameInput = document.getElementById('username') as HTMLInputElement;
          if (usernameInput) {
            usernameInput.focus();
          }
        }, 100);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  if (isLoading) {
    return <div className="auth-loading">Loading...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">News Feed</h1>
        <h2 className="auth-subtitle">{isLogin ? 'Login' : 'Register'}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(''); // Clear error when user starts typing
              }}
              placeholder="Enter your username"
              className={error ? 'error' : ''}
              disabled={isSubmitting}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(''); // Clear error when user starts typing
              }}
              placeholder="Enter your password"
              className={error ? 'error' : ''}
              disabled={isSubmitting}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting || !username.trim() || !password.trim()}
          >
            {isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="auth-toggle">
          <span>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={toggleMode}
              className="toggle-button"
              disabled={isSubmitting}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;