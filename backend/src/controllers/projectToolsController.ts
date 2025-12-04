/**
 * Project Tools Controller
 * Handles CRUD operations for project tool rentals
 * Similar to projectMaterialsController but for rental equipment
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { success } from '../utils/responseHelpers';

// ==================== RENTAL TOOLS CACHE ====================
interface CachedRentalTool {
  rental_tool_id: string;
  supplier_id: string;
  supplier_name: string;
  logo_url: string | null;
  depot_address: string | null;
  is_verified: boolean;
  tool_name: string;
  category: string;
  searchText: string;
  day_rate: number;
  week_rate: number | null;
  deposit_amount: number | null;
  direct_booking_available: boolean;
  delivery_option: string;
  trust_score: number | null;
}

let cachedRentalTools: CachedRentalTool[] = [];
let toolCacheTimestamp = 0;
const TOOL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getRentalToolsFromCache(): Promise<CachedRentalTool[]> {
  const now = Date.now();

  if (cachedRentalTools.length > 0 && (now - toolCacheTimestamp) < TOOL_CACHE_TTL) {
    return cachedRentalTools;
  }

  const result = await pool.query(
    `SELECT
      rt.id as rental_tool_id,
      rt.supplier_id,
      COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name,
      sup.logo_url,
      sup.depot_address,
      sup.is_verified,
      rt.name as tool_name,
      rt.category,
      LOWER(rt.name || ' ' || COALESCE(rt.spec_string, '') || ' ' || rt.category) as search_text,
      rt.day_rate,
      rt.week_rate,
      rt.deposit_amount,
      rt.direct_booking_available,
      rt.delivery_option,
      tm.on_time_pct,
      tm.spec_reliability_pct
    FROM rental_tools rt
    JOIN suppliers sup ON rt.supplier_id = sup.id
    LEFT JOIN trust_metrics tm ON tm.supplier_id = sup.id
    WHERE sup.is_active = true AND rt.is_active = true AND rt.is_available = true
    ORDER BY sup.id, rt.day_rate ASC`
  );

  cachedRentalTools = result.rows.map(row => ({
    rental_tool_id: row.rental_tool_id,
    supplier_id: row.supplier_id,
    supplier_name: row.supplier_name,
    logo_url: row.logo_url,
    depot_address: row.depot_address,
    is_verified: row.is_verified,
    tool_name: row.tool_name,
    category: row.category,
    searchText: row.search_text,
    day_rate: parseFloat(row.day_rate),
    week_rate: row.week_rate ? parseFloat(row.week_rate) : null,
    deposit_amount: row.deposit_amount ? parseFloat(row.deposit_amount) : null,
    direct_booking_available: row.direct_booking_available,
    delivery_option: row.delivery_option,
    trust_score: row.on_time_pct && row.spec_reliability_pct
      ? Math.round((parseFloat(row.on_time_pct) + parseFloat(row.spec_reliability_pct)) / 2)
      : null,
  }));

  toolCacheTimestamp = now;
  console.log(`[Cache] Refreshed rental tools cache: ${cachedRentalTools.length} items`);

  return cachedRentalTools;
}

// ==================== TOOL MATCHING ====================
const toolCategoryMappings: Record<string, string[]> = {
  'ექსკავატორი': ['excavator', 'digger'],
  'ბეტონის ტუმბო': ['concrete pump', 'pump'],
  'კრანი': ['crane'],
  'მიქსერი': ['mixer', 'concrete mixer'],
  'კომპრესორი': ['compressor'],
  'გენერატორი': ['generator'],
  'ვიბრატორი': ['vibrator'],
  'სახრახნისი': ['drill', 'hammer drill'],
  'შესადუღებელი': ['welder', 'welding'],
};

function extractToolSearchTerms(toolName: string, category?: string): string[] {
  const terms: string[] = [];
  const lowerName = toolName.toLowerCase();
  const lowerCategory = (category || '').toLowerCase();

  // Add name words
  lowerName.split(/[\s,.\-\/]+/).forEach(word => {
    if (word.length >= 3) terms.push(word);
  });

  // Add category words
  lowerCategory.split(/[\s,.\-\/]+/).forEach(word => {
    if (word.length >= 3) terms.push(word);
  });

  // Georgian translations
  for (const [georgian, english] of Object.entries(toolCategoryMappings)) {
    if (toolName.includes(georgian) || (category && category.includes(georgian))) {
      terms.push(...english);
    }
  }

  return [...new Set(terms)];
}

function findMatchingRentalSuppliers(
  searchTerms: string[],
  rentalTools: CachedRentalTool[]
): Map<string, CachedRentalTool> {
  const matches = new Map<string, CachedRentalTool>();

  for (const tool of rentalTools) {
    if (matches.has(tool.supplier_id)) continue;

    for (const term of searchTerms) {
      if (tool.searchText.includes(term)) {
        matches.set(tool.supplier_id, tool);
        break;
      }
    }
  }

  return matches;
}

// ==================== API HANDLERS ====================

/**
 * Get all tools for a project
 */
