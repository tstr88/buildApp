-- Migration 003: Create Suppliers and SKUs Tables
-- Description: Creates supplier profiles and product catalog (SKUs)

-- Suppliers Table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  depot_latitude DECIMAL(10, 8),
  depot_longitude DECIMAL(11, 8),
  depot_address TEXT,
  delivery_zones JSONB, -- Array of polygons or radius-based zones
  categories TEXT[], -- Array of product categories they supply
  payment_terms payment_terms[] DEFAULT ARRAY['cod']::payment_terms[],
  about TEXT,
  logo_url TEXT,
  cover_photo_url TEXT,
  business_registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  min_order_value DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_depot_coordinates CHECK (
    (depot_latitude IS NULL AND depot_longitude IS NULL) OR
    (depot_latitude IS NOT NULL AND depot_longitude IS NOT NULL AND
     depot_latitude >= -90 AND depot_latitude <= 90 AND
     depot_longitude >= -180 AND depot_longitude <= 180)
  ),
  CONSTRAINT unique_user_supplier UNIQUE(user_id)
);

-- SKUs Table (Stock Keeping Units - Products/Materials)
CREATE TABLE skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  spec_string TEXT, -- e.g., "M250 Concrete, 20cm slump"
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- e.g., "m3", "ton", "piece", "bag"
  base_price DECIMAL(10, 2) NOT NULL,
  images TEXT[], -- Array of image URLs
  direct_order_available BOOLEAN DEFAULT true,
  delivery_options delivery_option DEFAULT 'both',
  approx_lead_time_label VARCHAR(100), -- e.g., "1-2 days", "Same day"
  negotiable BOOLEAN DEFAULT false,
  description TEXT,
  specifications JSONB, -- Structured specifications as key-value pairs
  min_order_quantity DECIMAL(10, 2),
  max_order_quantity DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  stock_status VARCHAR(50) DEFAULT 'in_stock', -- 'in_stock', 'low_stock', 'out_of_stock', 'made_to_order'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_positive_price CHECK (base_price > 0),
  CONSTRAINT check_quantities CHECK (
    (min_order_quantity IS NULL OR min_order_quantity > 0) AND
    (max_order_quantity IS NULL OR max_order_quantity > 0) AND
    (min_order_quantity IS NULL OR max_order_quantity IS NULL OR
     min_order_quantity <= max_order_quantity)
  )
);

-- SKU Price History (for tracking price changes)
CREATE TABLE sku_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2) NOT NULL,
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Categories (predefined categories for filtering)
CREATE TABLE supplier_categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_ka VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100),
  parent_id INTEGER REFERENCES supplier_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Operating Hours
CREATE TABLE supplier_operating_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,

  CONSTRAINT unique_supplier_day UNIQUE(supplier_id, day_of_week)
);

-- Indexes for Suppliers
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_suppliers_is_verified ON suppliers(is_verified);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_categories ON suppliers USING gin(categories);
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at DESC);
CREATE INDEX idx_suppliers_location ON suppliers USING gist (
  ll_to_earth(depot_latitude::float8, depot_longitude::float8)
) WHERE depot_latitude IS NOT NULL AND depot_longitude IS NOT NULL;

-- Indexes for SKUs
CREATE INDEX idx_skus_supplier_id ON skus(supplier_id);
CREATE INDEX idx_skus_category ON skus(category);
CREATE INDEX idx_skus_is_active ON skus(is_active);
CREATE INDEX idx_skus_direct_order ON skus(direct_order_available);
CREATE INDEX idx_skus_name ON skus USING gin(to_tsvector('simple', name));
CREATE INDEX idx_skus_spec_string ON skus USING gin(to_tsvector('simple', spec_string));
CREATE INDEX idx_skus_created_at ON skus(created_at DESC);
CREATE INDEX idx_skus_updated_at ON skus(updated_at DESC);
CREATE INDEX idx_skus_specifications ON skus USING gin(specifications);

-- Indexes for Price History
CREATE INDEX idx_price_history_sku_id ON sku_price_history(sku_id);
CREATE INDEX idx_price_history_created_at ON sku_price_history(created_at DESC);

-- Indexes for Categories
CREATE INDEX idx_categories_slug ON supplier_categories(slug);
CREATE INDEX idx_categories_parent_id ON supplier_categories(parent_id);
CREATE INDEX idx_categories_is_active ON supplier_categories(is_active);

-- Indexes for Operating Hours
CREATE INDEX idx_operating_hours_supplier_id ON supplier_operating_hours(supplier_id);

-- Triggers
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skus_updated_at
  BEFORE UPDATE ON skus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log price changes
CREATE OR REPLACE FUNCTION log_sku_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.base_price != NEW.base_price THEN
    INSERT INTO sku_price_history (sku_id, old_price, new_price)
    VALUES (NEW.id, OLD.base_price, NEW.base_price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically log price changes
CREATE TRIGGER log_sku_price_change_trigger
  AFTER UPDATE ON skus
  FOR EACH ROW
  EXECUTE FUNCTION log_sku_price_change();

-- Comments
COMMENT ON TABLE suppliers IS 'Supplier business profiles linked to user accounts';
COMMENT ON COLUMN suppliers.depot_latitude IS 'Depot location latitude for delivery range calculations';
COMMENT ON COLUMN suppliers.depot_longitude IS 'Depot location longitude for delivery range calculations';
COMMENT ON COLUMN suppliers.delivery_zones IS 'JSONB array defining delivery coverage areas';
COMMENT ON COLUMN suppliers.categories IS 'Array of product categories this supplier provides';
COMMENT ON COLUMN suppliers.payment_terms IS 'Accepted payment terms (COD, Net 7, Net 15, etc.)';
COMMENT ON COLUMN suppliers.is_verified IS 'Whether supplier has been verified by buildApp';

COMMENT ON TABLE skus IS 'Product catalog (Stock Keeping Units) for each supplier';
COMMENT ON COLUMN skus.spec_string IS 'Human-readable specification string';
COMMENT ON COLUMN skus.unit IS 'Unit of measurement (m3, ton, piece, bag, etc.)';
COMMENT ON COLUMN skus.base_price IS 'Base price per unit in GEL';
COMMENT ON COLUMN skus.direct_order_available IS 'Whether product can be ordered directly without RFQ';
COMMENT ON COLUMN skus.delivery_options IS 'Available delivery methods: pickup, delivery, or both';
COMMENT ON COLUMN skus.negotiable IS 'Whether price is negotiable';
COMMENT ON COLUMN skus.specifications IS 'Structured product specifications as JSONB';

COMMENT ON TABLE sku_price_history IS 'Audit log of SKU price changes';
COMMENT ON TABLE supplier_categories IS 'Predefined categories for supplier classification';
COMMENT ON TABLE supplier_operating_hours IS 'Weekly operating hours for each supplier';
