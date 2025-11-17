/**
 * Database Reset Script
 * Drops all tables, runs migrations, and seeds database
 */

import { Pool } from 'pg';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Resetting database...\n');

    console.log('Dropping all tables...');
    
    // Get all table names
    const result = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    // Drop all tables
    for (const row of result.rows) {
      await client.query(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`);
      console.log(`  ✓ Dropped ${row.tablename}`);
    }

    console.log('\n✅ All tables dropped');
    console.log('\nRunning migrations...');

    // Run migrations
    execSync('npm run db:migrate', { stdio: 'inherit' });

    console.log('\n✅ Migrations complete');
    console.log('\nSeeding database...');

    // Run seed script
    execSync('npm run db:seed', { stdio: 'inherit' });

    console.log('\n====================================');
    console.log('✅ Database reset complete!');
    console.log('====================================\n');

  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase().catch(console.error);
