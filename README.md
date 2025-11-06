# News Feed System

A complete social media news feed application built with React, TypeScript, Node.js, Express, and PostgreSQL.

## 🚀 Features

### Core Features
- **User Authentication**: Register, login, logout with JWT tokens
- **News Feed**: View posts from followed users with infinite scroll
- **Post Creation**: Create text posts (max 200 characters)
- **Follow System**: Follow/unfollow other users
- **User Discovery**: Browse and discover users to follow

### Advanced Features
- **JWT Refresh Tokens**: Automatic token refresh for seamless user experience
- **Infinite Scroll**: Smooth pagination with automatic loading
- **Real-time Updates**: Feed refreshes on new posts and follow changes
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error management and user feedback
- **Rate Limiting**: API protection with configurable rate limits
- **Docker Support**: Full containerization for easy deployment

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Components**: Modular React components with TypeScript
- **State Management**: React Context API for global state
- **API Integration**: Axios with automatic token refresh interceptors
- **Styling**: CSS modules for component styling
- **Error Boundaries**: React error boundaries for graceful error handling

### Backend (Node.js + Express + TypeScript)
- **RESTful API**: Clean API design with proper HTTP status codes
- **Authentication**: JWT with refresh token rotation
- **Database**: PostgreSQL with connection pooling
- **Validation**: Input validation using Joi schemas
- **Security**: Helmet, CORS, rate limiting, password hashing
- **Error Handling**: Centralized error handling middleware

### Database (PostgreSQL)
- **Users Table**: User accounts with hashed passwords
- **Posts Table**: User posts with content and timestamps
- **Follows Table**: User follow relationships
- **Refresh Tokens Table**: Secure token management

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Docker and Docker Compose (optional)

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news-feed-system
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb news_feed_db

   # Run migrations (optional - tables are auto-created)
   npm run migrate
   ```

5. **Start the backend server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start the frontend server**
   ```bash
   # Development mode
   npm start

   # Production build
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_feed_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```
