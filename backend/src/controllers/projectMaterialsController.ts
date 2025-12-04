/**
 * Project Materials Controller
 * Handles CRUD operations for project materials and template calculations
 * OPTIMIZED: Uses in-memory caching and parallel queries
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { success } from '../utils/responseHelpers';

// ==================== SUPPLIER SKU CACHE ====================
// Cache all supplier SKUs in memory - refreshed every 5 minutes
interface CachedSku {
  supplier_id: string;
  supplier_name: string;
  logo_url: string | null;
  depot_address: string | null;
  is_verified: boolean;
  sku_id: string;
  searchText: string; // Pre-computed lowercase searchable text
  unit_price: number | null;
  unit: string | null;
  images: string[] | null;
  direct_order_available: boolean;
  trust_score: number | null;
}

let cachedSupplierSkus: CachedSku[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getSupplierSkusFromCache(): Promise<CachedSku[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedSupplierSkus.length > 0 && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedSupplierSkus;
  }

  // Refresh cache
  const result = await pool.query(
    `SELECT
      sup.id as supplier_id,
      COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name,
      sup.logo_url,
      sup.depot_address,
      sup.is_verified,
      s.id as sku_id,
      LOWER(COALESCE(s.name_en, '') || ' ' || COALESCE(s.name_ka, '') || ' ' ||
            COALESCE(s.spec_string_en, '') || ' ' || COALESCE(s.spec_string_ka, '') || ' ' ||
            COALESCE(s.category_en, '')) as search_text,
      s.base_price as unit_price,
      COALESCE(s.unit_en, s.unit_ka) as unit,
      s.images,
      s.direct_order_available,
      tm.on_time_pct,
      tm.spec_reliability_pct
    FROM suppliers sup
    JOIN skus s ON s.supplier_id = sup.id
    LEFT JOIN trust_metrics tm ON tm.supplier_id = sup.id
    WHERE sup.is_active = true AND s.is_active = true
    ORDER BY sup.id, s.base_price ASC`
  );

  cachedSupplierSkus = result.rows.map(row => ({
    supplier_id: row.supplier_id,
    supplier_name: row.supplier_name,
    logo_url: row.logo_url,
    depot_address: row.depot_address,
    is_verified: row.is_verified,
    sku_id: row.sku_id,
    searchText: row.search_text,
    unit_price: row.unit_price ? parseFloat(row.unit_price) : null,
    unit: row.unit,
    images: row.images,
    direct_order_available: row.direct_order_available,
    trust_score: row.on_time_pct && row.spec_reliability_pct
      ? Math.round((parseFloat(row.on_time_pct) + parseFloat(row.spec_reliability_pct)) / 2)
      : null,
  }));

  cacheTimestamp = now;
  console.log(`[Cache] Refreshed supplier SKUs cache: ${cachedSupplierSkus.length} items`);

  return cachedSupplierSkus;
}

// ==================== MATERIAL MATCHING ====================
// Georgian to English material type mapping
const materialMappings: Record<string, string[]> = {
  'ბეტონი': ['concrete', 'beton'],
  'ხრეში': ['gravel', 'crushed'],
  'ქვიშა': ['sand'],
  'არმატურა': ['rebar', 'reinforcement', 'armatura'],
  'ბადე': ['mesh', 'net'],
  'ფურცელი': ['sheet', 'plate'],
  'სვეტი': ['post', 'profile', 'column'],
  'ბოძი': ['post', 'pole'],
  'დაფა': ['board', 'lumber', 'plank'],
  'ხე-ტყე': ['lumber', 'wood', 'timber'],
  'რელსი': ['rail'],
  'ცემენტი': ['cement'],
  'აგური': ['brick'],
  'ბლოკი': ['block'],
  'თუნუქი': ['tin'],
};

/**
 * Fast search term extraction - optimized for speed
 */
function extractSearchTerms(materialName: string): string[] {
  const terms: string[] = [];
  const lowerName = materialName.toLowerCase();

  // Add full name words (3+ chars)
  lowerName.split(/[\s,.\-\/]+/).forEach(word => {
    if (word.length >= 3) terms.push(word);
  });

  // Extract key patterns
  // Grades: M300, C25, etc.
  const grades = materialName.match(/[MCmc]\d+/gi);
  if (grades) terms.push(...grades.map(g => g.toLowerCase()));

  // Dimensions: 60x60, 100x50
  const dims = materialName.match(/\d+x\d+/gi);
  if (dims) terms.push(...dims.map(d => d.toLowerCase()));

  // Georgian translations
  for (const [georgian, english] of Object.entries(materialMappings)) {
    if (materialName.includes(georgian)) {
      terms.push(...english);
    }
  }

  return [...new Set(terms)];
}

/**
 * Fast SKU matching - optimized for speed
 */
