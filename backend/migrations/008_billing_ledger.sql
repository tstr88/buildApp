-- Billing Ledger Table
-- Tracks success-fee charges for completed orders and rentals

CREATE TABLE IF NOT EXISTS billing_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Order Reference
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('material', 'rental')),
  
  -- Financial Details
  effective_value DECIMAL(12, 2) NOT NULL, -- Final delivered value after adjustments
  fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00, -- Success-fee rate (e.g., 5.00 for 5%)
  fee_amount DECIMAL(12, 2) NOT NULL, -- Calculated fee
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'disputed')),
  
  -- Timestamps
  completed_at TIMESTAMP NOT NULL, -- When order was completed
  invoiced_at TIMESTAMP, -- When invoice was generated
  paid_at TIMESTAMP, -- When payment was received
  
  -- Additional Info
  notes TEXT, -- Adjustments, disputes, etc.
  invoice_id VARCHAR(50), -- Reference to invoice document
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_billing_ledger_supplier ON billing_ledger(supplier_id);
CREATE INDEX idx_billing_ledger_status ON billing_ledger(status);
CREATE INDEX idx_billing_ledger_completed_at ON billing_ledger(completed_at);
CREATE INDEX idx_billing_ledger_order ON billing_ledger(order_id);

-- Supplier Balance Summary View
CREATE OR REPLACE VIEW supplier_billing_summary AS
SELECT 
  supplier_id,
  -- Pending fees (not yet invoiced)
  COALESCE(SUM(CASE WHEN status = 'pending' THEN fee_amount ELSE 0 END), 0) as pending_fees,
  -- Invoiced but not paid
  COALESCE(SUM(CASE WHEN status = 'invoiced' THEN fee_amount ELSE 0 END), 0) as outstanding_fees,
  -- Paid fees (historical)
  COALESCE(SUM(CASE WHEN status = 'paid' THEN fee_amount ELSE 0 END), 0) as paid_fees,
  -- Total fees ever charged
  COALESCE(SUM(fee_amount), 0) as total_fees,
  -- Order counts
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'invoiced') as invoiced_count,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_count
FROM billing_ledger
GROUP BY supplier_id;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_billing_ledger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billing_ledger_updated_at
  BEFORE UPDATE ON billing_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_ledger_updated_at();

-- Insert sample data for testing (using existing supplier)
INSERT INTO billing_ledger (
  supplier_id,
  order_id,
  order_type,
  effective_value,
  fee_percentage,
  fee_amount,
  status,
  completed_at,
  notes
) VALUES 
  -- Completed material orders
  (
    '5bbd07cd-54bf-459a-8d9a-baa35b2968ae',
    (SELECT id FROM orders WHERE supplier_id = '5bbd07cd-54bf-459a-8d9a-baa35b2968ae' LIMIT 1),
    'material',
    1250.00,
    5.00,
    62.50,
    'pending',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'Standard delivery, no adjustments'
  ),
  (
    '5bbd07cd-54bf-459a-8d9a-baa35b2968ae',
    NULL,
    'material',
    3500.00,
    5.00,
    175.00,
    'pending',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'Large concrete order'
  ),
  (
    '5bbd07cd-54bf-459a-8d9a-baa35b2968ae',
    NULL,
    'material',
    890.00,
    5.00,
    44.50,
    'invoiced',
    CURRENT_TIMESTAMP - INTERVAL '25 days',
    'Invoiced in previous month'
  ),
  (
    '5bbd07cd-54bf-459a-8d9a-baa35b2968ae',
    NULL,
    'rental',
    450.00,
    5.00,
    22.50,
    'paid',
    CURRENT_TIMESTAMP - INTERVAL '35 days',
    'Tool rental - 5 days'
  );
