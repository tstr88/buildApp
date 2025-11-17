-- Migration 017: Make RFQ project_id optional and add user_id
-- Description: Allows creating RFQs without linking to a project

-- Add user_id column to rfqs table
ALTER TABLE rfqs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Populate user_id from existing project relationships
UPDATE rfqs r
SET user_id = p.user_id
FROM projects p
WHERE r.project_id = p.id;

-- Make user_id NOT NULL after populating
ALTER TABLE rfqs ALTER COLUMN user_id SET NOT NULL;

-- Make project_id nullable (RFQs can exist without a project)
ALTER TABLE rfqs ALTER COLUMN project_id DROP NOT NULL;

-- Add index on user_id for faster queries
CREATE INDEX idx_rfqs_user_id ON rfqs(user_id);

-- Add comment
COMMENT ON COLUMN rfqs.user_id IS 'The buyer who created this RFQ';
COMMENT ON COLUMN rfqs.project_id IS 'Optional project this RFQ is linked to';
