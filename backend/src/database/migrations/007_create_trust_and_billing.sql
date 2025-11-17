-- Migration 007: Create Trust Metrics and Billing Tables
-- Description: Creates supplier trust metrics, billing ledger, and payment tracking

-- Trust Metrics Table
CREATE TABLE trust_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  spec_reliability_pct DECIMAL(5, 2) DEFAULT 0, -- % of orders matching specifications
  on_time_pct DECIMAL(5, 2) DEFAULT 0, -- % of on-time deliveries
  issue_rate_pct DECIMAL(5, 2) DEFAULT 0, -- % of orders with issues/disputes
  sample_size INTEGER DEFAULT 0, -- Number of completed orders in calculation
  total_orders INTEGER DEFAULT 0,
  total_disputes INTEGER DEFAULT 0,
  total_late_deliveries INTEGER DEFAULT 0,
  total_spec_mismatches INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2), -- Average star rating if implemented
  total_ratings INTEGER DEFAULT 0,
  response_time_hours DECIMAL(8, 2), -- Average response time to RFQs
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT unique_supplier_metrics UNIQUE(supplier_id),
  CONSTRAINT check_percentages CHECK (
    spec_reliability_pct >= 0 AND spec_reliability_pct <= 100 AND
    on_time_pct >= 0 AND on_time_pct <= 100 AND
    issue_rate_pct >= 0 AND issue_rate_pct <= 100
  ),
  CONSTRAINT check_counts CHECK (
    sample_size >= 0 AND
    total_orders >= 0 AND
    total_disputes >= 0 AND
    total_late_deliveries >= 0 AND
    total_spec_mismatches >= 0 AND
    total_ratings >= 0
  ),
  CONSTRAINT check_rating CHECK (
    average_rating IS NULL OR
    (average_rating >= 0 AND average_rating <= 5)
  )
);

-- Billing Ledger Table
CREATE TABLE billing_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_id UUID REFERENCES orders(id),
  booking_id UUID REFERENCES rental_bookings(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'order', 'rental', 'refund', 'adjustment'
  order_type order_type, -- 'material' or 'rental'
  effective_value DECIMAL(12, 2) NOT NULL, -- Order/booking total value
  fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Platform fee percentage
  fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Calculated fee amount
  net_amount DECIMAL(12, 2) NOT NULL, -- Amount due to supplier
  invoice_number VARCHAR(50) UNIQUE,
  invoice_status invoice_status DEFAULT 'pending',
  invoice_issued_at TIMESTAMP WITH TIME ZONE,
  payment_due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_ledger_amounts CHECK (
    effective_value >= 0 AND
    fee_percentage >= 0 AND fee_percentage <= 100 AND
    fee_amount >= 0 AND
    net_amount >= 0
  ),
  CONSTRAINT check_order_or_booking CHECK (
    (order_id IS NOT NULL AND booking_id IS NULL) OR
    (order_id IS NULL AND booking_id IS NOT NULL) OR
    (transaction_type IN ('refund', 'adjustment'))
  )
);

-- Supplier Payments Table (track payments to suppliers)
CREATE TABLE supplier_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  ledger_ids UUID[], -- Array of billing_ledger IDs included in this payment
  payment_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'bank_transfer', 'check', 'other'
  payment_reference VARCHAR(255),
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_payment_amount CHECK (payment_amount > 0)
);

-- Buyer Payments Table (track payments from buyers)
CREATE TABLE buyer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  booking_id UUID REFERENCES rental_bookings(id),
  payment_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'cash', 'card', 'bank_transfer', 'mobile_money'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_reference VARCHAR(255),
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_buyer_payment_amount CHECK (payment_amount > 0)
);

-- Supplier Reviews Table (if ratings are implemented)
CREATE TABLE supplier_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  booking_id UUID REFERENCES rental_bookings(id),
  rating INTEGER NOT NULL, -- 1-5 stars
  review_text TEXT,
  response_text TEXT, -- Supplier's response
  response_date TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false, -- Verified purchase/rental
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_review_per_order UNIQUE(buyer_id, order_id),
  CONSTRAINT unique_review_per_booking UNIQUE(buyer_id, booking_id),
  CONSTRAINT check_order_or_booking_review CHECK (
    (order_id IS NOT NULL AND booking_id IS NULL) OR
    (order_id IS NULL AND booking_id IS NOT NULL)
  )
);

-- Indexes for Trust Metrics
CREATE INDEX idx_trust_metrics_supplier_id ON trust_metrics(supplier_id);
CREATE INDEX idx_trust_metrics_spec_reliability ON trust_metrics(spec_reliability_pct DESC);
CREATE INDEX idx_trust_metrics_on_time ON trust_metrics(on_time_pct DESC);
CREATE INDEX idx_trust_metrics_issue_rate ON trust_metrics(issue_rate_pct ASC);
CREATE INDEX idx_trust_metrics_sample_size ON trust_metrics(sample_size DESC);

