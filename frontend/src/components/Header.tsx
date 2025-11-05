import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      showSuccess('Logged out successfully');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo">News Feed</h1>
        </div>
        
        <div className="header-right">
          {user && (
            <div className="user-section">
              <span className="welcome-text">Welcome, {user.username}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;