#!/bin/bash

# buildApp Database Setup Script
# Creates PostgreSQL database, user, and runs migrations

set -e

echo "🗄️  buildApp Database Setup"
echo "======================================"

# Configuration
DB_NAME="buildapp_dev"
DB_USER="buildapp_user"
DB_PASSWORD="buildapp_password"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Please start PostgreSQL first:"
    echo "  macOS: brew services start postgresql@14"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database user if it doesn't exist
echo ""
echo "Creating database user..."
psql -h $DB_HOST -p $DB_PORT -d postgres -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
    psql -h $DB_HOST -p $DB_PORT -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

echo "✅ Database user created/exists"

# Create database if it doesn't exist
echo ""
echo "Creating database..."
psql -h $DB_HOST -p $DB_PORT -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -h $DB_HOST -p $DB_PORT -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "✅ Database created/exists"

# Grant privileges
psql -h $DB_HOST -p $DB_PORT -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "✅ Privileges granted"

echo ""
echo "======================================"
echo "✅ Database setup complete!"
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "Next steps:"
echo "  1. Run migrations: npm run db:migrate"
echo "  2. Seed data: npm run db:seed"
echo "  3. Start server: npm run dev"
echo ""
