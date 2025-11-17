-- Migration 006: Create Rental System Tables
-- Description: Creates rental tool catalog, bookings, handovers, and returns

-- Rental Tools Table
CREATE TABLE rental_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  spec_string TEXT, -- e.g., "Excavator - 5 ton, diesel"
  category VARCHAR(100) NOT NULL,
  day_rate DECIMAL(10, 2) NOT NULL,
  week_rate DECIMAL(10, 2),
  month_rate DECIMAL(10, 2),
  deposit_info TEXT, -- Deposit amount and terms
  deposit_amount DECIMAL(10, 2),
  delivery_option delivery_option DEFAULT 'both',
  direct_booking_available BOOLEAN DEFAULT true,
  images TEXT[], -- Array of image URLs
  description TEXT,
  specifications JSONB, -- Technical specifications
  condition_notes TEXT,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  quantity_available INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_positive_rates CHECK (
    day_rate > 0 AND
    (week_rate IS NULL OR week_rate > 0) AND
    (month_rate IS NULL OR month_rate > 0)
  ),
  CONSTRAINT check_deposit CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  CONSTRAINT check_quantity CHECK (quantity_available >= 0)
);

-- Rental Bookings Table
CREATE TABLE rental_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable booking number
  buyer_id UUID NOT NULL REFERENCES users(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  project_id UUID REFERENCES projects(id),
  rental_tool_id UUID NOT NULL REFERENCES rental_tools(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_end_date TIMESTAMP WITH TIME ZONE,
  rental_duration_days INTEGER NOT NULL,
  day_rate DECIMAL(10, 2) NOT NULL,
  total_rental_amount DECIMAL(12, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  pickup_or_delivery delivery_option NOT NULL,
  delivery_address TEXT,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  payment_terms payment_terms NOT NULL DEFAULT 'advance_50',
  status booking_status DEFAULT 'pending',
  notes TEXT,
  buyer_notes TEXT,
  supplier_notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  late_return_fee DECIMAL(10, 2) DEFAULT 0,
  damage_fee DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_booking_dates CHECK (start_date < end_date),
  CONSTRAINT check_booking_amounts CHECK (
    day_rate > 0 AND
    total_rental_amount >= 0 AND
    deposit_amount >= 0 AND
    delivery_fee >= 0 AND
    late_return_fee >= 0 AND
    damage_fee >= 0
  ),
  CONSTRAINT check_delivery_coords CHECK (
    (delivery_latitude IS NULL AND delivery_longitude IS NULL) OR
    (delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL AND
     delivery_latitude >= -90 AND delivery_latitude <= 90 AND
     delivery_longitude >= -180 AND delivery_longitude <= 180)
  )
);

-- Handovers Table (tool handover at rental start)
CREATE TABLE handovers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES rental_bookings(id) ON DELETE CASCADE,
  photos TEXT[] NOT NULL, -- Photos of tool condition at handover
  condition_flags JSONB, -- Structured condition assessment
  odometer_reading VARCHAR(50),
  fuel_level VARCHAR(50),
  handover_notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  supplier_user_id UUID REFERENCES users(id), -- Who handed over the tool
  buyer_signature TEXT, -- Digital signature or acknowledgment
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- One handover per booking
  CONSTRAINT unique_booking_handover UNIQUE(booking_id)
);

-- Returns Table (tool return at rental end)
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES rental_bookings(id) ON DELETE CASCADE,
  photos TEXT[] NOT NULL, -- Photos of tool condition at return
  condition_flags JSONB, -- Structured condition assessment
  odometer_reading VARCHAR(50),
  fuel_level VARCHAR(50),
  damage_notes TEXT,
  damage_assessment JSONB, -- Detailed damage assessment if any
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  supplier_user_id UUID REFERENCES users(id), -- Who received the return
  buyer_signature TEXT, -- Digital signature or acknowledgment
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  is_late_return BOOLEAN DEFAULT false,
  days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- One return per booking
  CONSTRAINT unique_booking_return UNIQUE(booking_id),
  CONSTRAINT check_days_overdue CHECK (days_overdue >= 0)
);

-- Rental Tool Availability Calendar
CREATE TABLE rental_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_tool_id UUID NOT NULL REFERENCES rental_tools(id) ON DELETE CASCADE,
  blocked_start_date DATE NOT NULL,
  blocked_end_date DATE NOT NULL,
  reason VARCHAR(255), -- 'booked', 'maintenance', 'unavailable'
  booking_id UUID REFERENCES rental_bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_availability_dates CHECK (blocked_start_date <= blocked_end_date)
);

-- Indexes for Rental Tools
CREATE INDEX idx_rental_tools_supplier_id ON rental_tools(supplier_id);
CREATE INDEX idx_rental_tools_category ON rental_tools(category);
CREATE INDEX idx_rental_tools_is_available ON rental_tools(is_available);
CREATE INDEX idx_rental_tools_is_active ON rental_tools(is_active);
CREATE INDEX idx_rental_tools_name ON rental_tools USING gin(to_tsvector('simple', name));
CREATE INDEX idx_rental_tools_created_at ON rental_tools(created_at DESC);

-- Indexes for Rental Bookings
CREATE INDEX idx_rental_bookings_booking_number ON rental_bookings(booking_number);
CREATE INDEX idx_rental_bookings_buyer_id ON rental_bookings(buyer_id);
CREATE INDEX idx_rental_bookings_supplier_id ON rental_bookings(supplier_id);
CREATE INDEX idx_rental_bookings_rental_tool_id ON rental_bookings(rental_tool_id);
CREATE INDEX idx_rental_bookings_project_id ON rental_bookings(project_id);
CREATE INDEX idx_rental_bookings_status ON rental_bookings(status);
CREATE INDEX idx_rental_bookings_start_date ON rental_bookings(start_date);
CREATE INDEX idx_rental_bookings_end_date ON rental_bookings(end_date);
CREATE INDEX idx_rental_bookings_created_at ON rental_bookings(created_at DESC);

