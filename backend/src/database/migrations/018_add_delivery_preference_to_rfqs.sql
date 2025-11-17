-- Migration 018: Add Delivery Preference to RFQs
-- Description: Adds delivery_preference field to support pickup vs delivery options in RFQs

-- Add delivery_preference column to rfqs table
ALTER TABLE rfqs
  ADD COLUMN delivery_preference delivery_option DEFAULT 'delivery';

-- Add index for filtering by delivery preference
CREATE INDEX idx_rfqs_delivery_preference ON rfqs(delivery_preference);

-- Comments
COMMENT ON COLUMN rfqs.delivery_preference IS 'Whether buyer wants delivery or pickup (delivery, pickup, or both)';
