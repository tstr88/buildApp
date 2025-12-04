/**
 * Project Materials Controller
 * Handles CRUD operations for project materials and template calculations
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { success } from '../utils/responseHelpers';

// Georgian to English material type mapping for matching
const materialMappings: Record<string, string[]> = {
  'ბეტონი': ['concrete', 'beton'],
  'ხრეში': ['gravel', 'crushed'],
  'ქვიშა': ['sand'],
  'არმატურა': ['rebar', 'reinforcement', 'armatura'],
  'ბადე': ['mesh', 'reinforcement', 'net'],
  'ფურცელი': ['sheet', 'metal', 'plate'],
  'სვეტი': ['post', 'profile', 'column'],
  'ბოძი': ['post', 'profile', 'pole'],
  'დაფა': ['board', 'lumber', 'formwork', 'plank'],
  'ხე-ტყე': ['lumber', 'wood', 'formwork', 'timber'],
  'რელსი': ['rail', 'profile'],
  'ცემენტი': ['cement'],
  'აგური': ['brick'],
  'ბლოკი': ['block'],
  'თუნუქი': ['sheet', 'tin'],
};

/**
 * Extract searchable terms from material name
 */
function extractSearchTerms(materialName: string): string[] {
  const terms: string[] = [];
  const lowerName = materialName.toLowerCase();

  // Add the full name
  terms.push(lowerName);

  // Extract grade codes like M300, M200, C25
  const gradeMatch = materialName.match(/[MCmc]\d+/gi);
  if (gradeMatch) terms.push(...gradeMatch.map(g => g.toLowerCase()));

  // Extract dimensions like 60x60, 40x20, 100x100
  const dimMatch = materialName.match(/\d+[xX×]\d+/g);
  if (dimMatch) terms.push(...dimMatch.map(d => d.replace(/[X×]/gi, 'x').toLowerCase()));

  // Extract diameter/thickness like Ø4, Ø12, d4, d12
  const diameterMatch = materialName.match(/[Øød]\d+/gi);
  if (diameterMatch) terms.push(...diameterMatch.map(d => d.toLowerCase()));

  // Extract mm measurements
  const mmMatch = materialName.match(/\d+\s?მ?მ/g);
  if (mmMatch) terms.push(...mmMatch.map(m => m.replace(/\s/g, '')));

  // Add Georgian to English translations
  Object.entries(materialMappings).forEach(([georgian, englishTerms]) => {
    if (materialName.includes(georgian)) {
      terms.push(...englishTerms);
    }
  });

  // Split name into words and add significant words (>2 chars)
  const words = materialName.split(/[\s,.-]+/).filter(w => w.length > 2);
  terms.push(...words.map(w => w.toLowerCase()));

  return [...new Set(terms)]; // Remove duplicates
}

/**
 * Check if a supplier SKU matches a material based on terms
 */
function skuMatchesMaterial(
  skuNameEn: string | null,
  skuNameKa: string | null,
  specStringEn: string | null,
  specStringKa: string | null,
  categoryEn: string | null,
  searchTerms: string[]
): boolean {
  const skuText = [skuNameEn, skuNameKa, specStringEn, specStringKa, categoryEn]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Check if any search term matches
  return searchTerms.some(term => {
    // For short terms (grades, dimensions), require exact word boundary or contained
    if (term.length <= 4) {
      return skuText.includes(term);
    }
    // For longer terms, use substring matching
    return skuText.includes(term) || term.includes(skuText.substring(0, Math.min(skuText.length, 10)));
  });
}

/**
 * Get all materials for a project - OPTIMIZED VERSION
 */
