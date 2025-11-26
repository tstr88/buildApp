/**
 * Factories API routes
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success } from '../../utils/responseHelpers';
import pool from '../../config/database';
import sharp from 'sharp';

const router = Router();

/**
 * Create a thumbnail from a base64 image
 */
async function createThumbnail(base64Image: string, maxWidth: number = 200): Promise<string> {
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    const buffer = Buffer.from(base64Data, 'base64');

    const thumbnailBuffer = await sharp(buffer)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 70 })
      .toBuffer();

    return `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return base64Image;
  }
}

/**
 * GET /api/factories
 * Get list of all factories/suppliers with filters
 */
router.get('/', asyncHandler(async (req, res) => {
  const {
    category = [],
    trust_tier,
    direct_order_available,
    sort = 'reliability',
    lang = 'en'
  } = req.query;

  const langSuffix = lang === 'ka' ? '_ka' : '_en';

  let query = `
    SELECT
      s.id,
      s.business_name${langSuffix} as business_name,
      s.depot_address,
      s.depot_latitude as depot_lat,
      s.depot_longitude as depot_lng,
      s.categories,
      s.payment_terms,
      tm.spec_reliability_pct,
      tm.on_time_pct,
      tm.issue_rate_pct,
      tm.sample_size as total_deliveries,
      COALESCE((SELECT COUNT(*) FROM skus WHERE supplier_id = s.id), 0) as sku_count
    FROM suppliers s
    LEFT JOIN trust_metrics tm ON s.id = tm.supplier_id
    WHERE s.is_active = true
  `;

  const values: any[] = [];
  let paramCount = 1;

  // Filter by categories
  if (Array.isArray(category) && category.length > 0) {
    query += ` AND s.categories && $${paramCount}`;
    values.push(category);
    paramCount++;
  } else if (category && typeof category === 'string') {
    query += ` AND $${paramCount} = ANY(s.categories)`;
    values.push(category);
    paramCount++;
  }

  // Filter by trust tier
  if (trust_tier === 'verified') {
    query += ` AND s.is_verified = true`;
  } else if (trust_tier === 'trusted') {
    query += ` AND tm.spec_reliability_pct >= 95 AND tm.on_time_pct >= 90`;
  }

  // Filter by direct order availability
  if (direct_order_available === 'true') {
    query += ` AND 'direct_order' = ANY(s.payment_terms)`;
  }

  // Sorting
  switch (sort) {
    case 'reliability':
      query += ` ORDER BY tm.spec_reliability_pct DESC NULLS LAST`;
      break;
    case 'nearest':
      // TODO: implement distance-based sorting when project location is provided
      query += ` ORDER BY s.business_name${langSuffix}`;
      break;
    case 'most_skus':
      query += ` ORDER BY sku_count DESC`;
      break;
    case 'newest':
      query += ` ORDER BY s.created_at DESC`;
      break;
    default:
      query += ` ORDER BY tm.spec_reliability_pct DESC NULLS LAST`;
  }

  const result = await pool.query(query, values);

  const suppliers = result.rows.map(row => ({
    id: row.id,
    business_name: row.business_name,
    depot_address: row.depot_address || '',
    depot_lat: parseFloat(row.depot_lat) || 0,
    depot_lng: parseFloat(row.depot_lng) || 0,
    delivery_radius_km: 25, // Default delivery radius (TODO: get from supplier settings)
    categories: row.categories || [],
    trust_metrics: {
      spec_reliability: parseFloat(row.spec_reliability_pct) || 0,
      on_time_delivery: parseFloat(row.on_time_pct) || 0,
      issue_rate: parseFloat(row.issue_rate_pct) || 0,
      total_deliveries: parseInt(row.total_deliveries) || 0,
    },
    sku_count: parseInt(row.sku_count) || 0,
    has_direct_order: row.payment_terms?.includes('direct_order') || false,
    distance_km: undefined, // TODO: calculate based on project location
  }));

  success(res, { suppliers }, 'Factories retrieved successfully');
}));

/**
 * GET /api/factories/:factoryId
 * Get individual factory/supplier profile
 */
router.get('/:factoryId', asyncHandler(async (req, res) => {
  const { factoryId } = req.params;
  const { lang = 'en' } = req.query;

  const langSuffix = lang === 'ka' ? '_ka' : '_en';

  const query = `
    SELECT
      s.id,
      s.business_name${langSuffix} as business_name,
      s.depot_address,
      s.depot_latitude as depot_lat,
      s.depot_longitude as depot_lng,
      s.categories,
      s.payment_terms,
      s.about${langSuffix} as about,
      s.logo_url,
      s.cover_photo_url,
      s.min_order_value,
      s.is_verified,
      tm.spec_reliability_pct,
      tm.on_time_pct,
      tm.issue_rate_pct,
      tm.sample_size as total_deliveries,
      COALESCE((SELECT COUNT(*) FROM skus WHERE supplier_id = s.id), 0) as sku_count
    FROM suppliers s
    LEFT JOIN trust_metrics tm ON s.id = tm.supplier_id
    WHERE s.id = $1 AND s.is_active = true
  `;

  const result = await pool.query(query, [factoryId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Factory not found'
    });
  }

  const row = result.rows[0];
  const supplier = {
    id: row.id,
    business_name: row.business_name,
    depot_address: row.depot_address || '',
    depot_lat: parseFloat(row.depot_lat) || 0,
    depot_lng: parseFloat(row.depot_lng) || 0,
    categories: row.categories || [],
    payment_terms: row.payment_terms || [],
    about: row.about || '',
    logo_url: row.logo_url,
    cover_photo_url: row.cover_photo_url,
    min_order_value: parseFloat(row.min_order_value) || 0,
    is_verified: row.is_verified || false,
    trust_metrics: {
      spec_reliability: parseFloat(row.spec_reliability_pct) || 0,
      on_time_delivery: parseFloat(row.on_time_pct) || 0,
      issue_rate: parseFloat(row.issue_rate_pct) || 0,
      total_deliveries: parseInt(row.total_deliveries) || 0,
    },
    sku_count: parseInt(row.sku_count) || 0,
    has_direct_order: row.payment_terms?.includes('direct_order') || false,
  };

  return success(res, supplier, 'Factory profile retrieved successfully');
}));

/**
 * GET /api/factories/:factoryId/catalog
 * Get factory's SKU catalog
 */
router.get('/:factoryId/catalog', asyncHandler(async (req, res) => {
  const { factoryId } = req.params;
  const { search, category, lang = 'en' } = req.query;

  const langSuffix = lang === 'ka' ? '_ka' : '_en';

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
      s.approx_lead_time_label as lead_time_category,
      s.delivery_options,
      s.updated_at,
      s.images,
      sup.business_name_ka as supplier_name_ka,
      sup.business_name_en as supplier_name_en
    FROM skus s
    LEFT JOIN suppliers sup ON s.supplier_id = sup.id
    WHERE s.supplier_id = $1 AND s.is_active = true
  `;

  const values: any[] = [factoryId];
  let paramCount = 2;

  if (search && typeof search === 'string') {
    query += ` AND (name_ka ILIKE $${paramCount} OR name_en ILIKE $${paramCount} OR spec_string_ka ILIKE $${paramCount} OR spec_string_en ILIKE $${paramCount})`;
    values.push(`%${search}%`);
    paramCount++;
  }

  if (category && typeof category === 'string') {
    query += ` AND (category${langSuffix} = $${paramCount})`;
    values.push(category);
    paramCount++;
  }

  query += ` ORDER BY updated_at DESC`;

  const result = await pool.query(query, values);

  // Generate thumbnails for all SKUs
  const skus = await Promise.all(
    result.rows.map(async (row) => ({
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
      base_price: parseFloat(row.base_price) || 0,
      unit_ka: row.unit_ka,
      unit_en: row.unit_en,
      direct_order_available: row.direct_order_available || false,
      lead_time_category: row.lead_time_category,
      pickup_available: row.delivery_options === 'pickup' || row.delivery_options === 'both',
      delivery_available: row.delivery_options === 'delivery' || row.delivery_options === 'both',
      updated_at: row.updated_at,
      thumbnail_url: row.images && row.images.length > 0 ? await createThumbnail(row.images[0], 200) : undefined,
    }))
  );

  success(res, { skus }, 'Factory catalog retrieved successfully');
}));

export default router;
