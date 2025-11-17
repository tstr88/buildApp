-- Migration 001: Create Enums and Base Types
-- Description: Creates all enum types used across the buildApp schema

-- User Types
CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');

-- Buyer Roles
CREATE TYPE buyer_role AS ENUM ('homeowner', 'contractor');

-- Language Preferences
CREATE TYPE language_preference AS ENUM ('ka', 'en');

-- Order Types
CREATE TYPE order_type AS ENUM ('material', 'rental');

-- Delivery Options
CREATE TYPE delivery_option AS ENUM ('pickup', 'delivery', 'both');

-- RFQ Status
CREATE TYPE rfq_status AS ENUM (
  'draft',           -- Being prepared
  'active',          -- Sent to suppliers
  'expired',         -- Time window passed
  'closed'           -- Buyer closed it
);

-- Offer Status
CREATE TYPE offer_status AS ENUM (
  'pending',         -- Awaiting buyer review
  'accepted',        -- Buyer accepted
  'rejected',        -- Buyer rejected
  'expired',         -- Offer expired
  'withdrawn'        -- Supplier withdrew
);

-- Order Status
CREATE TYPE order_status AS ENUM (
  'pending',         -- Order placed, awaiting confirmation
  'confirmed',       -- Supplier confirmed
  'in_transit',      -- On the way
  'delivered',       -- Delivered, awaiting buyer confirmation
  'completed',       -- Buyer confirmed delivery
  'disputed',        -- Issue raised
  'cancelled'        -- Order cancelled
);

-- Confirmation Types
CREATE TYPE confirmation_type AS ENUM ('confirm', 'dispute');

-- Dispute Categories
CREATE TYPE dispute_category AS ENUM (
  'quantity_mismatch',
  'quality_issue',
  'specification_mismatch',
  'damage',
  'late_delivery',
  'wrong_item',
  'other'
);

-- Invoice Status
CREATE TYPE invoice_status AS ENUM (
  'pending',
  'issued',
  'paid',
  'overdue',
  'cancelled'
);

-- Notification Types
CREATE TYPE notification_type AS ENUM (
  'rfq_received',
  'offer_received',
  'offer_accepted',
  'order_confirmed',
  'delivery_scheduled',
  'delivery_completed',
  'confirmation_reminder',
  'dispute_raised',
  'payment_due',
  'rental_due',
  'return_reminder',
  'system_message'
);

-- Notification Channels
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'in_app');

-- Rental Booking Status
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'active',          -- Tool handed over
  'completed',       -- Tool returned
  'overdue',         -- Past return date
  'disputed',
  'cancelled'
);

-- Payment Terms
CREATE TYPE payment_terms AS ENUM (
  'cod',             -- Cash on delivery
  'net_7',           -- Net 7 days
  'net_15',          -- Net 15 days
  'net_30',          -- Net 30 days
  'advance_50',      -- 50% advance
  'advance_100'      -- Full advance
);

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create extension for JSONB operations
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Comments
COMMENT ON TYPE user_type IS 'User account type: buyer, supplier, or admin';
COMMENT ON TYPE buyer_role IS 'Specific role for buyers: homeowner or contractor';
COMMENT ON TYPE language_preference IS 'User interface language: Georgian (ka) or English (en)';
COMMENT ON TYPE order_type IS 'Type of order: material purchase or rental';
COMMENT ON TYPE delivery_option IS 'Delivery method: pickup, delivery, or both available';
COMMENT ON TYPE rfq_status IS 'Status of Request for Quote';
COMMENT ON TYPE offer_status IS 'Status of supplier offer';
COMMENT ON TYPE order_status IS 'Current status of order in the fulfillment lifecycle';
COMMENT ON TYPE confirmation_type IS 'Type of delivery confirmation: confirm or dispute';
COMMENT ON TYPE dispute_category IS 'Category of dispute for issue resolution';
COMMENT ON TYPE invoice_status IS 'Status of invoice in billing system';
COMMENT ON TYPE notification_type IS 'Type of notification sent to user';
COMMENT ON TYPE notification_channel IS 'Channel through which notification is delivered';
COMMENT ON TYPE booking_status IS 'Status of rental booking';
COMMENT ON TYPE payment_terms IS 'Payment terms agreed upon for the transaction';
