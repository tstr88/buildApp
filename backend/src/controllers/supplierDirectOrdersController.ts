/**
 * Supplier Direct Orders Controller
 * Handle direct order management for suppliers
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { getRelativeTime } from '../utils/dateUtils';
import { emitWindowProposed, emitWindowAccepted, emitOrderStatusChanged, emitOrderUpdated } from '../websocket';

/**
 * GET /api/suppliers/orders/direct?tab=new|scheduled|in_progress|completed
 * Get direct orders list with tab filtering
 */
export async function getDirectOrders(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tab = (req.query.tab as string) || 'new';
    const client = await pool.connect();

    try {
      // First get the supplier_id for this user
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Map tabs to status conditions
      let statusCondition = '';
      switch (tab) {
        case 'new':
          statusCondition = "AND o.status = 'pending'";
          break;
        case 'scheduled':
          statusCondition = "AND o.status = 'confirmed'";
          break;
        case 'in_progress':
          statusCondition = "AND o.status = 'in_transit'";
          break;
        case 'completed':
          statusCondition = "AND o.status IN ('delivered', 'completed')";
          break;
      }

      // Get orders
      const ordersResult = await client.query(
        `SELECT
          o.id,
          o.order_number as order_id,
          u.name as buyer_name,
          COALESCE(u.buyer_role::text, 'contractor') as buyer_type,
          COALESCE(jsonb_array_length(o.items), 0) as item_count,
          o.total_amount,
          o.pickup_or_delivery as delivery_type,
          o.status,
          o.promised_window_start as scheduled_window_start,
          o.promised_window_end as scheduled_window_end,
          o.created_at
        FROM orders o
        INNER JOIN users u ON u.id = o.buyer_id
        WHERE o.supplier_id = $1
          ${statusCondition}
        ORDER BY o.created_at DESC
        LIMIT 100`,
        [supplierId]
      );

      // Get counts for all tabs
      const countsResult = await client.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'pending') as new,
          COUNT(*) FILTER (WHERE status = 'confirmed') as scheduled,
          COUNT(*) FILTER (WHERE status = 'in_transit') as in_progress,
          COUNT(*) FILTER (WHERE status IN ('delivered', 'completed')) as completed
        FROM orders
        WHERE supplier_id = $1`,
        [supplierId]
      );

      const orders = ordersResult.rows.map((row) => ({
        id: row.id,
        order_id: row.order_id,
        buyer_type: row.buyer_type,
        buyer_name: row.buyer_name,
        item_count: parseInt(row.item_count, 10),
        total_amount: parseFloat(row.total_amount),
        delivery_type: row.delivery_type,
        status: row.status,
        scheduled_window_start: row.scheduled_window_start,
        scheduled_window_end: row.scheduled_window_end,
        created_at: row.created_at,
        relative_time: getRelativeTime(row.created_at),
      }));

      const counts = {
        new: parseInt(countsResult.rows[0].new, 10),
        scheduled: parseInt(countsResult.rows[0].scheduled, 10),
        in_progress: parseInt(countsResult.rows[0].in_progress, 10),
        completed: parseInt(countsResult.rows[0].completed, 10),
      };

      res.json({ orders, counts });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching direct orders:', error);
    res.status(500).json({ error: 'Failed to fetch direct orders' });
  }
}

/**
 * GET /api/suppliers/orders/:orderId
 * Get detailed order information
 */
export async function getDirectOrderDetail(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { orderId } = req.params;
    const client = await pool.connect();

    try {
      // First get the supplier_id for this user
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Get order details
      const orderResult = await client.query(
        `SELECT
          o.id,
          o.order_number as order_id,
          u.name as buyer_name,
          u.phone as buyer_phone,
          COALESCE(u.buyer_role::text, 'contractor') as buyer_type,
          o.total_amount,
          o.pickup_or_delivery as delivery_type,
          o.delivery_address,
          o.delivery_latitude as delivery_lat,
          o.delivery_longitude as delivery_lng,
          o.status,
          o.promised_window_start as scheduled_window_start,
          o.promised_window_end as scheduled_window_end,
          o.proposed_window_start,
          o.proposed_window_end,
          o.proposed_by,
          o.proposal_status,
          o.created_at,
          o.items,
          o.notes as internal_notes
        FROM orders o
        INNER JOIN users u ON u.id = o.buyer_id
        WHERE o.order_number = $1 AND o.supplier_id = $2`,
        [orderId, supplierId]
      );

      if (orderResult.rows.length === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const order = orderResult.rows[0];

      const orderDetail = {
        id: order.id,
        order_id: order.order_id,
        buyer_name: order.buyer_name,
        buyer_phone: order.buyer_phone,
        buyer_type: order.buyer_type,
        items: order.items || [],
        total_amount: parseFloat(order.total_amount),
        delivery_type: order.delivery_type,
        delivery_address: order.delivery_address,
        delivery_location:
          order.delivery_lat && order.delivery_lng
            ? { lat: parseFloat(order.delivery_lat), lng: parseFloat(order.delivery_lng) }
            : null,
        status: order.status,
        scheduled_window_start: order.scheduled_window_start,
        scheduled_window_end: order.scheduled_window_end,
        proposed_window_start: order.proposed_window_start,
        proposed_window_end: order.proposed_window_end,
        proposed_by: order.proposed_by,
        proposal_status: order.proposal_status,
        created_at: order.created_at,
        internal_notes: order.internal_notes,
      };

      res.json(orderDetail);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ error: 'Failed to fetch order detail' });
  }
}

/**
 * POST /api/suppliers/orders/:orderId/propose-window
 * Propose delivery/pickup window
 */
export async function proposeWindow(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { orderId } = req.params;
    const { window_start, window_end } = req.body;

    if (!window_start || !window_end) {
      res.status(400).json({ error: 'window_start and window_end are required' });
      return;
    }

    const client = await pool.connect();

    try {
      // First get the supplier_id for this user
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Verify order belongs to supplier
      const orderResult = await client.query(
        `SELECT id, status, buyer_id FROM orders WHERE order_number = $1 AND supplier_id = $2`,
        [orderId, supplierId]
      );

      if (orderResult.rows.length === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const order = orderResult.rows[0];

      // Create proposal (don't confirm yet - buyer needs to accept)
      await client.query(
        `UPDATE orders
        SET proposed_window_start = $1,
            proposed_window_end = $2,
            proposed_by = 'supplier',
            proposal_status = 'pending',
            updated_at = NOW()
        WHERE id = $3`,
        [window_start, window_end, order.id]
      );

      // Emit WebSocket event to buyer
      emitWindowProposed({
        order_number: orderId,
        order_id: order.id,
        proposed_window_start: window_start,
        proposed_window_end: window_end,
        proposed_by: 'supplier',
      }, order.buyer_id);

      res.json({ success: true, message: 'Window proposed successfully. Waiting for buyer confirmation.' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error proposing window:', error);
    res.status(500).json({ error: 'Failed to propose window' });
  }
}

/**
 * POST /api/suppliers/orders/:orderId/accept-window
 * Accept buyer's counter-proposed window
 */
export async function acceptBuyerWindow(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { orderId } = req.params;
    const client = await pool.connect();

    try {
      // First get the supplier_id for this user
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Verify order and check for pending buyer proposal
      const orderResult = await client.query(
        `SELECT id, proposed_window_start, proposed_window_end, proposal_status, proposed_by
         FROM orders
         WHERE order_number = $1 AND supplier_id = $2`,
        [orderId, supplierId]
      );

      if (orderResult.rows.length === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const order = orderResult.rows[0];

      if (!order.proposed_window_start || order.proposal_status !== 'pending' || order.proposed_by !== 'buyer') {
        res.status(400).json({ error: 'No pending buyer proposal to accept' });
        return;
      }

      // Get buyer_id for WebSocket notification
      const buyerIdResult = await client.query(
        'SELECT buyer_id FROM orders WHERE id = $1',
        [order.id]
      );
      const buyerId = buyerIdResult.rows[0].buyer_id;

      // Accept buyer's proposal: move proposed times to confirmed times
      await client.query(
        `UPDATE orders
         SET promised_window_start = proposed_window_start,
             promised_window_end = proposed_window_end,
             proposal_status = 'accepted',
             status = 'confirmed',
             updated_at = NOW()
         WHERE id = $1`,
        [order.id]
      );

      // Emit WebSocket event - only the specific event, no generic status change
      emitWindowAccepted({
        order_number: orderId,
        order_id: order.id,
        status: 'confirmed',
      }, buyerId);

      res.json({ success: true, message: 'Buyer window proposal accepted' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error accepting buyer window:', error);
    res.status(500).json({ error: 'Failed to accept buyer window' });
  }
}

/**
 * POST /api/suppliers/orders/:orderId/checklist
 * Update prep checklist
 */
export async function updateChecklist(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { orderId } = req.params;
    const { checklist } = req.body;

    const client = await pool.connect();

    try {
      // First get the supplier_id for this user
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      await client.query(
        `UPDATE orders
        SET notes = $1,
            updated_at = NOW()
        WHERE order_number = $2 AND supplier_id = $3`,
        [JSON.stringify(checklist), orderId, supplierId]
      );

      res.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ error: 'Failed to update checklist' });
  }
}

/**
 * POST /api/suppliers/orders/:orderId/upload-photos
 * Upload delivery photos
 */
export async function uploadPhotos(req: Request, res: Response): Promise<void> {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // TODO: Implement actual file upload to storage (S3, local, etc.)
    // For now, return mock URLs
    const photoUrls = [
      `/uploads/deliveries/${Date.now()}_1.jpg`,
      `/uploads/deliveries/${Date.now()}_2.jpg`,
      `/uploads/deliveries/${Date.now()}_3.jpg`,
    ];

    res.json({ photoUrls: photoUrls.slice(0, req.files ? (req.files as any[]).length : 0) });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
}

/**
 * POST /api/suppliers/orders/:orderId/mark-delivered
 * Mark order as delivered with photo proof
 */
export async function markDelivered(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { orderId } = req.params;
    const { photos, quantities_delivered, timestamp, notes } = req.body;

    if (!photos || photos.length === 0) {
      res.status(400).json({ error: 'At least one photo is required' });
      return;
    }

    if (!quantities_delivered) {
      res.status(400).json({ error: 'quantities_delivered is required' });
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // First get the supplier_id for this user
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (supplierResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Verify order belongs to supplier
      const orderResult = await client.query(
        `SELECT id, status, buyer_id FROM orders WHERE order_number = $1 AND supplier_id = $2`,
        [orderId, supplierId]
      );

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const order = orderResult.rows[0];

      // Calculate confirmation deadline (24 hours from now)
      const confirmationDeadline = new Date();
      confirmationDeadline.setHours(confirmationDeadline.getHours() + 24);

      // Create delivery event
      await client.query(
        `INSERT INTO delivery_events (
          order_id,
          delivered_at,
          photos,
          quantities_delivered,
          notes,
          confirmation_deadline,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          order.id,
          timestamp || new Date(),
          JSON.stringify(photos),
          JSON.stringify(quantities_delivered),
          notes || null,
          confirmationDeadline,
        ]
      );

      // Update order status
      await client.query(
        `UPDATE orders
        SET status = 'delivered',
            updated_at = NOW()
        WHERE id = $1`,
        [order.id]
      );

      await client.query('COMMIT');

      // Emit WebSocket event to buyer - only status change, not generic update
      emitOrderStatusChanged({
        order_number: orderId,
        order_id: order.id,
        status: 'delivered',
      }, order.buyer_id, userId);

      res.json({
        success: true,
        message: 'Order marked as delivered',
        confirmation_deadline: confirmationDeadline,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error marking delivered:', error);
    res.status(500).json({ error: 'Failed to mark order as delivered' });
  }
}
