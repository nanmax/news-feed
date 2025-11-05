#!/usr/bin/env node

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'news_feed_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

const migrations = [
  {
    version: '001',
    name: 'create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `DROP TABLE IF EXISTS users CASCADE;`
  },
  {
    version: '002',
    name: 'create_posts_table',
    up: `
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL CHECK (LENGTH(content) <= 200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `DROP TABLE IF EXISTS posts CASCADE;`
  },
  {
    version: '003',
    name: 'create_follows_table',
    up: `
      CREATE TABLE IF NOT EXISTS follows (
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, followee_id),
        CHECK (follower_id != followee_id)
      );
    `,
    down: `DROP TABLE IF EXISTS follows CASCADE;`
  },
  {
    version: '004',
    name: 'create_refresh_tokens_table',
    up: `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_revoked BOOLEAN DEFAULT FALSE
      );
    `,
    down: `DROP TABLE IF EXISTS refresh_tokens CASCADE;`
  },
  {
    version: '005',
    name: 'create_indexes',
    up: `
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
      CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `,
    down: `
      DROP INDEX IF EXISTS idx_posts_user_id;
      DROP INDEX IF EXISTS idx_posts_created_at;
      DROP INDEX IF EXISTS idx_follows_follower_id;
      DROP INDEX IF EXISTS idx_follows_followee_id;
      DROP INDEX IF EXISTS idx_refresh_tokens_token;
      DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
    `
  },
  {
    version: '006',
    name: 'create_migrations_table',
    up: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `DROP TABLE IF EXISTS migrations;`
  }
];

async function createMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Migrations table created or verified');
  } catch (error) {
    console.error('❌ Error creating migrations table:', error);
    throw error;
  }
}

async function getExecutedMigrations() {
  try {
    const result = await pool.query('SELECT version FROM migrations ORDER BY version');
    return result.rows.map(row => row.version);
  } catch (error) {
    console.error('❌ Error getting executed migrations:', error);
    return [];
  }
}

async function executeMigration(migration) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log(`🔄 Executing migration ${migration.version}: ${migration.name}`);
    await client.query(migration.up);
    
    await client.query(
      'INSERT INTO migrations (version, name) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING',
      [migration.version, migration.name]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Migration ${migration.version} completed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Migration ${migration.version} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function rollbackMigration(migration) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log(`🔄 Rolling back migration ${migration.version}: ${migration.name}`);
    await client.query(migration.down);
    
    await client.query('DELETE FROM migrations WHERE version = $1', [migration.version]);
    
    await client.query('COMMIT');
    console.log(`✅ Migration ${migration.version} rolled back successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Rollback ${migration.version} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    await createMigrationsTable();
    const executedMigrations = await getExecutedMigrations();
    
    console.log(`📋 Found ${executedMigrations.length} executed migrations`);
    
    let executedCount = 0;
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.version)) {
        await executeMigration(migration);
        executedCount++;
      } else {
        console.log(`⏭️  Migration ${migration.version} already executed, skipping`);
      }
    }
    
    if (executedCount === 0) {
      console.log('🎉 Database is up to date! No new migrations to run.');
    } else {
      console.log(`🎉 Successfully executed ${executedCount} new migrations!`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function rollbackLastMigration() {
  try {
    console.log('🔄 Rolling back last migration...');
    
    await createMigrationsTable();
    const result = await pool.query('SELECT version, name FROM migrations ORDER BY version DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('ℹ️  No migrations to rollback');
      return;
    }
    
    const lastMigration = result.rows[0];
    const migration = migrations.find(m => m.version === lastMigration.version);
    
    if (!migration) {
      console.error(`❌ Migration definition not found for version ${lastMigration.version}`);
      process.exit(1);
    }
    
    await rollbackMigration(migration);
    console.log('🎉 Rollback completed successfully!');
    
  } catch (error) {
    console.error('💥 Rollback failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function showStatus() {
  try {
    await createMigrationsTable();
    const executedMigrations = await getExecutedMigrations();
    
    console.log('\n📊 Migration Status:');
    console.log('==================');
    
    for (const migration of migrations) {
      const status = executedMigrations.includes(migration.version) ? '✅ Applied' : '⏸️  Pending';
      console.log(`${migration.version}: ${migration.name} - ${status}`);
    }
    
    console.log(`\n📈 Total: ${migrations.length} migrations, ${executedMigrations.length} applied, ${migrations.length - executedMigrations.length} pending`);
    
  } catch (error) {
    console.error('💥 Error checking status:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'up':
  case 'migrate':
    runMigrations();
    break;
  case 'down':
  case 'rollback':
    rollbackLastMigration();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log(`
📋 Database Migration Tool

Usage:
  node migrate.js <command>

Commands:
  up, migrate    Run pending migrations
  down, rollback Rollback the last migration
  status         Show migration status

Examples:
  node migrate.js up
  node migrate.js status
  node migrate.js rollback
    `);
    process.exit(1);
}