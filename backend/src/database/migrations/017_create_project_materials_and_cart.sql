-- Migration 017: Create Project Materials and Cart System
-- Description: Creates tables for tracking project materials from template calculations
-- and a persistent shopping cart for buyers

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Project material status
CREATE TYPE project_material_status AS ENUM (
  'need_to_buy',      -- Default, not yet acted on
  'already_have',     -- User marks manually (owns it already)
  'in_cart',          -- Added to cart for direct order
  'rfq_sent',         -- Waiting for supplier quotes
  'ordered',          -- Direct order placed or offer accepted
  'delivered'         -- Item received
);

-- =============================================================================
-- PROJECT MATERIALS TABLE
-- =============================================================================

CREATE TABLE project_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Material identification
  sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,
  custom_name VARCHAR(255),  -- For non-catalog items or template-generated names
  description TEXT,          -- Additional description/notes

  -- Quantity
  quantity DECIMAL(12, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  -- Status tracking
  status project_material_status NOT NULL DEFAULT 'need_to_buy',

  -- Supplier selection (nullable - user selects which supplier for this item)
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Price info (from SKU or estimated)
  unit_price DECIMAL(12, 2),
  estimated_total DECIMAL(12, 2),

  -- Links to orders/RFQs when acted upon
  cart_item_id UUID,  -- Will reference cart_items when added to cart
  rfq_id UUID REFERENCES rfqs(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_line_index INTEGER,  -- Which line in the order this corresponds to

  -- Template source (if generated from template calculation)
  template_slug VARCHAR(50),
  template_calculation_id UUID,  -- Groups materials from same calculation

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Either sku_id or custom_name must be provided
  CONSTRAINT material_identification CHECK (
    sku_id IS NOT NULL OR custom_name IS NOT NULL
  )
);

-- =============================================================================
-- CART ITEMS TABLE
-- =============================================================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Source tracking
  project_material_id UUID REFERENCES project_materials(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Item details
  sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  -- Item info (snapshot at time of adding)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(12, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,

  -- Intended action
  action_type VARCHAR(20) NOT NULL DEFAULT 'direct_order',  -- 'direct_order' or 'rfq'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate items from same material
  CONSTRAINT unique_cart_material UNIQUE (user_id, project_material_id)
    DEFERRABLE INITIALLY DEFERRED
);

-- =============================================================================
-- TEMPLATE CALCULATIONS TABLE (for tracking calculation history)
-- =============================================================================

CREATE TABLE template_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Template info
  template_slug VARCHAR(50) NOT NULL,
  template_version INTEGER,

  -- Input data (what user entered)
  inputs JSONB NOT NULL,

  -- Output data (calculated BOM)
  bom JSONB NOT NULL,
  total_estimated_price DECIMAL(12, 2),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Project materials indexes
CREATE INDEX idx_project_materials_project ON project_materials(project_id);
CREATE INDEX idx_project_materials_status ON project_materials(status);
CREATE INDEX idx_project_materials_supplier ON project_materials(supplier_id);
CREATE INDEX idx_project_materials_sku ON project_materials(sku_id);
CREATE INDEX idx_project_materials_rfq ON project_materials(rfq_id);
CREATE INDEX idx_project_materials_order ON project_materials(order_id);
CREATE INDEX idx_project_materials_calculation ON project_materials(template_calculation_id);

-- Cart indexes
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_supplier ON cart_items(supplier_id);
CREATE INDEX idx_cart_items_project ON cart_items(project_id);
CREATE INDEX idx_cart_items_action ON cart_items(action_type);

-- Template calculations indexes
CREATE INDEX idx_template_calculations_user ON template_calculations(user_id);
CREATE INDEX idx_template_calculations_project ON template_calculations(project_id);
CREATE INDEX idx_template_calculations_template ON template_calculations(template_slug);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamp trigger for project_materials
CREATE TRIGGER update_project_materials_timestamp
  BEFORE UPDATE ON project_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for cart_items
CREATE TRIGGER update_cart_items_timestamp
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update project_material status when added to cart
CREATE OR REPLACE FUNCTION update_material_cart_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update material status to in_cart
    UPDATE project_materials
    SET status = 'in_cart', cart_item_id = NEW.id, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.project_material_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Revert material status to need_to_buy
    UPDATE project_materials
    SET status = 'need_to_buy', cart_item_id = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.project_material_id AND status = 'in_cart';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_item_material_status
  AFTER INSERT OR DELETE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_material_cart_status();

-- =============================================================================
-- FOREIGN KEY FOR CART REFERENCE
-- =============================================================================

-- Add foreign key constraint for cart_item_id in project_materials
ALTER TABLE project_materials
  ADD CONSTRAINT fk_project_materials_cart_item
  FOREIGN KEY (cart_item_id) REFERENCES cart_items(id) ON DELETE SET NULL;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE project_materials IS 'Materials needed for a project, can be from template calculations or manually added';
COMMENT ON TABLE cart_items IS 'Persistent shopping cart for buyers, grouped by supplier for checkout';
COMMENT ON TABLE template_calculations IS 'History of template calculations for reference and analytics';

COMMENT ON COLUMN project_materials.status IS 'Current status of the material in the procurement workflow';
COMMENT ON COLUMN project_materials.template_calculation_id IS 'Groups materials from the same template calculation';
COMMENT ON COLUMN cart_items.action_type IS 'Whether this item is for direct order or RFQ';
COMMENT ON COLUMN cart_items.project_material_id IS 'Links back to the original project material if applicable';
