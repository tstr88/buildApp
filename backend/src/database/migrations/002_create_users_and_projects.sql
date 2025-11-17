-- Migration 002: Create Users and Projects Tables
-- Description: Creates user authentication and project management tables

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL,
  buyer_role buyer_role,
  language language_preference DEFAULT 'ka',
  email VARCHAR(255),
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_buyer_role CHECK (
    (user_type = 'buyer' AND buyer_role IS NOT NULL) OR
    (user_type != 'buyer' AND buyer_role IS NULL)
  )
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude >= -90 AND latitude <= 90 AND
     longitude >= -180 AND longitude <= 180)
  )
);

-- User Sessions Table (for JWT token management)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OTP Table (for phone verification)
CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'registration', 'login', 'reset_password'
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Indexes for Projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_active ON projects(is_active);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_location ON projects USING gist (
  ll_to_earth(latitude::float8, longitude::float8)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Indexes for Sessions
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_sessions_refresh_token ON user_sessions(refresh_token);

-- Indexes for OTPs
CREATE INDEX idx_otps_phone ON otps(phone);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_otps_is_used ON otps(is_used);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE users IS 'User accounts for buyers, suppliers, and admins';
COMMENT ON COLUMN users.phone IS 'Unique phone number used for authentication';
COMMENT ON COLUMN users.user_type IS 'Type of user account: buyer, supplier, or admin';
COMMENT ON COLUMN users.buyer_role IS 'Specific role for buyers (homeowner or contractor)';
COMMENT ON COLUMN users.language IS 'Preferred interface language (Georgian or English)';
COMMENT ON COLUMN users.is_verified IS 'Whether phone number has been verified';

COMMENT ON TABLE projects IS 'Construction projects associated with buyer accounts';
COMMENT ON COLUMN projects.latitude IS 'Project location latitude for delivery calculations';
COMMENT ON COLUMN projects.longitude IS 'Project location longitude for delivery calculations';
COMMENT ON COLUMN projects.notes IS 'Additional notes about the project';

COMMENT ON TABLE user_sessions IS 'Active user sessions for token-based authentication';
COMMENT ON COLUMN user_sessions.refresh_token IS 'JWT refresh token for session renewal';
COMMENT ON COLUMN user_sessions.device_info IS 'Device information for security tracking';

COMMENT ON TABLE otps IS 'One-time passwords for phone verification';
COMMENT ON COLUMN otps.purpose IS 'Purpose of OTP: registration, login, or password reset';
COMMENT ON COLUMN otps.attempts IS 'Number of failed verification attempts';
