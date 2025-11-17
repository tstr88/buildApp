-- Migration 008: Create Notifications and Templates Tables
-- Description: Creates notification system and construction project templates

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  deep_link TEXT, -- URL to navigate to when clicked
  data JSONB, -- Additional structured data
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_notification_type UNIQUE(user_id, notification_type)
);

-- Templates Table (Construction project templates with BOM)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title_ka VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_ka TEXT,
  description_en TEXT,
  fields JSONB NOT NULL, -- Form fields for template: [{name, type, label_ka, label_en, required, options}]
  bom_logic TEXT, -- Logic/formula to calculate bill of materials
  instructions JSONB, -- Step-by-step instructions: [{step, title_ka, title_en, description_ka, description_en}]
  safety_notes_ka TEXT,
  safety_notes_en TEXT,
  images TEXT[], -- Array of reference images
  estimated_duration_days INTEGER,
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'professional'
  category VARCHAR(100), -- 'foundation', 'walls', 'roofing', etc.
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template Usage Log (track which templates are being used)
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  input_values JSONB, -- User's input values for template fields
  generated_bom JSONB, -- Generated bill of materials
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Saved Templates (favorites)
CREATE TABLE user_saved_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_template UNIQUE(user_id, template_id)
);

-- System Logs Table (audit trail)
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'login', 'create_order', 'update_profile', etc.
  entity_type VARCHAR(50), -- 'user', 'order', 'rfq', etc.
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_data JSONB,
  response_data JSONB,
  is_error BOOLEAN DEFAULT false,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Tasks Table (for background jobs)
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_type VARCHAR(100) NOT NULL, -- 'send_reminder', 'update_metrics', 'expire_rfqs', etc.
  task_data JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_delivered_at ON notifications(delivered_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Indexes for Notification Preferences
CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);

-- Indexes for Templates
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_published ON templates(is_published);
CREATE INDEX idx_templates_difficulty ON templates(difficulty_level);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);

-- Indexes for Template Usage
CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX idx_template_usage_project_id ON template_usage(project_id);
CREATE INDEX idx_template_usage_created_at ON template_usage(created_at DESC);

-- Indexes for Saved Templates
CREATE INDEX idx_saved_templates_user_id ON user_saved_templates(user_id);
CREATE INDEX idx_saved_templates_template_id ON user_saved_templates(template_id);

-- Indexes for System Logs
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_entity_type ON system_logs(entity_type);
CREATE INDEX idx_system_logs_entity_id ON system_logs(entity_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_is_error ON system_logs(is_error);

-- Indexes for Scheduled Tasks
CREATE INDEX idx_scheduled_tasks_task_type ON scheduled_tasks(task_type);
CREATE INDEX idx_scheduled_tasks_scheduled_for ON scheduled_tasks(scheduled_for);
CREATE INDEX idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX idx_scheduled_tasks_created_at ON scheduled_tasks(created_at DESC);

-- Triggers
CREATE TRIGGER update_notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND (OLD.is_read = false OR OLD.is_read IS NULL) THEN
    NEW.read_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set read_at timestamp
CREATE TRIGGER mark_notification_read_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_read();

-- Function to create notifications based on events
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title VARCHAR,
  p_message TEXT,
  p_deep_link TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  prefs RECORD;
BEGIN
  -- Get user notification preferences
  SELECT * INTO prefs
  FROM notification_preferences
  WHERE user_id = p_user_id AND notification_type = p_type;

  -- If no preferences set, create with defaults
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id, notification_type)
    VALUES (p_user_id, p_type)
    RETURNING * INTO prefs;
  END IF;

  -- Create in-app notification if enabled
  IF prefs.in_app_enabled THEN
    INSERT INTO notifications (
      user_id,
      notification_type,
      channel,
      title,
      message,
      deep_link,
      data
    )
    VALUES (
      p_user_id,
      p_type,
      'in_app',
      p_title,
      p_message,
      p_deep_link,
      p_data
    )
    RETURNING id INTO notification_id;
  END IF;

  -- TODO: Add push, SMS, email notification logic here based on preferences

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete read notifications older than 30 days
  DELETE FROM notifications
  WHERE is_read = true
    AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete expired notifications
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < CURRENT_TIMESTAMP;

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for various events in the system';
COMMENT ON COLUMN notifications.notification_type IS 'Type of notification (rfq_received, order_confirmed, etc.)';
COMMENT ON COLUMN notifications.channel IS 'Delivery channel: push, sms, email, or in_app';
COMMENT ON COLUMN notifications.deep_link IS 'URL to navigate to when notification is clicked';
COMMENT ON COLUMN notifications.data IS 'Additional structured data for the notification';
COMMENT ON COLUMN notifications.expires_at IS 'When notification should be automatically removed';

COMMENT ON TABLE notification_preferences IS 'User preferences for notification channels by type';

COMMENT ON TABLE templates IS 'Construction project templates with material calculators';
COMMENT ON COLUMN templates.fields IS 'JSONB array of form fields for user input';
COMMENT ON COLUMN templates.bom_logic IS 'Formula/logic to calculate bill of materials from inputs';
COMMENT ON COLUMN templates.instructions IS 'JSONB array of step-by-step construction instructions';
COMMENT ON COLUMN templates.version IS 'Template version for tracking changes';

COMMENT ON TABLE template_usage IS 'Log of template usage for analytics';
COMMENT ON COLUMN template_usage.input_values IS 'User input values used with this template';
COMMENT ON COLUMN template_usage.generated_bom IS 'Generated bill of materials output';

COMMENT ON TABLE user_saved_templates IS 'User favorite/saved templates';
COMMENT ON TABLE system_logs IS 'System-wide audit trail and logging';
COMMENT ON TABLE scheduled_tasks IS 'Background jobs and scheduled tasks queue';

COMMENT ON FUNCTION create_notification IS 'Create a notification for a user based on their preferences';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Cleanup function to remove old read notifications';
