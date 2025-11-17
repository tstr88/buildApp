/**
 * Admin Template Management Routes
 * CRUD operations for construction templates (Fence, Slab, etc.)
 */

import { Router } from 'express';
import pool from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success, error as errorResponse } from '../../utils/responseHelpers';

const router = Router();

// GET /api/admin/templates - List all templates
router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query;

  let whereClause = '';
  if (status && status !== 'all') {
    const isPublished = status === 'published';
    whereClause = `WHERE is_published = ${isPublished}`;
  }

  const query = `
    SELECT
      id,
      slug,
      title_ka,
      title_en,
      description_ka,
      description_en,
      CASE WHEN is_published THEN 'published' ELSE 'draft' END as status,
      version,
      updated_at,
      0 as version_count
    FROM templates
    ${whereClause}
    ORDER BY slug ASC
  `;

  const result = await pool.query(query);

  const data = result.rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    titleKa: row.title_ka,
    titleEn: row.title_en,
    descriptionKa: row.description_ka,
    descriptionEn: row.description_en,
    status: row.status,
    version: row.version,
    updatedAt: row.updated_at,
    versionCount: parseInt(row.version_count),
  }));

  return success(res, { templates: data });
}));

// GET /api/admin/templates/:slug - Get template detail
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await pool.query(
    `SELECT * FROM templates WHERE slug = $1`,
    [slug]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Template not found', 404);
  }

  const template = result.rows[0];

  return success(res, {
    template: {
      id: template.id,
      slug: template.slug,
      titleKa: template.title_ka,
      titleEn: template.title_en,
      descriptionKa: template.description_ka,
      descriptionEn: template.description_en,
      status: template.is_published ? 'published' : 'draft',
      version: template.version,
      fields: template.fields,
      bomLogic: template.bom_logic,
      instructions: template.instructions,
      safetyNotesKa: template.safety_notes_ka,
      safetyNotesEn: template.safety_notes_en,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    }
  });
}));

// POST /api/admin/templates - Create new template
router.post('/', asyncHandler(async (req, res) => {
  const {
    slug,
    titleKa,
    titleEn,
    descriptionKa,
    descriptionEn,
    iconUrl,
    fields,
    bomLogic,
    instructions,
    safetyNotes,
  } = req.body;

  // @ts-ignore - req.user set by auth middleware
  const userId = req.user?.id;

  // Check if slug already exists
  const existing = await pool.query(
    'SELECT id FROM templates WHERE slug = $1',
    [slug]
  );

  if (existing.rows.length > 0) {
    return errorResponse(res, 'DUPLICATE_SLUG', 'Template with this slug already exists', 400);
  }

  const result = await pool.query(
    `INSERT INTO templates (
      slug, title_ka, title_en, description_ka, description_en,
      icon_url, status, fields, bom_logic, instructions, safety_notes,
      created_by, updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9, $10, $11, $11)
    RETURNING *`,
    [
      slug,
      titleKa,
      titleEn,
      descriptionKa || null,
      descriptionEn || null,
      iconUrl || null,
      JSON.stringify(fields || []),
      JSON.stringify(bomLogic || []),
      JSON.stringify(instructions || []),
      JSON.stringify(safetyNotes || []),
      userId,
    ]
  );

  const template = result.rows[0];

  return success(res, {
    template: {
      id: template.id,
      slug: template.slug,
      titleKa: template.title_ka,
      titleEn: template.title_en,
      status: template.status,
      version: template.version,
    }
  }, 'Template created successfully', 201);
}));

// PUT /api/admin/templates/:slug - Update template
router.post('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const {
    titleKa,
    titleEn,
    descriptionKa,
    descriptionEn,
    iconUrl,
    fields,
    bomLogic,
    instructions,
    safetyNotes,
  } = req.body;

  // @ts-ignore - req.user set by auth middleware
  const userId = req.user?.id;

  const result = await pool.query(
    `UPDATE templates
    SET
      title_ka = $1,
      title_en = $2,
      description_ka = $3,
      description_en = $4,
      icon_url = $5,
      fields = $6,
      bom_logic = $7,
      instructions = $8,
      safety_notes = $9,
      updated_by = $10
    WHERE slug = $11
    RETURNING *`,
    [
      titleKa,
      titleEn,
      descriptionKa,
      descriptionEn,
      iconUrl,
      JSON.stringify(fields),
      JSON.stringify(bomLogic),
      JSON.stringify(instructions),
      JSON.stringify(safetyNotes),
      userId,
      slug,
    ]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Template not found', 404);
  }

  const template = result.rows[0];

  return success(res, {
    template: {
      id: template.id,
      slug: template.slug,
      titleKa: template.title_ka,
      titleEn: template.title_en,
      status: template.status,
      version: template.version,
    }
  }, 'Template updated successfully');
}));