-- Indexes for Billing Ledger
CREATE INDEX idx_billing_ledger_supplier_id ON billing_ledger(supplier_id);
CREATE INDEX idx_billing_ledger_order_id ON billing_ledger(order_id);
CREATE INDEX idx_billing_ledger_booking_id ON billing_ledger(booking_id);
CREATE INDEX idx_billing_ledger_invoice_status ON billing_ledger(invoice_status);
CREATE INDEX idx_billing_ledger_payment_due_date ON billing_ledger(payment_due_date);
CREATE INDEX idx_billing_ledger_created_at ON billing_ledger(created_at DESC);

-- Indexes for Supplier Payments
CREATE INDEX idx_supplier_payments_supplier_id ON supplier_payments(supplier_id);
CREATE INDEX idx_supplier_payments_payment_date ON supplier_payments(payment_date DESC);
CREATE INDEX idx_supplier_payments_created_at ON supplier_payments(created_at DESC);

-- Indexes for Buyer Payments
CREATE INDEX idx_buyer_payments_buyer_id ON buyer_payments(buyer_id);
CREATE INDEX idx_buyer_payments_order_id ON buyer_payments(order_id);
CREATE INDEX idx_buyer_payments_booking_id ON buyer_payments(booking_id);
CREATE INDEX idx_buyer_payments_payment_status ON buyer_payments(payment_status);
CREATE INDEX idx_buyer_payments_created_at ON buyer_payments(created_at DESC);

-- Indexes for Reviews
CREATE INDEX idx_reviews_supplier_id ON supplier_reviews(supplier_id);
CREATE INDEX idx_reviews_buyer_id ON supplier_reviews(buyer_id);
CREATE INDEX idx_reviews_rating ON supplier_reviews(rating);
CREATE INDEX idx_reviews_is_visible ON supplier_reviews(is_visible);
CREATE INDEX idx_reviews_created_at ON supplier_reviews(created_at DESC);

-- Triggers
CREATE TRIGGER update_trust_metrics_updated_at
  BEFORE UPDATE ON trust_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_ledger_updated_at
  BEFORE UPDATE ON billing_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON supplier_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update trust metrics when confirmation is made
CREATE OR REPLACE FUNCTION update_trust_metrics_on_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  order_rec RECORD;
  supplier_uuid UUID;
  is_on_time BOOLEAN;
  is_spec_match BOOLEAN;
  has_issue BOOLEAN;
BEGIN
  -- Get order details
  SELECT o.*, s.id as supplier_uuid
  INTO order_rec
  FROM orders o
  JOIN suppliers s ON o.supplier_id = s.id
  WHERE o.id = NEW.order_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  supplier_uuid := order_rec.supplier_uuid;

  -- Determine metrics for this confirmation
  IF NEW.confirmation_type = 'confirm' THEN
    has_issue := false;
    is_spec_match := true;
  ELSE -- dispute
    has_issue := true;
    is_spec_match := CASE
      WHEN NEW.dispute_category IN ('specification_mismatch', 'wrong_item', 'quality_issue')
      THEN false
      ELSE true
    END;
  END IF;

  -- Check if delivery was on time
  is_on_time := order_rec.delivered_at <= order_rec.promised_window_end;

  -- Insert or update trust metrics
  INSERT INTO trust_metrics (supplier_id, total_orders, sample_size)
  VALUES (supplier_uuid, 1, 1)
  ON CONFLICT (supplier_id) DO UPDATE SET
    total_orders = trust_metrics.total_orders + 1,
    sample_size = trust_metrics.sample_size + 1,
    total_disputes = trust_metrics.total_disputes + CASE WHEN has_issue THEN 1 ELSE 0 END,
    total_late_deliveries = trust_metrics.total_late_deliveries + CASE WHEN NOT is_on_time THEN 1 ELSE 0 END,
    total_spec_mismatches = trust_metrics.total_spec_mismatches + CASE WHEN NOT is_spec_match THEN 1 ELSE 0 END,
    spec_reliability_pct = CASE
      WHEN trust_metrics.sample_size + 1 > 0
      THEN ((trust_metrics.sample_size - trust_metrics.total_spec_mismatches - CASE WHEN NOT is_spec_match THEN 1 ELSE 0 END)::DECIMAL / (trust_metrics.sample_size + 1)::DECIMAL) * 100
      ELSE 0
    END,
    on_time_pct = CASE
      WHEN trust_metrics.sample_size + 1 > 0
      THEN ((trust_metrics.sample_size - trust_metrics.total_late_deliveries - CASE WHEN NOT is_on_time THEN 1 ELSE 0 END)::DECIMAL / (trust_metrics.sample_size + 1)::DECIMAL) * 100
      ELSE 0
    END,
    issue_rate_pct = CASE
      WHEN trust_metrics.sample_size + 1 > 0
      THEN ((trust_metrics.total_disputes + CASE WHEN has_issue THEN 1 ELSE 0 END)::DECIMAL / (trust_metrics.sample_size + 1)::DECIMAL) * 100
      ELSE 0
    END,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trust metrics on confirmation
