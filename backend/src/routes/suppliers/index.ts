/**
 * Suppliers API routes
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success } from '../../utils/responseHelpers';
import { onboardSupplier } from '../../controllers/suppliersController';
import {
  getCatalogSKUs,
  createSKU,
  updateSKU,
  deleteSKU,
  bulkUpdateSKUs,
} from '../../controllers/supplierCatalogController';
import pool from '../../config/database';
import { emitWindowProposed, emitWindowAccepted } from '../../websocket';

const router = Router();
router.use(authenticate);

// Onboarding
router.post('/onboard', asyncHandler(onboardSupplier));

// Dashboard - check if supplier exists and return basic stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;

  // Check if supplier profile exists
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Get RFQ count (from rfqs table via rfq_recipients where supplier matches and status is active)
  const rfqCountResult = await pool.query(
    `SELECT COUNT(DISTINCT r.id) as count
     FROM rfqs r
     INNER JOIN rfq_recipients rr ON r.id = rr.rfq_id
     WHERE rr.supplier_id = $1 AND r.status = 'active'`,
    [supplierId]
  );
  const newRFQs = parseInt(rfqCountResult.rows[0]?.count) || 0;

  // Get offers sent waiting for approval (from offers table where status is pending)
  const offersWaitingResult = await pool.query(
    `SELECT COUNT(*) as count
     FROM offers
     WHERE supplier_id = $1 AND status = 'pending'`,
    [supplierId]
  );
  const offersWaitingApproval = parseInt(offersWaitingResult.rows[0]?.count) || 0;

  // Get new direct orders (orders with status 'pending')
  const newDirectOrdersResult = await pool.query(
    `SELECT COUNT(*) as count
     FROM orders
     WHERE supplier_id = $1 AND status = 'pending'`,
    [supplierId]
  );
  const newDirectOrders = parseInt(newDirectOrdersResult.rows[0]?.count) || 0;

  // Get scheduled confirmed direct orders (orders with status 'confirmed')
  const scheduledOrdersResult = await pool.query(
    `SELECT COUNT(*) as count
     FROM orders
     WHERE supplier_id = $1 AND status = 'confirmed'`,
    [supplierId]
  );
  const scheduledConfirmedOrders = parseInt(scheduledOrdersResult.rows[0]?.count) || 0;

  // Get today's deliveries from orders table
  const deliveriesResult = await pool.query(
    `SELECT COUNT(*) as count
     FROM orders
     WHERE supplier_id = $1
       AND DATE(promised_window_start) = CURRENT_DATE`,
    [supplierId]
  );
  const todaysDeliveries = parseInt(deliveriesResult.rows[0]?.count) || 0;

  // Get trust score from trust_metrics table (calculate from metrics, default to 100 if no metrics)
  const trustScoreResult = await pool.query(
    `SELECT
      COALESCE(
        ROUND(
          (spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3
        ),
        100
      ) as trust_score
     FROM trust_metrics
     WHERE supplier_id = $1`,
    [supplierId]
  );
  const trustScore = parseInt(trustScoreResult.rows[0]?.trust_score) || 100;

  return res.json({
    success: true,
    stats: {
      newRFQs,
      offersWaitingApproval,
      newDirectOrders,
      scheduledConfirmedOrders,
      todaysDeliveries,
      trustScore,
      trustTrend: 'stable',
    },
    activities: [],
  });
}));

// Catalog Management
router.get('/catalog/skus', asyncHandler(getCatalogSKUs));
router.post('/catalog/skus', asyncHandler(createSKU));
router.put('/catalog/skus/:skuId', asyncHandler(updateSKU));
router.delete('/catalog/skus/:skuId', asyncHandler(deleteSKU));
router.patch('/catalog/skus/bulk', asyncHandler(bulkUpdateSKUs));

router.get('/rfqs', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;
  const { status } = req.query;

  console.log('[Supplier RFQs] User ID:', userId, 'Status filter:', status);

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  console.log('[Supplier RFQs] Supplier lookup result:', supplierResult.rows);

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;
  console.log('[Supplier RFQs] Supplier ID:', supplierId);

  // Build query to get RFQs sent to this supplier
  let query = `
    SELECT
      r.id,
      r.title,
      r.lines,
      r.status,
      r.created_at,
      r.project_id,
      rr.viewed_at,
      rr.notified_at,
      u.name as buyer_name,
      u.phone as buyer_phone,
      u.buyer_role as buyer_type,
      p.name as project_name,
      p.address as project_address,
      p.latitude as project_latitude,
      p.longitude as project_longitude,
      o.id as offer_id,
      o.total_amount as offer_total,
      o.status as offer_status
    FROM rfq_recipients rr
    INNER JOIN rfqs r ON rr.rfq_id = r.id
    INNER JOIN users u ON r.user_id = u.id
    LEFT JOIN projects p ON r.project_id = p.id
    LEFT JOIN offers o ON o.rfq_id = r.id AND o.supplier_id = rr.supplier_id
    WHERE rr.supplier_id = $1
  `;

  const queryParams: any[] = [supplierId];

  // Filter by status if provided
  if (status === 'new') {
    // New RFQs: active and no offer sent (viewed_at doesn't matter for tab filtering)
    query += ` AND r.status = 'active' AND o.id IS NULL`;
  } else if (status === 'sent') {
    // Sent offers: has an offer with pending status
    query += ` AND o.id IS NOT NULL AND o.status = 'pending'`;
  } else if (status === 'accepted') {
    // Accepted offers: has an offer with accepted status
    query += ` AND o.id IS NOT NULL AND o.status = 'accepted'`;
  } else if (status === 'expired') {
    // Expired: either RFQ expired or offer expired/rejected
    query += ` AND (r.status = 'expired' OR (o.id IS NOT NULL AND o.status IN ('expired', 'rejected')))`;
  } else if (status === 'active') {
    query += ` AND r.status = 'active'`;
  } else if (status === 'closed') {
    query += ` AND r.status = 'closed'`;
  }

  query += ` ORDER BY r.created_at DESC`;

  console.log('[Supplier RFQs] Executing query with params:', queryParams);

  const result = await pool.query(query, queryParams);

  console.log('[Supplier RFQs] Query returned', result.rows.length, 'rows');

  // Get supplier depot location for distance calculation
  const supplierDepot = await pool.query(
    'SELECT depot_latitude, depot_longitude FROM suppliers WHERE id = $1',
    [supplierId]
  );
  const depotLat = supplierDepot.rows[0]?.depot_latitude;
  const depotLng = supplierDepot.rows[0]?.depot_longitude;

  // Helper function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper function to format relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Format the RFQs for the frontend
  const rfqs = result.rows.map(row => {
    const lines = Array.isArray(row.lines) ? row.lines : [];
    const itemCount = lines.length;

    // Calculate distance if both locations are available
    let distanceKm = 0;
    if (depotLat && depotLng && row.project_latitude && row.project_longitude) {
      distanceKm = calculateDistance(depotLat, depotLng, row.project_latitude, row.project_longitude);
    }

    // Check if buyer is new (created within last 30 days)
    const createdAt = new Date(row.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isNewBuyer = createdAt > thirtyDaysAgo;

    return {
      id: row.id,
      rfq_id: row.id, // Frontend expects rfq_id
      title: row.title,
      lines: row.lines,
      status: row.status,
      created_at: row.created_at,
      received_at: row.created_at, // Frontend expects received_at
      project_id: row.project_id,
      viewed_at: row.viewed_at,
      notified_at: row.notified_at,
      buyer_name: row.buyer_name,
      buyer_phone: row.buyer_phone,
      buyer_type: row.buyer_type || 'contractor',
      is_new_buyer: isNewBuyer,
      project_name: row.project_name,
      project_address: row.project_address,
      project_location: row.project_address || 'No address',
      distance_km: distanceKm,
      item_count: itemCount,
      relative_time: getRelativeTime(createdAt),
      preferred_window_start: row.created_at, // Use created_at as placeholder
      preferred_window_end: row.created_at,   // Use created_at as placeholder
      offer_status: row.offer_status || null,
      offer_total: row.offer_total || null,
    };
  });

  // Calculate counts for all tabs
  const countsQuery = `
    SELECT
      COUNT(*) FILTER (WHERE r.status = 'active' AND o.id IS NULL) as new_count,
      COUNT(*) FILTER (WHERE o.id IS NOT NULL AND o.status = 'pending') as sent_count,
      COUNT(*) FILTER (WHERE o.id IS NOT NULL AND o.status = 'accepted') as accepted_count,
      COUNT(*) FILTER (WHERE r.status = 'expired' OR (o.id IS NOT NULL AND o.status IN ('expired', 'rejected'))) as expired_count
    FROM rfq_recipients rr
    INNER JOIN rfqs r ON rr.rfq_id = r.id
    LEFT JOIN offers o ON o.rfq_id = r.id AND o.supplier_id = rr.supplier_id
    WHERE rr.supplier_id = $1
  `;

  const countsResult = await pool.query(countsQuery, [supplierId]);
  const counts = {
    new: parseInt(countsResult.rows[0]?.new_count || '0'),
    sent: parseInt(countsResult.rows[0]?.sent_count || '0'),
    accepted: parseInt(countsResult.rows[0]?.accepted_count || '0'),
    expired: parseInt(countsResult.rows[0]?.expired_count || '0'),
  };

  return res.json({
    success: true,
    data: rfqs,
    counts,
  });
}));

// Get individual RFQ detail
router.get('/rfqs/:rfqId', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;
  const { rfqId } = req.params;

  console.log('[Supplier RFQ Detail] User ID:', userId, 'RFQ ID:', rfqId);

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id, depot_latitude, depot_longitude FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;
  const depotLat = supplierResult.rows[0].depot_latitude;
  const depotLng = supplierResult.rows[0].depot_longitude;

  // Get RFQ details - verify supplier has access to this RFQ
  const rfqResult = await pool.query(
    `SELECT
      r.id,
      r.title,
      r.lines,
      r.status,
      r.created_at,
      r.project_id,
      r.preferred_window_start,
      r.preferred_window_end,
      r.additional_notes,
      COALESCE(r.delivery_address, p.address) as project_address,
      COALESCE(r.delivery_location_lat, p.latitude) as project_latitude,
      COALESCE(r.delivery_location_lng, p.longitude) as project_longitude,
      rr.viewed_at,
      u.name as buyer_name,
      u.phone as buyer_phone,
      u.buyer_role as buyer_type,
      p.name as project_name
    FROM rfq_recipients rr
    INNER JOIN rfqs r ON rr.rfq_id = r.id
    INNER JOIN users u ON r.user_id = u.id
    LEFT JOIN projects p ON r.project_id = p.id
    WHERE r.id = $1 AND rr.supplier_id = $2`,
    [rfqId, supplierId]
  );

  if (rfqResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'RFQ not found or access denied',
    });
  }

  const rfq = rfqResult.rows[0];

  // Calculate distance if both locations are available
  let distanceKm = 0;
  if (depotLat && depotLng && rfq.project_latitude && rfq.project_longitude) {
    const R = 6371; // Earth's radius in km
    const dLat = (rfq.project_latitude - depotLat) * Math.PI / 180;
    const dLng = (rfq.project_longitude - depotLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(depotLat * Math.PI / 180) * Math.cos(rfq.project_latitude * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = R * c;
  }

  // Check if supplier has already sent an offer and get offer data
  const offerResult = await pool.query(
    `SELECT id, line_prices, total_amount, delivery_window_start, delivery_window_end,
     payment_terms, delivery_fee, notes, expires_at, status, created_at
     FROM offers WHERE rfq_id = $1 AND supplier_id = $2`,
    [rfqId, supplierId]
  );
  const hasExistingOffer = offerResult.rows.length > 0;
  const existingOffer = offerResult.rows[0] || null;

  // Mark as viewed if not already viewed
  if (!rfq.viewed_at) {
    await pool.query(
      'UPDATE rfq_recipients SET viewed_at = NOW() WHERE rfq_id = $1 AND supplier_id = $2',
      [rfqId, supplierId]
    );
  }

  // Check if buyer is new (created within last 30 days)
  const createdAt = new Date(rfq.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const isNewBuyer = createdAt > thirtyDaysAgo;

  const rfqDetail = {
    id: rfq.id,
    buyer_type: rfq.buyer_type || 'contractor',
    buyer_name: rfq.buyer_name,
    is_new_buyer: isNewBuyer,
    project_location: rfq.project_address || 'No address',
    project_address: rfq.project_address,
    delivery_lat: rfq.project_latitude,
    delivery_lng: rfq.project_longitude,
    distance_km: distanceKm,
    lines: Array.isArray(rfq.lines) ? rfq.lines : [],
    preferred_window_start: rfq.preferred_window_start,
    preferred_window_end: rfq.preferred_window_end,
    additional_notes: rfq.additional_notes,
    access_notes: null,            // Not in MVP schema
    created_at: rfq.created_at,
    has_existing_offer: hasExistingOffer,
    existing_offer: existingOffer,
  };

  return res.json({
    success: true,
    rfq: rfqDetail,
  });
}));

// Get offer history for an RFQ
router.get('/rfqs/:rfqId/offer-history', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;
  const { rfqId } = req.params;

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Get the current offer ID for this RFQ
  const currentOfferResult = await pool.query(
    'SELECT id FROM offers WHERE rfq_id = $1 AND supplier_id = $2',
    [rfqId, supplierId]
  );

  if (currentOfferResult.rows.length === 0) {
    return res.json({
      success: true,
      history: [],
    });
  }

  const offerId = currentOfferResult.rows[0].id;

  // Get offer history, sorted by version (newest first)
  const historyResult = await pool.query(
    `SELECT
      id,
      line_prices,
      total_amount,
      delivery_window_start,
      delivery_window_end,
      payment_terms,
      delivery_fee,
      notes,
      expires_at,
      status,
      version_number,
      created_at,
      superseded_at
    FROM offer_history
    WHERE offer_id = $1
    ORDER BY version_number DESC`,
    [offerId]
  );

  return res.json({
    success: true,
    history: historyResult.rows,
  });
}));

router.post('/rfqs/:rfqId/offers', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;
  const { rfqId } = req.params;
  const {
    line_prices,
    total_amount,
    delivery_window_start,
    delivery_window_end,
    payment_terms,
    delivery_fee,
    notes,
    expires_at,
  } = req.body;

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Verify supplier has access to this RFQ
  const accessCheck = await pool.query(
    'SELECT id FROM rfq_recipients WHERE rfq_id = $1 AND supplier_id = $2',
    [rfqId, supplierId]
  );

  if (accessCheck.rows.length === 0) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this RFQ',
    });
  }

  // Check if offer already exists (constraint will prevent duplicates, but check for better error message)
  const existingOffer = await pool.query(
    `SELECT id, line_prices, total_amount, delivery_window_start, delivery_window_end,
            payment_terms, delivery_fee, notes, expires_at, status, created_at
     FROM offers WHERE rfq_id = $1 AND supplier_id = $2`,
    [rfqId, supplierId]
  );

  if (existingOffer.rows.length > 0) {
    // Save current offer to history before updating
    const currentOffer = existingOffer.rows[0];

    // Get the next version number
    const versionResult = await pool.query(
      'SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM offer_history WHERE offer_id = $1',
      [currentOffer.id]
    );
    const nextVersion = versionResult.rows[0].next_version;

    // Insert current offer into history
    // Note: line_prices from DB is already JSONB, so we need to handle it properly
    const linePricesForHistory = typeof currentOffer.line_prices === 'string'
      ? currentOffer.line_prices
      : JSON.stringify(currentOffer.line_prices);

    await pool.query(
      `INSERT INTO offer_history (
        offer_id, rfq_id, supplier_id, line_prices, total_amount,
        delivery_window_start, delivery_window_end, payment_terms,
        delivery_fee, notes, expires_at, status, version_number, created_at
      ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        currentOffer.id,
        rfqId,
        supplierId,
        linePricesForHistory,
        currentOffer.total_amount,
        currentOffer.delivery_window_start,
        currentOffer.delivery_window_end,
        currentOffer.payment_terms,
        currentOffer.delivery_fee,
        currentOffer.notes,
        currentOffer.expires_at,
        currentOffer.status,
        nextVersion,
        currentOffer.created_at,
      ]
    );

    // Update existing offer with new values
    await pool.query(
      `UPDATE offers SET
        line_prices = $1,
        total_amount = $2,
        delivery_window_start = $3,
        delivery_window_end = $4,
        payment_terms = $5,
        delivery_fee = $6,
        notes = $7,
        expires_at = $8,
        updated_at = NOW()
      WHERE rfq_id = $9 AND supplier_id = $10`,
      [
        JSON.stringify(line_prices),
        total_amount,
        delivery_window_start,
        delivery_window_end,
        payment_terms,
        delivery_fee || 0,
        notes,
        expires_at,
        rfqId,
        supplierId,
      ]
    );
  } else {
    // Insert new offer
    await pool.query(
      `INSERT INTO offers (
        rfq_id,
        supplier_id,
        line_prices,
        total_amount,
        delivery_window_start,
        delivery_window_end,
        payment_terms,
        delivery_fee,
        notes,
        expires_at,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        rfqId,
        supplierId,
        JSON.stringify(line_prices),
        total_amount,
        delivery_window_start,
        delivery_window_end,
        payment_terms,
        delivery_fee || 0,
        notes,
        expires_at,
        'pending',
      ]
    );
  }

  // Get buyer's user_id from RFQ to send WebSocket notification
  const rfqResult = await pool.query(
    'SELECT user_id FROM rfqs WHERE id = $1',
    [rfqId]
  );

  if (rfqResult.rows.length > 0) {
    const buyerUserId = rfqResult.rows[0].user_id;
    const { emitOfferCreated } = require('../../websocket');
    emitOfferCreated(rfqId, buyerUserId);
  }

  return res.status(201).json({
    success: true,
    message: 'Offer submitted successfully',
  });
}));

router.get('/orders/direct', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;
  const { tab = 'new' } = req.query;

  // First get the supplier_id for this user
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Map tab to order statuses
  const statusMap: Record<string, string[]> = {
    new: ['pending'],
    scheduled: ['confirmed'],
    in_progress: ['in_transit'],
    completed: ['delivered', 'completed'],
  };

  const statuses = statusMap[tab as string] || statusMap.new;

  let query = `
    SELECT
      o.id,
      o.order_number as order_id,
      o.buyer_id,
      o.total_amount,
      o.pickup_or_delivery as delivery_type,
      o.status,
      o.promised_window_start as scheduled_window_start,
      o.promised_window_end as scheduled_window_end,
      o.created_at,
      u.name as buyer_name,
      COALESCE(u.user_type::text, 'buyer') as buyer_type,
      COALESCE(jsonb_array_length(o.items), 0) as item_count
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    WHERE o.supplier_id = $1 AND o.status = ANY($2)
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query, [supplierId, statuses]);

  // Calculate relative time for each order
  const orders = result.rows.map(row => {
    const createdAt = new Date(row.created_at);
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let relativeTime = '';
    if (diffInDays > 0) {
      relativeTime = `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      relativeTime = `${diffInHours}h ago`;
    } else if (diffInMinutes > 0) {
      relativeTime = `${diffInMinutes}m ago`;
    } else {
      relativeTime = 'Just now';
    }

    return {
      ...row,
      relative_time: relativeTime,
    };
  });

  // Get counts for all tabs
  const countsQuery = `
    SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as new,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as scheduled,
      SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status IN ('delivered', 'completed') THEN 1 ELSE 0 END) as completed
    FROM orders
    WHERE supplier_id = $1
  `;

  const countsResult = await pool.query(countsQuery, [supplierId]);
  const counts = {
    new: parseInt(countsResult.rows[0]?.new) || 0,
    scheduled: parseInt(countsResult.rows[0]?.scheduled) || 0,
    in_progress: parseInt(countsResult.rows[0]?.in_progress) || 0,
    completed: parseInt(countsResult.rows[0]?.completed) || 0,
  };

  return res.json({
    success: true,
    orders,
    counts,
  });
}));

router.get('/orders/:id', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const { id } = req.params;
  const userId = req.user.id;

  // First get the supplier_id for this user
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  const query = `
    SELECT
      o.*,
      u.name as buyer_name,
      u.phone as buyer_phone,
      u.email as buyer_email,
      p.name as project_name,
      p.address as project_address
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN projects p ON o.project_id = p.id
    WHERE o.order_number = $1 AND o.supplier_id = $2
  `;

  const result = await pool.query(query, [id, supplierId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const order = result.rows[0];

  // Format the response to match what the frontend expects
  return res.json({
    id: order.id,
    order_id: order.order_number,
    buyer_name: order.buyer_name,
    buyer_phone: order.buyer_phone,
    buyer_type: order.buyer_type || 'buyer',
    items: order.items || [],
    total_amount: parseFloat(order.total_amount) || 0,
    delivery_type: order.pickup_or_delivery,
    delivery_address: order.delivery_address,
    delivery_location: order.delivery_location,
    status: order.status,
    scheduling_type: order.scheduling_type,
    scheduled_window_start: order.promised_window_start,
    scheduled_window_end: order.promised_window_end,
    proposed_window_start: order.proposed_window_start,
    proposed_window_end: order.proposed_window_end,
    proposed_by: order.proposed_by,
    proposal_status: order.proposal_status,
    created_at: order.created_at,
    prep_checklist: order.prep_checklist,
    delivery_event: order.delivery_event,
  });
}));

router.post('/orders/:orderId/propose-window', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const { orderId } = req.params;
  const { window_start, window_end } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!window_start || !window_end) {
    return res.status(400).json({
      success: false,
      error: 'Window start and end times are required',
    });
  }

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Verify order belongs to this supplier
  const orderCheck = await pool.query(
    'SELECT id, buyer_id FROM orders WHERE order_number = $1 AND supplier_id = $2',
    [orderId, supplierId]
  );

  if (orderCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const order = orderCheck.rows[0];

  // Update order with proposed window
  await pool.query(
    `UPDATE orders
     SET proposed_window_start = $1,
         proposed_window_end = $2,
         proposed_by = 'supplier',
         proposal_status = 'pending',
         updated_at = CURRENT_TIMESTAMP
     WHERE order_number = $3 AND supplier_id = $4`,
    [window_start, window_end, orderId, supplierId]
  );

  // Emit WebSocket event to buyer
  emitWindowProposed({
    order_number: orderId,
    order_id: order.id,
    proposed_window_start: window_start,
    proposed_window_end: window_end,
    proposed_by: 'supplier',
  }, order.buyer_id);

  return res.json({
    success: true,
    message: 'Window proposal sent successfully',
  });
}));

router.post('/orders/:orderId/accept-window', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const { orderId } = req.params;
  const userId = req.user.id;

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Get order with proposed window
  const orderResult = await pool.query(
    `SELECT id, buyer_id, proposed_window_start, proposed_window_end, proposed_by, proposal_status
     FROM orders
     WHERE order_number = $1 AND supplier_id = $2`,
    [orderId, supplierId]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const order = orderResult.rows[0];

  // Validate that there's a buyer proposal to accept
  if (order.proposed_by !== 'buyer' || order.proposal_status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'No pending buyer proposal to accept',
    });
  }

  // Accept the buyer's proposal
  await pool.query(
    `UPDATE orders
     SET promised_window_start = proposed_window_start,
         promised_window_end = proposed_window_end,
         proposal_status = 'accepted',
         status = 'confirmed',
         updated_at = CURRENT_TIMESTAMP
     WHERE order_number = $1 AND supplier_id = $2`,
    [orderId, supplierId]
  );

  // Emit WebSocket event to buyer - only the specific event, no generic status change
  emitWindowAccepted({
    order_number: orderId,
    order_id: order.id,
    status: 'confirmed',
  }, order.buyer_id);

  return res.json({
    success: true,
    message: 'Buyer proposal accepted successfully',
  });
}));

// Confirm the time that buyer selected during checkout (not a counter-proposal)
router.post('/orders/:orderId/confirm-scheduled-time', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const { orderId } = req.params;
  const userId = req.user.id;

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Verify order and check it has a scheduled time
  const orderResult = await pool.query(
    `SELECT id, buyer_id, promised_window_start, promised_window_end, status
     FROM orders
     WHERE order_number = $1 AND supplier_id = $2`,
    [orderId, supplierId]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  const order = orderResult.rows[0];

  if (!order.promised_window_start || !order.promised_window_end) {
    return res.status(400).json({
      success: false,
      error: 'No scheduled time to confirm',
    });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'Order is not in pending status',
    });
  }

  // Confirm the order - move status to confirmed
  await pool.query(
    `UPDATE orders
     SET status = 'confirmed',
         updated_at = CURRENT_TIMESTAMP
     WHERE order_number = $1 AND supplier_id = $2`,
    [orderId, supplierId]
  );

  // Emit WebSocket event to buyer
  emitWindowAccepted({
    order_number: orderId,
    order_id: order.id,
    status: 'confirmed',
  }, order.buyer_id);

  return res.json({
    success: true,
    message: 'Scheduled time confirmed',
  });
}));

router.get('/deliveries', asyncHandler(async (_req, res) => {
  success(res, [], 'Deliveries retrieved successfully');
}));

// Performance metrics
router.get('/performance', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userId = req.user.id;

  // Get supplier ID
  const supplierResult = await pool.query(
    'SELECT id, business_name_en, business_name_ka FROM suppliers WHERE user_id = $1',
    [userId]
  );

  if (supplierResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Supplier profile not found',
    });
  }

  const supplierId = supplierResult.rows[0].id;

  // Calculate overall metrics (simplified - using defaults since delivery tracking columns don't exist)
  const metricsQuery = `
    SELECT
      COUNT(*) as total_orders,
      COUNT(*) FILTER (WHERE status IN ('completed', 'delivered')) as completed_orders
    FROM orders
    WHERE supplier_id = $1
  `;

  const metricsResult = await pool.query(metricsQuery, [supplierId]);
  const metrics = metricsResult.rows[0];

  const totalOrders = parseInt(metrics.total_orders) || 0;
  const completedOrders = parseInt(metrics.completed_orders) || 0;

  // Default perfect scores since we don't have delivery tracking
  const specReliability = 100;
  const onTimeDelivery = 100;
  const issueRate = 0;

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (specReliability * 0.4) + (onTimeDelivery * 0.4) + ((100 - issueRate) * 0.2)
  );

  // Determine tier
  let tier: 'unverified' | 'verified' | 'trusted' = 'unverified';
  if (completedOrders < 10) {
    tier = 'unverified';
  } else if (completedOrders < 50) {
    tier = 'verified';
  } else if (completedOrders >= 50 && overallScore >= 85) {
    tier = 'trusted';
  } else {
    tier = 'verified';
  }

  // Calculate 30-day trend (mock data for now)
  const trend = 0; // TODO: Implement actual trend calculation

  // Get weekly trends (last 12 weeks - simplified with default perfect scores)
  const weeklyTrendsQuery = `
    WITH weeks AS (
      SELECT
        DATE_TRUNC('week', o.created_at) as week,
        100 as spec_reliability,
        100 as on_time_delivery,
        0 as issue_rate
      FROM orders o
      WHERE o.supplier_id = $1
        AND o.status IN ('completed', 'delivered')
        AND o.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', o.created_at)
    )
    SELECT
      TO_CHAR(week, 'Mon DD') as week,
      spec_reliability,
      on_time_delivery,
      issue_rate
    FROM weeks
    ORDER BY week ASC
  `;

  const trendsResult = await pool.query(weeklyTrendsQuery, [supplierId]);
  const weeklyTrends = trendsResult.rows.map(row => ({
    week: row.week,
    specReliability: parseFloat(row.spec_reliability) || 100,
    onTimeDelivery: parseFloat(row.on_time_delivery) || 100,
    issueRate: parseFloat(row.issue_rate) || 0,
  }));

  // Disputes (disputes table doesn't exist, returning empty array)
  const disputes: any[] = [];

  // Determine badges
  const badges = [
    {
      id: 'top_reliability',
      name: 'Top Reliability',
      description: 'Spec reliability >95% with >50 orders',
      earned: specReliability > 95 && completedOrders > 50,
    },
    {
      id: 'always_on_time',
      name: 'Always On Time',
      description: 'On-time delivery >90% with >50 orders',
      earned: onTimeDelivery > 90 && completedOrders > 50,
    },
    {
      id: 'low_issue_rate',
      name: 'Low Issue Rate',
      description: 'Issue rate <3% with >50 orders',
      earned: issueRate < 3 && completedOrders > 50,
    },
  ];

  // Get additional stats
  const statsQuery = `
    SELECT
      0 as direct_orders,
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_response_time
    FROM orders
    WHERE supplier_id = $1
  `;

  const statsResult = await pool.query(statsQuery, [supplierId]);
  const stats = statsResult.rows[0];

  return res.json({
    success: true,
    data: {
      trustMetrics: {
        overallScore,
        tier,
        sampleSize: completedOrders,
        trend,
        specReliability: Math.round(specReliability),
        onTimeDelivery: Math.round(onTimeDelivery),
        issueRate: Math.round(issueRate * 10) / 10, // One decimal place
      },
      weeklyTrends,
      disputes,
      badges,
      stats: {
        totalOrders: totalOrders,
        completedOrders: completedOrders,
        disputedOrders: 0,
        avgResponseTime: Math.round(parseFloat(stats.avg_response_time) || 0),
        offerAcceptanceRate: 85, // TODO: Calculate from RFQ data
        directOrders: parseInt(stats.direct_orders) || 0,
      },
    },
  });
}));

// Billing endpoints

// Get billing summary (current balance and month summary)
router.get('/billing/summary', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const supplierResult = await pool.query('SELECT id FROM suppliers WHERE user_id = $1', [req.user.id]);
  if (supplierResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Supplier profile not found' });
  }

  const supplierId = supplierResult.rows[0].id;

  // Get overall summary from view
  const summaryResult = await pool.query(
    'SELECT * FROM supplier_billing_summary WHERE supplier_id = $1',
    [supplierId]
  );

  const summary = summaryResult.rows[0] || {
    pending_fees: 0,
    outstanding_fees: 0,
    paid_fees: 0,
    total_fees: 0,
    pending_count: 0,
    invoiced_count: 0,
    paid_count: 0,
  };

  // Get current month stats
  const currentMonthResult = await pool.query(
    `SELECT
      COUNT(*) as completed_orders,
      SUM(effective_value) as total_effective_value,
      AVG(fee_percentage) as avg_fee_percentage,
      SUM(fee_amount) as fees_owed
    FROM billing_ledger
    WHERE supplier_id = $1
      AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)`,
    [supplierId]
  );

  const currentMonth = currentMonthResult.rows[0];

  return res.json({
    success: true,
    data: {
      currentBalance: {
        outstandingFees: parseFloat(summary.outstanding_fees) || 0,
        pendingFees: parseFloat(summary.pending_fees) || 0,
        status: parseFloat(summary.outstanding_fees) > 0 ? 'invoiced' : 'pending',
        nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      },
      monthSummary: {
        completedOrders: parseInt(currentMonth.completed_orders) || 0,
        totalEffectiveValue: parseFloat(currentMonth.total_effective_value) || 0,
        avgFeeRate: parseFloat(currentMonth.avg_fee_percentage) || 5.0,
        feesOwed: parseFloat(currentMonth.fees_owed) || 0,
      },
    },
  });
}));

// Get billing ledger (transactions with filters)
router.get('/billing/ledger', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const supplierResult = await pool.query('SELECT id FROM suppliers WHERE user_id = $1', [req.user.id]);
  if (supplierResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Supplier profile not found' });
  }

  const supplierId = supplierResult.rows[0].id;

  // Parse query params
  const {
    start_date,
    end_date,
    order_type,
    status,
    page = '1',
    limit = '50',
  } = req.query;

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Build query
  let query = `
    SELECT
      bl.id,
      bl.order_id,
      bl.order_type,
      bl.effective_value,
      bl.fee_percentage,
      bl.fee_amount,
      bl.status,
      bl.completed_at,
      bl.invoiced_at,
      bl.paid_at,
      bl.notes,
      bl.invoice_id
    FROM billing_ledger bl
    WHERE bl.supplier_id = $1
  `;

  const queryParams: any[] = [supplierId];
  let paramIndex = 2;

  if (start_date) {
    query += ` AND bl.completed_at >= $${paramIndex}`;
    queryParams.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    query += ` AND bl.completed_at <= $${paramIndex}`;
    queryParams.push(end_date);
    paramIndex++;
  }

  if (order_type) {
    query += ` AND bl.order_type = $${paramIndex}`;
    queryParams.push(order_type);
    paramIndex++;
  }

  if (status) {
    query += ` AND bl.status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  query += ` ORDER BY bl.completed_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(parseInt(limit as string), offset);

  const ledgerResult = await pool.query(query, queryParams);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) FROM billing_ledger WHERE supplier_id = $1';
  const countParams: any[] = [supplierId];
  let countParamIndex = 2;

  if (start_date) {
    countQuery += ` AND completed_at >= $${countParamIndex}`;
    countParams.push(start_date);
    countParamIndex++;
  }

  if (end_date) {
    countQuery += ` AND completed_at <= $${countParamIndex}`;
    countParams.push(end_date);
    countParamIndex++;
  }

  if (order_type) {
    countQuery += ` AND order_type = $${countParamIndex}`;
    countParams.push(order_type);
    countParamIndex++;
  }

  if (status) {
    countQuery += ` AND status = $${countParamIndex}`;
    countParams.push(status);
    countParamIndex++;
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  return res.json({
    success: true,
    data: {
      transactions: ledgerResult.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit as string)),
      },
    },
  });
}));

// Export CSV
router.get('/billing/export', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const supplierResult = await pool.query('SELECT id FROM suppliers WHERE user_id = $1', [req.user.id]);
  if (supplierResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Supplier profile not found' });
  }

  const supplierId = supplierResult.rows[0].id;
  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      TO_CHAR(completed_at, 'YYYY-MM-DD HH24:MI:SS') as completed_date,
      COALESCE(order_id::text, 'N/A') as order_id,
      order_type,
      effective_value,
      fee_percentage,
      fee_amount,
      status,
      COALESCE(notes, '') as notes
    FROM billing_ledger
    WHERE supplier_id = $1
  `;

  const queryParams: any[] = [supplierId];
  let paramIndex = 2;

  if (start_date) {
    query += ` AND completed_at >= $${paramIndex}`;
    queryParams.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    query += ` AND completed_at <= $${paramIndex}`;
    queryParams.push(end_date);
    paramIndex++;
  }

  query += ' ORDER BY completed_at DESC';

  const result = await pool.query(query, queryParams);

  // Generate CSV
  const csvHeader = 'Date,Order ID,Order Type,Effective Value,Fee %,Fee Amount,Status,Notes\n';
  const csvRows = result.rows.map(row =>
    `"${row.completed_date}","${row.order_id}","${row.order_type}",${row.effective_value},${row.fee_percentage},${row.fee_amount},"${row.status}","${row.notes}"`
  ).join('\n');

  const csv = csvHeader + csvRows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="billing_ledger_${new Date().toISOString().split('T')[0]}.csv"`);
  return res.send(csv);
}));

export default router;
