/**
 * Notifications API routes
 * - List notifications with pagination and filtering
 * - Mark notifications as read
 * - Manage notification preferences
 * - Register/unregister push notification device tokens
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { success, paginated } from '../../utils/responseHelpers';
import pool from '../../config/database';
import notificationService from '../../services/NotificationService';
import { ValidationError, NotFoundError } from '../../utils/errors/CustomErrors';

const router = Router();
router.use(authenticate); // All routes require authentication

/**
 * GET /api/notifications
 * Get user's notifications with pagination and filtering
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    page = '1',
    limit = '20',
    type,
    isRead,
    sortBy = 'delivered_at',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  // Build query with filters
  let query = `
    SELECT id, notification_type, channel, title, message, deep_link, data,
           delivered_at, read_at, is_read, expires_at
    FROM notifications
    WHERE user_id = $1
  `;
  const params: any[] = [userId];
  let paramCount = 1;

  if (type) {
    paramCount++;
    query += ` AND notification_type = $${paramCount}`;
    params.push(type);
  }

  if (isRead !== undefined) {
    paramCount++;
    query += ` AND is_read = $${paramCount}`;
    params.push(isRead === 'true');
  }

  // Add sorting
  const validSortColumns = ['delivered_at', 'read_at', 'notification_type'];
  const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'delivered_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortColumn} ${order}`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limitNum);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  // Execute query
  const result = await pool.query(query, params);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1';
  const countParams: any[] = [userId];
  let countParamNum = 1;

  if (type) {
    countParamNum++;
    countQuery += ` AND notification_type = $${countParamNum}`;
    countParams.push(type);
  }

  if (isRead !== undefined) {
    countParamNum++;
    countQuery += ` AND is_read = $${countParamNum}`;
    countParams.push(isRead === 'true');
  }

  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count, 10);

  return paginated(res, result.rows, pageNum, total, limitNum, 'Notifications retrieved successfully');
}));

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for the bell icon
 */
router.get('/unread-count', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );

  const count = parseInt(result.rows[0].count, 10);

  return success(res, { count }, 'Unread count retrieved');
}));

/**
 * POST /api/notifications/:notificationId/read
 * Mark a specific notification as read
 */
router.post('/:notificationId/read', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { notificationId } = req.params;

  // Verify notification belongs to user and mark as read
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true, read_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2 AND is_read = false
     RETURNING id`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Notification not found or already read');
  }

  return success(res, { notificationId: result.rows[0].id }, 'Notification marked as read');
}));

/**
 * POST /api/notifications/read-all
 * Mark all user's notifications as read
 */
router.post('/read-all', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await pool.query(
    `UPDATE notifications
     SET is_read = true, read_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND is_read = false
     RETURNING id`,
    [userId]
  );

  const count = result.rows.length;

  return success(res, { markedCount: count }, `${count} notifications marked as read`);
}));

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences for all notification types
 */
router.get('/preferences', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await pool.query(
    `SELECT notification_type, push_enabled, sms_enabled, email_enabled, in_app_enabled,
            quiet_hours_enabled, quiet_hours_start, quiet_hours_end
     FROM notification_preferences
     WHERE user_id = $1
     ORDER BY notification_type`,
    [userId]
  );

  return success(res, { preferences: result.rows }, 'Preferences retrieved successfully');
}));

/**
 * PUT /api/notifications/preferences/:notificationType
 * Update notification preferences for a specific notification type
 */
router.put('/preferences/:notificationType', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { notificationType } = req.params;
  const {
    pushEnabled,
    smsEnabled,
    emailEnabled,
    inAppEnabled,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
  } = req.body;

  // Validate notification type exists
  const validTypes = [
    'offer_received', 'offer_expiring', 'delivery_approaching', 'delivery_completed',
    'order_auto_completed', 'rental_handover_due', 'rental_return_reminder', 'window_confirmed',
    'rfq_received', 'offer_accepted', 'direct_order_placed', 'delivery_due_today',
    'buyer_confirmed_delivery', 'buyer_reported_issue', 'catalog_prices_stale',
    'unanswered_rfqs_summary', 'disputes_summary', 'platform_health_report',
    'order_confirmed', 'delivery_scheduled', 'confirmation_reminder', 'dispute_raised',
    'payment_due', 'rental_due', 'return_reminder', 'system_message',
  ];

  if (!validTypes.includes(notificationType)) {
    throw new ValidationError('Invalid notification type');
  }

  // Upsert preferences
  const result = await pool.query(
    `INSERT INTO notification_preferences (
       user_id, notification_type, push_enabled, sms_enabled, email_enabled, in_app_enabled,
       quiet_hours_enabled, quiet_hours_start, quiet_hours_end
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, notification_type)
     DO UPDATE SET
       push_enabled = COALESCE($3, notification_preferences.push_enabled),
       sms_enabled = COALESCE($4, notification_preferences.sms_enabled),
       email_enabled = COALESCE($5, notification_preferences.email_enabled),
       in_app_enabled = COALESCE($6, notification_preferences.in_app_enabled),
       quiet_hours_enabled = COALESCE($7, notification_preferences.quiet_hours_enabled),
       quiet_hours_start = COALESCE($8, notification_preferences.quiet_hours_start),
       quiet_hours_end = COALESCE($9, notification_preferences.quiet_hours_end),
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      notificationType,
      pushEnabled,
      smsEnabled,
      emailEnabled,
      inAppEnabled,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    ]
  );

  return success(res, { preference: result.rows[0] }, 'Preferences updated successfully');
}));

/**
 * POST /api/notifications/register-device
 * Register a device token for push notifications
 */
router.post('/register-device', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { token, deviceType, deviceName } = req.body;

  if (!token || !deviceType) {
    throw new ValidationError('Token and deviceType are required');
  }

  if (!['web', 'ios', 'android'].includes(deviceType)) {
    throw new ValidationError('Invalid deviceType. Must be: web, ios, or android');
  }

  const success_result = await notificationService.registerDeviceToken(
    userId,
    token,
    deviceType,
    deviceName
  );

  if (!success_result) {
    throw new Error('Failed to register device token');
  }

  return success(res, { registered: true }, 'Device token registered successfully');
}));

/**
 * POST /api/notifications/unregister-device
 * Unregister a device token (e.g., on logout)
 */
router.post('/unregister-device', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('Token is required');
  }

  const success_result = await notificationService.unregisterDeviceToken(userId, token);

  if (!success_result) {
    throw new Error('Failed to unregister device token');
  }

  return success(res, { unregistered: true }, 'Device token unregistered successfully');
}));

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification (soft delete by setting expires_at)
 */
router.delete('/:notificationId', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { notificationId } = req.params;

  const result = await pool.query(
    `UPDATE notifications
     SET expires_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Notification not found');
  }

  return success(res, { deleted: true }, 'Notification deleted successfully');
}));

export default router;
