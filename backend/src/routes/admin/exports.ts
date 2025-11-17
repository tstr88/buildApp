/**
 * Admin Data Export Routes
 * Generate CSV/XLSX/JSON exports of platform data
 */

import { Router } from 'express';
import pool from '../../config/database';
import { success, error as errorResponse } from '../../utils/responseHelpers';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

// Helper function to convert rows to CSV
function convertToCSV(rows: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      // Escape commas and quotes
      const stringValue = String(value).replace(/"/g, '""');
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue}"`
        : stringValue;
    }).join(',');
  });
  return [headerRow, ...dataRows].join('\n');
}

// 1. Orders Export
router.post('/orders', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, buyerType, supplierId, format = 'csv' } = req.body;

  let query = `
    SELECT
      o.id as order_id,
      o.order_type as type,
      b.name as buyer_name,
      b.phone as buyer_phone,
      b.buyer_role as buyer_type,
      COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
      o.items::text as items_summary,
      o.total_amount as total,
      o.fulfillment_method,
      o.status,
      o.created_at,
      o.scheduled_window_start,
      o.scheduled_window_end,
      o.delivered_at,
      o.confirmed_at,
      CASE WHEN o.disputed = true THEN 'yes' ELSE 'no' END as disputed
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN suppliers s ON o.supplier_id = s.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND o.created_at >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND o.created_at <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (status && status !== 'all') {
    query += ` AND o.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (buyerType && buyerType !== 'all') {
    query += ` AND b.buyer_role = $${paramCount}`;
    params.push(buyerType);
    paramCount++;
  }

  if (supplierId) {
    query += ` AND o.supplier_id = $${paramCount}`;
    params.push(supplierId);
    paramCount++;
  }

  query += ' ORDER BY o.created_at DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['order_id', 'type', 'buyer_name', 'buyer_phone', 'buyer_type', 'supplier_name',
                     'items_summary', 'total', 'fulfillment_method', 'status', 'created_at',
                     'scheduled_window_start', 'scheduled_window_end', 'delivered_at', 'confirmed_at', 'disputed'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { orders: result.rows, count: result.rows.length });
}));

// 2. RFQs & Offers Export
router.post('/rfqs', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, buyerType, format = 'csv' } = req.body;

  let query = `
    SELECT
      r.id as rfq_id,
      b.name as buyer_name,
      b.buyer_role as buyer_type,
      r.delivery_location::text as project_location,
      jsonb_array_length(r.items) as items_count,
      r.suppliers_sent_to_count,
      r.offers_received_count,
      r.accepted_offer_supplier_name,
      r.accepted_offer_total,
      r.created_at,
      r.status
    FROM rfqs r
    LEFT JOIN users b ON r.buyer_id = b.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND r.created_at >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND r.created_at <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (status && status !== 'all') {
    query += ` AND r.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (buyerType && buyerType !== 'all') {
    query += ` AND b.buyer_role = $${paramCount}`;
    params.push(buyerType);
    paramCount++;
  }

  query += ' ORDER BY r.created_at DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['rfq_id', 'buyer_name', 'buyer_type', 'project_location', 'items_count',
                     'suppliers_sent_to_count', 'offers_received_count', 'accepted_offer_supplier_name',
                     'accepted_offer_total', 'created_at', 'status'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=rfqs_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { rfqs: result.rows, count: result.rows.length });
}));

