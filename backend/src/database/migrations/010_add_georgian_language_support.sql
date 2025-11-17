-- Migration 010: Add Georgian Language Support to SKUs and Suppliers
-- Description: Adds bilingual (Georgian/English) fields to support full i18n

-- Step 0: Drop materialized view that depends on business_name
DROP MATERIALIZED VIEW IF EXISTS supplier_statistics;

-- Step 1: Add new bilingual columns to skus table
ALTER TABLE skus
  ADD COLUMN name_ka VARCHAR(255),
  ADD COLUMN name_en VARCHAR(255),
  ADD COLUMN spec_string_ka TEXT,
  ADD COLUMN spec_string_en TEXT,
  ADD COLUMN category_ka VARCHAR(100),
  ADD COLUMN category_en VARCHAR(100),
  ADD COLUMN unit_ka VARCHAR(50),
  ADD COLUMN unit_en VARCHAR(50),
  ADD COLUMN description_ka TEXT,
  ADD COLUMN description_en TEXT;

-- Step 2: Copy existing data to English fields
UPDATE skus SET
  name_en = name,
  spec_string_en = spec_string,
  category_en = category,
  unit_en = unit,
  description_en = description;

-- Step 3: Set default Georgian values (same as English for now - to be updated with real translations)
UPDATE skus SET
  name_ka = name,
  spec_string_ka = spec_string,
  category_ka = category,
  unit_ka = unit,
  description_ka = description;

-- Step 4: Drop old single-language columns (we'll use the new bilingual columns)
ALTER TABLE skus
  DROP COLUMN name,
  DROP COLUMN spec_string,
  DROP COLUMN category,
  DROP COLUMN unit,
  DROP COLUMN description;

-- Step 5: Make the new columns NOT NULL where appropriate
ALTER TABLE skus
  ALTER COLUMN name_ka SET NOT NULL,
  ALTER COLUMN name_en SET NOT NULL,
  ALTER COLUMN category_ka SET NOT NULL,
  ALTER COLUMN category_en SET NOT NULL,
  ALTER COLUMN unit_ka SET NOT NULL,
  ALTER COLUMN unit_en SET NOT NULL;

-- Step 6: Update indexes to use new column names
DROP INDEX IF EXISTS idx_skus_name;
DROP INDEX IF EXISTS idx_skus_spec_string;
DROP INDEX IF EXISTS idx_skus_category;

CREATE INDEX idx_skus_name_ka ON skus USING gin(to_tsvector('simple', name_ka));
CREATE INDEX idx_skus_name_en ON skus USING gin(to_tsvector('english', name_en));
CREATE INDEX idx_skus_spec_ka ON skus USING gin(to_tsvector('simple', spec_string_ka));
CREATE INDEX idx_skus_spec_en ON skus USING gin(to_tsvector('english', spec_string_en));
CREATE INDEX idx_skus_category_ka ON skus(category_ka);
CREATE INDEX idx_skus_category_en ON skus(category_en);

-- Step 7: Add bilingual columns to suppliers table
ALTER TABLE suppliers
  ADD COLUMN business_name_ka VARCHAR(255),
  ADD COLUMN business_name_en VARCHAR(255),
  ADD COLUMN about_ka TEXT,
  ADD COLUMN about_en TEXT;

-- Step 8: Copy existing supplier data to English fields
UPDATE suppliers SET
  business_name_en = business_name,
  about_en = about;

-- Step 9: Set default Georgian values for suppliers
UPDATE suppliers SET
  business_name_ka = business_name,
  about_ka = about;

-- Step 10: Drop old supplier columns
ALTER TABLE suppliers
  DROP COLUMN business_name,
  DROP COLUMN about;

-- Step 11: Make supplier columns NOT NULL where appropriate
ALTER TABLE suppliers
  ALTER COLUMN business_name_ka SET NOT NULL,
  ALTER COLUMN business_name_en SET NOT NULL;

-- Comments
COMMENT ON COLUMN skus.name_ka IS 'Product name in Georgian';
COMMENT ON COLUMN skus.name_en IS 'Product name in English';
COMMENT ON COLUMN skus.spec_string_ka IS 'Specification string in Georgian';
COMMENT ON COLUMN skus.spec_string_en IS 'Specification string in English';
COMMENT ON COLUMN skus.category_ka IS 'Category name in Georgian';
COMMENT ON COLUMN skus.category_en IS 'Category name in English';
COMMENT ON COLUMN skus.unit_ka IS 'Unit of measurement in Georgian (მ³, ტონა, ცალი, ტომარა)';
COMMENT ON COLUMN skus.unit_en IS 'Unit of measurement in English (m3, ton, piece, bag)';
COMMENT ON COLUMN skus.description_ka IS 'Product description in Georgian';
COMMENT ON COLUMN skus.description_en IS 'Product description in English';

COMMENT ON COLUMN suppliers.business_name_ka IS 'Business name in Georgian';
COMMENT ON COLUMN suppliers.business_name_en IS 'Business name in English';
COMMENT ON COLUMN suppliers.about_ka IS 'About text in Georgian';
COMMENT ON COLUMN suppliers.about_en IS 'About text in English';

-- Step 12: Recreate materialized view with updated column names
CREATE MATERIALIZED VIEW supplier_statistics AS
SELECT
  s.id as supplier_id,
  s.business_name_en as business_name,
  s.business_name_ka,
  s.business_name_en,
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
GROUP BY s.id, s.business_name_ka, s.business_name_en, tm.spec_reliability_pct, tm.on_time_pct, tm.issue_rate_pct;

CREATE INDEX idx_supplier_stats_supplier_id ON supplier_statistics(supplier_id);
