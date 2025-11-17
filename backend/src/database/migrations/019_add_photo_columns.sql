-- Migration 019: Add Photo Columns
-- Description: Adds photo URL columns for delivery proofs, dispute evidence, and catalog images

-- Add photo URLs to delivery_events (delivery proof photos)
ALTER TABLE delivery_events
  ADD COLUMN IF NOT EXISTS proof_photos text[];

-- Add photo URLs to confirmations (dispute evidence photos)
ALTER TABLE confirmations
  ADD COLUMN IF NOT EXISTS evidence_photos text[];

-- Add photo URLs to handovers (rental handover/return photos)
ALTER TABLE handovers
  ADD COLUMN IF NOT EXISTS handover_photos text[],
  ADD COLUMN IF NOT EXISTS return_photos text[];

-- Add photo URLs to returns (return condition photos)
ALTER TABLE returns
  ADD COLUMN IF NOT EXISTS condition_photos text[];

-- Add photo URLs to skus (product catalog images)
ALTER TABLE skus
  ADD COLUMN IF NOT EXISTS product_photos text[];

-- Comments
COMMENT ON COLUMN delivery_events.proof_photos IS 'Photos proving delivery completion';
COMMENT ON COLUMN confirmations.evidence_photos IS 'Photos supporting dispute/confirmation claims';
COMMENT ON COLUMN handovers.handover_photos IS 'Photos of tool condition at handover';
COMMENT ON COLUMN handovers.return_photos IS 'Photos of tool condition at return';
COMMENT ON COLUMN returns.condition_photos IS 'Photos of returned item condition';
COMMENT ON COLUMN skus.product_photos IS 'Product catalog photos (max 3)';
