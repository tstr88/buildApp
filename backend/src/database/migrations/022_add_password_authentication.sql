-- Migration 022: Add Password Authentication
-- Replace OTP-based authentication with email/password authentication

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Make email required and unique
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);

-- Make phone optional (can login with email or phone)
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Drop the unique constraint on phone (allow multiple users without phone)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Create a unique index on phone where it's not null
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone) WHERE phone IS NOT NULL;

-- Keep OTP table for now (can be used for password reset in future)
-- We won't delete it yet in case we need to rollback
