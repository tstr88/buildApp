-- Migration 020: Add Performance Indexes
-- Description: Adds indexes for frequently queried columns to optimize performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Suppliers table indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_paused ON suppliers(is_paused);
CREATE INDEX IF NOT EXISTS idx_suppliers_trust_metric ON suppliers(trust_metric DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers USING gist(location);
-- JSONB indexes for arrays
CREATE INDEX IF NOT EXISTS idx_suppliers_delivery_options ON suppliers USING gin(delivery_options);
CREATE INDEX IF NOT EXISTS idx_suppliers_categories ON suppliers USING gin(categories);

-- Buyers table indexes
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_buyer_id ON projects(buyer_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects USING gist(location);

-- RFQs table indexes
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_project_id ON rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON rfqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfqs_expires_at ON rfqs(expires_at);
-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_rfqs_status_created ON rfqs(status, created_at DESC);

-- RFQ Recipients table indexes
CREATE INDEX IF NOT EXISTS idx_rfq_recipients_rfq_id ON rfq_recipients(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_recipients_supplier_id ON rfq_recipients(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfq_recipients_status ON rfq_recipients(status);
-- Composite index for supplier inbox queries
CREATE INDEX IF NOT EXISTS idx_rfq_recipients_supplier_status ON rfq_recipients(supplier_id, status);

-- Offers table indexes
CREATE INDEX IF NOT EXISTS idx_offers_rfq_id ON offers(rfq_id);
CREATE INDEX IF NOT EXISTS idx_offers_supplier_id ON offers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_expires_at ON offers(expires_at);
-- Composite index for rfq offers list
CREATE INDEX IF NOT EXISTS idx_offers_rfq_status ON offers(rfq_id, status);

-- SKUs table indexes
CREATE INDEX IF NOT EXISTS idx_skus_supplier_id ON skus(supplier_id);
CREATE INDEX IF NOT EXISTS idx_skus_is_active ON skus(is_active);
CREATE INDEX IF NOT EXISTS idx_skus_category ON skus(category);
CREATE INDEX IF NOT EXISTS idx_skus_direct_order_enabled ON skus(direct_order_enabled);
-- Composite index for catalog browsing
CREATE INDEX IF NOT EXISTS idx_skus_active_direct ON skus(supplier_id, is_active, direct_order_enabled);
-- JSONB index for search fields
CREATE INDEX IF NOT EXISTS idx_skus_searchable_text ON skus USING gin(searchable_text);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_project_id ON orders(project_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_status ON orders(supplier_id, status);

-- Deliveries table indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_date ON deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivered_at ON deliveries(delivered_at);

-- Delivery Events table indexes
CREATE INDEX IF NOT EXISTS idx_delivery_events_delivery_id ON delivery_events(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_event_type ON delivery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_delivery_events_created_at ON delivery_events(created_at DESC);

-- Confirmations table indexes
CREATE INDEX IF NOT EXISTS idx_confirmations_delivery_id ON confirmations(delivery_id);
CREATE INDEX IF NOT EXISTS idx_confirmations_status ON confirmations(status);
CREATE INDEX IF NOT EXISTS idx_confirmations_created_at ON confirmations(created_at DESC);

-- Disputes table indexes
CREATE INDEX IF NOT EXISTS idx_disputes_confirmation_id ON disputes(confirmation_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at DESC);

-- Rentals table indexes
CREATE INDEX IF NOT EXISTS idx_rentals_supplier_id ON rentals(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rentals_is_active ON rentals(is_active);
CREATE INDEX IF NOT EXISTS idx_rentals_category ON rentals(category);

-- Rental Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_rental_bookings_buyer_id ON rental_bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_rental_id ON rental_bookings(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_status ON rental_bookings(status);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_created_at ON rental_bookings(created_at DESC);

-- Handovers table indexes
CREATE INDEX IF NOT EXISTS idx_handovers_booking_id ON handovers(booking_id);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON handovers(status);
CREATE INDEX IF NOT EXISTS idx_handovers_scheduled_at ON handovers(scheduled_at);

-- Returns table indexes
CREATE INDEX IF NOT EXISTS idx_returns_booking_id ON returns(booking_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_scheduled_at ON returns(scheduled_at);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
-- Composite index for notification list queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- Notification Preferences table indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Billing Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_billing_invoices_supplier_id ON billing_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_period_month ON billing_invoices(period_month, period_year);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices(status);

-- OTP Codes table indexes (for cleanup and verification)
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_expires ON otp_codes(phone, expires_at DESC);

-- Comments
COMMENT ON INDEX idx_users_phone IS 'Fast lookup for authentication';
COMMENT ON INDEX idx_rfqs_status_created IS 'Composite index for RFQ list queries';
COMMENT ON INDEX idx_rfq_recipients_supplier_status IS 'Optimizes supplier RFQ inbox queries';
COMMENT ON INDEX idx_orders_buyer_status IS 'Optimizes buyer order list queries';
COMMENT ON INDEX idx_orders_supplier_status IS 'Optimizes supplier order list queries';
COMMENT ON INDEX idx_notifications_user_read IS 'Optimizes notification list and unread count queries';
COMMENT ON INDEX idx_suppliers_location IS 'GiST index for location-based queries';
COMMENT ON INDEX idx_projects_location IS 'GiST index for project location queries';
COMMENT ON INDEX idx_suppliers_delivery_options IS 'GIN index for JSONB array searches';
COMMENT ON INDEX idx_suppliers_categories IS 'GIN index for category filtering';
COMMENT ON INDEX idx_skus_searchable_text IS 'GIN index for full-text search on SKUs';