export const getProjectTools = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;

  const [projectCheck, toolsResult, rentalTools] = await Promise.all([
    pool.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]),
    pool.query(
      `SELECT
        pt.id, pt.project_id, pt.rental_tool_id, pt.custom_tool_name, pt.category,
        pt.description, pt.rental_duration_days, pt.daily_rate_estimate, pt.estimated_total,
        pt.status, pt.supplier_id, pt.supplier_name as stored_supplier_name,
        pt.rental_rfq_id, pt.booking_id, pt.template_slug, pt.template_calculation_id,
        pt.sort_order, pt.created_at, pt.updated_at,
        rt.name as tool_name, rt.category as tool_category, rt.day_rate, rt.week_rate,
        rt.direct_booking_available, rt.delivery_option,
        COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name_from_db
      FROM project_tools pt
      LEFT JOIN rental_tools rt ON pt.rental_tool_id = rt.id
      LEFT JOIN suppliers sup ON pt.supplier_id = sup.id
      WHERE pt.project_id = $1
      ORDER BY pt.sort_order, pt.created_at`,
      [projectId]
    ),
    getRentalToolsFromCache()
  ]);

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const supplierToolCounts: Record<string, number> = {};
  let totalToolsCount = 0;

  const tools = toolsResult.rows.map(row => {
    const toolName = row.custom_tool_name || row.tool_name || '';
    const category = row.category || row.tool_category || '';
    const searchTerms = extractToolSearchTerms(toolName, category);
    const matchingSuppliers = findMatchingRentalSuppliers(searchTerms, rentalTools);

    if (row.status === 'need_to_buy') {
      totalToolsCount++;
      matchingSuppliers.forEach((_, supplierId) => {
        supplierToolCounts[supplierId] = (supplierToolCounts[supplierId] || 0) + 1;
      });
    }

    const sortedSuppliers = Array.from(matchingSuppliers.values())
      .sort((a, b) => a.day_rate - b.day_rate)
      .slice(0, 5);

    const availableSuppliers = sortedSuppliers.map(tool => ({
      supplier_id: tool.supplier_id,
      supplier_name: tool.supplier_name,
      logo_url: tool.logo_url,
      location: tool.depot_address,
      is_verified: tool.is_verified,
      direct_booking_available: tool.direct_booking_available,
      delivery_option: tool.delivery_option,
      trust_score: tool.trust_score,
      rental_tool_id: tool.rental_tool_id,
      tool_name: tool.tool_name,
      day_rate: tool.day_rate,
      week_rate: tool.week_rate,
      deposit_amount: tool.deposit_amount,
      tools_available: 0,
      total_tools_needed: 0,
    }));

    return {
      id: row.id,
      project_id: row.project_id,
      rental_tool_id: row.rental_tool_id,
      name: toolName,
      category: category,
      description: row.description,
      rental_duration_days: row.rental_duration_days,
      daily_rate_estimate: row.daily_rate_estimate ? parseFloat(row.daily_rate_estimate) : (row.day_rate ? parseFloat(row.day_rate) : null),
      estimated_total: row.estimated_total ? parseFloat(row.estimated_total) : null,
      status: row.status,
      supplier_id: row.supplier_id,
      supplier_name: row.supplier_name_from_db || row.stored_supplier_name,
      template_slug: row.template_slug,
      template_calculation_id: row.template_calculation_id,
      rental_rfq_id: row.rental_rfq_id,
      booking_id: row.booking_id,
      direct_booking_available: row.direct_booking_available,
      available_suppliers: availableSuppliers,
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  const toolsWithCounts = tools.map(t => ({
    ...t,
    available_suppliers: t.available_suppliers.map(s => ({
      ...s,
      tools_available: supplierToolCounts[s.supplier_id] || 0,
      total_tools_needed: totalToolsCount,
    })),
  }));

  return success(res, { tools: toolsWithCounts }, 'Project tools retrieved successfully');
};

/**
 * Add tools to a project (from template calculation or manual)
 */
export const addProjectTools = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;
  const { tools, template_slug, template_calculation_id } = req.body;

  if (!tools || !Array.isArray(tools) || tools.length === 0) {
    return res.status(400).json({ success: false, message: 'Tools array is required' });
  }

  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertedTools = [];
    for (let i = 0; i < tools.length; i++) {
      const t = tools[i];
      const estimatedTotal = t.estimated_total || (t.rental_duration_days * (t.daily_rate_estimate || 0));

      const result = await client.query(
        `INSERT INTO project_tools (
          project_id, rental_tool_id, custom_tool_name, category, description,
          rental_duration_days, daily_rate_estimate, estimated_total,
          status, supplier_id, supplier_name,
          template_slug, template_calculation_id, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          projectId,
          t.rental_tool_id || null,
          t.name || t.custom_tool_name || null,
          t.category || null,
          t.description || null,
          t.rental_duration_days || 1,
          t.daily_rate_estimate || null,
          estimatedTotal || null,
          t.status || 'need_to_buy',
          t.supplier_id || null,
          t.supplier_name || null,
          template_slug || null,
          template_calculation_id || null,
          i
        ]
      );
      insertedTools.push(result.rows[0]);
    }

    await client.query('COMMIT');

    return success(res, { tools: insertedTools }, 'Tools added to project successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add project tools error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add tools to project' });
  } finally {
    client.release();
  }
};

/**
 * Update a project tool
 */
export const updateProjectTool = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId, toolId } = req.params;
  const { status, supplier_id, supplier_name, rental_duration_days, rental_rfq_id, booking_id } = req.body;

  // Verify project belongs to user
  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (supplier_id !== undefined) {
    updates.push(`supplier_id = $${paramIndex++}`);
    values.push(supplier_id);
  }
  if (supplier_name !== undefined) {
    updates.push(`supplier_name = $${paramIndex++}`);
    values.push(supplier_name);
  }
  if (rental_duration_days !== undefined) {
    updates.push(`rental_duration_days = $${paramIndex++}`);
    values.push(rental_duration_days);
    // Recalculate estimated_total
    updates.push(`estimated_total = daily_rate_estimate * $${paramIndex++}`);
    values.push(rental_duration_days);
  }
  if (rental_rfq_id !== undefined) {
    updates.push(`rental_rfq_id = $${paramIndex++}`);
    values.push(rental_rfq_id);
  }
  if (booking_id !== undefined) {
    updates.push(`booking_id = $${paramIndex++}`);
    values.push(booking_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No updates provided' });
  }

  values.push(toolId, projectId);

  const result = await pool.query(
    `UPDATE project_tools
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex++} AND project_id = $${paramIndex}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }

  return success(res, { tool: result.rows[0] }, 'Tool updated successfully');
};

/**
 * Delete a project tool
 */
export const deleteProjectTool = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId, toolId } = req.params;

  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const result = await pool.query(
    'DELETE FROM project_tools WHERE id = $1 AND project_id = $2 RETURNING id',
    [toolId, projectId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }

  return success(res, null, 'Tool removed from project');
};

/**
 * Bulk update tools (select supplier for multiple)
 */
export const bulkUpdateProjectTools = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;
  const { tool_ids, supplier_id, supplier_name } = req.body;

  if (!tool_ids || !Array.isArray(tool_ids) || tool_ids.length === 0) {
    return res.status(400).json({ success: false, message: 'tool_ids array is required' });
  }

  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const result = await pool.query(
    `UPDATE project_tools
     SET supplier_id = $1, supplier_name = $2, updated_at = NOW()
     WHERE id = ANY($3) AND project_id = $4
     RETURNING *`,
    [supplier_id, supplier_name, tool_ids, projectId]
  );

  return success(res, { tools: result.rows }, `${result.rowCount} tools updated`);
};
