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

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-50 characters)",
  "password": "string (6+ characters)"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "john_doe"
}
```

#### POST /api/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "jwt_access_token",
  "refreshToken": "refresh_token_string",
  "expiresIn": "1h"
}
```

#### POST /api/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_access_token",
  "expiresIn": "1h"
}
```

#### POST /api/logout
Logout user and revoke refresh tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### User Endpoints

#### GET /api/users
Get all users for follow suggestions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "isFollowing": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/users/following
Get list of users that current user is following.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "following": [
    {
      "id": 2,
      "username": "jane_doe",
      "isFollowing": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Follow Endpoints

#### POST /api/follow/:userid
Follow a user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (201):**
```json
{
  "message": "you followed user 2"
}
```

#### DELETE /api/follow/:userid
Unfollow a user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "you unfollowed user 2"
}
```

### Post Endpoints

#### POST /api/posts
Create a new post.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "content": "string (max 200 characters)"
}
```

**Response (201):**
```json
{
  "id": 1,
  "userId": 1,
  "username": "john_doe",
  "content": "Hello, world!",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Feed Endpoints

#### GET /api/feed
Get news feed with posts from followed users.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10, max: 50)

**Response (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "userId": 2,
      "username": "jane_doe",
      "content": "Hello from Jane!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Health Check

#### GET /health
Check API health status.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Follows Table
```sql
CREATE TABLE follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id != followee_id)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE
);
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

### Test Coverage

The application includes comprehensive test coverage for:
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end user flow tests

## 🚀 Deployment

### Production Deployment

1. **Set environment variables for production**
2. **Build the applications**
   ```bash
   # Backend
   cd backend && npm run build

   # Frontend
   cd frontend && npm run build
   ```

3. **Deploy using Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Security Considerations

- Change JWT secrets in production
- Use HTTPS in production
- Configure proper CORS origins
- Set up proper database security
- Use environment-specific configurations
- Enable rate limiting
- Regular security updates

## 🎨 Design Decisions

### Frontend Architecture
- **Component-based**: Modular and reusable components
- **Context API**: Centralized state management for authentication
- **Custom Hooks**: Reusable logic for common operations
- **Error Boundaries**: Graceful error handling
- **TypeScript**: Type safety and better developer experience

### Backend Architecture
- **Layered Architecture**: Clear separation of concerns
- **Middleware Pattern**: Request/response processing pipeline
- **Repository Pattern**: Data access abstraction
- **JWT with Refresh Tokens**: Secure and scalable authentication
- **Input Validation**: Comprehensive request validation

### Database Design
- **Normalized Schema**: Efficient data storage and relationships
- **Indexes**: Optimized query performance
- **Constraints**: Data integrity enforcement
- **Cascading Deletes**: Automatic cleanup of related data

### Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Input Sanitization**: XSS and injection prevention
- **CORS Configuration**: Controlled cross-origin access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
- **Real-time Character Counter**: Live feedback while typing posts
- **Responsive Design**: Works on desktop and mobile devices
- **JWT with Refresh Tokens**: Secure authentication with automatic token refresh
- **Token Management**: Automatic cleanup of expired tokens

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router DOM** for navigation
- **Axios** for HTTP requests
- **CSS3** with custom styling
- **Nginx** for production deployment

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** database
- **JWT** with refresh tokens for authentication
- **Bcrypt** for password hashing
- **Joi** for request validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate limiting** for API protection
- **Node-cron** for scheduled token cleanup

### DevOps
- **Docker** and **Docker Compose** for containerization
- **Multi-stage builds** for optimized production images

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "username": "john_doe"
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Username already exists

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...",
  "expiresIn": "1h"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials

#### Refresh Token
```http
POST /api/refresh-token
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid or expired refresh token

#### Logout
```http
POST /api/logout
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401` - Unauthorized

### Posts Endpoints

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello world!"
}
```

**Success Response (201):**
```json
{
  "id": 10,
  "userid": 1,
  "content": "Hello world!",
  "createdat": "2025-11-05T10:00:00Z"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Unauthorized
- `422` - Content exceeds 200 characters

### Follow Endpoints

#### Follow User
```http
POST /api/follow/:userid
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "you are now following user 2"
}
```

**Error Responses:**
- `400` - Invalid user ID or trying to follow yourself
- `401` - Unauthorized
- `404` - User not found
- `409` - Already following this user

#### Unfollow User
```http
DELETE /api/follow/:userid
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "you unfollowed user 2"
}
```

**Error Responses:**
- `400` - Invalid user ID
- `401` - Unauthorized
- `404` - Not following this user

### Feed Endpoints

#### Get News Feed
```http
GET /api/feed?page=1&limit=10
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "page": 1,
  "posts": [
    {
      "id": 15,
      "userid": 2,
      "content": "Latest post from user 2",
      "createdat": "2025-11-05T11:00:00Z"
    },
    {
      "id": 12,
      "userid": 3,
      "content": "Another post from user 3",
      "createdat": "2025-11-05T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid pagination parameters
- `401` - Unauthorized

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Follows Table
```sql
CREATE TABLE follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id != followee_id)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE
);
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followee_id ON follows(followee_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

## Setup Instructions

### Prerequisites
- **Node.js** 18 or higher
- **PostgreSQL** 13 or higher
- **Docker** and **Docker Compose** (for containerized deployment)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news-feed-system
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

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

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb news_feed_db
   
   # The application will automatically create tables on first run
   ```

5. **Start the backend**
   ```bash
   # Development
   npm run dev
   
   # Production
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

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default points to localhost:3001)
   ```

4. **Start the frontend**
   ```bash
   # Development
   npm start
   
   # Production build
   npm run build
   npm install -g serve
   serve -s build
   ```

## Environment Variables

### Backend (.env)
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

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Testing

### Manual Testing Scenarios

#### Test Case 1: Registration & Login
1. **Register a new user**
   - Navigate to the application
   - Fill in username and password
   - Click "Register"
   - Should automatically log in after registration

2. **Login with existing user**
   - Use the toggle to switch to login mode
   - Enter valid credentials
   - Should redirect to dashboard

3. **Error handling**
   - Try registering with existing username → Should show 409 error
   - Try login with wrong credentials → Should show 401 error

#### Test Case 2: Create Post
1. **Create valid post**
   - Enter text up to 200 characters
   - Character counter should update in real-time
   - Click "Post" → Should appear in feed

2. **Validation**
   - Try to post empty content → Should show error
   - Type more than 200 characters → Submit button should disable
   - Character counter should turn red when over limit

#### Test Case 3: Follow/Unfollow
1. **Follow workflow**
   - Currently not implemented in UI but API endpoints are ready
   - Can be tested via API calls or Postman

2. **Feed updates**
   - Posts from followed users should appear in feed
   - Feed should be sorted by newest first

#### Test Case 4: News Feed
1. **Feed display**
   - Should show posts from followed users only
   - Should display user info and timestamps
   - Should show relative time (e.g., "2h ago")

2. **Pagination**
   - Should load 10 posts initially
   - "Load More" button should fetch next page
   - Should handle empty feed gracefully

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Joi schema validation for all endpoints
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Helmet security headers
- **CORS Configuration**: Controlled cross-origin access

## Performance Optimizations

- **Database Indexes**: Optimized queries for feed retrieval
- **Connection Pooling**: PostgreSQL connection pool
- **Pagination**: Efficient data loading
- **React Optimization**: Proper state management and re-rendering
- **Docker Multi-stage Builds**: Smaller production images

## Deployment

### Production Deployment

1. **Update environment variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure production database credentials
   - Set proper CORS origins

2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Health Checks**
   - Backend health: `GET /health`
   - Database connectivity is verified on startup

### Deployment Platforms

This application can be deployed on:
- **AWS** (ECS, EC2, RDS)
- **Heroku** with PostgreSQL addon
- **Railway** with PostgreSQL
- **DigitalOcean** App Platform
- **Vercel** (frontend) + **Railway/Render** (backend)
- **Netlify** (frontend) + **Heroku** (backend)

## Known Limitations

1. **Follow/Unfollow UI**: Currently only API endpoints exist
2. **User Discovery**: No search or user listing functionality
3. **Real-time Updates**: No WebSocket implementation
4. **File Uploads**: No image/media support
5. **Email Verification**: No email confirmation for registration

## Future Enhancements

1. **User Management UI**: Follow/unfollow buttons, user profiles
2. **Real-time Features**: WebSocket for live updates
3. **Media Support**: Image and video uploads
4. **Search Functionality**: Search users and posts
5. **Notifications**: Real-time notifications for follows and likes
6. **Post Interactions**: Like, comment, and share features
7. **Admin Panel**: User management and content moderation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   - Ensure PostgreSQL is running
   - Check database credentials in .env
   - Verify database exists

2. **CORS Errors**
   ```
   Access to fetch at 'http://localhost:3001/api/...' blocked by CORS
   ```
   - Check backend CORS configuration
   - Ensure frontend URL is in allowed origins

3. **JWT Token Issues**
   ```
   401 Unauthorized
   ```
   - Check if token is stored in localStorage
   - Verify JWT secret matches between requests
   - Token might be expired

4. **Build Errors**
   ```
   Module not found
   ```
   - Run `npm install` in respective directories
   - Check Node.js version compatibility
   - Clear node_modules and reinstall

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed error stacks and SQL queries in console.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is created for technical assessment purposes.

---

**Ganapatih Full-Stack Developer Take-Home Test**  
*News Feed System Implementation*  
*November 2025*