// POST /api/admin/templates/:slug/publish - Publish template and increment version
router.post('/:slug/publish', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { changeNotes } = req.body;

  // @ts-ignore - req.user set by auth middleware
  const userId = req.user?.id;

  // Get current template
  const templateResult = await pool.query(
    'SELECT * FROM templates WHERE slug = $1',
    [slug]
  );

  if (templateResult.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Template not found', 404);
  }

  const template = templateResult.rows[0];
  const newVersion = template.version + 1;

  // Start transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create version record
    await client.query(
      `INSERT INTO template_versions (
        template_id, version, title_ka, title_en, description_ka, description_en,
        icon_url, status, fields, bom_logic, instructions, safety_notes,
        created_by, change_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        template.id,
        template.version,
        template.title_ka,
        template.title_en,
        template.description_ka,
        template.description_en,
        template.icon_url,
        template.status,
        template.fields,
        template.bom_logic,
        template.instructions,
        template.safety_notes,
        userId,
        changeNotes || null,
      ]
    );

    // Update template status and version
    const updated = await client.query(
      `UPDATE templates
      SET status = 'published', version = $1, updated_by = $2
      WHERE slug = $3
      RETURNING *`,
      [newVersion, userId, slug]
    );

    await client.query('COMMIT');

    const updatedTemplate = updated.rows[0];

    return success(res, {
      template: {
        id: updatedTemplate.id,
        slug: updatedTemplate.slug,
        titleKa: updatedTemplate.title_ka,
        titleEn: updatedTemplate.title_en,
        status: updatedTemplate.status,
        version: updatedTemplate.version,
      }
    }, 'Template published successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

// POST /api/admin/templates/:slug/duplicate - Duplicate template
router.post('/:slug/duplicate', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { newSlug, newTitleKa, newTitleEn } = req.body;

  // @ts-ignore - req.user set by auth middleware
  const userId = req.user?.id;

  // Get original template
  const originalResult = await pool.query(
    'SELECT * FROM templates WHERE slug = $1',
    [slug]
  );

  if (originalResult.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Original template not found', 404);
  }

  // Check if new slug exists
  const existingResult = await pool.query(
    'SELECT id FROM templates WHERE slug = $1',
    [newSlug]
  );

  if (existingResult.rows.length > 0) {
    return errorResponse(res, 'DUPLICATE_SLUG', 'Template with new slug already exists', 400);
  }

  const original = originalResult.rows[0];

  const result = await pool.query(
    `INSERT INTO templates (
      slug, title_ka, title_en, description_ka, description_en,
      icon_url, status, fields, bom_logic, instructions, safety_notes,
      created_by, updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9, $10, $11, $11)
    RETURNING *`,
    [
      newSlug,
      newTitleKa,
      newTitleEn,
      original.description_ka,
      original.description_en,
      original.icon_url,
      original.fields,
      original.bom_logic,
      original.instructions,
      original.safety_notes,
      userId,
    ]
  );

  const duplicate = result.rows[0];

  return success(res, {
    template: {
      id: duplicate.id,
      slug: duplicate.slug,
      titleKa: duplicate.title_ka,
      titleEn: duplicate.title_en,
      status: duplicate.status,
      version: duplicate.version,
    }
  }, 'Template duplicated successfully', 201);
}));

// GET /api/admin/templates/:slug/versions - Get version history
router.get('/:slug/versions', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Get template ID
  const templateResult = await pool.query(
    'SELECT id FROM templates WHERE slug = $1',
    [slug]
  );

  if (templateResult.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Template not found', 404);
  }

  const templateId = templateResult.rows[0].id;

  const result = await pool.query(
    `SELECT
      tv.*,
      u.name as created_by_name
    FROM template_versions tv
    LEFT JOIN users u ON u.id = tv.created_by
    WHERE tv.template_id = $1
    ORDER BY tv.version DESC`,
    [templateId]
  );

  const versions = result.rows.map((row: any) => ({
    id: row.id,
    version: row.version,
    titleKa: row.title_ka,
    titleEn: row.title_en,
    status: row.status,
    createdAt: row.created_at,
    createdBy: row.created_by_name,
    changeNotes: row.change_notes,
  }));

  return success(res, { versions });
}));

// POST /api/admin/templates/:slug/restore/:version - Restore previous version
router.post('/:slug/restore/:version', asyncHandler(async (req, res) => {
  const { slug, version } = req.params;

  // @ts-ignore - req.user set by auth middleware
  const userId = req.user?.id;

  // Get template ID
  const templateResult = await pool.query(
    'SELECT id FROM templates WHERE slug = $1',
    [slug]
  );

  if (templateResult.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Template not found', 404);
  }

  const templateId = templateResult.rows[0].id;

  // Get version to restore
  const versionResult = await pool.query(
    `SELECT * FROM template_versions
    WHERE template_id = $1 AND version = $2`,
    [templateId, parseInt(version)]
  );

  if (versionResult.rows.length === 0) {
    return errorResponse(res, 'NOT_FOUND', 'Version not found', 404);
  }

  const versionData = versionResult.rows[0];

  // Update template with version data
  const result = await pool.query(
    `UPDATE templates
    SET
      title_ka = $1,
      title_en = $2,
      description_ka = $3,
      description_en = $4,
      icon_url = $5,
      fields = $6,
      bom_logic = $7,
      instructions = $8,
      safety_notes = $9,
      status = 'draft',
      updated_by = $10
    WHERE id = $11
    RETURNING *`,
    [
      versionData.title_ka,
      versionData.title_en,
      versionData.description_ka,
      versionData.description_en,
      versionData.icon_url,
      versionData.fields,
      versionData.bom_logic,
      versionData.instructions,
      versionData.safety_notes,
      userId,
      templateId,
    ]
  );

  const template = result.rows[0];

  return success(res, {
    template: {
      id: template.id,
      slug: template.slug,
      titleKa: template.title_ka,
      titleEn: template.title_en,
      status: template.status,
      version: template.version,
    }
  }, `Template restored to version ${version}`);
}));

export default router;
