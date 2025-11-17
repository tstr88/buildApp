/**
 * Rentals API routes
 * Public endpoints for rental tool catalog
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success } from '../../utils/responseHelpers';
import pool from '../../config/database';

const router = Router();

/**
 * GET /api/rentals/tools
 * Get rental tools catalog with filters
 */
router.get('/tools', asyncHandler(async (req, res) => {
  const {
    search,
    category = [],
    supplier_id = [],
    direct_booking,
    delivery_available,
    min_daily_rate,
    max_daily_rate,
    min_weekly_rate,
    max_weekly_rate,
    sort = 'recommended',
    lang = 'en',
  } = req.query;

  // Determine which language columns to use
  const langSuffix = lang === 'ka' ? '_ka' : '_en';

  let query = `
    SELECT
      rt.id,
      rt.name${langSuffix} as tool_name,
      rt.spec_string${langSuffix} as spec_string,
      rt.category${langSuffix} as category,
      rt.day_rate as daily_rate,
      rt.week_rate as weekly_rate,
      rt.deposit_amount,
      rt.delivery_option,
      rt.direct_booking_available,
      rt.images,
      rt.supplier_id,
      COALESCE(s.business_name${langSuffix}, s.business_name_en) as supplier_name
    FROM rental_tools rt
    LEFT JOIN suppliers s ON rt.supplier_id = s.id
    WHERE rt.is_active = true AND rt.is_available = true
  `;

  const values: any[] = [];
  let paramCount = 1;

  // Search filter - search in both language columns
  if (search && typeof search === 'string') {
    query += ` AND (rt.name_en ILIKE $${paramCount} OR rt.name_ka ILIKE $${paramCount} OR rt.spec_string_en ILIKE $${paramCount} OR rt.spec_string_ka ILIKE $${paramCount})`;
    values.push(`%${search}%`);
    paramCount++;
  }

  // Category filters - search in appropriate language column
  if (Array.isArray(category) && category.length > 0) {
    query += ` AND rt.category${langSuffix} = ANY($${paramCount})`;
    values.push(category);
    paramCount++;
  } else if (category && typeof category === 'string') {
    query += ` AND rt.category${langSuffix} = $${paramCount}`;
    values.push(category);
    paramCount++;
  }

  // Supplier filter
  if (Array.isArray(supplier_id) && supplier_id.length > 0) {
    query += ` AND rt.supplier_id = ANY($${paramCount})`;
    values.push(supplier_id);
    paramCount++;
  } else if (supplier_id && typeof supplier_id === 'string') {
    query += ` AND rt.supplier_id = $${paramCount}`;
    values.push(supplier_id);
    paramCount++;
  }

  // Direct booking filter
  if (direct_booking === 'true') {
    query += ` AND rt.direct_booking_available = true`;
  }

  // Delivery options filter
  if (delivery_available === 'true') {
    query += ` AND rt.delivery_option IN ('delivery', 'both')`;
  }

  // Price filters
  if (min_daily_rate && typeof min_daily_rate === 'string') {
    query += ` AND rt.day_rate >= $${paramCount}`;
    values.push(parseFloat(min_daily_rate));
    paramCount++;
  }

  if (max_daily_rate && typeof max_daily_rate === 'string') {
    query += ` AND rt.day_rate <= $${paramCount}`;
    values.push(parseFloat(max_daily_rate));
    paramCount++;
  }

  if (min_weekly_rate && typeof min_weekly_rate === 'string') {
    query += ` AND rt.week_rate >= $${paramCount}`;
    values.push(parseFloat(min_weekly_rate));
    paramCount++;
  }

  if (max_weekly_rate && typeof max_weekly_rate === 'string') {
    query += ` AND rt.week_rate <= $${paramCount}`;
    values.push(parseFloat(max_weekly_rate));
    paramCount++;
  }

  // Sorting
  switch (sort) {
    case 'price_low':
      query += ` ORDER BY rt.day_rate ASC NULLS LAST`;
      break;
    case 'price_high':
      query += ` ORDER BY rt.day_rate DESC NULLS LAST`;
      break;
    case 'name':
      query += ` ORDER BY rt.name${langSuffix} ASC`;
      break;
    case 'recommended':
    default:
      query += ` ORDER BY rt.day_rate ASC`;
  }

  const result = await pool.query(query, values);

  const tools = result.rows.map(row => ({
    id: row.id,
    tool_name: row.tool_name,
    spec_string: row.spec_string,
    category: row.category,
    daily_rate: parseFloat(row.daily_rate),
    weekly_rate: row.weekly_rate ? parseFloat(row.weekly_rate) : null,
    deposit_amount: row.deposit_amount ? parseFloat(row.deposit_amount) : null,
    delivery_available: row.delivery_option === 'delivery' || row.delivery_option === 'both',
    pickup_available: row.delivery_option === 'pickup' || row.delivery_option === 'both',
    direct_booking_available: row.direct_booking_available || false,
    photo_url: row.images && row.images.length > 0 ? row.images[0] : null,
    supplier_id: row.supplier_id,
    supplier_name: row.supplier_name,
  }));

  return success(res, { tools }, 'Rental tools retrieved successfully');
}));

/**
 * GET /api/rentals/tools/:id
 * Get single rental tool details by ID
 */
router.get('/tools/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lang = 'en' } = req.query;

  // Determine which language columns to use
  const langSuffix = lang === 'ka' ? '_ka' : '_en';

  const query = `
    SELECT
      rt.id,
      rt.name${langSuffix} as tool_name,
      rt.spec_string${langSuffix} as spec_string,
      rt.description${langSuffix} as description,
      rt.category${langSuffix} as category,
      rt.day_rate as daily_rate,
      rt.week_rate as weekly_rate,
      rt.deposit_amount,
      rt.delivery_option,
      rt.direct_booking_available,
      rt.images,
      rt.supplier_id,
      COALESCE(s.business_name${langSuffix}, s.business_name_en) as supplier_name,
      s.depot_address as supplier_address,
      u.phone as supplier_phone,
      u.email as supplier_email
    FROM rental_tools rt
    LEFT JOIN suppliers s ON rt.supplier_id = s.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE rt.id = $1 AND rt.is_active = true
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Rental tool not found'
    });
  }

  const row = result.rows[0];
  const tool = {
    id: row.id,
    tool_name: row.tool_name,
    spec_string: row.spec_string,
    description: row.description,
    category: row.category,
    daily_rate: parseFloat(row.daily_rate),
    weekly_rate: row.weekly_rate ? parseFloat(row.weekly_rate) : null,
    deposit_amount: row.deposit_amount ? parseFloat(row.deposit_amount) : null,
    delivery_available: row.delivery_option === 'delivery' || row.delivery_option === 'both',
    pickup_available: row.delivery_option === 'pickup' || row.delivery_option === 'both',
    direct_booking_available: row.direct_booking_available || false,
    photo_url: row.images && row.images.length > 0 ? row.images[0] : null,
    supplier_id: row.supplier_id,
    supplier_name: row.supplier_name,
    supplier_phone: row.supplier_phone,
    supplier_email: row.supplier_email,
    supplier_address: row.supplier_address,
  };

  return success(res, tool, 'Rental tool retrieved successfully');
}));

export default router;
