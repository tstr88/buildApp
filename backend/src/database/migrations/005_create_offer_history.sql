-- Migration 005: Create Offer History Table
-- Description: Tracks historical versions of offers when suppliers revise them

-- Offer History Table (tracks all previous versions of offers)
CREATE TABLE offer_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  line_prices JSONB NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  delivery_window_start TIMESTAMP WITH TIME ZONE,
  delivery_window_end TIMESTAMP WITH TIME ZONE,
  payment_terms payment_terms NOT NULL DEFAULT 'cod',
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status offer_status DEFAULT 'pending',
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When this version was created
  superseded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When it was replaced

  -- Constraints
  CONSTRAINT check_total_amount CHECK (total_amount >= 0),
  CONSTRAINT check_delivery_fee CHECK (delivery_fee >= 0),
  CONSTRAINT check_delivery_window CHECK (
    delivery_window_start IS NULL OR
    delivery_window_end IS NULL OR
    delivery_window_start < delivery_window_end
  )
);

-- Indexes for Offer History
CREATE INDEX idx_offer_history_offer_id ON offer_history(offer_id);
CREATE INDEX idx_offer_history_rfq_id ON offer_history(rfq_id);
CREATE INDEX idx_offer_history_supplier_id ON offer_history(supplier_id);
CREATE INDEX idx_offer_history_created_at ON offer_history(created_at DESC);
CREATE INDEX idx_offer_history_version ON offer_history(offer_id, version_number DESC);

-- Comments
COMMENT ON TABLE offer_history IS 'Historical versions of offers when suppliers revise them';
COMMENT ON COLUMN offer_history.version_number IS 'Sequential version number starting from 1';
COMMENT ON COLUMN offer_history.created_at IS 'When this version of the offer was originally created';
COMMENT ON COLUMN offer_history.superseded_at IS 'When this version was replaced by a new version';
