-- Migration 009: Additional Indexes and Extensions
-- Description: Creates additional performance indexes and enables required extensions

-- Enable cube extension (required for earthdistance)
CREATE EXTENSION IF NOT EXISTS cube;

-- Enable earthdistance extension (for geographical distance calculations)
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Enable pg_trgm extension (for fuzzy text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Additional composite indexes for common query patterns

-- Users
CREATE INDEX idx_users_type_active ON users(user_type, is_active) WHERE is_active = true;
CREATE INDEX idx_users_phone_verified ON users(phone, is_verified);

-- Projects
CREATE INDEX idx_projects_user_active ON projects(user_id, is_active) WHERE is_active = true;

-- Suppliers
CREATE INDEX idx_suppliers_verified_active ON suppliers(is_verified, is_active) WHERE is_active = true;
CREATE INDEX idx_suppliers_business_name_trgm ON suppliers USING gin(business_name gin_trgm_ops);

-- SKUs
CREATE INDEX idx_skus_supplier_active ON skus(supplier_id, is_active) WHERE is_active = true;
CREATE INDEX idx_skus_supplier_category ON skus(supplier_id, category);
CREATE INDEX idx_skus_category_active ON skus(category, is_active) WHERE is_active = true;
CREATE INDEX idx_skus_name_trgm ON skus USING gin(name gin_trgm_ops);

-- RFQs
CREATE INDEX idx_rfqs_project_status ON rfqs(project_id, status);
CREATE INDEX idx_rfqs_status_expires ON rfqs(status, expires_at) WHERE status = 'active';

-- RFQ Recipients
CREATE INDEX idx_rfq_recipients_supplier_viewed ON rfq_recipients(supplier_id, viewed_at);

-- Offers
CREATE INDEX idx_offers_rfq_status ON offers(rfq_id, status);
CREATE INDEX idx_offers_supplier_status ON offers(supplier_id, status);
CREATE INDEX idx_offers_status_expires ON offers(status, expires_at) WHERE status = 'pending';

-- Orders
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, status);
CREATE INDEX idx_orders_supplier_status ON orders(supplier_id, status);
CREATE INDEX idx_orders_buyer_created ON orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_supplier_created ON orders(supplier_id, created_at DESC);
CREATE INDEX idx_orders_status_window ON orders(status, promised_window_start, promised_window_end);

-- Delivery Events
CREATE INDEX idx_delivery_events_order_timestamp ON delivery_events(order_id, timestamp DESC);

-- Confirmations
CREATE INDEX idx_confirmations_order_type ON confirmations(order_id, confirmation_type);

-- Rental Tools
CREATE INDEX idx_rental_tools_supplier_available ON rental_tools(supplier_id, is_available, is_active) WHERE is_active = true;
CREATE INDEX idx_rental_tools_category_available ON rental_tools(category, is_available) WHERE is_active = true;
CREATE INDEX idx_rental_tools_name_trgm ON rental_tools USING gin(name gin_trgm_ops);

-- Rental Bookings
CREATE INDEX idx_rental_bookings_buyer_status ON rental_bookings(buyer_id, status);
CREATE INDEX idx_rental_bookings_supplier_status ON rental_bookings(supplier_id, status);
CREATE INDEX idx_rental_bookings_tool_dates ON rental_bookings(rental_tool_id, start_date, end_date);
CREATE INDEX idx_rental_bookings_status_dates ON rental_bookings(status, start_date, end_date);

-- Billing Ledger
CREATE INDEX idx_billing_ledger_supplier_status ON billing_ledger(supplier_id, invoice_status);
CREATE INDEX idx_billing_ledger_status_due_date ON billing_ledger(invoice_status, payment_due_date) WHERE invoice_status IN ('pending', 'issued', 'overdue');

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_user_type_read ON notifications(user_id, notification_type, is_read);

-- Templates
CREATE INDEX idx_templates_published_category ON templates(is_published, category) WHERE is_published = true;

-- Partial indexes for performance

-- Active RFQs only
CREATE INDEX idx_rfqs_active_window ON rfqs(preferred_window_start, preferred_window_end)
  WHERE status = 'active';

-- Pending offers only
CREATE INDEX idx_offers_pending ON offers(created_at DESC)
  WHERE status = 'pending';

-- In-progress orders
CREATE INDEX idx_orders_in_progress ON orders(created_at DESC)
  WHERE status IN ('pending', 'confirmed', 'in_transit', 'delivered');

