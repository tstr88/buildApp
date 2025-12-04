-- Migration 023: Create Project Tools Table
-- Description: Adds tool rentals tracking for projects (parallel to project_materials)

-- =============================================================================
-- PROJECT TOOLS TABLE
-- =============================================================================

CREATE TABLE project_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Tool identification
  rental_tool_id UUID REFERENCES rental_tools(id) ON DELETE SET NULL,
  custom_tool_name VARCHAR(255),  -- For template-suggested tools not in catalog
  category VARCHAR(100),          -- Tool category (e.g., "Concrete Equipment")
  description TEXT,               -- Additional notes

  -- Rental terms
  rental_duration_days INTEGER NOT NULL DEFAULT 1,
  daily_rate_estimate DECIMAL(10, 2),
  estimated_total DECIMAL(12, 2),

  -- Status tracking (reusing same enum as materials)
  status project_material_status NOT NULL DEFAULT 'need_to_buy',

  -- Supplier selection
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name VARCHAR(255),

  -- Links to RFQ/Booking when acted upon
  rental_rfq_id UUID,  -- Will reference rental_rfqs if sent
  booking_id UUID REFERENCES rental_bookings(id) ON DELETE SET NULL,

  -- Template source (if generated from template calculation)
  template_slug VARCHAR(50),
  template_calculation_id UUID,

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Either rental_tool_id or custom_tool_name must be provided
  CONSTRAINT tool_identification CHECK (
    rental_tool_id IS NOT NULL OR custom_tool_name IS NOT NULL
  )
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_project_tools_project ON project_tools(project_id);
CREATE INDEX idx_project_tools_status ON project_tools(status);
CREATE INDEX idx_project_tools_supplier ON project_tools(supplier_id);
CREATE INDEX idx_project_tools_rental_tool ON project_tools(rental_tool_id);
CREATE INDEX idx_project_tools_booking ON project_tools(booking_id);
CREATE INDEX idx_project_tools_calculation ON project_tools(template_calculation_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamp trigger
CREATE TRIGGER update_project_tools_timestamp
  BEFORE UPDATE ON project_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE project_tools IS 'Tool rentals needed for a project, can be from template calculations or manually added';
COMMENT ON COLUMN project_tools.status IS 'Current status of the tool rental in the procurement workflow';
COMMENT ON COLUMN project_tools.template_calculation_id IS 'Groups tools from the same template calculation';
