/**
 * Catalog API routes
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success } from '../../utils/responseHelpers';
import pool from '../../config/database';

const router = Router();

/**
 * GET /api/catalog/skus
 * Browse all SKUs across all suppliers with filters
 */
router.get('/skus', asyncHandler(async (req, res) => {
  const {
    search,
    category = [],
    supplier_id = [],
    direct_order_available,
    delivery_option,
    lead_time,
    price_min,
    price_max,
    updated_since,
    sort = 'relevance',
    page = 1,
    limit = 20
  } = req.query;

  let query = `
    SELECT
      s.id,
      s.supplier_id,
      s.name_ka,
      s.name_en,
      s.spec_string_ka,
      s.spec_string_en,
      s.category_ka,
      s.category_en,
      s.base_price,
      s.unit_ka,
      s.unit_en,
      s.direct_order_available,
      s.approx_lead_time_label,
      s.delivery_options,
      s.updated_at,
      s.images,
      sup.business_name_ka as supplier_name_ka,
      sup.business_name_en as supplier_name_en
    FROM skus s
    LEFT JOIN suppliers sup ON s.supplier_id = sup.id
    WHERE s.is_active = true
  `;

  const values: any[] = [];
  let paramCount = 1;

  // Search filter (search both languages)
  if (search && typeof search === 'string') {
    query += ` AND (s.name_ka ILIKE $${paramCount} OR s.name_en ILIKE $${paramCount} OR s.spec_string_ka ILIKE $${paramCount} OR s.spec_string_en ILIKE $${paramCount})`;
    values.push(`%${search}%`);
    paramCount++;
  }

  // Category filters (match either language)
  if (Array.isArray(category) && category.length > 0) {
    query += ` AND (s.category_ka = ANY($${paramCount}) OR s.category_en = ANY($${paramCount}))`;
    values.push(category);
    paramCount++;
  } else if (category && typeof category === 'string') {
    query += ` AND (s.category_ka = $${paramCount} OR s.category_en = $${paramCount})`;
    values.push(category);
    paramCount++;
  }

  // Supplier filter
  if (Array.isArray(supplier_id) && supplier_id.length > 0) {
    query += ` AND s.supplier_id = ANY($${paramCount})`;
    values.push(supplier_id);
    paramCount++;
  } else if (supplier_id && typeof supplier_id === 'string') {
    query += ` AND s.supplier_id = $${paramCount}`;
    values.push(supplier_id);
    paramCount++;
  }

  // Direct order filter
  if (direct_order_available === 'true') {
    query += ` AND s.direct_order_available = true`;
  }

  // Delivery options
  if (delivery_option && typeof delivery_option === 'string' && delivery_option !== 'any') {
    if (delivery_option === 'both') {
      query += ` AND s.delivery_options = 'both'`;
    } else if (delivery_option === 'delivery') {
      query += ` AND s.delivery_options IN ('delivery', 'both')`;
    } else if (delivery_option === 'pickup') {
      query += ` AND s.delivery_options IN ('pickup', 'both')`;
    }
  }

  // Lead time filter
  if (lead_time && typeof lead_time === 'string' && lead_time !== 'any') {
    query += ` AND s.approx_lead_time_label ILIKE $${paramCount}`;
    values.push(`%${lead_time}%`);
    paramCount++;
  }

  // Price range
  if (price_min && typeof price_min === 'string') {
    query += ` AND s.base_price >= $${paramCount}`;
    values.push(parseFloat(price_min));
    paramCount++;
  }

  if (price_max && typeof price_max === 'string') {
    query += ` AND s.base_price <= $${paramCount}`;
    values.push(parseFloat(price_max));
    paramCount++;
  }

  // Updated since filter
  if (updated_since && typeof updated_since === 'string') {
    if (updated_since === '7d') {
      query += ` AND s.updated_at >= NOW() - INTERVAL '7 days'`;
    } else if (updated_since === '14d') {
      query += ` AND s.updated_at >= NOW() - INTERVAL '14 days'`;
    } else if (updated_since === '30d') {
      query += ` AND s.updated_at >= NOW() - INTERVAL '30 days'`;
    } else if (updated_since === 'stale') {
      query += ` AND s.updated_at < NOW() - INTERVAL '14 days'`;
    }
  }

  // Sorting
  switch (sort) {
    case 'price_low':
      query += ` ORDER BY s.base_price ASC NULLS LAST`;
      break;
    case 'price_high':
      query += ` ORDER BY s.base_price DESC NULLS LAST`;
      break;
    case 'newest':
      query += ` ORDER BY s.updated_at DESC`;
      break;
    case 'name':
      query += ` ORDER BY s.name_en ASC`;
      break;
    case 'relevance':
    default:
      query += ` ORDER BY s.updated_at DESC`;
  }

  // Pagination
  const pageNum = typeof page === 'string' ? parseInt(page) : 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit) : 20;
  const offset = (pageNum - 1) * limitNum;

  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limitNum, offset);

  const result = await pool.query(query, values);

  const skus = result.rows.map(row => ({
    id: row.id,
    supplier_id: row.supplier_id,
    supplier_name_ka: row.supplier_name_ka,
    supplier_name_en: row.supplier_name_en,
    name_ka: row.name_ka,
    name_en: row.name_en,
    spec_string_ka: row.spec_string_ka,
    spec_string_en: row.spec_string_en,
    category_ka: row.category_ka,
    category_en: row.category_en,
    base_price: parseFloat(row.base_price) || undefined,
    unit_ka: row.unit_ka,
    unit_en: row.unit_en,
    direct_order_available: row.direct_order_available || false,
    lead_time_category: row.approx_lead_time_label,
    pickup_available: row.delivery_options === 'pickup' || row.delivery_options === 'both',
    delivery_available: row.delivery_options === 'delivery' || row.delivery_options === 'both',
    updated_at: row.updated_at,
    thumbnail_url: row.images && row.images.length > 0 ? row.images[0] : undefined,
  }));

  return success(res, { skus, page: pageNum, limit: limitNum, total: result.rows.length }, 'SKUs retrieved successfully');
}));

