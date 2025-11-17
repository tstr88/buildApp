/**
 * Buyers Controller
 * Handles buyer-specific endpoints
 */

import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * GET /api/buyers/home
 * Get buyer home screen data
 */
export async function getBuyerHome(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;

    // Get published templates
    const templatesResult = await pool.query(
      `SELECT
        id,
        slug,
        title_ka,
        title_en,
        description_ka,
        description_en,
        category,
        estimated_duration_days,
        difficulty_level,
        images
       FROM templates
       WHERE is_published = true
       ORDER BY created_at DESC
       LIMIT 10`
    );

    // Get user stats
    const statsResult = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM projects WHERE user_id = $1 AND is_active = true) as active_projects,
        (SELECT COUNT(*) FROM rfqs WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1) AND status = 'active') as active_rfqs,
        (SELECT COUNT(*) FROM orders WHERE buyer_id = $1 AND status IN ('pending', 'confirmed')) as pending_orders`,
      [userId]
    );

    // Get recent activity (last 5 items)
    const activityResult = await pool.query(
      `SELECT
        'rfq' as type,
        r.id,
        p.name as title,
        r.created_at as date
       FROM rfqs r
       JOIN projects p ON r.project_id = p.id
       WHERE p.user_id = $1
       UNION ALL
       SELECT
        'order' as type,
        o.id,
        o.order_number as title,
        o.created_at as date
       FROM orders o
       WHERE o.buyer_id = $1
       ORDER BY date DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        user_type: req.user.user_type,
      },
      templates: templatesResult.rows,
      stats: {
        active_projects: parseInt(statsResult.rows[0]?.active_projects || '0'),
        active_rfqs: parseInt(statsResult.rows[0]?.active_rfqs || '0'),
        pending_orders: parseInt(statsResult.rows[0]?.pending_orders || '0'),
      },
      recent_activity: activityResult.rows,
    });
  } catch (error) {
    console.error('Get buyer home error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load home data',
    });
  }
}

/**
 * GET /api/buyers/dashboard
 * Get buyer dashboard with detailed stats
 */
export async function getBuyerDashboard(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;

    // Get comprehensive dashboard stats
    const dashboardResult = await pool.query(
      `SELECT
        -- Projects
        (SELECT COUNT(*) FROM projects WHERE user_id = $1) as total_projects,
        (SELECT COUNT(*) FROM projects WHERE user_id = $1 AND is_active = true) as active_projects,

        -- RFQs
        (SELECT COUNT(*) FROM rfqs WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)) as total_rfqs,
        (SELECT COUNT(*) FROM rfqs WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1) AND status = 'active') as active_rfqs,

        -- Orders
        (SELECT COUNT(*) FROM orders WHERE buyer_id = $1) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE buyer_id = $1 AND status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE buyer_id = $1 AND status = 'completed') as completed_orders,
        (SELECT COALESCE(SUM(grand_total), 0) FROM orders WHERE buyer_id = $1 AND status = 'completed') as total_spent,

        -- Rental bookings
        (SELECT COUNT(*) FROM rental_bookings WHERE buyer_id = $1) as total_rentals,
        (SELECT COUNT(*) FROM rental_bookings WHERE buyer_id = $1 AND status = 'active') as active_rentals`,
      [userId]
    );

    res.json({
      success: true,
      dashboard: dashboardResult.rows[0],
    });
  } catch (error) {
    console.error('Get buyer dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard',
    });
  }
}
