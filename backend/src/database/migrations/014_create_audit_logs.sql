-- Migration 014: Create audit logs table for admin tracking
-- Immutable logs for critical platform actions

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Actor (who performed the action)
  actor_id UUID REFERENCES users(id),
  actor_name VARCHAR(200),
  actor_type VARCHAR(20), -- 'buyer', 'supplier', 'admin', 'system'

  -- Action details
  action_type VARCHAR(50) NOT NULL, -- 'offer_accepted', 'delivery_confirmed', etc.

  -- Target (what was affected)
  target_type VARCHAR(50), -- 'order', 'rfq', 'supplier', 'template', etc.
  target_id VARCHAR(100), -- ID of the affected entity

  -- Additional context
  details JSONB DEFAULT '{}'::jsonb, -- before/after state, notes, metadata
  ip_address INET, -- IP address of the actor

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Prevent updates and deletes (immutability)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Seed some example audit logs for testing
INSERT INTO audit_logs (actor_id, actor_name, actor_type, action_type, target_type, target_id, details, ip_address)
SELECT
  u.id,
  u.name,
  u.user_type,
  'user_registered',
  'user',
  u.id::text,
  jsonb_build_object('phone', u.phone, 'buyer_role', u.buyer_role),
  '127.0.0.1'::inet
FROM users u
WHERE u.user_type IN ('buyer', 'supplier', 'admin')
LIMIT 5;

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for critical platform actions';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed (e.g., offer_accepted, delivery_confirmed, supplier_approved)';
COMMENT ON COLUMN audit_logs.details IS 'JSONB field containing before/after state, notes, and additional metadata';