CREATE TRIGGER update_trust_metrics_trigger
  AFTER INSERT ON confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_metrics_on_confirmation();

-- Function to create billing ledger entry when order completes
CREATE OR REPLACE FUNCTION create_billing_entry_on_order_complete()
RETURNS TRIGGER AS $$
DECLARE
  platform_fee_pct DECIMAL(5, 2) := 5.0; -- 5% platform fee (configurable)
  fee_amt DECIMAL(10, 2);
  net_amt DECIMAL(12, 2);
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    fee_amt := NEW.grand_total * (platform_fee_pct / 100);
    net_amt := NEW.grand_total - fee_amt;

    INSERT INTO billing_ledger (
      supplier_id,
      order_id,
      transaction_type,
      order_type,
      effective_value,
      fee_percentage,
      fee_amount,
      net_amount,
      payment_due_date
    )
    VALUES (
      NEW.supplier_id,
      NEW.id,
      'order',
      NEW.order_type,
      NEW.grand_total,
      platform_fee_pct,
      fee_amt,
      net_amt,
      (CURRENT_DATE + INTERVAL '7 days')::DATE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create billing entry
CREATE TRIGGER create_billing_entry_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_billing_entry_on_order_complete();

-- Function to create billing entry when rental completes
CREATE OR REPLACE FUNCTION create_billing_entry_on_rental_complete()
RETURNS TRIGGER AS $$
DECLARE
  platform_fee_pct DECIMAL(5, 2) := 5.0; -- 5% platform fee
  fee_amt DECIMAL(10, 2);
  net_amt DECIMAL(12, 2);
  total_amt DECIMAL(12, 2);
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    total_amt := NEW.total_rental_amount + NEW.late_return_fee + NEW.damage_fee;
    fee_amt := total_amt * (platform_fee_pct / 100);
    net_amt := total_amt - fee_amt;

    INSERT INTO billing_ledger (
      supplier_id,
      booking_id,
      transaction_type,
      order_type,
      effective_value,
      fee_percentage,
      fee_amount,
      net_amount,
      payment_due_date
    )
    VALUES (
      NEW.supplier_id,
      NEW.id,
      'rental',
      'rental',
      total_amt,
      platform_fee_pct,
      fee_amt,
      net_amt,
      (CURRENT_DATE + INTERVAL '7 days')::DATE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create billing entry for rentals
CREATE TRIGGER create_billing_entry_rental_trigger
  AFTER UPDATE ON rental_bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_billing_entry_on_rental_complete();

-- Comments
COMMENT ON TABLE trust_metrics IS 'Supplier trust and performance metrics calculated from order history';
COMMENT ON COLUMN trust_metrics.spec_reliability_pct IS 'Percentage of orders matching specifications (no spec disputes)';
COMMENT ON COLUMN trust_metrics.on_time_pct IS 'Percentage of deliveries within promised time window';
COMMENT ON COLUMN trust_metrics.issue_rate_pct IS 'Percentage of orders with disputes or issues';
COMMENT ON COLUMN trust_metrics.sample_size IS 'Number of completed orders used in calculations';

COMMENT ON TABLE billing_ledger IS 'Financial ledger tracking all transactions and platform fees';
COMMENT ON COLUMN billing_ledger.effective_value IS 'Total transaction value';
COMMENT ON COLUMN billing_ledger.fee_percentage IS 'Platform fee percentage applied';
COMMENT ON COLUMN billing_ledger.fee_amount IS 'Calculated platform fee amount';
COMMENT ON COLUMN billing_ledger.net_amount IS 'Amount payable to supplier after fees';
COMMENT ON COLUMN billing_ledger.invoice_status IS 'Status: pending, issued, paid, overdue, cancelled';

COMMENT ON TABLE supplier_payments IS 'Payments made to suppliers';
COMMENT ON TABLE buyer_payments IS 'Payments received from buyers';
COMMENT ON TABLE supplier_reviews IS 'Buyer reviews and ratings for suppliers';
