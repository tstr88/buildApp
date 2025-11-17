-- Complete test data for Offer Comparison Feature
-- This creates everything: buyer, suppliers, project, RFQ, and offers

BEGIN;

-- 1. Create a test buyer user
INSERT INTO users (phone, name, user_type, buyer_role, is_verified, language)
VALUES ('+995555111111', 'Test Buyer', 'buyer', 'homeowner', true, 'ka')
ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
RETURNING id;

-- Get the buyer ID
DO $$
DECLARE
  v_buyer_id UUID;
  v_supplier1_id UUID;
  v_supplier2_id UUID;
  v_supplier3_id UUID;
  v_project_id UUID;
  v_rfq_id UUID;
  v_offer1_id UUID;
  v_offer2_id UUID;
  v_offer3_id UUID;
  v_line1_id UUID;
  v_line2_id UUID;
  v_line3_id UUID;
BEGIN
  -- Get buyer ID
  SELECT id INTO v_buyer_id FROM users WHERE phone = '+995555111111';

  -- Get or create supplier IDs
  SELECT id INTO v_supplier1_id FROM suppliers LIMIT 1 OFFSET 0;
  SELECT id INTO v_supplier2_id FROM suppliers LIMIT 1 OFFSET 1;
  SELECT id INTO v_supplier3_id FROM suppliers LIMIT 1 OFFSET 2;

  -- Create a project
  INSERT INTO projects (user_id, name, latitude, longitude, address, created_at)
  VALUES (v_buyer_id, 'My Fence Project', 41.7151, 44.8271, 'Chavchavadze Ave 12, Tbilisi', NOW())
  RETURNING id INTO v_project_id;

  RAISE NOTICE 'Created project: %', v_project_id;

  -- Create an RFQ
  INSERT INTO rfqs (project_id, title, status, preferred_window_start, preferred_window_end, additional_notes, created_at, expires_at)
  VALUES (
    v_project_id,
    'Fence Materials Quote',
    'open',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    'Need high quality materials for residential fence',
    NOW(),
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_rfq_id;

  RAISE NOTICE 'Created RFQ: %', v_rfq_id;

  -- Add RFQ line items
  INSERT INTO rfq_lines (rfq_id, description, quantity, unit, spec_notes)
  VALUES (v_rfq_id, 'Concrete M300', 10, 'm³', 'High strength concrete')
  RETURNING id INTO v_line1_id;

  INSERT INTO rfq_lines (rfq_id, description, quantity, unit, spec_notes)
  VALUES (v_rfq_id, 'Rebar 12mm', 0.5, 'ton', 'For reinforcement')
  RETURNING id INTO v_line2_id;

  INSERT INTO rfq_lines (rfq_id, description, quantity, unit, spec_notes)
  VALUES (v_rfq_id, 'Concrete Blocks', 500, 'unit', '20cm blocks')
  RETURNING id INTO v_line3_id;

  -- Add RFQ recipients
  INSERT INTO rfq_recipients (rfq_id, supplier_id, notified_at, viewed_at)
  VALUES
    (v_rfq_id, v_supplier1_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_rfq_id, v_supplier2_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (v_rfq_id, v_supplier3_id, NOW() - INTERVAL '2 days', NULL);

  -- Create or update trust metrics
  INSERT INTO trust_metrics (supplier_id, spec_reliability_pct, on_time_pct, issue_rate_pct, sample_size)
  VALUES
    (v_supplier1_id, 95.0, 88.0, 3.0, 20),
    (v_supplier2_id, 72.0, 65.0, 18.0, 15),
    (v_supplier3_id, 98.0, 95.0, 2.0, 10)
  ON CONFLICT (supplier_id) DO UPDATE SET
    spec_reliability_pct = EXCLUDED.spec_reliability_pct,
    on_time_pct = EXCLUDED.on_time_pct,
    issue_rate_pct = EXCLUDED.issue_rate_pct,
    sample_size = EXCLUDED.sample_size;

  -- Create Offer 1 (LOWEST PRICE - should be highlighted)
  INSERT INTO offers (rfq_id, supplier_id, status, total_amount, delivery_fee, payment_terms, delivery_window_start, delivery_window_end, notes, expires_at, created_at)
  VALUES (
    v_rfq_id,
    v_supplier1_id,
    'pending',
    3325.00,
    150.00,
    'net_30',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '10 days',
    'We can deliver within your timeframe. Premium quality concrete.',
    NOW() + INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO v_offer1_id;

  -- Offer 1 line items
  INSERT INTO offer_lines (offer_id, rfq_line_id, description, quantity, unit, unit_price)
  VALUES
    (v_offer1_id, v_line1_id, 'Concrete M300', 10, 'm³', 180.00),
    (v_offer1_id, v_line2_id, 'Rebar 12mm', 0.5, 'ton', 850.00),
    (v_offer1_id, v_line3_id, 'Concrete Blocks', 500, 'unit', 1.50);

  RAISE NOTICE 'Created Offer 1: % (LOWEST PRICE - ₾3325)', v_offer1_id;

  -- Create Offer 2 (Higher price)
  INSERT INTO offers (rfq_id, supplier_id, status, total_amount, delivery_fee, payment_terms, delivery_window_start, delivery_window_end, notes, expires_at, created_at)
  VALUES (
    v_rfq_id,
    v_supplier2_id,
    'pending',
    4125.00,
    200.00,
    'net_15',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '12 days',
    'Best materials in Tbilisi. Quick delivery available.',
    NOW() + INTERVAL '4 days',
    NOW() - INTERVAL '12 hours'
  )
  RETURNING id INTO v_offer2_id;

  -- Offer 2 line items
  INSERT INTO offer_lines (offer_id, rfq_line_id, description, quantity, unit, unit_price)
  VALUES
    (v_offer2_id, v_line1_id, 'Concrete M300', 10, 'm³', 220.00),
    (v_offer2_id, v_line2_id, 'Rebar 12mm', 0.5, 'ton', 900.00),
    (v_offer2_id, v_line3_id, 'Concrete Blocks', 500, 'unit', 1.80);

  RAISE NOTICE 'Created Offer 2: % (₾4125)', v_offer2_id;

  -- Create Offer 3 (EXPIRED - should appear in expired section)
  INSERT INTO offers (rfq_id, supplier_id, status, total_amount, delivery_fee, payment_terms, delivery_window_start, delivery_window_end, notes, expires_at, created_at)
  VALUES (
    v_rfq_id,
    v_supplier3_id,
    'pending',
    3700.00,
    100.00,
    'net_30',
    NOW() + INTERVAL '6 days',
    NOW() + INTERVAL '11 days',
    'Competitive pricing with flexible terms.',
    NOW() - INTERVAL '1 hour',  -- This offer has EXPIRED
    NOW() - INTERVAL '2 days'
  );

  RAISE NOTICE 'Created Offer 3: EXPIRED (₾3700)';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Test data created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📱 Login as: +995555111111';
  RAISE NOTICE '🔐 OTP: 123456';
  RAISE NOTICE '📍 Project: "My Fence Project"';
  RAISE NOTICE '📋 RFQ: "Fence Materials Quote"';
  RAISE NOTICE '💰 3 offers created:';
  RAISE NOTICE '   - Offer 1: ₾3,325 (LOWEST - green border)';
  RAISE NOTICE '   - Offer 2: ₾4,125';
  RAISE NOTICE '   - Offer 3: ₾3,700 (EXPIRED)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 To test:';
  RAISE NOTICE '1. Login at http://localhost:5173';
  RAISE NOTICE '2. Go to Projects tab';
  RAISE NOTICE '3. Click "My Fence Project"';
  RAISE NOTICE '4. Click RFQs tab';
  RAISE NOTICE '5. Click "Fence Materials Quote"';
  RAISE NOTICE '6. Click "Compare Offers" button';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

COMMIT;
