/**
 * Templates Controller
 * Handles project template endpoints
 */

import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * GET /api/templates
 * Get published templates (public endpoint)
 */
export async function getTemplates(req: Request, res: Response): Promise<void> {
  try {
    const { is_published, category } = req.query;

    let query = `
      SELECT
        id,
        slug,
        title_ka,
        title_en,
        description_ka,
        description_en,
        category,
        estimated_duration_days,
        difficulty_level,
        images,
        version,
        is_published,
        created_at,
        updated_at
      FROM templates
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    // Filter by published status
    if (is_published !== undefined) {
      paramCount++;
      query += ` AND is_published = $${paramCount}`;
      params.push(is_published === 'true');
    }

    // Filter by category
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      templates: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load templates',
    });
  }
}

/**
 * GET /api/templates/:slug
 * Get template by slug (public endpoint)
 */
export async function getTemplateBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        slug,
        title_ka,
        title_en,
        description_ka,
        description_en,
        fields,
        bom_logic,
        instructions,
        safety_notes_ka,
        safety_notes_en,
        images,
        estimated_duration_days,
        difficulty_level,
        category,
        version,
        is_published,
        created_at,
        updated_at
       FROM templates
       WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Template not found',
      });
      return;
    }

    // Don't return unpublished templates unless user is admin
    const template = result.rows[0];
    if (!template.is_published && (!req.user || req.user.user_type !== 'admin')) {
      res.status(404).json({
        success: false,
        error: 'Template not found',
      });
      return;
    }

    res.json({
      success: true,
      template: template,
    });
  } catch (error) {
    console.error('Get template by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load template',
    });
  }
}

/**
 * GET /api/templates/:id/usage-stats
 * Get template usage statistics
 */
export async function getTemplateStats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_uses,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completion_rate
       FROM template_usage
       WHERE template_id = $1`,
      [id]
    );

    const recentUsesResult = await pool.query(
      `SELECT
        u.name as user_name,
        tu.created_at,
        tu.completed_at
       FROM template_usage tu
       JOIN users u ON tu.user_id = u.id
       WHERE tu.template_id = $1
       ORDER BY tu.created_at DESC
       LIMIT 5`,
      [id]
    );

    res.json({
      success: true,
      stats: {
        ...statsResult.rows[0],
        recent_uses: recentUsesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load template statistics',
    });
  }
}
