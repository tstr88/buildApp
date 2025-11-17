-- Fix phone column length in users table
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(20);
