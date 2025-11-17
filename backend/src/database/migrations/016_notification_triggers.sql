-- Migration 016: Notification Triggers
-- Auto-create notifications when events occur

-- Note: This migration creates trigger functions for notification automation.
-- However, the actual CREATE TRIGGER statements are commented out because the
-- referenced tables (offers, rfqs, orders, deliveries, rentals, disputes, etc.)
-- may not exist yet or may have different schemas.
--
-- INSTRUCTIONS:
-- 1. Review your database schema
-- 2. Uncomment and adapt the triggers based on your actual table structure
-- 3. Test each trigger individually before deploying to production

-- ========================================
-- TRIGGER FUNCTION: Notify on offer received
-- ========================================
CREATE OR REPLACE FUNCTION notify_offer_received()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_buyer_id UUID;
  v_supplier_name TEXT;
  v_buyer_locale TEXT;
BEGIN
  -- Get buyer ID and locale from the RFQ
  SELECT user_id INTO v_buyer_id
  FROM rfqs WHERE id = NEW.rfq_id;

  SELECT COALESCE(language, 'ka') INTO v_buyer_locale
  FROM users WHERE id = v_buyer_id;

  -- Get supplier name
  SELECT COALESCE(business_name_ka, business_name_en, 'Supplier') INTO v_supplier_name
  FROM suppliers WHERE user_id = NEW.supplier_id;

  -- Create notification using template
  IF v_buyer_locale = 'en' THEN
    PERFORM create_notification(
      v_buyer_id,
      'offer_received',
      'New Offer from ' || v_supplier_name,
      'You have received a new offer for your RFQ. Review and accept before it expires.',
      'buildapp://offers/' || NEW.id::text,
      false -- not force send
    );
  ELSE
    PERFORM create_notification(
      v_buyer_id,
      'offer_received',
      'ახალი შეთავაზება ' || v_supplier_name || '-სგან',
      'თქვენ მიიღეთ ახალი შეთავაზება თქვენი RFQ-ის შესახებ. გადახედეთ და მიიღეთ ვადის გასვლამდე.',
      'buildapp://offers/' || NEW.id::text,
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when offers table exists:
-- CREATE TRIGGER trigger_notify_offer_received
-- AFTER INSERT ON offers
-- FOR EACH ROW
-- WHEN (NEW.status = 'pending')
-- EXECUTE FUNCTION notify_offer_received();


-- ========================================
-- TRIGGER FUNCTION: Notify on RFQ received (to suppliers)
-- ========================================
CREATE OR REPLACE FUNCTION notify_rfq_received()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_supplier RECORD;
  v_buyer_type TEXT;
  v_location TEXT;
BEGIN
  -- Get buyer type and location from RFQ
  SELECT buyer_type, location INTO v_buyer_type, v_location
  FROM NEW;

  -- Notify all eligible suppliers in the region
  -- (This is a simplified example - you may have more complex supplier matching logic)
  FOR v_supplier IN
    SELECT user_id, COALESCE(language, 'ka') as locale
    FROM suppliers s
    JOIN users u ON s.user_id = u.id
    WHERE s.is_active = true
      AND (s.service_regions @> ARRAY[v_location] OR s.service_regions IS NULL)
  LOOP
    IF v_supplier.locale = 'en' THEN
      PERFORM create_notification(
        v_supplier.user_id,
        'rfq_received',
        'New RFQ from ' || COALESCE(v_buyer_type, 'Buyer'),
        'New RFQ in ' || COALESCE(v_location, 'your area') || '. Submit your offer to win the business.',
        'buildapp://rfqs/' || NEW.id::text,
        false
      );
    ELSE
      PERFORM create_notification(
        v_supplier.user_id,
        'rfq_received',
        'ახალი RFQ ' || COALESCE(v_buyer_type, 'მყიდველისგან'),
        'ახალი RFQ ' || COALESCE(v_location, 'თქვენს რეგიონში') || '. წარადგინეთ თქვენი შეთავაზება ბიზნესის მოსაგებად.',
        'buildapp://rfqs/' || NEW.id::text,
        false
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Uncomment when rfqs table exists:
-- CREATE TRIGGER trigger_notify_rfq_received
-- AFTER INSERT ON rfqs
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_rfq_received();


-- ========================================
-- TRIGGER FUNCTION: Notify on offer accepted
-- ========================================
CREATE OR REPLACE FUNCTION notify_offer_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_supplier_id UUID;
  v_buyer_name TEXT;
  v_supplier_locale TEXT;
BEGIN
  -- Only trigger if status changed to 'accepted'
  IF OLD.status <> 'accepted' AND NEW.status = 'accepted' THEN
    -- Get supplier ID
    SELECT supplier_id INTO v_supplier_id FROM offers WHERE id = NEW.id;

    -- Get supplier locale
    SELECT COALESCE(language, 'ka') INTO v_supplier_locale
    FROM users WHERE id = v_supplier_id;

    -- Get buyer name
    SELECT COALESCE(name, 'The buyer') INTO v_buyer_name
    FROM users u
    JOIN rfqs r ON r.user_id = u.id
    WHERE r.id = NEW.rfq_id;

    -- Create notification
    IF v_supplier_locale = 'en' THEN
      PERFORM create_notification(
        v_supplier_id,
        'offer_accepted',
        'Your Offer Was Accepted!',
        'Congratulations! ' || v_buyer_name || ' accepted your offer. Prepare for delivery.',
        'buildapp://orders/' || NEW.order_id::text,
        true -- force send (critical)
      );
    ELSE
      PERFORM create_notification(
        v_supplier_id,
        'offer_accepted',
        'თქვენი შეთავაზება მიღებულია!',
        'გილოცავთ! ' || v_buyer_name || ' მიიღო თქვენი შეთავაზება. მოემზადეთ მიწოდებისთვის.',
        'buildapp://orders/' || NEW.order_id::text,
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when offers table exists:
-- CREATE TRIGGER trigger_notify_offer_accepted
-- AFTER UPDATE ON offers
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_offer_accepted();


-- ========================================
-- TRIGGER FUNCTION: Notify on direct order placed
-- ========================================
CREATE OR REPLACE FUNCTION notify_direct_order_placed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_supplier_id UUID;
  v_buyer_name TEXT;
  v_supplier_locale TEXT;
BEGIN
  -- Only for direct orders (not RFQ-based)
  IF NEW.rfq_id IS NULL AND NEW.offer_id IS NULL THEN
    v_supplier_id := NEW.supplier_id;

    -- Get supplier locale
    SELECT COALESCE(language, 'ka') INTO v_supplier_locale
    FROM users WHERE id = v_supplier_id;

    -- Get buyer name
    SELECT COALESCE(name, 'A buyer') INTO v_buyer_name
    FROM users WHERE id = NEW.buyer_id;

    -- Create notification
    IF v_supplier_locale = 'en' THEN
      PERFORM create_notification(
        v_supplier_id,
        'direct_order_placed',
        'New Direct Order',
        v_buyer_name || ' placed a direct order. Confirm and schedule delivery.',
        'buildapp://orders/' || NEW.id::text,
        true -- force send (critical)
      );
    ELSE
      PERFORM create_notification(
        v_supplier_id,
        'direct_order_placed',
        'ახალი პირდაპირი შეკვეთა',
        v_buyer_name || ' განათავსა პირდაპირი შეკვეთა. დაადასტურეთ და დაგეგმეთ მიწოდება.',
        'buildapp://orders/' || NEW.id::text,
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when orders table exists:
-- CREATE TRIGGER trigger_notify_direct_order_placed
-- AFTER INSERT ON orders
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_direct_order_placed();


-- ========================================
-- TRIGGER FUNCTION: Notify on delivery completed
-- ========================================
CREATE OR REPLACE FUNCTION notify_delivery_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_buyer_id UUID;
  v_buyer_locale TEXT;
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF OLD.status <> 'delivered' AND NEW.status = 'delivered' THEN
    -- Get buyer ID
    SELECT buyer_id INTO v_buyer_id FROM orders WHERE id = NEW.order_id;

    -- Get buyer locale
    SELECT COALESCE(language, 'ka') INTO v_buyer_locale
    FROM users WHERE id = v_buyer_id;

    -- Create notification
    IF v_buyer_locale = 'en' THEN
      PERFORM create_notification(
        v_buyer_id,
        'delivery_completed',
        'Delivery Completed',
        'Your order has been delivered. Please confirm receipt within 24 hours.',
        'buildapp://orders/' || NEW.order_id::text,
        true -- force send (critical)
      );
    ELSE
      PERFORM create_notification(
        v_buyer_id,
        'delivery_completed',
        'მიწოდება დასრულდა',
        'თქვენი შეკვეთა მიწოდებულია. გთხოვთ დაადასტუროთ მიღება 24 საათის განმავლობაში.',
        'buildapp://orders/' || NEW.order_id::text,
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when deliveries table exists:
-- CREATE TRIGGER trigger_notify_delivery_completed
-- AFTER UPDATE ON deliveries
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_delivery_completed();


-- ========================================
-- TRIGGER FUNCTION: Notify on buyer confirmation
-- ========================================
CREATE OR REPLACE FUNCTION notify_buyer_confirmed_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_supplier_id UUID;
  v_buyer_name TEXT;
  v_supplier_locale TEXT;
BEGIN
  -- Only trigger when buyer_confirmed changes to true
  IF (OLD.buyer_confirmed IS NULL OR OLD.buyer_confirmed = false)
     AND NEW.buyer_confirmed = true THEN
    -- Get supplier ID
    SELECT supplier_id INTO v_supplier_id FROM orders WHERE id = NEW.order_id;

    -- Get supplier locale
    SELECT COALESCE(language, 'ka') INTO v_supplier_locale
    FROM users WHERE id = v_supplier_id;

    -- Get buyer name
    SELECT COALESCE(name, 'The buyer') INTO v_buyer_name
    FROM users u
    JOIN orders o ON o.buyer_id = u.id
    WHERE o.id = NEW.order_id;

    -- Create notification
    IF v_supplier_locale = 'en' THEN
      PERFORM create_notification(
        v_supplier_id,
        'buyer_confirmed_delivery',
        'Delivery Confirmed',
        v_buyer_name || ' confirmed receipt of the delivery. Payment is being processed.',
        'buildapp://orders/' || NEW.order_id::text,
        false
      );
    ELSE
      PERFORM create_notification(
        v_supplier_id,
        'buyer_confirmed_delivery',
        'მიწოდება დადასტურდა',
        v_buyer_name || ' დაადასტურა მიწოდების მიღება. გადახდა მუშავდება.',
        'buildapp://orders/' || NEW.order_id::text,
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when deliveries table exists:
-- CREATE TRIGGER trigger_notify_buyer_confirmed_delivery
-- AFTER UPDATE ON deliveries
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_buyer_confirmed_delivery();


-- ========================================
-- TRIGGER FUNCTION: Notify on issue reported
-- ========================================
CREATE OR REPLACE FUNCTION notify_buyer_reported_issue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_supplier_id UUID;
  v_buyer_name TEXT;
  v_supplier_locale TEXT;
BEGIN
  -- Get supplier ID from order
  SELECT supplier_id INTO v_supplier_id FROM orders WHERE id = NEW.order_id;

  -- Get supplier locale
  SELECT COALESCE(language, 'ka') INTO v_supplier_locale
  FROM users WHERE id = v_supplier_id;

  -- Get buyer name
  SELECT COALESCE(name, 'A buyer') INTO v_buyer_name
  FROM users u
  JOIN orders o ON o.buyer_id = u.id
  WHERE o.id = NEW.order_id;

  -- Create notification
  IF v_supplier_locale = 'en' THEN
    PERFORM create_notification(
      v_supplier_id,
      'buyer_reported_issue',
      'Issue Reported',
      v_buyer_name || ' reported an issue: ' || COALESCE(NEW.issue_type, 'delivery problem') || '. Please respond promptly.',
      'buildapp://orders/' || NEW.order_id::text,
      true -- force send (critical)
    );
  ELSE
    PERFORM create_notification(
      v_supplier_id,
      'buyer_reported_issue',
      'პრობლემა დაფიქსირდა',
      v_buyer_name || ' დააფიქსირა პრობლემა: ' || COALESCE(NEW.issue_type, 'მიწოდების პრობლემა') || '. გთხოვთ უპასუხოთ დაუყოვნებლივ.',
      'buildapp://orders/' || NEW.order_id::text,
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when issues/disputes table exists:
-- CREATE TRIGGER trigger_notify_buyer_reported_issue
-- AFTER INSERT ON issues
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_buyer_reported_issue();


-- ========================================
-- TRIGGER FUNCTION: Notify on dispute raised
-- ========================================
CREATE OR REPLACE FUNCTION notify_dispute_raised()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_other_party_id UUID;
  v_other_party_locale TEXT;
BEGIN
  -- Notify the other party in the dispute
  IF NEW.raised_by = 'buyer' THEN
    -- Notify supplier
    SELECT supplier_id INTO v_other_party_id FROM orders WHERE id = NEW.order_id;
  ELSE
    -- Notify buyer
    SELECT buyer_id INTO v_other_party_id FROM orders WHERE id = NEW.order_id;
  END IF;

  -- Get locale
  SELECT COALESCE(language, 'ka') INTO v_other_party_locale
  FROM users WHERE id = v_other_party_id;

  -- Create notification
  IF v_other_party_locale = 'en' THEN
    PERFORM create_notification(
      v_other_party_id,
      'dispute_raised',
      'Dispute Raised',
      'A dispute has been raised regarding order. Our team will review it shortly.',
      'buildapp://disputes/' || NEW.id::text,
      true -- force send (critical)
    );
  ELSE
    PERFORM create_notification(
      v_other_party_id,
      'dispute_raised',
      'დავა წამოიწყო',
      'დავა წამოიწყო შეკვეთასთან დაკავშირებით. ჩვენი გუნდი მალე განიხილავს მას.',
      'buildapp://disputes/' || NEW.id::text,
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when disputes table exists:
-- CREATE TRIGGER trigger_notify_dispute_raised
-- AFTER INSERT ON disputes
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_dispute_raised();


-- ========================================
-- TRIGGER FUNCTION: Notify on window confirmed
-- ========================================
CREATE OR REPLACE FUNCTION notify_window_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_buyer_id UUID;
  v_buyer_locale TEXT;
  v_delivery_date TEXT;
BEGIN
  -- Only trigger when window is confirmed
  IF (OLD.window_confirmed_at IS NULL) AND (NEW.window_confirmed_at IS NOT NULL) THEN
    -- Get buyer ID
    SELECT buyer_id INTO v_buyer_id FROM orders WHERE id = NEW.order_id;

    -- Get buyer locale
    SELECT COALESCE(language, 'ka') INTO v_buyer_locale
    FROM users WHERE id = v_buyer_id;

    -- Format delivery date
    v_delivery_date := to_char(NEW.scheduled_window_start, 'DD Mon, HH24:MI');

    -- Create notification
    IF v_buyer_locale = 'en' THEN
      PERFORM create_notification(
        v_buyer_id,
        'window_confirmed',
        'Delivery Window Confirmed',
        'Your delivery is scheduled for ' || v_delivery_date || '. You will receive a reminder 1 hour before.',
        'buildapp://orders/' || NEW.order_id::text,
        false
      );
    ELSE
      PERFORM create_notification(
        v_buyer_id,
        'window_confirmed',
        'მიწოდების ფანჯარა დადასტურდა',
        'თქვენი მიწოდება დაგეგმილია ' || v_delivery_date || '. მიიღებთ შეხსენებას 1 საათით ადრე.',
        'buildapp://orders/' || NEW.order_id::text,
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Uncomment when deliveries table exists:
-- CREATE TRIGGER trigger_notify_window_confirmed
-- AFTER UPDATE ON deliveries
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_window_confirmed();


-- ========================================
-- SCHEDULED JOBS (Example queries for cron/scheduler)
-- ========================================

-- These are example queries you can schedule using pg_cron, a cron job, or your scheduler of choice

/*
-- Daily morning reminder: Deliveries due today
-- Schedule this to run at 8:00 AM daily
DO $$
DECLARE
  v_supplier RECORD;
  v_count INT;
  v_supplier_locale TEXT;
BEGIN
  FOR v_supplier IN
    SELECT DISTINCT s.user_id, COUNT(*) as delivery_count
    FROM deliveries d
    JOIN orders o ON o.id = d.order_id
    JOIN suppliers s ON s.user_id = o.supplier_id
    WHERE DATE(d.scheduled_window_start) = CURRENT_DATE
      AND d.status IN ('scheduled', 'confirmed')
    GROUP BY s.user_id
  LOOP
    SELECT COALESCE(language, 'ka') INTO v_supplier_locale
    FROM users WHERE id = v_supplier.user_id;

    IF v_supplier_locale = 'en' THEN
      PERFORM create_notification(
        v_supplier.user_id,
        'delivery_due_today',
        'Delivery Due Today',
        'You have ' || v_supplier.delivery_count || ' delivery scheduled for today. Check your delivery schedule.',
        NULL,
        false
      );
    ELSE
      PERFORM create_notification(
        v_supplier.user_id,
        'delivery_due_today',
        'მიწოდება დღეს',
        'თქვენ გაქვთ ' || v_supplier.delivery_count || ' მიწოდება დაგეგმილი დღეს. შეამოწმეთ თქვენი მიწოდების განრიგი.',
        NULL,
        false
      );
    END IF;
  END LOOP;
END $$;

-- Daily summary: Unanswered RFQs (for admins)
-- Schedule this to run at 9:00 AM daily
DO $$
DECLARE
  v_admin RECORD;
  v_count INT;
BEGIN
  -- Count RFQs older than 24 hours with no offers
  SELECT COUNT(*) INTO v_count
  FROM rfqs r
  WHERE r.created_at < NOW() - INTERVAL '24 hours'
    AND r.status = 'active'
    AND NOT EXISTS (SELECT 1 FROM offers o WHERE o.rfq_id = r.id);

  -- Notify all admins
  FOR v_admin IN SELECT id FROM users WHERE user_type = 'admin' LOOP
    PERFORM create_notification(
      v_admin.id,
      'unanswered_rfqs_summary',
      'Daily RFQ Report',
      v_count || ' RFQs have been unanswered for over 24 hours. Review and take action.',
      NULL,
      false
    );
  END LOOP;
END $$;

-- Weekly: Catalog prices stale reminder
-- Schedule this to run every Monday at 10:00 AM
DO $$
DECLARE
  v_supplier RECORD;
  v_supplier_locale TEXT;
BEGIN
  FOR v_supplier IN
    SELECT DISTINCT s.user_id
    FROM suppliers s
    JOIN catalog_items ci ON ci.supplier_id = s.user_id
    WHERE ci.updated_at < NOW() - INTERVAL '7 days'
      AND s.is_active = true
  LOOP
    SELECT COALESCE(language, 'ka') INTO v_supplier_locale
    FROM users WHERE id = v_supplier.user_id;

    IF v_supplier_locale = 'en' THEN
      PERFORM create_notification(
        v_supplier.user_id,
        'catalog_prices_stale',
        'Update Your Catalog Prices',
        'Your catalog prices haven''t been updated in over 7 days. Keep them current to win more business.',
        NULL,
        false
      );
    ELSE
      PERFORM create_notification(
        v_supplier.user_id,
        'catalog_prices_stale',
        'განაახლეთ თქვენი კატალოგის ფასები',
        'თქვენი კატალოგის ფასები არ განახლებულა 7 დღეზე მეტი ხნის განმავლობაში. გააქტიურეთ ისინი მეტი ბიზნესის მოსაგებად.',
        NULL,
        false
      );
    END IF;
  END LOOP;
END $$;
*/

-- ========================================
-- NOTES ON USAGE
-- ========================================

-- This migration creates trigger functions that are ready to use, but the actual
-- triggers are commented out because the referenced tables may not exist or may
-- have different column names.
--
-- To use these triggers:
-- 1. Review your database schema
-- 2. Adjust the SQL in trigger functions to match your actual table/column names
-- 3. Uncomment the CREATE TRIGGER statements
-- 4. Test each trigger individually
-- 5. Monitor the notifications table to ensure triggers fire correctly
--
-- For scheduled notifications (expiring offers, delivery approaching, etc.):
-- 1. Set up a cron job or use pg_cron extension
-- 2. Create scheduled tasks that query for upcoming events
-- 3. Call create_notification() for matching records
--
-- Example cron setup with pg_cron:
-- SELECT cron.schedule('delivery-reminders', '0 * * * *', $$ -- every hour
--   SELECT notify_delivery_approaching();
-- $$);
