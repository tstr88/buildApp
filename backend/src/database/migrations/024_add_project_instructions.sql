-- Migration 024: Add project instructions storage
-- Store construction/assembly instructions that are customized based on template inputs

-- Add instructions column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]'::jsonb;
-- Structure: [{
--   step: number,
--   title_ka: string,
--   title_en: string,
--   description_ka: string (can include {{variable}} placeholders replaced with actual values),
--   description_en: string,
--   image_url: string | null,
--   duration_minutes: number | null,
--   difficulty: 'easy' | 'medium' | 'hard' | null,
--   tools_needed: string[] | null,
--   materials_needed: string[] | null,
--   tips_ka: string[] | null,
--   tips_en: string[] | null,
--   warnings_ka: string[] | null,
--   warnings_en: string[] | null,
--   substeps: [{ text_ka, text_en, image_url }] | null
-- }]

-- Add safety_notes column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS safety_notes JSONB DEFAULT '[]'::jsonb;
-- Structure: [{ text_ka, text_en, severity: 'info' | 'warning' | 'critical' }]

-- Add template metadata for reference
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_slug VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_inputs JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_template_slug ON projects(template_slug);

COMMENT ON COLUMN projects.instructions IS 'Step-by-step construction/assembly instructions customized based on template inputs';
COMMENT ON COLUMN projects.safety_notes IS 'Safety warnings and notices for the project';
COMMENT ON COLUMN projects.template_slug IS 'Reference to the template used (fence, slab, etc.)';
COMMENT ON COLUMN projects.template_inputs IS 'User inputs from the calculator that generated this project';
