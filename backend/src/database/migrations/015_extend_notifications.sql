/**
 * Extend Notifications System
 * - Add new notification types for critical events
 * - Add device_tokens table for push notifications
 * - Update notification_preferences for quiet hours
 */

-- Drop and recreate notification_type enum with all notification types
ALTER TYPE notification_type RENAME TO notification_type_old;

CREATE TYPE notification_type AS ENUM (
  -- Buyer notifications
  'offer_received',              -- New offer from supplier (RFQ response)
  'offer_expiring',              -- Offer expiring in 4h (if unread)
  'delivery_approaching',        -- Delivery in 1 hour (approaching window)
  'delivery_completed',          -- Delivered, confirm within 24h
  'order_auto_completed',        -- Order auto-completed (if no confirm)
  'rental_handover_due',         -- Rental handover, confirm within 2h
  'rental_return_reminder',      -- Rental return due tomorrow
  'window_confirmed',            -- Delivery window confirmed by supplier

  -- Supplier notifications
  'rfq_received',                -- New RFQ from buyer
  'offer_accepted',              -- Your offer was accepted
  'direct_order_placed',         -- Direct order placed
  'delivery_due_today',          -- Delivery due today (morning reminder)
  'buyer_confirmed_delivery',    -- Buyer confirmed delivery
  'buyer_reported_issue',        -- Buyer reported issue/dispute
  'catalog_prices_stale',        -- Catalog prices are stale (weekly)

  -- Admin notifications
  'unanswered_rfqs_summary',     -- X unanswered RFQs (>24h) - daily summary
  'disputes_summary',            -- X disputes opened today
  'platform_health_report',      -- Platform health report (weekly)

  -- Existing types (keep for compatibility)
  'order_confirmed',
  'delivery_scheduled',
  'confirmation_reminder',
  'dispute_raised',
  'payment_due',
  'rental_due',
  'return_reminder',
  'system_message'
);

-- Update existing notifications table to use new enum
ALTER TABLE notifications
  ALTER COLUMN notification_type TYPE notification_type
  USING notification_type::text::notification_type;

ALTER TABLE notification_preferences
  ALTER COLUMN notification_type TYPE notification_type
  USING notification_type::text::notification_type;

-- Drop old enum
DROP TYPE notification_type_old;

-- Create device_tokens table for push notification registration
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type VARCHAR(20) NOT NULL, -- 'web', 'ios', 'android'
  device_name VARCHAR(200),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_device_token UNIQUE(user_id, token)
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_last_used ON device_tokens(last_used_at);

-- Add quiet_hours to notification_preferences
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT true;

-- Create function to check if current time is in quiet hours
CREATE OR REPLACE FUNCTION is_quiet_hours(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_quiet_hours_enabled BOOLEAN;
  v_quiet_start TIME;
  v_quiet_end TIME;
  v_current_time TIME;
BEGIN
  -- Get user's quiet hours preferences
  SELECT quiet_hours_enabled, quiet_hours_start, quiet_hours_end
  INTO v_quiet_hours_enabled, v_quiet_start, v_quiet_end
  FROM notification_preferences
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If no preferences or quiet hours disabled, return false
  IF v_quiet_hours_enabled IS NULL OR v_quiet_hours_enabled = false THEN
    RETURN false;
  END IF;

  v_current_time := CURRENT_TIME;

  -- Handle case where quiet hours span midnight (e.g., 22:00 to 08:00)
  IF v_quiet_start > v_quiet_end THEN
    RETURN v_current_time >= v_quiet_start OR v_current_time < v_quiet_end;
  ELSE
    RETURN v_current_time >= v_quiet_start AND v_current_time < v_quiet_end;
  END IF;
END;
$$;

-- Update create_notification function to respect quiet hours
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title VARCHAR,
  p_message TEXT,
  p_deep_link TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL,
  p_channel notification_channel DEFAULT 'in_app',
  p_force_send BOOLEAN DEFAULT false -- Override quiet hours for critical notifications
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
  v_in_app_enabled BOOLEAN;
  v_is_quiet_hours BOOLEAN;
BEGIN
  -- Check if user has preferences for this notification type
  SELECT in_app_enabled INTO v_in_app_enabled
  FROM notification_preferences
  WHERE user_id = p_user_id AND notification_type = p_type;

  -- If no preferences exist, create default preferences
  IF v_in_app_enabled IS NULL THEN
    INSERT INTO notification_preferences (user_id, notification_type)
    VALUES (p_user_id, p_type)
    ON CONFLICT (user_id, notification_type) DO NOTHING;
    v_in_app_enabled := true; -- Default to enabled
  END IF;

  -- Check if in quiet hours
  v_is_quiet_hours := is_quiet_hours(p_user_id);

  -- Don't create notification if:
  -- - In-app notifications are disabled for this type
  -- - We're in quiet hours and this is not a forced send (critical notification)
  IF v_in_app_enabled = false OR (v_is_quiet_hours = true AND p_force_send = false) THEN
    RETURN NULL;
  END IF;

  -- Create the notification
  INSERT INTO notifications (
    user_id,
    notification_type,
    channel,
    title,
    message,
    deep_link,
    data
  )
  VALUES (
    p_user_id,
    p_type,
    p_channel,
    p_title,
    p_message,
    p_deep_link,
    p_data
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Create function to get user's device tokens
CREATE OR REPLACE FUNCTION get_user_device_tokens(p_user_id UUID)
RETURNS TABLE (token TEXT, device_type VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT dt.token, dt.device_type
  FROM device_tokens dt
  WHERE dt.user_id = p_user_id
  ORDER BY dt.last_used_at DESC;
END;
$$;

-- Create function to cleanup old device tokens (not used in 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_device_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM device_tokens
  WHERE last_used_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Add comment explaining the notification type mapping
COMMENT ON TYPE notification_type IS
'Notification types mapped to user-facing events:
BUYER: offer_received, offer_expiring, delivery_approaching, delivery_completed,
       order_auto_completed, rental_handover_due, rental_return_reminder, window_confirmed
SUPPLIER: rfq_received, offer_accepted, direct_order_placed, delivery_due_today,
          buyer_confirmed_delivery, buyer_reported_issue, catalog_prices_stale
ADMIN: unanswered_rfqs_summary, disputes_summary, platform_health_report';

-- Add comment on quiet hours
COMMENT ON FUNCTION is_quiet_hours(UUID) IS
'Checks if current time falls within user''s quiet hours (default 22:00-08:00).
Returns true if notifications should be suppressed (unless critical/forced).';
