/**
 * RFQs Controller
 * Handles Request for Quote endpoints for buyers
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { emitRFQCreated } from '../websocket';
import { notifyRfqReceived } from '../services/NotificationHelpers';

interface RFQLine {
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  spec_notes?: string;
}

interface CreateRFQRequest {
  project_id?: string; // Optional - RFQs can be created without a project
  title?: string;
  lines: RFQLine[];
  preferred_window_start?: string;
  preferred_window_end?: string;
  delivery_location_lat?: number;
  delivery_location_lng?: number;
  delivery_address?: string;
  delivery_preference?: string;
  additional_notes?: string;
  supplier_ids: string[];
  expires_in_days?: number;
}

/**
 * GET /api/buyers/rfqs
 * Get buyer's RFQs with filters
 */
export async function getRFQs(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const { status, project_id } = req.query;

    console.log('[Buyer RFQs] Fetching RFQs for user:', userId, 'status filter:', status);

    let query = `
      SELECT
        r.id,
        r.user_id,
        r.project_id,
        r.title,
        r.lines,
        r.preferred_window_start,
        r.preferred_window_end,
        r.delivery_location_lat,
        r.delivery_location_lng,
        r.delivery_address,
        r.additional_notes,
        r.status,
        r.expires_at,
        r.created_at,
        r.updated_at,
        p.name as project_name,
        p.latitude as project_latitude,
        p.longitude as project_longitude,
        (SELECT COUNT(*) FROM rfq_recipients WHERE rfq_id = r.id) as supplier_count,
        (SELECT COUNT(*) FROM offers WHERE rfq_id = r.id) as offer_count,
        (SELECT COUNT(*) FROM offers WHERE rfq_id = r.id AND status = 'pending') as unread_offer_count
      FROM rfqs r
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE r.user_id = $1
    `;

    const queryParams: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND r.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (project_id) {
      query += ` AND r.project_id = $${paramIndex}`;
      queryParams.push(project_id);
      paramIndex++;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, queryParams);

    console.log('[Buyer RFQs] Found', result.rows.length, 'RFQs for user', userId);
    if (result.rows.length > 0) {
      console.log('[Buyer RFQs] First RFQ:', result.rows[0].id, result.rows[0].title, 'offer_count:', result.rows[0].offer_count);
    }

    res.json({
      success: true,
      data: result.rows,
      message: 'RFQs retrieved successfully',
    });
  } catch (error) {
    console.error('Get RFQs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve RFQs',
    });
  }
}

/**
 * GET /api/buyers/rfqs/:id
 * Get RFQ detail with offers
 */
export async function getRFQById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const { id } = req.params;

    // Get RFQ with project info
    const rfqResult = await pool.query(
      `SELECT
        r.*,
        p.name as project_name,
        p.latitude as project_latitude,
        p.longitude as project_longitude,
        p.address as project_address
      FROM rfqs r
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (rfqResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'RFQ not found',
      });
      return;
    }

    const rfq = rfqResult.rows[0];

    // Get recipients (suppliers sent to)
    const recipientsResult = await pool.query(
      `SELECT
        rr.id,
        rr.rfq_id,
        rr.supplier_id,
        rr.viewed_at,
        rr.notified_at,
        s.business_name_ka,
        s.business_name_en,
        s.logo_url,
        s.depot_latitude,
        s.depot_longitude,
        u.phone as supplier_phone
      FROM rfq_recipients rr
      JOIN suppliers s ON rr.supplier_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE rr.rfq_id = $1
      ORDER BY rr.notified_at DESC`,
      [id]
    );

    // Get offers
    const offersResult = await pool.query(
      `SELECT
        o.id,
        o.rfq_id,
        o.supplier_id,
        o.line_prices,
        o.total_amount,
        o.delivery_window_start,
        o.delivery_window_end,
        o.payment_terms,
        o.delivery_fee,
        o.notes,
        o.expires_at,
        o.status,
        o.accepted_at,
        o.rejected_at,
        o.rejection_reason,
        o.created_at,
        s.business_name_ka,
        s.business_name_en,
        s.logo_url,
        s.depot_latitude,
        s.depot_longitude
      FROM offers o
      JOIN suppliers s ON o.supplier_id = s.id
      WHERE o.rfq_id = $1
      ORDER BY o.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...rfq,
        recipients: recipientsResult.rows,
        offers: offersResult.rows,
      },
      message: 'RFQ retrieved successfully',
    });
  } catch (error) {
    console.error('Get RFQ by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve RFQ',
    });
  }
}

/**
 * POST /api/buyers/rfqs
 * Create a new RFQ
 */