-- Overdue rentals (note: can't use CURRENT_DATE in index predicate as it's not immutable)
CREATE INDEX idx_rental_bookings_overdue ON rental_bookings(status, end_date)
  WHERE status = 'active';

-- Unpaid invoices
CREATE INDEX idx_billing_unpaid ON billing_ledger(payment_due_date)
  WHERE invoice_status IN ('pending', 'issued', 'overdue');

-- Helper functions for distance calculations

-- Function to calculate distance between two points in kilometers
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    earth_distance(
      ll_to_earth(lat1::float8, lon1::float8),
      ll_to_earth(lat2::float8, lon2::float8)
    ) / 1000
  )::DECIMAL(10, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find suppliers within radius
CREATE OR REPLACE FUNCTION find_suppliers_in_radius(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km DECIMAL
)
RETURNS TABLE (
  supplier_id UUID,
  business_name VARCHAR,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.business_name,
    calculate_distance_km(p_latitude, p_longitude, s.depot_latitude, s.depot_longitude) as distance
  FROM suppliers s
  WHERE s.depot_latitude IS NOT NULL
    AND s.depot_longitude IS NOT NULL
    AND s.is_active = true
    AND s.is_verified = true
    AND earth_distance(
      ll_to_earth(p_latitude::float8, p_longitude::float8),
      ll_to_earth(s.depot_latitude::float8, s.depot_longitude::float8)
    ) <= (p_radius_km * 1000)
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest suppliers
CREATE OR REPLACE FUNCTION find_nearest_suppliers(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  supplier_id UUID,
  business_name VARCHAR,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.business_name,
    calculate_distance_km(p_latitude, p_longitude, s.depot_latitude, s.depot_longitude) as distance
  FROM suppliers s
  WHERE s.depot_latitude IS NOT NULL
    AND s.depot_longitude IS NOT NULL
    AND s.is_active = true
    AND s.is_verified = true
  ORDER BY
    ll_to_earth(s.depot_latitude::float8, s.depot_longitude::float8) <->
    ll_to_earth(p_latitude::float8, p_longitude::float8)
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for supplier statistics
CREATE MATERIALIZED VIEW supplier_statistics AS
SELECT
  s.id as supplier_id,
  s.business_name,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT rb.id) as total_rentals,
  COALESCE(SUM(o.grand_total), 0) as total_order_value,
  COALESCE(SUM(rb.total_rental_amount), 0) as total_rental_value,
  COALESCE(AVG(sr.rating), 0) as average_rating,
  COUNT(DISTINCT sr.id) as total_reviews,
  tm.spec_reliability_pct,
  tm.on_time_pct,
  tm.issue_rate_pct
FROM suppliers s
LEFT JOIN orders o ON s.id = o.supplier_id AND o.status = 'completed'
LEFT JOIN rental_bookings rb ON s.id = rb.supplier_id AND rb.status = 'completed'
LEFT JOIN supplier_reviews sr ON s.id = sr.supplier_id AND sr.is_visible = true
LEFT JOIN trust_metrics tm ON s.id = tm.supplier_id
WHERE s.is_active = true
GROUP BY s.id, s.business_name, tm.spec_reliability_pct, tm.on_time_pct, tm.issue_rate_pct;

-- Create index on materialized view
CREATE INDEX idx_supplier_stats_supplier_id ON supplier_statistics(supplier_id);
CREATE INDEX idx_supplier_stats_total_orders ON supplier_statistics(total_orders DESC);
CREATE INDEX idx_supplier_stats_rating ON supplier_statistics(average_rating DESC);

-- Function to refresh supplier statistics
CREATE OR REPLACE FUNCTION refresh_supplier_statistics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY supplier_statistics;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION calculate_distance_km IS 'Calculate distance in kilometers between two lat/lon points';
COMMENT ON FUNCTION find_suppliers_in_radius IS 'Find all suppliers within specified radius (km) of a location';
COMMENT ON FUNCTION find_nearest_suppliers IS 'Find N nearest suppliers to a location';
COMMENT ON MATERIALIZED VIEW supplier_statistics IS 'Aggregated statistics for suppliers (refresh periodically)';
COMMENT ON FUNCTION refresh_supplier_statistics IS 'Refresh the supplier_statistics materialized view';