// 3. Deliveries Export
router.post('/deliveries', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, onTime, disputed, format = 'csv' } = req.body;

  let query = `
    SELECT
      o.id as order_id,
      COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
      b.name as buyer_name,
      o.scheduled_window_start,
      o.scheduled_window_end,
      o.delivered_at,
      CASE
        WHEN o.delivered_at IS NOT NULL
          AND o.delivered_at <= o.scheduled_window_end + interval '30 minutes'
        THEN 'yes'
        ELSE 'no'
      END as on_time,
      o.delivery_photos_count,
      CASE
        WHEN o.disputed THEN 'disputed'
        WHEN o.confirmed_at IS NOT NULL THEN 'confirmed'
        ELSE 'pending'
      END as confirmation_status,
      o.dispute_issue_category
    FROM orders o
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN suppliers s ON o.supplier_id = s.id
    WHERE o.status IN ('delivered', 'completed', 'disputed')
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND o.delivered_at >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND o.delivered_at <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (onTime && onTime !== 'all') {
    if (onTime === 'on_time') {
      query += ` AND o.delivered_at <= o.scheduled_window_end + interval '30 minutes'`;
    } else if (onTime === 'late') {
      query += ` AND o.delivered_at > o.scheduled_window_end + interval '30 minutes'`;
    }
  }

  if (disputed && disputed !== 'all') {
    query += ` AND o.disputed = $${paramCount}`;
    params.push(disputed === 'yes');
    paramCount++;
  }

  query += ' ORDER BY o.delivered_at DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['order_id', 'supplier_name', 'buyer_name', 'scheduled_window_start', 'scheduled_window_end',
                     'delivered_at', 'on_time', 'delivery_photos_count', 'confirmation_status', 'dispute_issue_category'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=deliveries_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { deliveries: result.rows, count: result.rows.length });
}));

// 4. Rentals Export
router.post('/rentals', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, format = 'csv' } = req.body;

  let query = `
    SELECT
      rb.id as booking_id,
      rs.tool_name,
      COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
      b.name as buyer_name,
      rb.start_date,
      rb.end_date,
      EXTRACT(DAY FROM (rb.end_date - rb.start_date)) as duration_days,
      rb.handover_timestamp,
      rb.return_timestamp,
      CASE
        WHEN rb.return_timestamp > rb.end_date THEN 'yes'
        ELSE 'no'
      END as overdue,
      CASE
        WHEN rb.return_timestamp > rb.end_date
        THEN EXTRACT(DAY FROM (rb.return_timestamp - rb.end_date))
        ELSE 0
      END as overdue_days,
      rb.total_amount,
      rb.status
    FROM rental_bookings rb
    LEFT JOIN rental_skus rs ON rb.rental_sku_id = rs.id
    LEFT JOIN users b ON rb.buyer_id = b.id
    LEFT JOIN suppliers s ON rs.supplier_id = s.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND rb.start_date >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND rb.end_date <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (status && status !== 'all') {
    query += ` AND rb.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  query += ' ORDER BY rb.created_at DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['booking_id', 'tool_name', 'supplier_name', 'buyer_name', 'start_date', 'end_date',
                     'duration_days', 'handover_timestamp', 'return_timestamp', 'overdue', 'overdue_days',
                     'total_amount', 'status'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=rentals_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { rentals: result.rows, count: result.rows.length });
}));

// 5. Disputes Export
router.post('/disputes', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, issueCategory, format = 'csv' } = req.body;

  let query = `
    SELECT
      o.id as order_id,
      d.id as dispute_id,
      b.name as buyer_name,
      COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
      d.issue_category,
      d.reported_at,
      CASE WHEN d.supplier_response IS NOT NULL THEN 'yes' ELSE 'no' END as supplier_responded,
      d.supplier_responded_at,
      d.outcome,
      d.resolved_at
    FROM disputes d
    JOIN orders o ON d.order_id = o.id
    LEFT JOIN users b ON o.buyer_id = b.id
    LEFT JOIN suppliers s ON o.supplier_id = s.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND d.reported_at >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND d.reported_at <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (status && status !== 'all') {
    query += ` AND d.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (issueCategory && issueCategory !== 'all') {
    query += ` AND d.issue_category = $${paramCount}`;
    params.push(issueCategory);
    paramCount++;
  }

  query += ' ORDER BY d.reported_at DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['order_id', 'dispute_id', 'buyer_name', 'supplier_name', 'issue_category',
                     'reported_at', 'supplier_responded', 'supplier_responded_at', 'outcome', 'resolved_at'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=disputes_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { disputes: result.rows, count: result.rows.length });
}));

// 6. Supplier Stats Export
router.post('/suppliers', asyncHandler(async (req, res) => {
  const { status, trustTier, format = 'csv' } = req.body;

  let query = `
    SELECT
      s.id as supplier_id,
      COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
      s.status,
      s.sku_count,
      s.direct_order_sku_count,
      ROUND(s.trust_score, 2) as trust_score_pct,
      ROUND(s.spec_reliability, 2) as spec_reliability_pct,
      ROUND(s.on_time_delivery, 2) as on_time_pct,
      ROUND(s.issue_rate, 2) as issue_rate_pct,
      s.completed_orders_count,
      s.disputed_orders_count,
      s.last_activity_at
    FROM suppliers s
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (status && status !== 'all') {
    query += ` AND s.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (trustTier && trustTier !== 'all') {
    if (trustTier === 'low') {
      query += ` AND s.trust_score < 70`;
    } else if (trustTier === 'medium') {
      query += ` AND s.trust_score >= 70 AND s.trust_score < 90`;
    } else if (trustTier === 'high') {
      query += ` AND s.trust_score >= 90`;
    }
  }

  query += ' ORDER BY s.trust_score DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['supplier_id', 'supplier_name', 'status', 'sku_count', 'direct_order_sku_count',
                     'trust_score_pct', 'spec_reliability_pct', 'on_time_pct', 'issue_rate_pct',
                     'completed_orders_count', 'disputed_orders_count', 'last_activity_at'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=suppliers_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { suppliers: result.rows, count: result.rows.length });
}));

// 7. Billing Export
router.post('/billing', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, supplierId, format = 'csv' } = req.body;

  let query = `
    SELECT
      COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
      o.id as order_id,
      o.confirmed_at as completed_date,
      o.order_type as type,
      o.total_amount as effective_value,
      5.0 as fee_percentage,
      ROUND(o.total_amount * 0.05, 2) as fee_amount,
      CASE
        WHEN o.fee_invoiced_at IS NULL THEN 'pending'
        WHEN o.fee_paid_at IS NOT NULL THEN 'paid'
        ELSE 'invoiced'
      END as invoice_status
    FROM orders o
    LEFT JOIN suppliers s ON o.supplier_id = s.id
    WHERE o.status = 'completed'
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND o.confirmed_at >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND o.confirmed_at <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (status && status !== 'all') {
    if (status === 'pending') {
      query += ` AND o.fee_invoiced_at IS NULL`;
    } else if (status === 'invoiced') {
      query += ` AND o.fee_invoiced_at IS NOT NULL AND o.fee_paid_at IS NULL`;
    } else if (status === 'paid') {
      query += ` AND o.fee_paid_at IS NOT NULL`;
    }
  }

  if (supplierId) {
    query += ` AND o.supplier_id = $${paramCount}`;
    params.push(supplierId);
    paramCount++;
  }

  query += ' ORDER BY o.confirmed_at DESC LIMIT 10000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['supplier_name', 'order_id', 'completed_date', 'type', 'effective_value',
                     'fee_percentage', 'fee_amount', 'invoice_status'];
    const csv = convertToCSV(result.rows, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=billing_export_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { billing: result.rows, count: result.rows.length });
}));

export default router;