function findMatchingSuppliers(
  searchTerms: string[],
  supplierSkus: CachedSku[]
): Map<string, CachedSku> {
  const matches = new Map<string, CachedSku>();

  for (const sku of supplierSkus) {
    // Skip if we already have this supplier (we want lowest price first)
    if (matches.has(sku.supplier_id)) continue;

    // Check if any term matches
    for (const term of searchTerms) {
      if (sku.searchText.includes(term)) {
        matches.set(sku.supplier_id, sku);
        break;
      }
    }
  }

  return matches;
}

// ==================== API HANDLERS ====================

/**
 * Get all materials for a project - ULTRA OPTIMIZED
 */
export const getProjectMaterials = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;

  // Run queries in parallel
  const [projectCheck, materialsResult, supplierSkus] = await Promise.all([
    pool.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]),
    pool.query(
      `SELECT
        pm.id, pm.project_id, pm.sku_id, pm.custom_name, pm.description,
        pm.quantity, pm.unit as material_unit, pm.status, pm.supplier_id,
        pm.unit_price, pm.estimated_total, pm.cart_item_id, pm.rfq_id,
        pm.order_id, pm.template_slug, pm.template_calculation_id,
        pm.sort_order, pm.created_at, pm.updated_at,
        s.name_en as sku_name_en, s.name_ka as sku_name_ka,
        s.unit_en as sku_unit_en, s.unit_ka as sku_unit_ka, s.images as sku_images,
        COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name
      FROM project_materials pm
      LEFT JOIN skus s ON pm.sku_id = s.id
      LEFT JOIN suppliers sup ON pm.supplier_id = sup.id
      WHERE pm.project_id = $1
      ORDER BY pm.sort_order, pm.created_at`,
      [projectId]
    ),
    getSupplierSkusFromCache()
  ]);

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  // Process materials and find matching suppliers
  const supplierProductCounts: Record<string, number> = {};
  let totalMaterialsCount = 0;

  const materials = materialsResult.rows.map(row => {
    const materialName = row.custom_name || row.sku_name_en || row.sku_name_ka || '';
    const searchTerms = extractSearchTerms(materialName);
    const matchingSuppliers = findMatchingSuppliers(searchTerms, supplierSkus);

    // Count suppliers for "need_to_buy" materials
    if (row.status === 'need_to_buy') {
      totalMaterialsCount++;
      matchingSuppliers.forEach((_, supplierId) => {
        supplierProductCounts[supplierId] = (supplierProductCounts[supplierId] || 0) + 1;
      });
    }

    const availableSuppliers = Array.from(matchingSuppliers.values()).map(sku => ({
      supplier_id: sku.supplier_id,
      supplier_name: sku.supplier_name,
      logo_url: sku.logo_url,
      location: sku.depot_address,
      is_verified: sku.is_verified,
      direct_order_available: sku.direct_order_available,
      trust_score: sku.trust_score,
      sku_id: sku.sku_id,
      unit_price: sku.unit_price,
      unit: sku.unit,
      images: sku.images,
      products_available: 0, // Will be filled below
      total_products_needed: 0,
    }));

    return {
      id: row.id,
      project_id: row.project_id,
      sku_id: row.sku_id,
      name: materialName,
      description: row.description,
      quantity: parseFloat(row.quantity),
      unit: row.material_unit || row.sku_unit_en || row.sku_unit_ka,
      status: row.status,
      supplier_id: row.supplier_id,
      supplier_name: row.supplier_name,
      unit_price: row.unit_price ? parseFloat(row.unit_price) : null,
      estimated_total: row.estimated_total ? parseFloat(row.estimated_total) : null,
      template_slug: row.template_slug,
      template_calculation_id: row.template_calculation_id,
      rfq_id: row.rfq_id,
      order_id: row.order_id,
      cart_item_id: row.cart_item_id,
      images: row.sku_images,
      available_suppliers: availableSuppliers,
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  // Add product counts to suppliers
  const materialsWithCounts = materials.map(m => ({
    ...m,
    available_suppliers: m.available_suppliers.map(s => ({
      ...s,
      products_available: supplierProductCounts[s.supplier_id] || 0,
      total_products_needed: totalMaterialsCount,
    })),
  }));

  return success(res, { materials: materialsWithCounts }, 'Project materials retrieved successfully');
};

/**
 * Add materials to a project (from template calculation or manual)
 */
export const addProjectMaterials = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;
  const { materials, template_slug, template_inputs, template_calculation_id } = req.body;

  if (!materials || !Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ success: false, message: 'Materials array is required' });
  }

  // Verify project belongs to user
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

    // If this is from a template, save the calculation
    let calculationId = template_calculation_id;
    if (template_slug && template_inputs && !calculationId) {
      const calcResult = await client.query(
        `INSERT INTO template_calculations (user_id, project_id, template_slug, inputs, bom, total_estimated_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          projectId,
          template_slug,
          JSON.stringify(template_inputs),
          JSON.stringify(materials),
          materials.reduce((sum: number, m: any) => sum + (m.estimated_total || 0), 0)
        ]
      );
      calculationId = calcResult.rows[0].id;
    }

    // Insert materials
    const insertedMaterials = [];
    for (let i = 0; i < materials.length; i++) {
      const m = materials[i];
      const result = await client.query(
        `INSERT INTO project_materials (
          project_id, sku_id, custom_name, description, quantity, unit,
          status, supplier_id, unit_price, estimated_total,
          template_slug, template_calculation_id, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          projectId,
          m.sku_id || null,
          m.name || m.custom_name || null,
          m.description || null,
          m.quantity,
          m.unit,
          m.status || 'need_to_buy',
          m.supplier_id || null,
          m.unit_price || null,
          m.estimated_total || (m.quantity * (m.unit_price || 0)) || null,
          template_slug || null,
          calculationId || null,
          i
        ]
      );
      insertedMaterials.push(result.rows[0]);
    }

    await client.query('COMMIT');

    return success(res, {
      materials: insertedMaterials,
      calculation_id: calculationId
    }, 'Materials added successfully', 201);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding project materials:', err);
    return res.status(500).json({ success: false, message: 'Failed to add materials' });
  } finally {
    client.release();
  }
};

