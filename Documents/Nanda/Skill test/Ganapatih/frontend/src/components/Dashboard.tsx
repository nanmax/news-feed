import React, { useState } from 'react';
import Header from './Header';
import PostCreator from './PostCreator';
import NewsFeed from './NewsFeed';
import UserCard from './UserCard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFollowUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-left">
            <PostCreator onPostCreated={handlePostCreated} />
            <NewsFeed refreshTrigger={refreshTrigger} />
          </div>
          
          <div className="dashboard-right">
            <UserCard onFollowUpdate={handleFollowUpdate} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;