/**
 * Performance Monitoring Admin Routes
 * Admin-only endpoints for viewing performance metrics
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getPerformanceStats, getSlowRequests, resetMetrics } from '../../middleware/performanceMonitoring';
import { success } from '../../utils/responseHelpers';

const router = Router();

/**
 * GET /api/admin/performance/stats
 * Get overall performance statistics
 */
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const stats = getPerformanceStats();
    return success(res, stats, 'Performance statistics retrieved successfully');
  })
);

/**
 * GET /api/admin/performance/slow
 * Get recent slow requests
 */
router.get(
  '/slow',
  asyncHandler(async (req, res) => {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : undefined;
    const slowRequests = getSlowRequests(threshold);
    return success(res, { requests: slowRequests, threshold }, 'Slow requests retrieved successfully');
  })
);

/**
 * POST /api/admin/performance/reset
 * Reset performance metrics
 */
router.post(
  '/reset',
  asyncHandler(async (_req, res) => {
    resetMetrics();
    return success(res, null, 'Performance metrics reset successfully');
  })
);

export default router;