router.get('/browse', asyncHandler(async (_req, res) => {
  return success(res, [], 'Catalog items retrieved successfully');
}));

router.get('/search', asyncHandler(async (_req, res) => {
  return success(res, [], 'Search results retrieved successfully');
}));

/**
 * GET /api/catalog/skus/:id
 * Get single SKU details by ID
 */
router.get('/skus/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      s.id,
      s.supplier_id,
      s.name_ka,
      s.name_en,
      s.spec_string_ka,
      s.spec_string_en,
      s.category_ka,
      s.category_en,
      s.base_price,
      s.unit_ka,
      s.unit_en,
      s.direct_order_available,
      s.approx_lead_time_label,
      s.delivery_options,
      s.updated_at,
      s.images,
      s.description_ka,
      s.description_en,
      sup.business_name_ka as supplier_name_ka,
      sup.business_name_en as supplier_name_en,
      sup.depot_address as supplier_address,
      u.phone as supplier_phone,
      u.email as supplier_email
    FROM skus s
    LEFT JOIN suppliers sup ON s.supplier_id = sup.id
    LEFT JOIN users u ON sup.user_id = u.id
    WHERE s.id = $1 AND s.is_active = true
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'SKU not found'
    });
  }

  const row = result.rows[0];
  const sku = {
    id: row.id,
    supplier_id: row.supplier_id,
    supplier_name_ka: row.supplier_name_ka,
    supplier_name_en: row.supplier_name_en,
    supplier_phone: row.supplier_phone,
    supplier_email: row.supplier_email,
    supplier_address: row.supplier_address,
    name_ka: row.name_ka,
    name_en: row.name_en,
    spec_string_ka: row.spec_string_ka,
    spec_string_en: row.spec_string_en,
    description_ka: row.description_ka,
    description_en: row.description_en,
    category_ka: row.category_ka,
    category_en: row.category_en,
    base_price: parseFloat(row.base_price) || undefined,
    unit_ka: row.unit_ka,
    unit_en: row.unit_en,
    direct_order_available: row.direct_order_available || false,
    lead_time_category: row.approx_lead_time_label,
    pickup_available: row.delivery_options === 'pickup' || row.delivery_options === 'both',
    delivery_available: row.delivery_options === 'delivery' || row.delivery_options === 'both',
    updated_at: row.updated_at,
    thumbnail_url: row.images && row.images.length > 0 ? row.images[0] : undefined,
  };

  return success(res, sku, 'SKU retrieved successfully');
}));

router.get('/categories', asyncHandler(async (_req, res) => {
  return success(res, [], 'Categories retrieved successfully');
}));

export default router;