export async function createRFQ(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const {
      project_id,
      title,
      lines,
      preferred_window_start,
      preferred_window_end,
      delivery_location_lat,
      delivery_location_lng,
      delivery_address,
      delivery_preference = 'delivery',
      additional_notes,
      supplier_ids,
      expires_in_days = 7,
    }: CreateRFQRequest = req.body;

    // Validation
    if (!lines || lines.length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one line item is required',
      });
      return;
    }

    if (lines.length > 50) {
      res.status(400).json({
        success: false,
        error: 'Maximum 50 line items allowed',
      });
      return;
    }

    if (!supplier_ids || supplier_ids.length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one supplier must be selected',
      });
      return;
    }

    if (supplier_ids.length > 5) {
      res.status(400).json({
        success: false,
        error: 'Maximum 5 suppliers allowed',
      });
      return;
    }

    // Check project ownership (if project_id is provided)
    if (project_id) {
      const projectCheck = await pool.query(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [project_id, userId]
      );

      if (projectCheck.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Create RFQ
    const rfqResult = await pool.query(
      `INSERT INTO rfqs (
        user_id,
        project_id,
        title,
        lines,
        preferred_window_start,
        preferred_window_end,
        delivery_location_lat,
        delivery_location_lng,
        delivery_address,
        delivery_preference,
        additional_notes,
        status,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        userId,
        project_id || null,
        title,
        JSON.stringify(lines),
        preferred_window_start,
        preferred_window_end,
        delivery_location_lat,
        delivery_location_lng,
        delivery_address,
        delivery_preference,
        additional_notes,
        'active',
        expiresAt,
      ]
    );

    const rfq = rfqResult.rows[0];

    // Create RFQ recipients
    const recipientValues = supplier_ids.map((supplierId) => `('${rfq.id}', '${supplierId}')`).join(',');
    await pool.query(
      `INSERT INTO rfq_recipients (rfq_id, supplier_id) VALUES ${recipientValues}`
    );

    // Update project materials status to 'rfq_sent' if they were linked
    const projectMaterialIds = lines
      .filter((line: any) => line.project_material_id)
      .map((line: any) => line.project_material_id);

    if (projectMaterialIds.length > 0) {
      await pool.query(
        `UPDATE project_materials
         SET status = 'rfq_sent', rfq_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($2)`,
        [rfq.id, projectMaterialIds]
      );
    }

    // Get user_ids for the suppliers to send WebSocket notifications
    const supplierUsersResult = await pool.query(
      `SELECT user_id FROM suppliers WHERE id = ANY($1)`,
      [supplier_ids]
    );
    const supplierUserIds = supplierUsersResult.rows.map((row) => row.user_id);

    // Send real-time notifications to suppliers
    if (supplierUserIds.length > 0) {
      emitRFQCreated(rfq.id, supplierUserIds);
    }

    // Get buyer type for notification
    const buyerResult = await pool.query(
      `SELECT user_type FROM users WHERE id = $1`,
      [userId]
    );
    const buyerType = buyerResult.rows[0]?.user_type || 'buyer';
    const location = delivery_address || 'Unknown location';

    // Send bell notifications to each supplier
    console.log(`[RFQ] Sending bell notifications to ${supplierUserIds.length} suppliers for RFQ ${rfq.id}`);
    for (const supplierUserId of supplierUserIds) {
      console.log(`[RFQ] Calling notifyRfqReceived for supplier user ${supplierUserId}`);
      notifyRfqReceived(supplierUserId, buyerType, location, rfq.id);
    }

    res.status(201).json({
      success: true,
      data: rfq,
      message: 'RFQ created successfully',
    });
  } catch (error) {
    console.error('Create RFQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create RFQ',
    });
  }
}

/**
 * DELETE /api/buyers/rfqs/:id
 * Cancel an RFQ (only if no offers received yet)
 */
export async function deleteRFQ(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const { id } = req.params;

    // Check ownership and offers
    const rfqCheck = await pool.query(
      `SELECT r.id, r.status,
        (SELECT COUNT(*) FROM offers WHERE rfq_id = r.id) as offer_count
      FROM rfqs r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = $1 AND p.user_id = $2`,
      [id, userId]
    );

    if (rfqCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'RFQ not found',
      });
      return;
    }

    const rfq = rfqCheck.rows[0];

    if (rfq.offer_count > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete RFQ with offers. Please close it instead.',
      });
      return;
    }

    // Delete RFQ (cascade will delete recipients)
    await pool.query('DELETE FROM rfqs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'RFQ deleted successfully',
    });
  } catch (error) {
    console.error('Delete RFQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete RFQ',
    });
  }
}

/**
 * PUT /api/buyers/rfqs/:id/close
 * Close an RFQ
 */
export async function closeRFQ(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const { id } = req.params;

    // Check ownership
    const rfqCheck = await pool.query(
      `SELECT r.id
      FROM rfqs r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = $1 AND p.user_id = $2`,
      [id, userId]
    );

    if (rfqCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'RFQ not found',
      });
      return;
    }

    // Update status to closed
    await pool.query(
      'UPDATE rfqs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['closed', id]
    );

    res.json({
      success: true,
      message: 'RFQ closed successfully',
    });
  } catch (error) {
    console.error('Close RFQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close RFQ',
    });
  }
}

/**
 * GET /api/buyers/rfqs/stats
 * Get RFQ statistics for buyer dashboard
 */
export async function getRFQStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        COUNT(CASE WHEN r.status = 'active' THEN 1 END)::int as active_count,
        COUNT(CASE WHEN r.status = 'expired' THEN 1 END)::int as expired_count,
        COUNT(CASE WHEN r.status = 'closed' THEN 1 END)::int as closed_count,
        (SELECT COUNT(*) FROM offers o
          JOIN rfqs r2 ON o.rfq_id = r2.id
          JOIN projects p2 ON r2.project_id = p2.id
          WHERE p2.user_id = $1 AND o.status = 'pending')::int as pending_offers_count
      FROM rfqs r
      JOIN projects p ON r.project_id = p.id
      WHERE p.user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'RFQ stats retrieved successfully',
    });
  } catch (error) {
    console.error('Get RFQ stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve RFQ stats',
    });
  }
}
