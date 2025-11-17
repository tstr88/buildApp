-- Migration 013: Template Management System
-- Create tables for admin-managed templates (Fence, Slab, etc.)

-- Templates table: stores template definitions
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  title_ka VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  description_ka TEXT,
  description_en TEXT,
  icon_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL DEFAULT 1,

  -- Template configuration stored as JSONB
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ name, type, label_ka, label_en, unit, validation: { required, min, max, options }, default, help_ka, help_en }]

  bom_logic JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ item_spec, quantity_formula, unit, price_per_unit }]

  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ step, title_ka, title_en, description_ka, description_en, image_url }]

  safety_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ text_ka, text_en, severity }]

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Template versions table: audit trail for template changes
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title_ka VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  description_ka TEXT,
  description_en TEXT,
  icon_url VARCHAR(500),
  status VARCHAR(20) NOT NULL,
  fields JSONB NOT NULL,
  bom_logic JSONB NOT NULL,
  instructions JSONB NOT NULL,
  safety_notes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  change_notes TEXT,
  UNIQUE(template_id, version)
);

-- Indexes
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX idx_template_versions_version ON template_versions(template_id, version DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_updated_at();

-- Seed initial templates (Fence and Slab)
INSERT INTO templates (slug, title_ka, title_en, description_ka, description_en, status, version, fields, bom_logic, instructions, safety_notes)
VALUES
  (
    'fence',
    'ღობე',
    'Fence',
    'მეტალის პრივატული ღობის დამონტაჟება',
    'Metal privacy fence installation',
    'published',
    1,
    '[
      {
        "name": "length",
        "type": "number",
        "label_ka": "სიგრძე",
        "label_en": "Length",
        "unit": "m",
        "validation": { "required": true, "min": 1, "max": 100 },
        "help_ka": "შეიყვანეთ ღობის საერთო სიგრძე მეტრებში",
        "help_en": "Enter total fence length in meters"
      },
      {
        "name": "height",
        "type": "number",
        "label_ka": "სიმაღლე",
        "label_en": "Height",
        "unit": "m",
        "validation": { "required": true, "min": 1, "max": 3 },
        "help_ka": "შეიყვანეთ ღობის სიმაღლე მეტრებში",
        "help_en": "Enter fence height in meters"
      },
      {
        "name": "style",
        "type": "pills",
        "label_ka": "სტილი",
        "label_en": "Style",
        "validation": {
          "required": true,
          "options": [
            { "value": "metal_privacy", "label_ka": "მეტალის პრივატული", "label_en": "Metal privacy" },
            { "value": "wood_on_metal", "label_ka": "ხის ფიცრები მეტალზე", "label_en": "Wood on metal" }
          ]
        }
      },
      {
        "name": "gates",
        "type": "pills",
        "label_ka": "კარიბჭე",
        "label_en": "Gates",
        "validation": {
          "required": true,
          "options": [
            { "value": "none", "label_ka": "არ არის", "label_en": "None" },
            { "value": "walk", "label_ka": "საბორკილო", "label_en": "Walk" },
            { "value": "car", "label_ka": "სატრანსპორტო", "label_en": "Car" }
          ]
        }
      },
      {
        "name": "terrain",
        "type": "pills",
        "label_ka": "რელიეფი",
        "label_en": "Terrain",
        "validation": {
          "required": true,
          "options": [
            { "value": "flat", "label_ka": "ბრტყელი", "label_en": "Flat" },
            { "value": "sloped", "label_ka": "დახრილი", "label_en": "Sloped" }
          ]
        }
      }
    ]'::jsonb,
    '[
      {
        "item_spec": "Concrete M300",
        "quantity_formula": "Posts × 0.04 m³ (calculated as: length / 2.5 + corners + gates)",
        "unit": "m³",
        "price_per_unit": 120
      },
      {
        "item_spec": "Metal posts 60×60mm",
        "quantity_formula": "(length / 2.5) + corners + gates",
        "unit": "pcs",
        "price_per_unit": 35
      },
      {
        "item_spec": "Metal sheets 2m×1m",
        "quantity_formula": "(length × height) / 2 (per sheet area). If sloped terrain: multiply by 1.15",
        "unit": "pcs",
        "price_per_unit": 45
      },
      {
        "item_spec": "Horizontal rails 40×20mm",
        "quantity_formula": "length × 3 (3 rails per fence section)",
        "unit": "m",
        "price_per_unit": 8
      }
    ]'::jsonb,
    '[
      {
        "step": 1,
        "title_ka": "მონიშნეთ საზღვრები",
        "title_en": "Mark boundaries",
        "description_ka": "გამოიყენეთ თოკები და კოლები საზღვრების მოსანიშნად. შეამოწმეთ საკუთრების დოკუმენტები.",
        "description_en": "Use string and stakes to mark boundaries. Check property documents."
      },
      {
        "step": 2,
        "title_ka": "შეამოწმეთ კომუნალური ხაზები",
        "title_en": "Check utility lines",
        "description_ka": "დარწმუნდით, რომ არ არის მიწისქვეშა კომუნალური ხაზები სამუშაო ზონაში.",
        "description_en": "Ensure there are no underground utility lines in the work zone."
      },
      {
        "step": 3,
        "title_ka": "მოამზადეთ საფუძველი",
        "title_en": "Prepare foundation",
        "description_ka": "გათხარეთ ორმოები ბოძებისთვის მინიმუმ 60სმ სიღრმით.",
        "description_en": "Dig holes for posts at minimum 60cm depth."
      },
      {
        "step": 4,
        "title_ka": "დაამონტაჟეთ ბოძები",
        "title_en": "Install posts",
        "description_ka": "მოათავსეთ ბოძები ორმოებში, გაასწორეთ და ჩაასხით ბეტონი.",
        "description_en": "Place posts in holes, level them, and pour concrete."
      },
      {
        "step": 5,
        "title_ka": "დაამონტაჟეთ ფურცლები",
        "title_en": "Install panels",
        "description_ka": "მიაჭირეთ მეტალის ფურცლები ბოძებს შედუღებით ან ხრახნით.",
        "description_en": "Attach metal panels to posts by welding or bolting."
      }
    ]'::jsonb,
    '[
      {
        "text_ka": "შეამოწმეთ საკუთრების საზღვრები ოფიციალური დოკუმენტებით ან ზომიერით",
        "text_en": "Check property boundaries with official documents or surveyor",
        "severity": "warning"
      },
      {
        "text_ka": "საფუძველი: მინიმუმ 60სმ სიღრმე ყინვის ხაზის ქვემოთ",
        "text_en": "Foundation: minimum 60cm depth below frost line",
        "severity": "critical"
      },
      {
        "text_ka": "კომუნალური ხაზების შემოწმება სავალდებულოა თხრილამდე",
        "text_en": "Utility line check is mandatory before digging",
        "severity": "critical"
      }
    ]'::jsonb
  ),
  (
    'slab',
    'ბეტონის ფილა',
    'Concrete Slab',
    'ბეტონის ფილის მოსასხმელად',
    'For pouring concrete slabs',
    'published',
    1,
    '[
      {
        "name": "length",
        "type": "number",
        "label_ka": "სიგრძე",
        "label_en": "Length",
        "unit": "m",
        "validation": { "required": true, "min": 1, "max": 50 }
      },
      {
        "name": "width",
        "type": "number",
        "label_ka": "სიგანე",
        "label_en": "Width",
        "unit": "m",
        "validation": { "required": true, "min": 1, "max": 50 }
      },
      {
        "name": "thickness",
        "type": "number",
        "label_ka": "სისქე",
        "label_en": "Thickness",
        "unit": "cm",
        "validation": { "required": true, "min": 10, "max": 40 }
      },
      {
        "name": "grade",
        "type": "pills",
        "label_ka": "ბეტონის მარკა",
        "label_en": "Concrete Grade",
        "validation": {
          "required": true,
          "options": [
            { "value": "m200", "label_ka": "M200 (სახლის სამშენებლოდ)", "label_en": "M200 (Residential)" },
            { "value": "m300", "label_ka": "M300 (კომერციული)", "label_en": "M300 (Commercial)" }
          ]
        }
      },
      {
        "name": "reinforcement",
        "type": "pills",
        "label_ka": "არმატურა",
        "label_en": "Reinforcement",
        "validation": {
          "required": true,
          "options": [
            { "value": "none", "label_ka": "არ არის", "label_en": "None" },
            { "value": "mesh", "label_ka": "ბადე", "label_en": "Mesh" },
            { "value": "rebar", "label_ka": "არმატურა", "label_en": "Rebar" }
          ]
        }
      }
    ]'::jsonb,
    '[
      {
        "item_spec": "Concrete M200/M300",
        "quantity_formula": "(length × width × thickness_in_meters) × 1.05 (5% waste factor)",
        "unit": "m³",
        "price_per_unit": 110
      },
      {
        "item_spec": "Gravel base",
        "quantity_formula": "(length × width) × 0.1m",
        "unit": "m³",
        "price_per_unit": 25
      },
      {
        "item_spec": "Reinforcement mesh (if selected)",
        "quantity_formula": "(length × width) × 1.1 (10% overlap)",
        "unit": "m²",
        "price_per_unit": 12
      },
      {
        "item_spec": "Edge formwork lumber",
        "quantity_formula": "(length + width) × 2",
        "unit": "m",
        "price_per_unit": 5
      }
    ]'::jsonb,
    '[
      {
        "step": 1,
        "title_ka": "მოამზადეთ ადგილი",
        "title_en": "Prepare site",
        "description_ka": "გაასუფთავეთ და გაასწორეთ ადგილი. მოაშორეთ ბალახი და ტოპსოილი.",
        "description_en": "Clear and level the site. Remove grass and topsoil."
      },
      {
        "step": 2,
        "title_ka": "ჩაასხით ხრეში",
        "title_en": "Add gravel base",
        "description_ka": "მოათავსეთ 10სმ ხრეშის ფენა და კარგად დაამაგრეთ.",
        "description_en": "Place 10cm gravel layer and compact well."
      },
      {
        "step": 3,
        "title_ka": "დააყენეთ გარსაცმი",
        "title_en": "Set formwork",
        "description_ka": "დააყენეთ ხის გარსაცმი სასურველი სისქით.",
        "description_en": "Set wooden formwork to desired thickness."
      },
      {
        "step": 4,
        "title_ka": "მოათავსეთ არმატურა",
        "title_en": "Place reinforcement",
        "description_ka": "თუ საჭიროა, მოათავსეთ არმატურული ბადე ან არმატურა.",
        "description_en": "If required, place reinforcement mesh or rebar."
      },
      {
        "step": 5,
        "title_ka": "ჩაასხით ბეტონი",
        "title_en": "Pour concrete",
        "description_ka": "ჩაასხით ბეტონი და გაასწორეთ ზედაპირი.",
        "description_en": "Pour concrete and level the surface."
      }
    ]'::jsonb,
    '[
      {
        "text_ka": "მინიმალური სისქე: 10სმ ლაივში, 15სმ კომერციულ გამოყენებაზე",
        "text_en": "Minimum thickness: 10cm residential, 15cm commercial",
        "severity": "warning"
      },
      {
        "text_ka": "ხრეშის საბაზო ფენა სავალდებულოა სტაბილურობისთვის",
        "text_en": "Gravel base layer is mandatory for stability",
        "severity": "critical"
      }
    ]'::jsonb
  );

COMMENT ON TABLE templates IS 'Admin-managed templates for construction projects (Fence, Slab, etc.)';
COMMENT ON TABLE template_versions IS 'Version history and audit trail for template changes';
