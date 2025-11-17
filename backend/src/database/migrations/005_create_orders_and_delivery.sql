-- Migration 005: Create Orders and Delivery Tables
-- Description: Creates order management, delivery tracking, and confirmation tables

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number
  buyer_id UUID NOT NULL REFERENCES users(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  project_id UUID REFERENCES projects(id),
  offer_id UUID REFERENCES offers(id), -- If created from accepted offer
  order_type order_type NOT NULL DEFAULT 'material',
  items JSONB NOT NULL, -- Array of order items: [{sku_id?, description, quantity, unit, unit_price, total}]
  total_amount DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  grand_total DECIMAL(12, 2) NOT NULL,
  pickup_or_delivery delivery_option NOT NULL,
  delivery_address TEXT,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  promised_window_start TIMESTAMP WITH TIME ZONE,
  promised_window_end TIMESTAMP WITH TIME ZONE,
  payment_terms payment_terms NOT NULL DEFAULT 'cod',
  negotiable BOOLEAN DEFAULT false,
  status order_status DEFAULT 'pending',
  notes TEXT,
  buyer_notes TEXT,
  supplier_notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_order_amounts CHECK (
    total_amount >= 0 AND
    delivery_fee >= 0 AND
    tax_amount >= 0 AND
    grand_total >= 0
  ),
  CONSTRAINT check_promised_window CHECK (
    promised_window_start IS NULL OR
    promised_window_end IS NULL OR
    promised_window_start < promised_window_end
  ),
  CONSTRAINT check_delivery_coordinates CHECK (
    (delivery_latitude IS NULL AND delivery_longitude IS NULL) OR
    (delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL AND
     delivery_latitude >= -90 AND delivery_latitude <= 90 AND
     delivery_longitude >= -180 AND delivery_longitude <= 180)
  )
);

-- Delivery Events Table (tracking actual deliveries)
CREATE TABLE delivery_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  photos TEXT[], -- Array of photo URLs from delivery
  quantities_delivered JSONB NOT NULL, -- Array mapping items to delivered quantities
  delivery_notes TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  supplier_user_id UUID REFERENCES users(id), -- Who logged the delivery
  vehicle_info VARCHAR(255),
  driver_name VARCHAR(255),
  is_partial BOOLEAN DEFAULT false, -- Partial delivery
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Confirmations Table (buyer confirms or disputes delivery)
CREATE TABLE confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_event_id UUID REFERENCES delivery_events(id),
  buyer_user_id UUID NOT NULL REFERENCES users(id),
  confirmation_type confirmation_type NOT NULL,
  dispute_reason TEXT,
  dispute_category dispute_category,
  evidence_photos TEXT[], -- Array of photo URLs for disputes
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id), -- Admin who resolved dispute
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_dispute_fields CHECK (
    (confirmation_type = 'dispute' AND dispute_reason IS NOT NULL) OR
    (confirmation_type = 'confirm' AND dispute_reason IS NULL)
  )
);

-- Order Status History (audit trail)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Communications (messages between buyer and supplier)
CREATE TABLE order_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  attachments TEXT[], -- Array of attachment URLs
  is_internal BOOLEAN DEFAULT false, -- Internal note not visible to other party
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX idx_orders_project_id ON orders(project_id);
CREATE INDEX idx_orders_offer_id ON orders(offer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_promised_window ON orders(promised_window_start, promised_window_end);
CREATE INDEX idx_orders_items ON orders USING gin(items);

-- Indexes for Delivery Events
CREATE INDEX idx_delivery_events_order_id ON delivery_events(order_id);
CREATE INDEX idx_delivery_events_supplier_user_id ON delivery_events(supplier_user_id);
CREATE INDEX idx_delivery_events_timestamp ON delivery_events(timestamp DESC);
CREATE INDEX idx_delivery_events_is_partial ON delivery_events(is_partial);

-- Indexes for Confirmations
CREATE INDEX idx_confirmations_order_id ON confirmations(order_id);
CREATE INDEX idx_confirmations_buyer_user_id ON confirmations(buyer_user_id);
CREATE INDEX idx_confirmations_confirmation_type ON confirmations(confirmation_type);
CREATE INDEX idx_confirmations_timestamp ON confirmations(timestamp DESC);
CREATE INDEX idx_confirmations_resolved_at ON confirmations(resolved_at);

-- Indexes for Order Status History
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Indexes for Order Communications
CREATE INDEX idx_order_comms_order_id ON order_communications(order_id);
CREATE INDEX idx_order_comms_sender_id ON order_communications(sender_id);
CREATE INDEX idx_order_comms_created_at ON order_communications(created_at DESC);

-- Triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month VARCHAR(6);
  sequence_num INTEGER;
BEGIN
  -- Format: ORD-YYYYMM-XXXXX
  year_month := TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMM');

  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 12) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'ORD-' || year_month || '-%';

  NEW.order_number := 'ORD-' || year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log status changes
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Function to update order status after delivery event
CREATE OR REPLACE FUNCTION update_order_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET status = 'delivered',
      delivered_at = NEW.timestamp
  WHERE id = NEW.order_id
    AND status = 'in_transit';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order after delivery
CREATE TRIGGER update_order_on_delivery_trigger
  AFTER INSERT ON delivery_events
  FOR EACH ROW
  EXECUTE FUNCTION update_order_on_delivery();

-- Function to update order status after confirmation
CREATE OR REPLACE FUNCTION update_order_on_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_type = 'confirm' THEN
    UPDATE orders
    SET status = 'completed',
        completed_at = NEW.timestamp
    WHERE id = NEW.order_id
      AND status = 'delivered';
  ELSIF NEW.confirmation_type = 'dispute' THEN
    UPDATE orders
    SET status = 'disputed'
    WHERE id = NEW.order_id
      AND status = 'delivered';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order after confirmation
CREATE TRIGGER update_order_on_confirmation_trigger
  AFTER INSERT ON confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_order_on_confirmation();

-- Comments
COMMENT ON TABLE orders IS 'Material and rental orders placed by buyers with suppliers';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order identifier (ORD-YYYYMM-XXXXX)';
COMMENT ON COLUMN orders.items IS 'JSONB array of ordered items with quantities and prices';
COMMENT ON COLUMN orders.pickup_or_delivery IS 'Whether order is for pickup or delivery';
COMMENT ON COLUMN orders.promised_window_start IS 'Supplier promised delivery start time';
COMMENT ON COLUMN orders.promised_window_end IS 'Supplier promised delivery end time';
COMMENT ON COLUMN orders.negotiable IS 'Whether terms are still being negotiated';

COMMENT ON TABLE delivery_events IS 'Log of actual delivery events with photos and quantities';
COMMENT ON COLUMN delivery_events.photos IS 'Array of photo URLs taken at delivery';
COMMENT ON COLUMN delivery_events.quantities_delivered IS 'JSONB mapping of items to actual delivered quantities';
COMMENT ON COLUMN delivery_events.is_partial IS 'Whether this is a partial delivery';

COMMENT ON TABLE confirmations IS 'Buyer confirmations or disputes of deliveries';
COMMENT ON COLUMN confirmations.confirmation_type IS 'Type: confirm (accept) or dispute (reject)';
COMMENT ON COLUMN confirmations.dispute_category IS 'Category of dispute if disputing';
COMMENT ON COLUMN confirmations.evidence_photos IS 'Photos provided as evidence for disputes';

COMMENT ON TABLE order_status_history IS 'Audit trail of order status changes';
COMMENT ON TABLE order_communications IS 'Messages between buyer and supplier about the order';