/**
 * Update a project material
 */
export const updateProjectMaterial = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId, materialId } = req.params;
  const updates = req.body;

  // Verify project and material belong to user
  const check = await pool.query(
    `SELECT pm.id FROM project_materials pm
     JOIN projects p ON pm.project_id = p.id
     WHERE pm.id = $1 AND pm.project_id = $2 AND p.user_id = $3`,
    [materialId, projectId, userId]
  );

  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }

  // Build dynamic update query
  const allowedFields = ['status', 'supplier_id', 'sku_id', 'quantity', 'unit_price', 'custom_name', 'description', 'sort_order'];
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${paramCount}`);
      values.push(updates[field]);
      paramCount++;
    }
  }

  // Recalculate estimated_total if quantity or unit_price changed
  if (updates.quantity !== undefined || updates.unit_price !== undefined) {
    setClauses.push(`estimated_total = COALESCE($${paramCount}, quantity) * COALESCE($${paramCount + 1}, unit_price)`);
    values.push(updates.quantity || null, updates.unit_price || null);
    paramCount += 2;
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' });
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(materialId);

  const result = await pool.query(
    `UPDATE project_materials SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return success(res, { material: result.rows[0] }, 'Material updated successfully');
};

/**
 * Delete a project material
 */
export const deleteProjectMaterial = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId, materialId } = req.params;

  // Verify project and material belong to user
  const check = await pool.query(
    `SELECT pm.id, pm.cart_item_id FROM project_materials pm
     JOIN projects p ON pm.project_id = p.id
     WHERE pm.id = $1 AND pm.project_id = $2 AND p.user_id = $3`,
    [materialId, projectId, userId]
  );

  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }

  // If in cart, remove from cart first
  if (check.rows[0].cart_item_id) {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [check.rows[0].cart_item_id]);
  }

  await pool.query('DELETE FROM project_materials WHERE id = $1', [materialId]);

  return success(res, null, 'Material deleted successfully');
};

/**
 * Bulk update material statuses
 */
export const bulkUpdateMaterialStatus = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;
  const { material_ids, status } = req.body;

  if (!material_ids || !Array.isArray(material_ids) || material_ids.length === 0) {
    return res.status(400).json({ success: false, message: 'material_ids array is required' });
  }

  const validStatuses = ['need_to_buy', 'already_have', 'in_cart', 'rfq_sent', 'ordered', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  // Verify project belongs to user
  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const result = await pool.query(
    `UPDATE project_materials
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = ANY($2::uuid[]) AND project_id = $3
     RETURNING id`,
    [status, material_ids, projectId]
  );

  return success(res, {
    updated_count: result.rows.length,
    updated_ids: result.rows.map(r => r.id)
  }, 'Materials updated successfully');
};

/**
 * Get available suppliers for a material (by SKU name match)
 */
export const getAvailableSuppliersForMaterial = async (req: Request, res: Response) => {
  const { materialId } = req.params;

  const [material, supplierSkus] = await Promise.all([
    pool.query(
      `SELECT pm.*, s.name_en, s.name_ka
       FROM project_materials pm
       LEFT JOIN skus s ON pm.sku_id = s.id
       WHERE pm.id = $1`,
      [materialId]
    ),
    getSupplierSkusFromCache()
  ]);

  if (material.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }

  const mat = material.rows[0];
  const searchName = mat.custom_name || mat.name_en || mat.name_ka;
  const searchTerms = extractSearchTerms(searchName);
  const matchingSuppliers = findMatchingSuppliers(searchTerms, supplierSkus);

  return success(res, {
    material_id: materialId,
    material_name: searchName,
    suppliers: Array.from(matchingSuppliers.values()).map(s => ({
      supplier_id: s.supplier_id,
      supplier_name: s.supplier_name,
      logo_url: s.logo_url,
      sku_id: s.sku_id,
      unit_price: s.unit_price,
      unit: s.unit,
      images: s.images,
      trust_metrics: {
        trust_score: s.trust_score
      }
    }))
  }, 'Available suppliers retrieved');
};
