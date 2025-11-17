-- Migration 004: Create RFQs and Offers Tables
-- Description: Creates Request for Quote (RFQ) and supplier offer tables

-- RFQs Table (Request for Quotes)
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255),
  lines JSONB NOT NULL, -- Array of line items: [{sku_id?, description, quantity, unit, spec_notes}]
  preferred_window_start TIMESTAMP WITH TIME ZONE,
  preferred_window_end TIMESTAMP WITH TIME ZONE,
  delivery_location_lat DECIMAL(10, 8),
  delivery_location_lng DECIMAL(11, 8),
  delivery_address TEXT,
  additional_notes TEXT,
  status rfq_status DEFAULT 'draft',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_rfq_window CHECK (
    preferred_window_start IS NULL OR
    preferred_window_end IS NULL OR
    preferred_window_start < preferred_window_end
  ),
  CONSTRAINT check_delivery_coordinates CHECK (
    (delivery_location_lat IS NULL AND delivery_location_lng IS NULL) OR
    (delivery_location_lat IS NOT NULL AND delivery_location_lng IS NOT NULL AND
     delivery_location_lat >= -90 AND delivery_location_lat <= 90 AND
     delivery_location_lng >= -180 AND delivery_location_lng <= 180)
  )
);

-- RFQ Recipients Table (which suppliers received this RFQ)
CREATE TABLE rfq_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  notified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT unique_rfq_supplier UNIQUE(rfq_id, supplier_id)
);

-- Offers Table (Supplier responses to RFQs)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  line_prices JSONB NOT NULL, -- Array matching RFQ lines with prices: [{line_index, unit_price, total_price, notes}]
  total_amount DECIMAL(12, 2) NOT NULL,
  delivery_window_start TIMESTAMP WITH TIME ZONE,
  delivery_window_end TIMESTAMP WITH TIME ZONE,
  payment_terms payment_terms NOT NULL DEFAULT 'cod',
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status offer_status DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_total_amount CHECK (total_amount >= 0),
  CONSTRAINT check_delivery_fee CHECK (delivery_fee >= 0),
  CONSTRAINT check_delivery_window CHECK (
    delivery_window_start IS NULL OR
    delivery_window_end IS NULL OR
    delivery_window_start < delivery_window_end
  ),
  CONSTRAINT unique_rfq_supplier_offer UNIQUE(rfq_id, supplier_id)
);

-- RFQ Attachments (photos, drawings, specifications)
CREATE TABLE rfq_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- 'photo', 'pdf', 'drawing', 'document'
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offer Attachments (supplier can attach documents to offer)
CREATE TABLE offer_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ Views Log (analytics for suppliers)
CREATE TABLE rfq_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address INET
);

-- Indexes for RFQs
CREATE INDEX idx_rfqs_project_id ON rfqs(project_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_created_at ON rfqs(created_at DESC);
CREATE INDEX idx_rfqs_expires_at ON rfqs(expires_at);
CREATE INDEX idx_rfqs_preferred_window ON rfqs(preferred_window_start, preferred_window_end);
CREATE INDEX idx_rfqs_lines ON rfqs USING gin(lines);

-- Indexes for RFQ Recipients
CREATE INDEX idx_rfq_recipients_rfq_id ON rfq_recipients(rfq_id);
CREATE INDEX idx_rfq_recipients_supplier_id ON rfq_recipients(supplier_id);
CREATE INDEX idx_rfq_recipients_viewed_at ON rfq_recipients(viewed_at);
CREATE INDEX idx_rfq_recipients_notified_at ON rfq_recipients(notified_at DESC);

-- Indexes for Offers
CREATE INDEX idx_offers_rfq_id ON offers(rfq_id);
CREATE INDEX idx_offers_supplier_id ON offers(supplier_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_created_at ON offers(created_at DESC);
CREATE INDEX idx_offers_expires_at ON offers(expires_at);
CREATE INDEX idx_offers_accepted_at ON offers(accepted_at);

-- Indexes for Attachments
CREATE INDEX idx_rfq_attachments_rfq_id ON rfq_attachments(rfq_id);
CREATE INDEX idx_offer_attachments_offer_id ON offer_attachments(offer_id);

-- Indexes for Views
CREATE INDEX idx_rfq_views_rfq_id ON rfq_views(rfq_id);
CREATE INDEX idx_rfq_views_supplier_id ON rfq_views(supplier_id);
CREATE INDEX idx_rfq_views_viewed_at ON rfq_views(viewed_at DESC);

-- Triggers
CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON rfqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark RFQ recipient as viewed
CREATE OR REPLACE FUNCTION mark_rfq_as_viewed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rfq_recipients
  SET viewed_at = NEW.viewed_at
  WHERE rfq_id = NEW.rfq_id
    AND supplier_id = NEW.supplier_id
    AND viewed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update recipient when view is logged
CREATE TRIGGER update_rfq_recipient_viewed
  AFTER INSERT ON rfq_views
  FOR EACH ROW
  EXECUTE FUNCTION mark_rfq_as_viewed();

-- Function to update RFQ status when all offers expire
CREATE OR REPLACE FUNCTION check_rfq_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If the RFQ's expiration time has passed, mark it as expired
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < CURRENT_TIMESTAMP AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check expiration on update
CREATE TRIGGER check_rfq_expiration_trigger
  BEFORE UPDATE ON rfqs
  FOR EACH ROW
  EXECUTE FUNCTION check_rfq_expiration();

-- Comments
COMMENT ON TABLE rfqs IS 'Request for Quotes from buyers to suppliers';
COMMENT ON COLUMN rfqs.lines IS 'JSONB array of line items with descriptions, quantities, specifications';
COMMENT ON COLUMN rfqs.preferred_window_start IS 'Buyer preferred delivery start time';
COMMENT ON COLUMN rfqs.preferred_window_end IS 'Buyer preferred delivery end time';
COMMENT ON COLUMN rfqs.status IS 'Current status: draft, active, expired, or closed';

COMMENT ON TABLE rfq_recipients IS 'Tracks which suppliers received specific RFQs';
COMMENT ON COLUMN rfq_recipients.viewed_at IS 'When supplier first viewed the RFQ';
COMMENT ON COLUMN rfq_recipients.notified_at IS 'When notification was sent to supplier';

COMMENT ON TABLE offers IS 'Supplier responses/quotes for RFQs';
COMMENT ON COLUMN offers.line_prices IS 'JSONB array with pricing for each RFQ line item';
COMMENT ON COLUMN offers.total_amount IS 'Total amount for the entire offer';
COMMENT ON COLUMN offers.delivery_fee IS 'Additional delivery/transport fee';
COMMENT ON COLUMN offers.expires_at IS 'When this offer expires and is no longer valid';
COMMENT ON COLUMN offers.status IS 'Current status: pending, accepted, rejected, expired, withdrawn';

COMMENT ON TABLE rfq_attachments IS 'Files attached to RFQs (photos, drawings, specs)';
COMMENT ON TABLE offer_attachments IS 'Files attached to offers (quotes, certificates)';
COMMENT ON TABLE rfq_views IS 'Analytics log of when suppliers view RFQs';
