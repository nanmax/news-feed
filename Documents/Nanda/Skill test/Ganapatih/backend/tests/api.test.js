const request = require('supertest');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = require('../src/index');
const { pool } = require('../src/database/config');

describe('News Feed API Tests', () => {
  let testUser1, testUser2;
  let user1Token, user2Token;

  beforeAll(async () => {
    await cleanDatabase();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  async function cleanDatabase() {
    await pool.query('DELETE FROM refresh_tokens');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM posts');
    await pool.query('DELETE FROM users');
  }

  async function setupTestData() {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test users
    const user1Result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      ['testuser1', hashedPassword]
    );
    testUser1 = user1Result.rows[0];

    const user2Result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      ['testuser2', hashedPassword]
    );
    testUser2 = user2Result.rows[0];

    // Login to get tokens
    const login1Response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser1', password: 'password123' });
    user1Token = login1Response.body.token;

    const login2Response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser2', password: 'password123' });
    user2Token = login2Response.body.token;
  }

  describe('Authentication Endpoints', () => {
    describe('POST /api/register', () => {
      test('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            username: 'newuser',
            password: 'password123'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe('newuser');
      });

      test('should reject duplicate username', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            username: 'testuser1',
            password: 'password123'
          });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Username already exists');
      });

      test('should reject invalid input', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            username: 'ab',
            password: '123'
          });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/login', () => {
      test('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            username: 'testuser1',
            password: 'password123'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body).toHaveProperty('expiresIn');
      });

      test('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            username: 'testuser1',
            password: 'wrongpassword'
          });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
      });

      test('should reject non-existent user', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            username: 'nonexistent',
            password: 'password123'
          });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
      });
    });

    describe('POST /api/refresh-token', () => {
      test('should refresh token successfully', async () => {
        const loginResponse = await request(app)
          .post('/api/login')
          .send({
            username: 'testuser1',
            password: 'password123'
          });

        const refreshToken = loginResponse.body.refreshToken;

        const response = await request(app)
          .post('/api/refresh-token')
          .send({ refreshToken });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('expiresIn');
      });

      test('should reject invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/refresh-token')
          .send({ refreshToken: 'invalid_token' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or expired refresh token');
      });
    });

    describe('POST /api/logout', () => {
      test('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/logout')
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logged out successfully');
      });

      test('should reject logout without token', async () => {
        const response = await request(app)
          .post('/api/logout');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('User Endpoints', () => {
    describe('GET /api/users', () => {
      test('should get all users with follow status', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('users');
        expect(Array.isArray(response.body.users)).toBe(true);
        expect(response.body.users.length).toBeGreaterThan(0);
        
        const user = response.body.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('isFollowing');
        expect(user).toHaveProperty('createdAt');
      });

      test('should reject request without authentication', async () => {
        const response = await request(app)
          .get('/api/users');

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/users/following', () => {
      test('should get following list', async () => {
        const response = await request(app)
          .get('/api/users/following')
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('following');
        expect(Array.isArray(response.body.following)).toBe(true);
      });
    });
  });

  describe('Follow Endpoints', () => {
    describe('POST /api/follow/:userid', () => {
      test('should follow a user successfully', async () => {
        const response = await request(app)
          .post(`/api/follow/${testUser2.id}`)
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(`you followed user ${testUser2.id}`);
      });

      test('should reject following self', async () => {
        const response = await request(app)
          .post(`/api/follow/${testUser1.id}`)
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Cannot follow yourself');
      });

      test('should reject following non-existent user', async () => {
        const response = await request(app)
          .post('/api/follow/99999')
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
      });

      test('should reject duplicate follow', async () => {
        const response = await request(app)
          .post(`/api/follow/${testUser2.id}`)
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Already following this user');
      });
    });

    describe('DELETE /api/follow/:userid', () => {
      test('should unfollow a user successfully', async () => {
        const response = await request(app)
          .delete(`/api/follow/${testUser2.id}`)
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`you unfollowed user ${testUser2.id}`);
      });

      test('should reject unfollowing user not being followed', async () => {
        const response = await request(app)
          .delete(`/api/follow/${testUser2.id}`)
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not following this user');
      });
    });
  });

  describe('Post Endpoints', () => {
    describe('POST /api/posts', () => {
      test('should create a post successfully', async () => {
        const postContent = 'This is a test post';
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ content: postContent });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.content).toBe(postContent);
        expect(response.body.username).toBe(testUser1.username);
        expect(response.body).toHaveProperty('createdAt');
      });

      test('should reject post with empty content', async () => {
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ content: '' });

        expect(response.status).toBe(422);
      });

      test('should reject post with content too long', async () => {
        const longContent = 'a'.repeat(201);
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ content: longContent });

        expect(response.status).toBe(422);
      });

      test('should reject post without authentication', async () => {
        const response = await request(app)
          .post('/api/posts')
          .send({ content: 'Test post' });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Feed Endpoints', () => {
    beforeAll(async () => {
      // Create follow relationship and posts for feed testing
      await request(app)
        .post(`/api/follow/${testUser2.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Post from user 2' });
    });

    describe('GET /api/feed', () => {
      test('should get feed with posts from followed users', async () => {
        const response = await request(app)
          .get('/api/feed')
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('posts');
        expect(Array.isArray(response.body.posts)).toBe(true);
        
        if (response.body.posts.length > 0) {
          const post = response.body.posts[0];
          expect(post).toHaveProperty('id');
          expect(post).toHaveProperty('userId');
          expect(post).toHaveProperty('username');
          expect(post).toHaveProperty('content');
          expect(post).toHaveProperty('createdAt');
        }
      });

      test('should support pagination', async () => {
        const response = await request(app)
          .get('/api/feed?page=1&limit=5')
          .set('Authorization', `Bearer ${user1Token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('posts');
        expect(Array.isArray(response.body.posts)).toBe(true);
      });

      test('should reject feed request without authentication', async () => {
        const response = await request(app)
          .get('/api/feed');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Health Check', () => {
    describe('GET /health', () => {
      test('should return health status', async () => {
        const response = await request(app)
          .get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment');
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });
  });
});

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}',
    '!src/**/*.spec.{js,ts}'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};