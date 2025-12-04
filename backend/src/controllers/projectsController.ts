/**
 * Projects Controller
 * Handles project management endpoints for buyers
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { Project } from '../types/database';

// Georgia bounds for coordinate validation
const GEORGIA_BOUNDS = {
  minLat: 41.0,
  maxLat: 43.6,
  minLng: 40.0,
  maxLng: 46.8,
};

/**
 * GET /api/buyers/projects
 * Get buyer's projects with summary data
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;

    // Get projects with counts of related entities
    const result = await pool.query(
      `SELECT
        p.id,
        p.name,
        p.latitude,
        p.longitude,
        p.address,
        p.notes,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(rfq_count.count, 0)::int as rfq_count,
        COALESCE(order_count.count, 0)::int as order_count,
        COALESCE(delivery_count.count, 0)::int as delivery_count,
        COALESCE(rental_count.count, 0)::int as rental_count
       FROM projects p
       LEFT JOIN (
         SELECT project_id, COUNT(*) as count
         FROM rfqs
         GROUP BY project_id
       ) rfq_count ON p.id = rfq_count.project_id
       LEFT JOIN (
         SELECT project_id, COUNT(*) as count
         FROM orders
         WHERE project_id IS NOT NULL
         GROUP BY project_id
       ) order_count ON p.id = order_count.project_id
       LEFT JOIN (
         SELECT o.project_id, COUNT(*) as count
         FROM delivery_events de
         JOIN orders o ON de.order_id = o.id
         WHERE o.project_id IS NOT NULL
         GROUP BY o.project_id
       ) delivery_count ON p.id = delivery_count.project_id
       LEFT JOIN (
         SELECT project_id, COUNT(*) as count
         FROM rental_bookings
         WHERE project_id IS NOT NULL
         GROUP BY project_id
       ) rental_count ON p.id = rental_count.project_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'Projects retrieved successfully',
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load projects',
    });
  }
}

/**
 * GET /api/buyers/projects/:id
 * Get project detail with all related entities
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const projectId = req.params.id;

    // Get project details
    const projectResult = await pool.query<Project>(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    // Get RFQs for this project
    const rfqsResult = await pool.query(
      `SELECT
        r.id,
        r.title,
        r.status,
        r.created_at,
        r.expires_at,
        (SELECT COUNT(*) FROM offers WHERE rfq_id = r.id) as offer_count
      FROM rfqs r
      WHERE r.project_id = $1
      ORDER BY r.created_at DESC`,
      [projectId]
    );

    // Get orders for this project
    const ordersResult = await pool.query(
      `SELECT
        o.id,
        o.order_number,
        o.status,
        o.grand_total,
        o.created_at,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      WHERE o.project_id = $1
      ORDER BY o.created_at DESC`,
      [projectId]
    );

    // Get deliveries for this project
    const deliveriesResult = await pool.query(
      `SELECT
        de.id,
        de.timestamp as delivered_at,
        de.delivery_notes as notes,
        de.driver_name as delivered_by_name,
        o.order_number,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name
      FROM delivery_events de
      JOIN orders o ON de.order_id = o.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      WHERE o.project_id = $1
      ORDER BY de.timestamp DESC`,
      [projectId]
    );

    // Get rental bookings for this project
    const rentalsResult = await pool.query(
      `SELECT
        rb.id,
        rb.status,
        rb.start_date,
        rb.end_date,
        rb.total_cost,
        rt.name_en as tool_name,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name
      FROM rental_bookings rb
      LEFT JOIN rental_tools rt ON rb.rental_tool_id = rt.id
      LEFT JOIN suppliers s ON rb.supplier_id = s.id
      WHERE rb.project_id = $1
      ORDER BY rb.created_at DESC`,
      [projectId]
    );

    res.json({
      success: true,
      data: {
        project: projectResult.rows[0],
        rfqs: rfqsResult.rows,
        orders: ordersResult.rows,
        deliveries: deliveriesResult.rows,
        rentals: rentalsResult.rows,
      },
      message: 'Project details retrieved successfully',
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load project details',
    });
  }
}

/**
 * POST /api/buyers/projects
 * Create a new project
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const { name, latitude, longitude, address, notes } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({
        success: false,
        error: 'Project name must be 100 characters or less',
      });
      return;
    }

    // Validate coordinates if provided
    if (latitude !== undefined && longitude !== undefined) {
      if (
        latitude < GEORGIA_BOUNDS.minLat ||
        latitude > GEORGIA_BOUNDS.maxLat ||
        longitude < GEORGIA_BOUNDS.minLng ||
        longitude > GEORGIA_BOUNDS.maxLng
      ) {
        res.status(400).json({
          success: false,
          error: 'Coordinates must be within Georgia bounds',
        });
        return;
      }
    }

    // Both latitude and longitude must be provided together or neither
    if ((latitude !== undefined && longitude === undefined) || (latitude === undefined && longitude !== undefined)) {
      res.status(400).json({
        success: false,
        error: 'Both latitude and longitude must be provided',
      });
      return;
    }

    // Create project
    const result = await pool.query<Project>(
      `INSERT INTO projects (user_id, name, latitude, longitude, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name.trim(), latitude || null, longitude || null, address || null, notes || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
}

/**
 * PUT /api/buyers/projects/:id
 * Update an existing project
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const projectId = req.params.id;
    const { name, latitude, longitude, address, notes } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (existingProject.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    // Validation
    if (name !== undefined && (name.trim().length === 0 || name.length > 100)) {
      res.status(400).json({
        success: false,
        error: 'Project name must be between 1 and 100 characters',
      });
      return;
    }

    // Validate coordinates if provided
    if (latitude !== undefined && longitude !== undefined) {
      if (
        latitude < GEORGIA_BOUNDS.minLat ||
        latitude > GEORGIA_BOUNDS.maxLat ||
        longitude < GEORGIA_BOUNDS.minLng ||
        longitude > GEORGIA_BOUNDS.maxLng
      ) {
        res.status(400).json({
          success: false,
          error: 'Coordinates must be within Georgia bounds',
        });
        return;
      }
    }

    // Both latitude and longitude must be provided together or neither
    if ((latitude !== undefined && longitude === undefined) || (latitude === undefined && longitude !== undefined)) {
      res.status(400).json({
        success: false,
        error: 'Both latitude and longitude must be provided',
      });
      return;
    }

    // Update project
    const result = await pool.query<Project>(
      `UPDATE projects
       SET
         name = COALESCE($1, name),
         latitude = COALESCE($2, latitude),
         longitude = COALESCE($3, longitude),
         address = COALESCE($4, address),
         notes = COALESCE($5, notes)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        name?.trim() || null,
        latitude !== undefined ? latitude : null,
        longitude !== undefined ? longitude : null,
        address !== undefined ? address : null,
        notes !== undefined ? notes : null,
        projectId,
        userId,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
}

/**
 * DELETE /api/buyers/projects/:id
 * Soft delete a project (only if no active orders)
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const projectId = req.params.id;

    // Check if project exists and belongs to user
    const existingProject = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (existingProject.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    // Check for active orders
    const activeOrdersResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE project_id = $1
         AND status IN ('pending', 'confirmed', 'in_transit')`,
      [projectId]
    );

    const activeOrderCount = parseInt(activeOrdersResult.rows[0].count);

    if (activeOrderCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete project with active orders',
      });
      return;
    }

    // Check for active RFQs
    const activeRfqsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM rfqs
       WHERE project_id = $1
         AND status = 'active'`,
      [projectId]
    );

    const activeRfqCount = parseInt(activeRfqsResult.rows[0].count);

    if (activeRfqCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete project with active RFQs',
      });
      return;
    }

    // Check for active rentals
    const activeRentalsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM rental_bookings
       WHERE project_id = $1
         AND status IN ('pending', 'confirmed', 'active')`,
      [projectId]
    );

    const activeRentalCount = parseInt(activeRentalsResult.rows[0].count);

    if (activeRentalCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete project with active rental bookings',
      });
      return;
    }

    // Soft delete by setting is_active to false
    await pool.query(
      `UPDATE projects SET is_active = false WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
}
