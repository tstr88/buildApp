-- Migration 012: Allow Dual Buyer-Supplier Role
-- Description: Modifies the check_buyer_role constraint to allow users to be both buyers and suppliers

-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_buyer_role;

-- Add a new, more flexible constraint
-- Users can now:
-- 1. Be a buyer with a buyer_role
-- 2. Be a supplier with or without a buyer_role (to support dual roles)
-- 3. Be an admin without a buyer_role
ALTER TABLE users ADD CONSTRAINT check_buyer_role CHECK (
  (user_type = 'buyer' AND buyer_role IS NOT NULL) OR
  (user_type = 'supplier') OR
  (user_type = 'admin' AND buyer_role IS NULL)
);

-- Comment explaining the change
COMMENT ON CONSTRAINT check_buyer_role ON users IS
  'Ensures buyers have a role, allows suppliers to optionally retain buyer role for dual functionality, and prevents admins from having buyer roles';
