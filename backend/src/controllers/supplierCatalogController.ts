/**
 * Supplier Catalog Controller
 * Manage supplier's product catalog with Direct Order controls
 */

import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * GET /api/suppliers/catalog/skus
 * Get supplier's catalog with filters
 */
export async function getCatalogSKUs(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      category,
      direct_order,
      status,
      sort_by = 'updated_at',
      sort_order = 'desc',
    } = req.query;

    const client = await pool.connect();

    try {
      // Get supplier_id
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Build filters
      let whereConditions = ['supplier_id = $1'];
      const queryParams: any[] = [supplierId];
      let paramIndex = 2;

      if (category) {
        whereConditions.push(`(category_ka = $${paramIndex} OR category_en = $${paramIndex})`);
        queryParams.push(category);
        paramIndex++;
      }

      if (direct_order === 'on') {
        whereConditions.push('direct_order_available = true');
      } else if (direct_order === 'off') {
        whereConditions.push('direct_order_available = false');
      }

      if (status === 'active') {
        whereConditions.push('is_active = true');
      } else if (status === 'inactive') {
        whereConditions.push('is_active = false');
      }

      // Build ORDER BY
      const sortColumn = sort_by === 'name' ? 'name_en' : 'updated_at';
      const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

      const query = `
        SELECT
          id,
          name_ka,
          name_en,
          spec_string_ka,
          spec_string_en,
          category_ka,
          category_en,
          unit_ka,
          unit_en,
          base_price,
          images,
          direct_order_available,
          delivery_options,
          approx_lead_time_label,
          negotiable,
          min_order_quantity,
          is_active,
          created_at,
          updated_at,
          CASE
            WHEN updated_at < NOW() - INTERVAL '14 days' THEN true
            ELSE false
          END as is_stale
        FROM skus
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT 100
      `;

      const skusResult = await client.query(query, queryParams);

      // Get stats
      const statsQuery = `
        SELECT
          COUNT(*) as total_skus,
          COUNT(*) FILTER (WHERE direct_order_available = true) as direct_order_enabled,
          COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '14 days') as stale_prices
        FROM skus
        WHERE supplier_id = $1 AND is_active = true
      `;

      const statsResult = await client.query(statsQuery, [supplierId]);

      res.json({
        skus: skusResult.rows,
        stats: {
          total_skus: parseInt(statsResult.rows[0].total_skus, 10),
          direct_order_enabled: parseInt(statsResult.rows[0].direct_order_enabled, 10),
          stale_prices: parseInt(statsResult.rows[0].stale_prices, 10),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching catalog SKUs:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
}

/**
 * POST /api/suppliers/catalog/skus
 * Create new SKU
 */
export async function createSKU(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      name_ka,
      name_en,
      spec_string_ka,
      spec_string_en,
      category_ka,
      category_en,
      unit_ka,
      unit_en,
      base_price,
      images,
      description_ka,
      description_en,
      direct_order_available,
      delivery_options,
      approx_lead_time_label,
      negotiable,
      min_order_quantity,
      specifications,
    } = req.body;

    // Validation
    if (!name_ka || !name_en || !category_ka || !category_en || !unit_ka || !unit_en || !base_price) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (base_price <= 0) {
      res.status(400).json({ error: 'Base price must be greater than 0' });
      return;
    }

    if (direct_order_available && !delivery_options) {
      res.status(400).json({ error: 'Delivery options required when direct order is enabled' });
      return;
    }

    const client = await pool.connect();

    try {
      // Get supplier_id
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      const insertQuery = `
        INSERT INTO skus (
          supplier_id,
          name_ka,
          name_en,
          spec_string_ka,
          spec_string_en,
          category_ka,
          category_en,
          unit_ka,
          unit_en,
          base_price,
          images,
          description_ka,
          description_en,
          direct_order_available,
          delivery_options,
          approx_lead_time_label,
          negotiable,
          min_order_quantity,
          specifications
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        supplierId,
        name_ka,
        name_en,
        spec_string_ka || null,
        spec_string_en || null,
        category_ka,
        category_en,
        unit_ka,
        unit_en,
        base_price,
        images || [],
        description_ka || null,
        description_en || null,
        direct_order_available !== undefined ? direct_order_available : true,
        delivery_options || 'both',
        approx_lead_time_label || null,
        negotiable !== undefined ? negotiable : false,
        min_order_quantity || null,
        specifications ? JSON.stringify(specifications) : null,
      ]);

      res.status(201).json({ sku: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating SKU:', error);
    res.status(500).json({ error: 'Failed to create SKU' });
  }
}

/**
 * PUT /api/suppliers/catalog/skus/:skuId
 * Update existing SKU
 */
export async function updateSKU(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { skuId } = req.params;
    const updateData = req.body;

    // Validation
    if (updateData.base_price && updateData.base_price <= 0) {
      res.status(400).json({ error: 'Base price must be greater than 0' });
      return;
    }

    if (updateData.direct_order_available && !updateData.delivery_options) {
      res.status(400).json({ error: 'Delivery options required when direct order is enabled' });
      return;
    }

    const client = await pool.connect();

    try {
      // Get supplier_id
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Verify SKU belongs to supplier
      const skuCheck = await client.query(
        'SELECT id FROM skus WHERE id = $1 AND supplier_id = $2',
        [skuId, supplierId]
      );

      if (skuCheck.rows.length === 0) {
        res.status(404).json({ error: 'SKU not found' });
        return;
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = [
        'name_ka',
        'name_en',
        'spec_string_ka',
        'spec_string_en',
        'category_ka',
        'category_en',
        'unit_ka',
        'unit_en',
        'base_price',
        'images',
        'description_ka',
        'description_en',
        'direct_order_available',
        'delivery_options',
        'approx_lead_time_label',
        'negotiable',
        'min_order_quantity',
        'specifications',
        'is_active',
      ];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = $${paramIndex}`);
          values.push(updateData[field]);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      values.push(skuId);

      const updateQuery = `
        UPDATE skus
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      res.json({ sku: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating SKU:', error);
    res.status(500).json({ error: 'Failed to update SKU' });
  }
}

/**
 * DELETE /api/suppliers/catalog/skus/:skuId
 * Delete SKU (hard delete if permanent=true, otherwise soft delete)
 */
export async function deleteSKU(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { skuId } = req.params;
    const { permanent } = req.query;
    const isPermanent = permanent === 'true';
    const client = await pool.connect();

    try {
      // Get supplier_id
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      let result;
      if (isPermanent) {
        // Hard delete - permanently remove from database
        result = await client.query(
          `DELETE FROM skus
           WHERE id = $1 AND supplier_id = $2
           RETURNING id`,
          [skuId, supplierId]
        );
      } else {
        // Soft delete - set is_active to false
        result = await client.query(
          `UPDATE skus
           SET is_active = false
           WHERE id = $1 AND supplier_id = $2
           RETURNING id`,
          [skuId, supplierId]
        );
      }

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'SKU not found' });
        return;
      }

      res.json({
        success: true,
        message: isPermanent ? 'SKU deleted permanently' : 'SKU deactivated'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting SKU:', error);
    res.status(500).json({ error: 'Failed to delete SKU' });
  }
}

/**
 * PATCH /api/suppliers/catalog/skus/bulk
 * Bulk update SKUs
 */
export async function bulkUpdateSKUs(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sku_ids, updates } = req.body;

    if (!sku_ids || !Array.isArray(sku_ids) || sku_ids.length === 0) {
      res.status(400).json({ error: 'sku_ids array required' });
      return;
    }

    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'updates object required' });
      return;
    }

    const client = await pool.connect();

    try {
      // Get supplier_id
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Build update query
      const updateFields: string[] = [];
      const values: any[] = [supplierId];
      let paramIndex = 2;

      const allowedFields = [
        'direct_order_available',
        'delivery_options',
        'category_ka',
        'category_en',
        'is_active',
      ];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(updates[field]);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        res.status(400).json({ error: 'No valid fields to update' });
        return;
      }

      values.push(sku_ids);

      const updateQuery = `
        UPDATE skus
        SET ${updateFields.join(', ')}
        WHERE supplier_id = $1 AND id = ANY($${paramIndex}::uuid[])
        RETURNING id
      `;

      const result = await client.query(updateQuery, values);

      res.json({
        success: true,
        updated_count: result.rows.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating SKUs:', error);
    res.status(500).json({ error: 'Failed to bulk update SKUs' });
  }
}
