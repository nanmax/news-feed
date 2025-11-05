require('dotenv').config({ path: '.env.test' });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'newsfeed_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

beforeAll(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Failed to connect to test database:', error.message);
    process.exit(1);
  }
});

afterAll(async () => {
  await pool.end();
});

global.testPool = pool;