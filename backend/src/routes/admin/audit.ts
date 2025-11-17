/**
 * Admin Audit Logs Routes
 * View immutable audit trail of critical actions
 */

import { Router } from 'express';
import pool from '../../config/database';
import { success, error as errorResponse } from '../../utils/responseHelpers';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

// Get audit logs with filtering
router.get('/', asyncHandler(async (req, res) => {
  const {
    searchQuery,
    actionType,
    actorType,
    targetType,
    dateFrom,
    dateTo,
    page = '1',
    limit = '50',
    sortKey = 'timestamp',
    sortDirection = 'desc'
  } = req.query;

  let query = `
    SELECT
      id,
      timestamp,
      actor_id,
      actor_name,
      actor_type,
      action_type,
      target_type,
      target_id,
      details,
      ip_address,
      created_at
    FROM audit_logs
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  // Search by order ID, user name, or target ID
  if (searchQuery) {
    query += ` AND (
      target_id ILIKE $${paramCount}
      OR actor_name ILIKE $${paramCount}
      OR id::text ILIKE $${paramCount}
    )`;
    params.push(`%${searchQuery}%`);
    paramCount++;
  }

  if (actionType && actionType !== 'all') {
    query += ` AND action_type = $${paramCount}`;
    params.push(actionType);
    paramCount++;
  }

  if (actorType && actorType !== 'all') {
    query += ` AND actor_type = $${paramCount}`;
    params.push(actorType);
    paramCount++;
  }

  if (targetType && targetType !== 'all') {
    query += ` AND target_type = $${paramCount}`;
    params.push(targetType);
    paramCount++;
  }

  if (dateFrom) {
    query += ` AND timestamp >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND timestamp <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  // Count total before pagination
  const countQuery = query.replace('SELECT id, timestamp, actor_id, actor_name, actor_type, action_type, target_type, target_id, details, ip_address, created_at', 'SELECT COUNT(*) as total');
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Sorting
  const validSortKeys = ['timestamp', 'action_type', 'actor_name', 'target_type', 'created_at'];
  const sortColumn = validSortKeys.includes(sortKey as string) ? sortKey : 'timestamp';
  const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortColumn} ${direction}`;

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limitNum, offset);

  const result = await pool.query(query, params);

  return success(res, {
    logs: result.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}));

// Get distinct action types for filtering
router.get('/action-types', asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT DISTINCT action_type
    FROM audit_logs
    ORDER BY action_type ASC
  `);

  return success(res, { actionTypes: result.rows.map((r: any) => r.action_type) });
}));

// Export audit logs as CSV
router.post('/export', asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, actionType, format = 'csv' } = req.body;

  let query = `
    SELECT
      id,
      timestamp,
      actor_name,
      actor_type,
      action_type,
      target_type,
      target_id,
      details,
      ip_address
    FROM audit_logs
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (dateFrom) {
    query += ` AND timestamp >= $${paramCount}`;
    params.push(dateFrom);
    paramCount++;
  }

  if (dateTo) {
    query += ` AND timestamp <= $${paramCount}`;
    params.push(dateTo);
    paramCount++;
  }

  if (actionType && actionType !== 'all') {
    query += ` AND action_type = $${paramCount}`;
    params.push(actionType);
    paramCount++;
  }

  query += ' ORDER BY timestamp DESC LIMIT 50000';

  const result = await pool.query(query, params);

  if (format === 'csv') {
    const headers = ['id', 'timestamp', 'actor_name', 'actor_type', 'action_type', 'target_type', 'target_id', 'details', 'ip_address'];
    const headerRow = headers.join(',');
    const dataRows = result.rows.map((row: any) => {
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        // For JSONB details, stringify it
        const stringValue = header === 'details' ? JSON.stringify(value) : String(value);
        const escaped = stringValue.replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
          ? `"${escaped}"`
          : escaped;
      }).join(',');
    });
    const csv = [headerRow, ...dataRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.csv`);
    return res.send(csv);
  }

  return success(res, { logs: result.rows, count: result.rows.length });
}));

export default router;
