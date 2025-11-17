import { Pool } from 'pg';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

interface Migration {
  migration_number: number;
  migration_name: string;
  executed_at: Date;
}

// Create migrations tracking table if it doesn't exist
async function createMigrationsTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_number INTEGER UNIQUE NOT NULL,
        migration_name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Migrations table ready');
  } finally {
    client.release();
  }
}

// Get list of executed migrations
async function getExecutedMigrations(): Promise<Set<number>> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ migration_number: number }>(
      'SELECT migration_number FROM schema_migrations ORDER BY migration_number'
    );
    return new Set(result.rows.map((row) => row.migration_number));
  } finally {
    client.release();
  }
}

// Get list of migration files
async function getMigrationFiles(): Promise<Array<{ number: number; name: string; path: string }>> {
  const migrationsDir = join(__dirname, 'migrations');
  const files = await readdir(migrationsDir);

  const migrations = files
    .filter((file) => file.endsWith('.sql'))
    .map((file) => {
      const match = file.match(/^(\d{3})_(.+)\.sql$/);
      if (!match) {
        throw new Error(`Invalid migration filename: ${file}`);
      }
      return {
        number: parseInt(match[1]),
        name: match[2],
        path: join(migrationsDir, file),
      };
    })
    .sort((a, b) => a.number - b.number);

  return migrations;
}

// Execute a single migration
async function executeMigration(
  migration: { number: number; name: string; path: string }
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log(`\nExecuting migration ${migration.number}: ${migration.name}`);

    // Read and execute migration SQL
    const sql = await readFile(migration.path, 'utf-8');
    await client.query(sql);

    // Record migration
    await client.query(
      'INSERT INTO schema_migrations (migration_number, migration_name) VALUES ($1, $2)',
      [migration.number, migration.name]
    );

    await client.query('COMMIT');
    console.log(`✓ Migration ${migration.number} completed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Migration ${migration.number} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Rollback last N migrations
async function rollbackMigrations(count: number = 1): Promise<void> {
  const client = await pool.connect();

  try {
    const result = await client.query<Migration>(
      'SELECT migration_number, migration_name FROM schema_migrations ORDER BY migration_number DESC LIMIT $1',
      [count]
    );

    if (result.rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    for (const migration of result.rows) {
      console.log(`\nRolling back migration ${migration.migration_number}: ${migration.migration_name}`);

      // Note: This is a simple rollback that just removes the record
      // For production, you'd want to create separate rollback SQL files
      await client.query('DELETE FROM schema_migrations WHERE migration_number = $1', [
        migration.migration_number,
      ]);

      console.log(`✓ Migration ${migration.migration_number} rolled back`);
      console.warn('⚠ Note: Rollback only removed migration record. Database changes persist.');
      console.warn(
        '  For full rollback, create a down migration or manually revert changes.'
      );
    }
  } finally {
    client.release();
  }
}

// Run pending migrations
async function runMigrations(): Promise<void> {
  console.log('Starting database migrations...\n');

  await createMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = await getMigrationFiles();

  const pendingMigrations = migrationFiles.filter(
    (migration) => !executedMigrations.has(migration.number)
  );

  if (pendingMigrations.length === 0) {
    console.log('✓ No pending migrations');
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);

  for (const migration of pendingMigrations) {
    await executeMigration(migration);
  }

  console.log('\n✓ All migrations completed successfully!');
}

// Show migration status
async function showStatus(): Promise<void> {
  await createMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = await getMigrationFiles();

  console.log('\nMigration Status:\n');
  console.log('='.repeat(60));

  for (const migration of migrationFiles) {
    const status = executedMigrations.has(migration.number) ? '✓ Applied' : '✗ Pending';
    console.log(`[${status}] ${migration.number}: ${migration.name}`);
  }

  console.log('='.repeat(60));
  console.log(
    `\nTotal: ${migrationFiles.length} | Applied: ${executedMigrations.size} | Pending: ${migrationFiles.length - executedMigrations.size}`
  );
}

// Main CLI
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await runMigrations();
        break;

      case 'down':
      case 'rollback': {
        const count = parseInt(process.argv[3] || '1');
        await rollbackMigrations(count);
        break;
      }

      case 'status':
        await showStatus();
        break;

      case 'create': {
        const name = process.argv[3];
        if (!name) {
          console.error('Error: Migration name required');
          console.log('Usage: npm run migrate:create <migration_name>');
          process.exit(1);
        }

        // Get next migration number
        const migrationFiles = await getMigrationFiles();
        const nextNumber = migrationFiles.length > 0
          ? Math.max(...migrationFiles.map((m) => m.number)) + 1
          : 1;

        const filename = `${nextNumber.toString().padStart(3, '0')}_${name.replace(/\s+/g, '_')}.sql`;
        const filepath = join(__dirname, 'migrations', filename);

        await writeFile(
          filepath,
          `-- Migration ${nextNumber}: ${name}\n-- Description: \n\n-- Add your SQL here\n`
        );

        console.log(`✓ Created migration: ${filename}`);
        break;
      }

      default:
        console.log('buildApp Database Migration Tool\n');
        console.log('Usage:');
        console.log('  npm run migrate          - Run pending migrations');
        console.log('  npm run migrate:status   - Show migration status');
        console.log('  npm run migrate:rollback [N] - Rollback last N migrations (default: 1)');
        console.log('  npm run migrate:create <name> - Create new migration file');
        console.log('\nExamples:');
        console.log('  npm run migrate');
        console.log('  npm run migrate:status');
        console.log('  npm run migrate:rollback');
        console.log('  npm run migrate:rollback 3');
        console.log('  npm run migrate:create add_user_settings');
    }
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runMigrations, rollbackMigrations, showStatus };
