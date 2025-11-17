/**
 * Admin API routes
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success } from '../../utils/responseHelpers';
import pool from '../../config/database';
import templatesRouter from './templates';
import exportsRouter from './exports';
import auditRouter from './audit';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin'));

// Template management routes
router.use('/templates', templatesRouter);

// Data export routes
router.use('/exports', exportsRouter);

// Audit logs routes
router.use('/audit', auditRouter);

// Admin Dashboard - Platform health metrics
router.get('/dashboard', asyncHandler(async (_req, res) => {
  // 1. Live RFQs
  const rfqsQuery = await pool.query(`
    SELECT
      COUNT(*) as total_active,
      COUNT(*) FILTER (WHERE
        created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
        AND (SELECT COUNT(*) FROM offers WHERE offers.rfq_id = rfqs.id) = 0
      ) as zero_replies_24h,
      EXTRACT(EPOCH FROM AVG(
        CASE
          WHEN (SELECT MIN(created_at) FROM offers WHERE offers.rfq_id = rfqs.id) IS NOT NULL
          THEN (SELECT MIN(created_at) FROM offers WHERE offers.rfq_id = rfqs.id) - rfqs.created_at
          ELSE NULL
        END
      )) / 3600 as avg_response_hours
    FROM rfqs
    WHERE status = 'active'
  `);

  const rfqStats = rfqsQuery.rows[0];

  // 2. Today's Deliveries/Pickups
  const deliveriesQuery = await pool.query(`
    SELECT
      COUNT(*) as scheduled_today,
      COUNT(*) FILTER (WHERE status = 'delivered') as completed,
      COUNT(*) FILTER (WHERE status IN ('confirmed', 'in_transit')) as in_progress,
      COUNT(*) FILTER (WHERE
        promised_window_end < CURRENT_TIMESTAMP
        AND status NOT IN ('delivered', 'cancelled')
      ) as late
    FROM orders
    WHERE DATE(promised_window_start) = CURRENT_DATE
  `);

  const deliveryStats = deliveriesQuery.rows[0];

  // 3. Pending Confirmations
  const confirmationsQuery = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE
        status = 'delivered'
        AND delivered_at IS NOT NULL
        AND delivered_at + INTERVAL '24 hours' - CURRENT_TIMESTAMP < INTERVAL '6 hours'
        AND delivered_at + INTERVAL '24 hours' > CURRENT_TIMESTAMP
      ) as expiring_buyer_confirmations,
      (SELECT COUNT(*) FROM rental_bookings
       WHERE status = 'confirmed'
       AND start_date <= CURRENT_DATE
       AND actual_start_date IS NULL
      ) as pending_rental_handovers
    FROM orders
  `);

  const confirmationStats = confirmationsQuery.rows[0];

  // 4. Disputes (placeholder - would need disputes table)
  const disputeStats = {
    open_disputes: 0,
    breakdown: {},
    avg_resolution_days: 0,
  };

  // 5. Supplier Health
  const supplierHealthQuery = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE is_verified = false) as unverified,
      COUNT(*) FILTER (WHERE
        (SELECT MAX(updated_at) FROM skus WHERE supplier_id = suppliers.id)
        < CURRENT_TIMESTAMP - INTERVAL '14 days'
      ) as stale_catalogs,
      COUNT(*) FILTER (WHERE
        (SELECT
          ROUND(
            (spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3
          )
         FROM trust_metrics WHERE supplier_id = suppliers.id
        ) < 70
      ) as low_trust_scores
    FROM suppliers
  `);

  const supplierHealth = supplierHealthQuery.rows[0];

  // 6. Rental Health
  const rentalHealthQuery = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status IN ('confirmed', 'active')) as active_bookings,
      COUNT(*) FILTER (WHERE
        status = 'active'
        AND end_date < CURRENT_DATE
        AND actual_end_date IS NULL
      ) as overdue_returns
    FROM rental_bookings
  `);

  const rentalHealth = rentalHealthQuery.rows[0];

  // 7. Billing
  const billingQuery = await pool.query(`
    SELECT
      COALESCE(SUM(fee_amount) FILTER (WHERE invoice_status IN ('pending', 'issued', 'overdue')), 0) as outstanding_fees,
      COUNT(*) FILTER (WHERE
        invoice_status IN ('issued', 'overdue')
        AND invoice_issued_at < CURRENT_TIMESTAMP - INTERVAL '14 days'
      ) as overdue_invoices
    FROM billing_ledger
  `);

  const billingStats = billingQuery.rows[0];

  // 8. Platform Stats
  const platformStatsQuery = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE user_type = 'buyer') as total_buyers,
      (SELECT COUNT(*) FROM suppliers) as total_suppliers,
      (SELECT COUNT(*) FROM orders
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
      ) as orders_this_month,
      (SELECT COUNT(*) FROM orders
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
       AND offer_id IS NULL
      ) as direct_orders_this_month,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
       AND status IN ('confirmed', 'in_transit', 'delivered')
      ) as gmv_this_month,
      (SELECT COALESCE(SUM(fee_amount), 0) FROM billing_ledger
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
      ) as revenue_this_month
  `);

  const platformStats = platformStatsQuery.rows[0];

  success(res, {
    liveRFQs: {
      totalActive: parseInt(rfqStats.total_active) || 0,
      zeroReplies24h: parseInt(rfqStats.zero_replies_24h) || 0,
      avgResponseHours: parseFloat(rfqStats.avg_response_hours) || 0,
    },
    deliveries: {
      scheduledToday: parseInt(deliveryStats.scheduled_today) || 0,
      completed: parseInt(deliveryStats.completed) || 0,
      inProgress: parseInt(deliveryStats.in_progress) || 0,
      late: parseInt(deliveryStats.late) || 0,
    },
    confirmations: {
      expiringBuyerConfirmations: parseInt(confirmationStats.expiring_buyer_confirmations) || 0,
      pendingRentalHandovers: parseInt(confirmationStats.pending_rental_handovers) || 0,
    },
    disputes: disputeStats,
    supplierHealth: {
      unverified: parseInt(supplierHealth.unverified) || 0,
      staleCatalogs: parseInt(supplierHealth.stale_catalogs) || 0,
      lowTrustScores: parseInt(supplierHealth.low_trust_scores) || 0,
    },
    rentalHealth: {
      activeBookings: parseInt(rentalHealth.active_bookings) || 0,
      overdueReturns: parseInt(rentalHealth.overdue_returns) || 0,
    },
    billing: {
      outstandingFees: parseFloat(billingStats.outstanding_fees) || 0,
      overdueInvoices: parseInt(billingStats.overdue_invoices) || 0,
    },
    platformStats: {
      totalBuyers: parseInt(platformStats.total_buyers) || 0,
      totalSuppliers: parseInt(platformStats.total_suppliers) || 0,
      totalUsers: (parseInt(platformStats.total_buyers) || 0) + (parseInt(platformStats.total_suppliers) || 0),
      ordersThisMonth: parseInt(platformStats.orders_this_month) || 0,
      directOrdersThisMonth: parseInt(platformStats.direct_orders_this_month) || 0,
      gmvThisMonth: parseFloat(platformStats.gmv_this_month) || 0,
      revenueThisMonth: parseFloat(platformStats.revenue_this_month) || 0,
    },
  });
}));

router.get('/templates', asyncHandler(async (_req, res) => {
  success(res, [], 'Templates retrieved successfully');
}));

router.post('/templates', asyncHandler(async (_req, res) => {
  success(res, {}, 'Template created successfully', 201);
}));

router.get('/stats', asyncHandler(async (_req, res) => {
  success(res, {}, 'Statistics retrieved successfully');
}));

// ==================== ADMIN QUEUE ENDPOINTS ====================

// RFQ Queue - Get RFQs with filters
router.get('/rfqs', asyncHandler(async (req, res) => {
  const { zeroReplies, buyerType, region, sortKey = 'createdAt', sortDirection = 'desc' } = req.query;

  let whereConditions = ["rfqs.status = 'active'"];

  // Filter by zero replies
  if (zeroReplies === '24h') {
    whereConditions.push(`rfqs.created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'`);
    whereConditions.push(`(SELECT COUNT(*) FROM offers WHERE offers.rfq_id = rfqs.id) = 0`);
  } else if (zeroReplies === '48h') {
    whereConditions.push(`rfqs.created_at < CURRENT_TIMESTAMP - INTERVAL '48 hours'`);
    whereConditions.push(`(SELECT COUNT(*) FROM offers WHERE offers.rfq_id = rfqs.id) = 0`);
  }

  // Filter by buyer type
  if (buyerType && buyerType !== 'all') {
    whereConditions.push(`users.buyer_role = '${buyerType}'`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderByClause = `ORDER BY ${sortKey === 'ageHours' ? 'rfqs.created_at' : sortKey} ${sortDirection}`;

  const query = `
    SELECT
      rfqs.id,
      users.name as buyer_name,
      users.buyer_role as buyer_type,
      (SELECT COUNT(*) FROM rfq_items WHERE rfq_id = rfqs.id) as items_count,
      (SELECT COUNT(DISTINCT supplier_id) FROM rfq_recipients WHERE rfq_id = rfqs.id) as suppliers_sent_to,
      (SELECT COUNT(*) FROM offers WHERE rfq_id = rfqs.id) as replies_received,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - rfqs.created_at)) / 3600 as age_hours,
      rfqs.created_at
    FROM rfqs
    JOIN users ON users.id = rfqs.buyer_id
    ${whereClause}
    ${orderByClause}
    LIMIT 100
  `;

  const result = await pool.query(query);

  const data = result.rows.map(row => ({
    id: row.id,
    buyerName: row.buyer_name,
    buyerType: row.buyer_type,
    itemsCount: parseInt(row.items_count),
    suppliersSentTo: parseInt(row.suppliers_sent_to),
    repliesReceived: parseInt(row.replies_received),
    ageHours: Math.floor(parseFloat(row.age_hours)),
    createdAt: row.created_at,
  }));

  success(res, { data });
}));

// RFQ Queue - Nudge suppliers
router.post('/rfqs/:rfqId/nudge-suppliers', asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Get all suppliers who received this RFQ but haven't responded
  const suppliersQuery = await pool.query(`
    SELECT DISTINCT rr.supplier_id, s.business_name
    FROM rfq_recipients rr
    JOIN suppliers s ON s.id = rr.supplier_id
    LEFT JOIN offers o ON o.rfq_id = rr.rfq_id AND o.supplier_id = rr.supplier_id
    WHERE rr.rfq_id = $1 AND o.id IS NULL
  `, [rfqId]);

  // TODO: Send push notifications to these suppliers
  // For now, just log the action
  console.log(`Nudging ${suppliersQuery.rows.length} suppliers for RFQ ${rfqId}`);

  success(res, {
    message: `Nudged ${suppliersQuery.rows.length} suppliers`,
    suppliersNudged: suppliersQuery.rows.length
  });
}));

// Delivery Queue - Get deliveries with filters
router.get('/deliveries', asyncHandler(async (req, res) => {
  const { date, status, supplier, sortKey = 'scheduledWindowStart', sortDirection = 'asc' } = req.query;

  let whereConditions = ["orders.status != 'cancelled'"];

  // Filter by date
  if (date === 'today') {
    whereConditions.push(`DATE(orders.promised_window_start) = CURRENT_DATE`);
  } else if (date === 'tomorrow') {
    whereConditions.push(`DATE(orders.promised_window_start) = CURRENT_DATE + INTERVAL '1 day'`);
  } else if (date === 'week') {
    whereConditions.push(`DATE(orders.promised_window_start) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`);
  }

  // Filter by status
  if (status && status !== 'all') {
    if (status === 'late') {
      whereConditions.push(`orders.promised_window_end < CURRENT_TIMESTAMP AND orders.status NOT IN ('delivered', 'cancelled')`);
    } else {
      whereConditions.push(`orders.status = '${status}'`);
    }
  }

  // Filter by supplier
  if (supplier) {
    whereConditions.push(`suppliers.business_name ILIKE '%${supplier}%'`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderByClause = `ORDER BY orders.${sortKey} ${sortDirection}`;

  const query = `
    SELECT
      orders.id,
      orders.id as order_id,
      suppliers.business_name as supplier_name,
      suppliers.contact_phone as supplier_phone,
      users.name as buyer_name,
      users.phone as buyer_phone,
      orders.promised_window_start as scheduled_window_start,
      orders.promised_window_end as scheduled_window_end,
      orders.status,
      CASE
        WHEN orders.promised_window_end < CURRENT_TIMESTAMP AND orders.status NOT IN ('delivered', 'cancelled')
        THEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - orders.promised_window_end)) / 60
        ELSE NULL
      END as minutes_late
    FROM orders
    JOIN suppliers ON suppliers.id = orders.supplier_id
    JOIN users ON users.id = orders.buyer_id
    ${whereClause}
    ${orderByClause}
    LIMIT 100
  `;

  const result = await pool.query(query);

  const data = result.rows.map(row => ({
    id: row.id,
    orderId: row.order_id,
    supplierName: row.supplier_name,
    supplierPhone: row.supplier_phone,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    scheduledWindowStart: row.scheduled_window_start,
    scheduledWindowEnd: row.scheduled_window_end,
    status: row.status === 'confirmed' ? 'scheduled' :
            row.status === 'in_transit' ? 'in_progress' :
            row.minutes_late ? 'late' : row.status,
    minutesLate: row.minutes_late ? Math.floor(parseFloat(row.minutes_late)) : null,
  }));

  success(res, { data });
}));

// Delivery Queue - Add admin note
router.patch('/deliveries/:orderId/note', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { note } = req.body;

  // TODO: Add admin_notes table or field
  // For now, just acknowledge
  console.log(`Admin note for order ${orderId}: ${note}`);

  success(res, { message: 'Note saved' });
}));

// Confirmation Queue - Get expiring confirmations
router.get('/confirmations', asyncHandler(async (req, res) => {
  const { tab = 'expiring' } = req.query;

  if (tab === 'expiring') {
    // Get orders awaiting buyer confirmation (24h window, expiring in <6h)
    const ordersQuery = await pool.query(`
      SELECT
        orders.id,
        orders.id as order_id,
        'delivery' as type,
        users.name as buyer_name,
        users.phone as buyer_phone,
        EXTRACT(EPOCH FROM (orders.delivered_at + INTERVAL '24 hours' - CURRENT_TIMESTAMP)) / 60 as time_remaining_minutes,
        orders.delivered_at + INTERVAL '24 hours' as deadline
      FROM orders
      JOIN users ON users.id = orders.buyer_id
      WHERE orders.status = 'delivered'
        AND orders.delivered_at IS NOT NULL
        AND orders.delivered_at + INTERVAL '24 hours' > CURRENT_TIMESTAMP
        AND orders.delivered_at + INTERVAL '24 hours' - CURRENT_TIMESTAMP < INTERVAL '6 hours'

      UNION ALL

      SELECT
        rb.id,
        rb.id as order_id,
        CASE
          WHEN rb.actual_start_date IS NULL THEN 'handover'
          ELSE 'return'
        END as type,
        u.name as buyer_name,
        u.phone as buyer_phone,
        CASE
          WHEN rb.actual_start_date IS NULL
          THEN EXTRACT(EPOCH FROM (rb.start_date + INTERVAL '2 hours' - CURRENT_TIMESTAMP)) / 60
          ELSE EXTRACT(EPOCH FROM (rb.end_date + INTERVAL '2 hours' - CURRENT_TIMESTAMP)) / 60
        END as time_remaining_minutes,
        CASE
          WHEN rb.actual_start_date IS NULL
          THEN rb.start_date + INTERVAL '2 hours'
          ELSE rb.end_date + INTERVAL '2 hours'
        END as deadline
      FROM rental_bookings rb
      JOIN users u ON u.id = rb.buyer_id
      WHERE rb.status IN ('confirmed', 'active')
        AND (
          (rb.actual_start_date IS NULL AND rb.start_date + INTERVAL '2 hours' > CURRENT_TIMESTAMP AND rb.start_date + INTERVAL '2 hours' - CURRENT_TIMESTAMP < INTERVAL '30 minutes')
          OR
          (rb.actual_start_date IS NOT NULL AND rb.actual_end_date IS NULL AND rb.end_date + INTERVAL '2 hours' > CURRENT_TIMESTAMP AND rb.end_date + INTERVAL '2 hours' - CURRENT_TIMESTAMP < INTERVAL '30 minutes')
        )

      ORDER BY time_remaining_minutes ASC
      LIMIT 100
    `);

    const data = ordersQuery.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      type: row.type,
      buyerName: row.buyer_name,
      buyerPhone: row.buyer_phone,
      timeRemainingMinutes: Math.floor(parseFloat(row.time_remaining_minutes)),
      deadline: row.deadline,
    }));

    success(res, { data });
  } else {
    // Get auto-completed orders (no buyer response within 24h)
    const autoCompletedQuery = await pool.query(`
      SELECT
        orders.id,
        orders.id as order_id,
        'delivery' as type,
        users.name as buyer_name,
        users.phone as buyer_phone,
        orders.delivered_at + INTERVAL '24 hours' as deadline
      FROM orders
      JOIN users ON users.id = orders.buyer_id
      WHERE orders.status = 'completed'
        AND orders.buyer_confirmed_at IS NULL
        AND orders.delivered_at IS NOT NULL
        AND orders.delivered_at + INTERVAL '24 hours' < CURRENT_TIMESTAMP
      ORDER BY orders.delivered_at DESC
      LIMIT 100
    `);

    const data = autoCompletedQuery.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      type: row.type,
      buyerName: row.buyer_name,
      buyerPhone: row.buyer_phone,
      timeRemainingMinutes: 0,
      deadline: row.deadline,
    }));

    success(res, { data });
  }
}));

// Confirmation Queue - Send SMS reminder
router.post('/confirmations/:id/remind', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Integrate with SMS service
  console.log(`Sending SMS reminder for confirmation ${id}`);

  success(res, { message: 'SMS reminder sent' });
}));

// Dispute Queue - Get disputes with filters
router.get('/disputes', asyncHandler(async (req, res) => {
  const { status, issueCategory, buyerType, sortKey = 'reportedAt', sortDirection = 'desc' } = req.query;

  // TODO: Create disputes table
  // For now, return mock data structure
  success(res, { data: [] });
}));

// Dispute Queue - Add admin note
router.post('/disputes/:disputeId/note', asyncHandler(async (req, res) => {
  const { disputeId } = req.params;
  const { note } = req.body;

  // TODO: Add to disputes table
  console.log(`Admin note for dispute ${disputeId}: ${note}`);

  success(res, { message: 'Admin note saved' });
}));

// Dispute Queue - Mark resolved
router.patch('/disputes/:disputeId/resolve', asyncHandler(async (req, res) => {
  const { disputeId } = req.params;
  const { outcome } = req.body;

  // TODO: Update dispute status and outcome
  console.log(`Dispute ${disputeId} resolved with outcome: ${outcome}`);

  success(res, { message: 'Dispute marked as resolved' });
}));

// Supplier Queue - Get suppliers with filters
router.get('/suppliers', asyncHandler(async (req, res) => {
  const { status, trustScore, staleCatalog, sortKey = 'lastActivity', sortDirection = 'desc' } = req.query;

  let whereConditions: string[] = [];

  // Filter by status
  if (status && status !== 'all') {
    if (status === 'unverified') {
      whereConditions.push(`suppliers.is_verified = false`);
    } else if (status === 'verified') {
      whereConditions.push(`suppliers.is_verified = true AND suppliers.status = 'active'`);
    } else if (status === 'paused') {
      whereConditions.push(`suppliers.status = 'paused'`);
    }
  }

  // Filter by trust score
  if (trustScore && trustScore !== 'all') {
    if (trustScore === 'low') {
      whereConditions.push(`
        (SELECT ROUND((spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3)
         FROM trust_metrics WHERE supplier_id = suppliers.id) < 70
      `);
    } else if (trustScore === 'medium') {
      whereConditions.push(`
        (SELECT ROUND((spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3)
         FROM trust_metrics WHERE supplier_id = suppliers.id) BETWEEN 70 AND 90
      `);
    } else if (trustScore === 'high') {
      whereConditions.push(`
        (SELECT ROUND((spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3)
         FROM trust_metrics WHERE supplier_id = suppliers.id) > 90
      `);
    }
  }

  // Filter by stale catalog
  if (staleCatalog === 'yes') {
    whereConditions.push(`
      (SELECT MAX(updated_at) FROM skus WHERE supplier_id = suppliers.id)
      < CURRENT_TIMESTAMP - INTERVAL '14 days'
    `);
  } else if (staleCatalog === 'no') {
    whereConditions.push(`
      (SELECT MAX(updated_at) FROM skus WHERE supplier_id = suppliers.id)
      >= CURRENT_TIMESTAMP - INTERVAL '14 days'
    `);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderByClause = `ORDER BY ${sortKey === 'lastActivity' ? 'suppliers.updated_at' : sortKey} ${sortDirection}`;

  const query = `
    SELECT
      suppliers.id,
      suppliers.business_name,
      CASE
        WHEN suppliers.is_verified = false THEN 'unverified'
        WHEN suppliers.status = 'paused' THEN 'paused'
        WHEN (SELECT ROUND((spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3)
              FROM trust_metrics WHERE supplier_id = suppliers.id) > 90 THEN 'trusted'
        ELSE 'verified'
      END as status,
      COALESCE(
        (SELECT ROUND((spec_reliability_pct + on_time_pct + (100 - issue_rate_pct)) / 3)
         FROM trust_metrics WHERE supplier_id = suppliers.id),
        0
      ) as trust_score,
      (SELECT COUNT(*) FROM skus WHERE supplier_id = suppliers.id AND is_active = true) as sku_count,
      (SELECT COUNT(*) FROM skus
       WHERE supplier_id = suppliers.id
       AND is_active = true
       AND updated_at < CURRENT_TIMESTAMP - INTERVAL '14 days'
      ) as stale_skus_count,
      suppliers.updated_at as last_activity,
      suppliers.contact_phone as phone
    FROM suppliers
    ${whereClause}
    ${orderByClause}
    LIMIT 100
  `;

  const result = await pool.query(query);

  const data = result.rows.map(row => ({
    id: row.id,
    businessName: row.business_name,
    status: row.status,
    trustScore: parseInt(row.trust_score),
    skuCount: parseInt(row.sku_count),
    staleSkusCount: parseInt(row.stale_skus_count),
    lastActivity: row.last_activity,
    phone: row.phone,
  }));

  success(res, { data });
}));

// Supplier Queue - Update supplier status
router.patch('/suppliers/:supplierId/status', asyncHandler(async (req, res) => {
  const { supplierId } = req.params;
  const { status } = req.body;

  if (status === 'verified') {
    await pool.query(
      `UPDATE suppliers SET is_verified = true, status = 'active' WHERE id = $1`,
      [supplierId]
    );
  } else if (status === 'paused') {
    await pool.query(
      `UPDATE suppliers SET status = 'paused' WHERE id = $1`,
      [supplierId]
    );
  }

  success(res, { message: 'Supplier status updated' });
}));

// Supplier Queue - Nudge supplier
router.post('/suppliers/:supplierId/nudge', asyncHandler(async (req, res) => {
  const { supplierId } = req.params;

  // TODO: Send push notification to supplier
  console.log(`Nudging supplier ${supplierId} to update catalog`);

  success(res, { message: 'Nudge sent to supplier' });
}));

// Rental Queue - Get rentals with filters
router.get('/rentals', asyncHandler(async (req, res) => {
  const { status, overdue, sortKey = 'returnDate', sortDirection = 'asc' } = req.query;

  let whereConditions: string[] = [];

  // Filter by status
  if (status === 'active') {
    whereConditions.push(`rental_bookings.status IN ('confirmed', 'active')`);
  } else if (status === 'completed') {
    whereConditions.push(`rental_bookings.status = 'completed'`);
  }

  // Filter by overdue
  if (overdue === 'yes') {
    whereConditions.push(`
      rental_bookings.status = 'active'
      AND rental_bookings.end_date < CURRENT_DATE
      AND rental_bookings.actual_end_date IS NULL
    `);
  } else if (overdue === 'no') {
    whereConditions.push(`
      (rental_bookings.status != 'active'
       OR rental_bookings.end_date >= CURRENT_DATE
       OR rental_bookings.actual_end_date IS NOT NULL)
    `);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderByClause = `ORDER BY rental_bookings.${sortKey === 'returnDate' ? 'end_date' : sortKey} ${sortDirection}`;

  const query = `
    SELECT
      rental_bookings.id,
      rental_bookings.id as booking_id,
      skus.name_en as tool_name,
      suppliers.business_name as supplier_name,
      suppliers.contact_phone as supplier_phone,
      rental_bookings.start_date as handover_date,
      CASE
        WHEN rental_bookings.actual_start_date IS NOT NULL THEN 'completed'
        ELSE 'pending'
      END as handover_status,
      rental_bookings.end_date as return_date,
      CASE
        WHEN rental_bookings.actual_end_date IS NOT NULL THEN 'completed'
        WHEN rental_bookings.status = 'active' AND rental_bookings.end_date < CURRENT_DATE THEN 'overdue'
        ELSE 'pending'
      END as return_status,
      CASE
        WHEN rental_bookings.status = 'active'
             AND rental_bookings.end_date < CURRENT_DATE
             AND rental_bookings.actual_end_date IS NULL
        THEN CURRENT_DATE - rental_bookings.end_date
        ELSE NULL
      END as overdue_days
    FROM rental_bookings
    JOIN skus ON skus.id = rental_bookings.sku_id
    JOIN suppliers ON suppliers.id = skus.supplier_id
    ${whereClause}
    ${orderByClause}
    LIMIT 100
  `;

  const result = await pool.query(query);

  const data = result.rows.map(row => ({
    id: row.id,
    bookingId: row.booking_id,
    toolName: row.tool_name,
    supplierName: row.supplier_name,
    supplierPhone: row.supplier_phone,
    handoverDate: row.handover_date,
    handoverStatus: row.handover_status,
    returnDate: row.return_date,
    returnStatus: row.return_status,
    overdueDays: row.overdue_days ? parseInt(row.overdue_days) : null,
  }));

  success(res, { data });
}));

export default router;
