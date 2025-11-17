-- Migration: Add bilingual support to rental_tools table
-- This migration adds Georgian (ka) and English (en) columns for tool names, descriptions, specs, and categories

-- Add new bilingual columns
ALTER TABLE rental_tools
  ADD COLUMN name_ka TEXT,
  ADD COLUMN name_en TEXT,
  ADD COLUMN spec_string_ka TEXT,
  ADD COLUMN spec_string_en TEXT,
  ADD COLUMN description_ka TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN category_ka TEXT,
  ADD COLUMN category_en TEXT;

-- Copy existing data to English columns (assuming existing data is in English)
UPDATE rental_tools
SET
  name_en = name,
  spec_string_en = spec_string,
  description_en = description,
  category_en = category;

-- Set Georgian columns to same as English for now (will be translated later)
UPDATE rental_tools
SET
  name_ka = name,
  spec_string_ka = spec_string,
  description_ka = description,
  category_ka = category;

-- Make bilingual columns NOT NULL
ALTER TABLE rental_tools
  ALTER COLUMN name_ka SET NOT NULL,
  ALTER COLUMN name_en SET NOT NULL,
  ALTER COLUMN category_ka SET NOT NULL,
  ALTER COLUMN category_en SET NOT NULL;

-- Note: spec_string and description can remain nullable

-- Drop old monolingual columns
ALTER TABLE rental_tools
  DROP COLUMN name,
  DROP COLUMN spec_string,
  DROP COLUMN description,
  DROP COLUMN category;

-- Add comment to table
COMMENT ON TABLE rental_tools IS 'Tool rental catalog with bilingual Georgian/English support';
COMMENT ON COLUMN rental_tools.name_ka IS 'Tool name in Georgian';
COMMENT ON COLUMN rental_tools.name_en IS 'Tool name in English';
COMMENT ON COLUMN rental_tools.spec_string_ka IS 'Tool specifications in Georgian';
COMMENT ON COLUMN rental_tools.spec_string_en IS 'Tool specifications in English';
COMMENT ON COLUMN rental_tools.description_ka IS 'Tool description in Georgian';
COMMENT ON COLUMN rental_tools.description_en IS 'Tool description in English';
COMMENT ON COLUMN rental_tools.category_ka IS 'Tool category in Georgian';
COMMENT ON COLUMN rental_tools.category_en IS 'Tool category in English';
