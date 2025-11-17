# Database Migrations Guide

## Overview

This guide explains how to work with database migrations for the buildApp PostgreSQL database.

## Quick Start

### Prerequisites

1. PostgreSQL 14+ installed and running
2. Node.js 18+ installed
3. Backend dependencies installed (`npm install`)

### Setup Database

```bash
# Create the database
createdb buildapp

# Or using psql
psql -U postgres
CREATE DATABASE buildapp;
\q
```

### Configure Environment

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildapp
DB_USER=postgres
DB_PASSWORD=your_password
```

### Run Migrations

```bash
cd backend

# Run all pending migrations
npm run migrate

# Check status
npm run migrate:status
```

## Migration Commands

### Run Migrations

```bash
# Run all pending migrations
npm run migrate

# Alternative command
npm run migrate up
```

This will:
1. Create the `schema_migrations` tracking table if needed
2. Check which migrations have been executed
3. Run all pending migrations in order
4. Record each migration in the tracking table

### Check Status

```bash
npm run migrate:status
```

Shows:
- Which migrations have been applied
- Which migrations are pending
- Total migration count

Example output:
```
Migration Status:

============================================================
[✓ Applied] 001: create_enums_and_base_types
[✓ Applied] 002: create_users_and_projects
[✓ Applied] 003: create_suppliers_and_skus
[✗ Pending] 004: create_rfqs_and_offers
============================================================

Total: 9 | Applied: 3 | Pending: 6
```

### Rollback Migrations

```bash
# Rollback last migration
npm run migrate:rollback

# Rollback last 3 migrations
npm run migrate:rollback 3
```

**Important Notes:**
- Rollback only removes the migration record from `schema_migrations`
- Database changes persist (tables/data are not automatically removed)
- For production, create separate "down" migrations to safely revert changes

### Create New Migration

```bash
npm run migrate:create add_feature_name
```

This creates a new migration file with the next sequential number.

## Migration Files

### Location

All migration files are in: `backend/src/database/migrations/`

### Naming Convention

Format: `NNN_descriptive_name.sql`

- `NNN`: 3-digit sequential number (001, 002, etc.)
- `descriptive_name`: Snake_case description
- `.sql`: SQL file extension

Examples:
- `001_create_enums_and_base_types.sql`
- `002_create_users_and_projects.sql`
- `010_add_user_preferences.sql`

### Current Migrations

1. **001_create_enums_and_base_types.sql**
   - All enum types (user_type, order_status, etc.)
   - PostgreSQL extensions (uuid-ossp, btree_gin)
   - Base type definitions

2. **002_create_users_and_projects.sql**
   - users table (authentication, profiles)
   - projects table (buyer projects)
   - user_sessions table (JWT tokens)
   - otps table (phone verification)
   - Base indexes and triggers

3. **003_create_suppliers_and_skus.sql**
   - suppliers table (supplier profiles)
   - skus table (product catalog)
   - sku_price_history table (price tracking)
   - supplier_categories table
   - supplier_operating_hours table
   - Price change logging trigger

4. **004_create_rfqs_and_offers.sql**
   - rfqs table (requests for quotes)
   - rfq_recipients table (supplier tracking)
   - offers table (supplier quotes)
   - rfq_attachments and offer_attachments
   - rfq_views table (analytics)
   - Auto-expiration triggers

5. **005_create_orders_and_delivery.sql**
   - orders table (material orders)
   - delivery_events table (delivery tracking)
   - confirmations table (buyer confirmations/disputes)
   - order_status_history table (audit trail)
   - order_communications table (messages)
   - Auto-numbering, status update triggers

6. **006_create_rental_system.sql**
   - rental_tools table (equipment catalog)
   - rental_bookings table (rental orders)
   - handovers table (tool handover docs)
   - returns table (tool return docs)
   - rental_availability table (calendar)
   - Booking automation triggers

7. **007_create_trust_and_billing.sql**
   - trust_metrics table (supplier reputation)
   - billing_ledger table (financial tracking)
   - supplier_payments and buyer_payments tables
   - supplier_reviews table
   - Auto-update trust metrics trigger
   - Auto-create billing entries trigger

8. **008_create_notifications_and_templates.sql**
   - notifications table (multi-channel)
   - notification_preferences table
   - templates table (construction templates)
   - template_usage and user_saved_templates
   - system_logs table (audit trail)
   - scheduled_tasks table (background jobs)
   - Notification helper functions

9. **009_additional_indexes_and_extensions.sql**
   - Geographic extensions (cube, earthdistance, pg_trgm)
   - Performance indexes (composite, partial, GIN, GIST)
   - Distance calculation functions
   - Supplier search functions
   - supplier_statistics materialized view

## Writing Migrations

### Best Practices

1. **One Purpose Per Migration**
   - Each migration should have a single, clear purpose
   - Don't mix unrelated changes

2. **Use Comments**
   ```sql
   -- Migration 010: Add user preferences
   -- Description: Adds user preference settings for notifications and display
   ```

3. **Use Transactions**
   - Migrations automatically run in transactions
   - If any statement fails, entire migration rolls back

4. **Add Constraints**
   ```sql
   CONSTRAINT check_positive_amount CHECK (amount > 0)
   ```

5. **Add Indexes**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   ```