export const getProjectMaterials = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;

  // Verify project belongs to user
  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  // Get materials with supplier and SKU info - SINGLE QUERY
  const materialsResult = await pool.query(
    `SELECT
      pm.id,
      pm.project_id,
      pm.sku_id,
      pm.custom_name,
      pm.description,
      pm.quantity,
      pm.unit as material_unit,
      pm.status,
      pm.supplier_id,
      pm.unit_price,
      pm.estimated_total,
      pm.cart_item_id,
      pm.rfq_id,
      pm.order_id,
      pm.template_slug,
      pm.template_calculation_id,
      pm.sort_order,
      pm.created_at,
      pm.updated_at,
      s.name_en as sku_name_en,
      s.name_ka as sku_name_ka,
      s.unit_en as sku_unit_en,
      s.unit_ka as sku_unit_ka,
      s.images as sku_images,
      COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name
    FROM project_materials pm
    LEFT JOIN skus s ON pm.sku_id = s.id
    LEFT JOIN suppliers sup ON pm.supplier_id = sup.id
    WHERE pm.project_id = $1
    ORDER BY pm.sort_order, pm.created_at`,
    [projectId]
  );

  // Get ALL active suppliers with their SKUs in ONE query
  const suppliersResult = await pool.query(
    `SELECT
      sup.id as supplier_id,
      COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name,
      sup.logo_url,
      sup.depot_address,
      sup.is_verified,
      s.id as sku_id,
      s.name_en as sku_name_en,
      s.name_ka as sku_name_ka,
      s.spec_string_en,
      s.spec_string_ka,
      s.category_en,
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

  // Build a map of supplier SKUs for fast lookup
  const supplierSkus = suppliersResult.rows;

  // Process each material and find matching suppliers IN MEMORY
  const materials = materialsResult.rows.map(row => {
    const materialName = row.custom_name || row.sku_name_en || row.sku_name_ka || '';
    const searchTerms = extractSearchTerms(materialName);

    // Find matching suppliers - group by supplier, pick lowest price SKU per supplier
    const matchingSupplierMap: Record<string, any> = {};

    for (const sku of supplierSkus) {
      if (skuMatchesMaterial(
        sku.sku_name_en,
        sku.sku_name_ka,
        sku.spec_string_en,
        sku.spec_string_ka,
        sku.category_en,
        searchTerms
      )) {
        // Only keep the first (lowest price) SKU per supplier
        if (!matchingSupplierMap[sku.supplier_id]) {
          matchingSupplierMap[sku.supplier_id] = {
            supplier_id: sku.supplier_id,
            supplier_name: sku.supplier_name,
            logo_url: sku.logo_url,
            location: sku.depot_address || null,
            is_verified: sku.is_verified,
            direct_order_available: sku.direct_order_available,
            trust_score: sku.on_time_pct && sku.spec_reliability_pct
              ? Math.round((parseFloat(sku.on_time_pct) + parseFloat(sku.spec_reliability_pct)) / 2)
              : null,
            sku_id: sku.sku_id,
            sku_name: sku.sku_name_en || sku.sku_name_ka,
            unit_price: sku.unit_price ? parseFloat(sku.unit_price) : null,
            unit: sku.unit,
            images: sku.images
          };
        }
      }
    }

    const availableSuppliers = Object.values(matchingSupplierMap);

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

  // Calculate how many materials each supplier can provide
  const supplierProductCounts: Record<string, { count: number; name: string }> = {};
  const totalMaterialsCount = materials.filter(m => m.status === 'need_to_buy').length;

  materials.forEach(m => {
    if (m.status === 'need_to_buy') {
      m.available_suppliers.forEach((s: any) => {
        if (!supplierProductCounts[s.supplier_id]) {
          supplierProductCounts[s.supplier_id] = { count: 0, name: s.supplier_name };
        }
        supplierProductCounts[s.supplier_id].count++;
      });
    }
  });

  // Add product count info to each supplier in materials
  const materialsWithCounts = materials.map(m => ({
    ...m,
    available_suppliers: m.available_suppliers.map((s: any) => ({
      ...s,
      products_available: supplierProductCounts[s.supplier_id]?.count || 0,
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

  const material = await pool.query(
    `SELECT pm.*, s.name_en, s.name_ka
     FROM project_materials pm
     LEFT JOIN skus s ON pm.sku_id = s.id
     WHERE pm.id = $1`,
    [materialId]
  );

  if (material.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }

  const mat = material.rows[0];
  const searchName = mat.custom_name || mat.name_en || mat.name_ka;

  // Find suppliers with matching SKUs
  const suppliers = await pool.query(
    `SELECT DISTINCT ON (sup.id)
      sup.id,
      COALESCE(sup.business_name_en, sup.business_name_ka) as name,
      sup.logo_url,
      s.id as sku_id,
      COALESCE(s.name_en, s.name_ka) as sku_name,
      s.unit_price,
      s.unit,
      s.images,
      tm.spec_reliability_pct,
      tm.on_time_pct
     FROM suppliers sup
     JOIN skus s ON s.supplier_id = sup.id
     LEFT JOIN trust_metrics tm ON tm.supplier_id = sup.id
     WHERE sup.is_active = true
       AND s.is_active = true
       AND (
         LOWER(COALESCE(s.name_en, '')) ILIKE $1
         OR LOWER(COALESCE(s.name_ka, '')) ILIKE $1
       )
     ORDER BY sup.id, s.unit_price ASC`,
    [`%${searchName}%`]
  );

  return success(res, {
    material_id: materialId,
    material_name: searchName,
    suppliers: suppliers.rows.map(s => ({
      supplier_id: s.id,
      supplier_name: s.name,
      logo_url: s.logo_url,
      sku_id: s.sku_id,
      sku_name: s.sku_name,
      unit_price: parseFloat(s.unit_price),
      unit: s.unit,
      images: s.images,
      trust_metrics: {
        spec_reliability: s.spec_reliability_pct,
        on_time: s.on_time_pct
      }
    }))
  }, 'Available suppliers retrieved');
};
