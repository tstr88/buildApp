-- Clear existing data
TRUNCATE TABLE otps CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE rfq_responses CASCADE;
TRUNCATE TABLE rfq_items CASCADE;
TRUNCATE TABLE rfqs CASCADE;
TRUNCATE TABLE skus CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE buyers CASCADE;
TRUNCATE TABLE users CASCADE;

-- Create Supplier User
INSERT INTO users (id, phone, name, user_type, language, is_active, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', '+995555100001', 'გიორგი ბერიძე', 'supplier', 'ka', true, true);

-- Create Homeowner User
INSERT INTO users (id, phone, name, user_type, buyer_role, language, is_active, is_verified) VALUES
('22222222-2222-2222-2222-222222222222', '+995555100002', 'ნინო გელაშვილი', 'buyer', 'homeowner', 'ka', true, true);

-- Create Supplier Profile
INSERT INTO suppliers (id, user_id, business_name, depot_latitude, depot_longitude, depot_address, categories, payment_terms, about, is_verified, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'კონკრეტ ჯეო', 41.7151, 44.8271, 'თბილისი, დიღომი', ARRAY['ბეტონი', 'ბლოკი', 'ქვიშა'], ARRAY['cod', 'bank_transfer']::payment_terms[], 'საუკეთესო ხარისხის სამშენებლო მასალები', true, true);

-- Create Buyer Profile
INSERT INTO buyers (id, user_id, buyer_role) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'homeowner');

-- Create Products (SKUs) for Supplier
INSERT INTO skus (id, supplier_id, name, spec_string, category, unit, base_price, direct_order_available, delivery_options, approx_lead_time_label, negotiable, description, min_order_quantity, is_active, created_at, updated_at) VALUES
-- Direct Order Products
('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ბეტონი M300', '15-20 სლამპი, სტანდარტული მარცვალი', 'ბეტონი', 'm3', 180.00, true, 'both'::delivery_option, 'იმავე დღეს', false, 'მაღალი ხარისხის ბეტონი M300 კლასი', 5.0, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ბეტონის ბლოკი 20x20x40', 'სტანდარტული ზომა, მაღალი სიმტკიცე', 'ბლოკი', 'pcs', 2.50, true, 'both'::delivery_option, 'მომდევნო დღეს', false, 'საუკეთესო ხარისხის ბეტონის ბლოკი', 100.0, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'მდინარის ქვიშა', 'გაწმენდილი, სამშენებლო', 'ქვიშა', 'ton', 45.00, true, 'delivery'::delivery_option, '2-3 დღე', true, 'სუფთა მდინარის ქვიშა ყველა სახის სამუშაოსთვის', 3.0, true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- RFQ Only Products
('c4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ცემენტი M500', '50კგ ტომარა', 'ცემენტი', 'bag', 18.00, false, 'both'::delivery_option, null, false, 'იმპორტული ცემენტი M500', 50.0, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

('c5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'არმატურა 12მმ', '6 მეტრი სიგრძე', 'არმატურა', 'pcs', 15.00, false, 'pickup'::delivery_option, null, true, 'მაღალი ხარისხის სამშენებლო არმატურა', 20.0, true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- Create a Project for Homeowner
INSERT INTO projects (id, buyer_id, name, address, latitude, longitude, start_date, project_type, status, created_at) VALUES
('p1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'სახლის მშენებლობა ვაკეში', 'თბილისი, ვაკე, ი.ჭავჭავაძის 15', 41.6938, 44.7676, NOW() + INTERVAL '1 month', 'new_construction', 'planning', NOW() - INTERVAL '10 days');

-- Create RFQ from Homeowner
INSERT INTO rfqs (id, buyer_id, project_id, delivery_date, delivery_address, delivery_latitude, delivery_longitude, delivery_window, notes, status, created_at) VALUES
('r1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'p1111111-1111-1111-1111-111111111111', NOW() + INTERVAL '5 days', 'თბილისი, ვაკე, ი.ჭავჭავაძის 15', 41.6938, 44.7676, 'morning', 'გთხოვთ ხარისხიანი მასალა', 'pending', NOW() - INTERVAL '3 days');

-- RFQ Items
INSERT INTO rfq_items (id, rfq_id, sku_id, quantity, notes) VALUES
('ri111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 15.0, 'M300 ბეტონი ფუნდამენტისთვის'),
('ri222222-2222-2222-2222-222222222222', 'r1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 100.0, 'M500 ცემენტი');

-- Create Direct Orders
-- Order 1: Pending (new order)
INSERT INTO orders (id, buyer_id, supplier_id, project_id, delivery_date, delivery_address, delivery_latitude, delivery_longitude, delivery_window, payment_method, payment_status, order_status, notes, created_at) VALUES
('o1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p1111111-1111-1111-1111-111111111111', NOW() + INTERVAL '2 days', 'თბილისი, ვაკე, ი.ჭავჭავაძის 15', 41.6938, 44.7676, 'morning', 'cod', 'unpaid', 'pending', 'სასწრაფო შეკვეთა', NOW() - INTERVAL '6 hours');

INSERT INTO order_items (id, order_id, sku_id, quantity, unit_price, subtotal) VALUES
('oi111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 500.0, 2.50, 1250.00),
('oi222222-2222-2222-2222-222222222222', 'o1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 10.0, 45.00, 450.00);

-- Update order total
UPDATE orders SET total_amount = 1700.00 WHERE id = 'o1111111-1111-1111-1111-111111111111';

-- Order 2: Scheduled
INSERT INTO orders (id, buyer_id, supplier_id, project_id, delivery_date, delivery_address, delivery_latitude, delivery_longitude, delivery_window, payment_method, payment_status, order_status, notes, created_at) VALUES
('o2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p1111111-1111-1111-1111-111111111111', NOW() + INTERVAL '7 days', 'თბილისი, ვაკე, ი.ჭავჭავაძის 15', 41.6938, 44.7676, 'afternoon', 'bank_transfer', 'unpaid', 'scheduled', null, NOW() - INTERVAL '2 days');

INSERT INTO order_items (id, order_id, sku_id, quantity, unit_price, subtotal) VALUES
('oi333333-3333-3333-3333-333333333333', 'o2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 20.0, 180.00, 3600.00);

UPDATE orders SET total_amount = 3600.00 WHERE id = 'o2222222-2222-2222-2222-222222222222';

-- Order 3: Completed
INSERT INTO orders (id, buyer_id, supplier_id, project_id, delivery_date, delivery_address, delivery_latitude, delivery_longitude, delivery_window, payment_method, payment_status, order_status, notes, created_at, updated_at) VALUES
('o3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'p1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 days', 'თბილისი, ვაკე, ი.ჭავჭავაძის 15', 41.6938, 44.7676, 'morning', 'cod', 'paid', 'completed', 'ყველაფერი კარგად იყო', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days');

INSERT INTO order_items (id, order_id, sku_id, quantity, unit_price, subtotal) VALUES
('oi444444-4444-4444-4444-444444444444', 'o3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 300.0, 2.50, 750.00);

UPDATE orders SET total_amount = 750.00 WHERE id = 'o3333333-3333-3333-3333-333333333333';

-- Create OTPs for easy login
INSERT INTO otps (phone, otp_code, purpose, expires_at) VALUES
('+995555100001', '111111', 'login', NOW() + INTERVAL '1 hour'),
('+995555100002', '222222', 'login', NOW() + INTERVAL '1 hour');