6. **Add Comments to Schema**
   ```sql
   COMMENT ON TABLE users IS 'User accounts for authentication';
   COMMENT ON COLUMN users.phone IS 'Unique phone number';
   ```

7. **Test Locally First**
   - Always test migrations in development before production
   - Verify data integrity after migration

### Common Patterns

#### Creating a Table

```sql
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_example_name ON example(name);

-- Add trigger for updated_at
CREATE TRIGGER update_example_updated_at
  BEFORE UPDATE ON example
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE example IS 'Description of the table';
```

#### Adding a Column

```sql
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);

-- Add index if needed
CREATE INDEX idx_users_middle_name ON users(middle_name);

-- Add comment
COMMENT ON COLUMN users.middle_name IS 'User middle name';
```

#### Creating an Enum

```sql
CREATE TYPE status_type AS ENUM ('active', 'inactive', 'pending');

-- Use in table
ALTER TABLE example ADD COLUMN status status_type DEFAULT 'pending';
```

#### Adding a Foreign Key

```sql
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;
```

#### Creating a Trigger

```sql
CREATE OR REPLACE FUNCTION my_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER my_trigger
  AFTER INSERT ON my_table
  FOR EACH ROW
  EXECUTE FUNCTION my_trigger_function();
```

## Troubleshooting

### Migration Fails

```bash
# Check the error message
npm run migrate

# Check current status
npm run migrate:status

# If needed, manually fix the database issue
psql -d buildapp -U postgres

# Try running migrations again
npm run migrate
```

### Migration Already Applied

If you need to re-run a migration:

```sql
-- Remove from tracking table
DELETE FROM schema_migrations WHERE migration_number = 5;

-- Then run migrations again
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U postgres -d buildapp

# Check environment variables
cat backend/.env

# Verify PostgreSQL is running
pg_isready
```

### Reset Database (Development Only!)

```bash
# WARNING: This deletes all data!

# Drop and recreate database
dropdb buildapp
createdb buildapp

# Run all migrations
cd backend
npm run migrate
```

## Production Considerations

### Before Deploying

1. **Test Locally**
   ```bash
   npm run migrate:status
   npm run migrate
   ```

2. **Backup Database**
   ```bash
   pg_dump -U postgres buildapp > backup.sql
   ```

3. **Review Migration SQL**
   - Check all migration files
   - Verify no destructive operations
   - Confirm indexes won't cause downtime

### During Deployment

1. **Run in Maintenance Window**
   - Some migrations may lock tables
   - Plan for brief downtime if needed

2. **Monitor Progress**
   ```bash
   npm run migrate 2>&1 | tee migration.log
   ```

3. **Verify Success**
   ```bash
   npm run migrate:status
   ```

### Rollback Plan

1. **Have Database Backup**
   ```bash
   pg_restore -U postgres -d buildapp backup.sql
   ```

2. **Document Rollback Steps**
   - For each migration, document how to manually revert

3. **Test Rollback Locally**
   - Practice rollback procedure before production

## Advanced Usage

### Manual Migration

If you need to run SQL manually:

```bash
psql -d buildapp -U postgres -f backend/src/database/migrations/001_file.sql
```

### Check Migration Table

```sql
SELECT * FROM schema_migrations ORDER BY migration_number;
```

### Skip Migration (Not Recommended)

```sql
-- Mark as executed without running
INSERT INTO schema_migrations (migration_number, migration_name)
VALUES (5, 'migration_name');
```

### Custom Migration Script

```typescript
import { runMigrations } from './src/database/migrate';

async function customMigration() {
  try {
    await runMigrations();
    console.log('Migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

customMigration();
```

## Database Maintenance

### Regular Tasks

```bash
# Refresh materialized views
psql -d buildapp -c "SELECT refresh_supplier_statistics();"

# Clean old notifications
psql -d buildapp -c "SELECT cleanup_old_notifications();"

# Vacuum and analyze
psql -d buildapp -c "VACUUM ANALYZE;"
```

### Monitoring

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Getting Help

1. **Check Documentation**
   - [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
   - This file
   - Migration file comments

2. **Review Migration Files**
   - Each migration has detailed comments
   - Look at similar migrations for examples

3. **Test in Development**
   - Always test migrations locally first
   - Use a copy of production data if possible

4. **Database Logs**
   ```bash
   # PostgreSQL logs (location varies by OS)
   tail -f /var/log/postgresql/postgresql-14-main.log
   ```

## FAQ

**Q: Can I modify an existing migration?**

A: No, never modify a migration that has been applied. Create a new migration for changes.

**Q: What if I need to rename a column?**

A: Create a new migration with ALTER TABLE statements.

**Q: How do I add seed data?**

A: Create a separate seed script or add INSERT statements in a migration.

**Q: Can migrations be run in parallel?**

A: No, migrations must run sequentially to maintain order.

**Q: What about down migrations?**

A: Currently, rollback only removes the record. For production, create explicit down migrations.

**Q: How do I handle migration conflicts in teams?**

A: Communicate about migrations, resolve conflicts by creating new migrations with corrections.

---

**Last Updated**: 2025-01
**Database Version**: 1.0
**Migration System Version**: 1.0