-- Indexes for Handovers
CREATE INDEX idx_handovers_booking_id ON handovers(booking_id);
CREATE INDEX idx_handovers_supplier_user_id ON handovers(supplier_user_id);
CREATE INDEX idx_handovers_timestamp ON handovers(timestamp DESC);

-- Indexes for Returns
CREATE INDEX idx_returns_booking_id ON returns(booking_id);
CREATE INDEX idx_returns_supplier_user_id ON returns(supplier_user_id);
CREATE INDEX idx_returns_timestamp ON returns(timestamp DESC);
CREATE INDEX idx_returns_is_late_return ON returns(is_late_return);

-- Indexes for Availability
CREATE INDEX idx_rental_availability_tool_id ON rental_availability(rental_tool_id);
CREATE INDEX idx_rental_availability_dates ON rental_availability(blocked_start_date, blocked_end_date);
CREATE INDEX idx_rental_availability_booking_id ON rental_availability(booking_id);

-- Triggers
CREATE TRIGGER update_rental_tools_updated_at
  BEFORE UPDATE ON rental_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_bookings_updated_at
  BEFORE UPDATE ON rental_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month VARCHAR(6);
  sequence_num INTEGER;
BEGIN
  -- Format: RNT-YYYYMM-XXXXX
  year_month := TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMM');

  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 12) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM rental_bookings
  WHERE booking_number LIKE 'RNT-' || year_month || '-%';

  NEW.booking_number := 'RNT-' || year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking number
CREATE TRIGGER generate_booking_number_trigger
  BEFORE INSERT ON rental_bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION generate_booking_number();

-- Function to update booking status after handover
CREATE OR REPLACE FUNCTION update_booking_on_handover()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rental_bookings
  SET status = 'active',
      actual_start_date = NEW.timestamp
  WHERE id = NEW.booking_id
    AND status = 'confirmed';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update booking after handover
CREATE TRIGGER update_booking_on_handover_trigger
  AFTER INSERT ON handovers
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_on_handover();

-- Function to update booking status after return
CREATE OR REPLACE FUNCTION update_booking_on_return()
RETURNS TRIGGER AS $$
DECLARE
  booking_rec RECORD;
BEGIN
  -- Get the booking details
  SELECT * INTO booking_rec FROM rental_bookings WHERE id = NEW.booking_id;

  -- Update booking with return info
  UPDATE rental_bookings
  SET status = 'completed',
      actual_end_date = NEW.timestamp,
      late_return_fee = CASE
        WHEN NEW.is_late_return THEN day_rate * NEW.days_overdue
        ELSE 0
      END
  WHERE id = NEW.booking_id
    AND status = 'active';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update booking after return
CREATE TRIGGER update_booking_on_return_trigger
  AFTER INSERT ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_on_return();

-- Function to block availability when booking is confirmed
CREATE OR REPLACE FUNCTION block_rental_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO rental_availability (
      rental_tool_id,
      blocked_start_date,
      blocked_end_date,
      reason,
      booking_id
    )
    VALUES (
      NEW.rental_tool_id,
      NEW.start_date::DATE,
      NEW.end_date::DATE,
      'booked',
      NEW.id
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to block availability
CREATE TRIGGER block_rental_availability_trigger
  AFTER INSERT OR UPDATE ON rental_bookings
  FOR EACH ROW
  EXECUTE FUNCTION block_rental_availability();

-- Comments
COMMENT ON TABLE rental_tools IS 'Catalog of tools and equipment available for rental';
COMMENT ON COLUMN rental_tools.day_rate IS 'Daily rental rate in GEL';
COMMENT ON COLUMN rental_tools.week_rate IS 'Weekly rental rate (optional discount)';
COMMENT ON COLUMN rental_tools.month_rate IS 'Monthly rental rate (optional discount)';
COMMENT ON COLUMN rental_tools.deposit_info IS 'Text description of deposit requirements';
COMMENT ON COLUMN rental_tools.quantity_available IS 'Number of units available for rent';

COMMENT ON TABLE rental_bookings IS 'Rental bookings similar to material orders';
COMMENT ON COLUMN rental_bookings.booking_number IS 'Human-readable booking identifier (RNT-YYYYMM-XXXXX)';
COMMENT ON COLUMN rental_bookings.rental_duration_days IS 'Calculated rental period in days';
COMMENT ON COLUMN rental_bookings.late_return_fee IS 'Fee charged for late return';
COMMENT ON COLUMN rental_bookings.damage_fee IS 'Fee charged for damages';

COMMENT ON TABLE handovers IS 'Tool handover documentation with condition photos';
COMMENT ON COLUMN handovers.condition_flags IS 'JSONB structured condition assessment';
COMMENT ON COLUMN handovers.buyer_signature IS 'Digital signature acknowledging condition';

COMMENT ON TABLE returns IS 'Tool return documentation with condition photos and damage assessment';
COMMENT ON COLUMN returns.damage_notes IS 'Description of any damage found';
COMMENT ON COLUMN returns.damage_assessment IS 'Detailed JSONB assessment of damages';
COMMENT ON COLUMN returns.is_late_return IS 'Whether tool was returned after agreed end date';
COMMENT ON COLUMN returns.days_overdue IS 'Number of days past the agreed return date';

COMMENT ON TABLE rental_availability IS 'Availability calendar for rental tools';
