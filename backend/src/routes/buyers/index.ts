/**
 * Buyers API routes
 * Endpoints for buyer-specific functionality
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../../controllers/projectsController';
import { getBuyerHome, getBuyerDashboard } from '../../controllers/buyersController';
import {
  getRFQs,
  getRFQById,
  createRFQ,
  deleteRFQ,
  closeRFQ,
  getRFQStats,
} from '../../controllers/rfqsController';
import {
  getOffersForRFQ,
  acceptOffer,
  rejectOffer,
} from '../../controllers/offersController';
import {
  createDirectOrder,
  getOrders,
  getOrderById,
  getAvailableWindows,
} from '../../controllers/ordersController';
import pool from '../../config/database';
import { success } from '../../utils/responseHelpers';
import { emitWindowAccepted, emitWindowProposed } from '../../websocket';

const router = Router();

// All buyer routes require authentication
router.use(authenticate);

/**
 * GET /api/buyers/home
 * Get buyer home screen data
 */
router.get('/home', getBuyerHome);

/**
 * GET /api/buyers/dashboard
 * Get buyer dashboard stats
 */
router.get('/dashboard', getBuyerDashboard);

/**
 * GET /api/buyers/projects
 * Get buyer's projects
 */
router.get('/projects', asyncHandler(getProjects));

/**
 * GET /api/buyers/projects/:id
 * Get project detail
 */
router.get('/projects/:id', asyncHandler(getProjectById));

/**
 * POST /api/buyers/projects
 * Create a new project
 */
router.post('/projects', asyncHandler(createProject));

/**
 * PUT /api/buyers/projects/:id
 * Update a project
 */
router.put('/projects/:id', asyncHandler(updateProject));

/**
 * DELETE /api/buyers/projects/:id
 * Delete a project
 */
router.delete('/projects/:id', asyncHandler(deleteProject));

/**
 * GET /api/buyers/rfqs/stats
 * Get RFQ statistics
 */
router.get('/rfqs/stats', asyncHandler(getRFQStats));

/**
 * GET /api/buyers/rfqs/:id
 * Get RFQ detail with offers
 */
router.get('/rfqs/:id', asyncHandler(getRFQById));

/**
 * GET /api/buyers/rfqs
 * Get buyer's RFQs
 */
router.get('/rfqs', asyncHandler(getRFQs));

/**
 * POST /api/buyers/rfqs
 * Create a new RFQ
 */
router.post('/rfqs', asyncHandler(createRFQ));

/**
 * PUT /api/buyers/rfqs/:id/close
 * Close an RFQ
 */
router.put('/rfqs/:id/close', asyncHandler(closeRFQ));

/**
 * DELETE /api/buyers/rfqs/:id
 * Delete an RFQ
 */
router.delete('/rfqs/:id', asyncHandler(deleteRFQ));

/**
 * GET /api/buyers/rfqs/:rfqId/offers
 * Get all offers for a specific RFQ with trust metrics
 */
router.get('/rfqs/:rfqId/offers', asyncHandler(getOffersForRFQ));

/**
 * POST /api/buyers/offers/:offerId/accept
 * Accept an offer and create an order
 */
router.post('/offers/:offerId/accept', asyncHandler(acceptOffer));

/**
 * POST /api/buyers/offers/:offerId/reject
 * Reject an offer
 */
router.post('/offers/:offerId/reject', asyncHandler(rejectOffer));

/**
 * POST /api/buyers/orders/direct
 * Create a direct order
 */
router.post('/orders/direct', asyncHandler(createDirectOrder));

/**
 * GET /api/buyers/orders/:id
 * Get order detail
 */
router.get('/orders/:id', asyncHandler(getOrderById));

/**
 * GET /api/buyers/orders
 * Get buyer's orders
 */
router.get('/orders', asyncHandler(getOrders));

/**
 * POST /api/buyers/orders/:orderId/accept-window
 * Accept supplier's proposed delivery/pickup window
 */
router.post('/orders/:orderId/accept-window', asyncHandler(async (req, res) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;

  if (!buyerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  // Verify order belongs to buyer and has pending proposal
  const orderCheck = await pool.query(
    `SELECT id, supplier_id, proposed_window_start, proposed_window_end, proposal_status, proposed_by
     FROM orders
     WHERE order_number = $1 AND buyer_id = $2`,
    [orderId, buyerId]
  );

  if (orderCheck.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const order = orderCheck.rows[0];

  if (!order.proposed_window_start || order.proposal_status !== 'pending' || order.proposed_by !== 'supplier') {
    return res.status(400).json({ success: false, error: 'No pending supplier proposal to accept' });
  }

  // Accept proposal: move proposed times to confirmed times
  await pool.query(
    `UPDATE orders
     SET promised_window_start = proposed_window_start,
         promised_window_end = proposed_window_end,
         proposal_status = 'accepted',
         status = 'confirmed',
         updated_at = NOW()
     WHERE id = $1`,
    [order.id]
  );

  // Get supplier's user_id for WebSocket notification
  const supplierResult = await pool.query(
    'SELECT user_id FROM suppliers WHERE id = $1',
    [order.supplier_id]
  );

  if (supplierResult.rows.length > 0) {
    const supplierUserId = supplierResult.rows[0].user_id;

    // Emit WebSocket event to supplier - only the specific event, no generic status change
    emitWindowAccepted({
      order_number: orderId,
      order_id: order.id,
      status: 'confirmed',
    }, supplierUserId);
  }

  return success(res, { message: 'Window proposal accepted' }, 'Window accepted successfully');
}));

/**
 * POST /api/buyers/orders/:orderId/reject-window
 * Reject supplier's proposed window
 */
router.post('/orders/:orderId/reject-window', asyncHandler(async (req, res) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;

  if (!buyerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const orderCheck = await pool.query(
    `SELECT id, proposal_status, proposed_by
     FROM orders
     WHERE order_number = $1 AND buyer_id = $2`,
    [orderId, buyerId]
  );

  if (orderCheck.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const order = orderCheck.rows[0];

  if (order.proposal_status !== 'pending' || order.proposed_by !== 'supplier') {
    return res.status(400).json({ success: false, error: 'No pending supplier proposal to reject' });
  }

  await pool.query(
    `UPDATE orders
     SET proposal_status = 'rejected',
         updated_at = NOW()
     WHERE id = $1`,
    [order.id]
  );

  return success(res, { message: 'Window proposal rejected' }, 'Window rejected successfully');
}));

/**
 * POST /api/buyers/orders/:orderId/counter-propose-window
 * Counter-propose a different delivery/pickup window
 */
router.post('/orders/:orderId/counter-propose-window', asyncHandler(async (req, res) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;
  const { window_start, window_end } = req.body;

  console.log('[Counter-Propose] Received request:', { orderId, buyerId, window_start, window_end });

  if (!buyerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!window_start || !window_end) {
    return res.status(400).json({ success: false, error: 'window_start and window_end are required' });
  }

  const orderCheck = await pool.query(
    `SELECT id, supplier_id FROM orders WHERE order_number = $1 AND buyer_id = $2`,
    [orderId, buyerId]
  );

  console.log('[Counter-Propose] Order check result:', orderCheck.rows.length, orderCheck.rows[0]);

  if (orderCheck.rows.length === 0) {
    console.log('[Counter-Propose] Order not found for:', { orderId, buyerId });
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const order = orderCheck.rows[0];

  // Create buyer's counter-proposal
  await pool.query(
    `UPDATE orders
     SET proposed_window_start = $1,
         proposed_window_end = $2,
         proposed_by = 'buyer',
         proposal_status = 'pending',
         updated_at = NOW()
     WHERE id = $3`,
    [window_start, window_end, order.id]
  );

  // Get supplier's user_id for WebSocket notification
  const supplierResult = await pool.query(
    'SELECT user_id FROM suppliers WHERE id = $1',
    [order.supplier_id]
  );

  if (supplierResult.rows.length > 0) {
    const supplierUserId = supplierResult.rows[0].user_id;

    // Emit WebSocket event to supplier
    emitWindowProposed({
      order_number: orderId,
      order_id: order.id,
      proposed_window_start: window_start,
      proposed_window_end: window_end,
      proposed_by: 'buyer',
    }, supplierUserId);
  }

  return success(res, { message: 'Counter-proposal sent to supplier' }, 'Counter-proposal sent successfully');
}));

/**
 * POST /api/buyers/orders/:orderId/confirm
 * Confirm delivery of an order
 */
router.post('/orders/:orderId/confirm', asyncHandler(async (req, res) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;

  // Check order exists and belongs to this buyer (query by order_number for consistency)
  const orderResult = await pool.query(
    `SELECT id, order_number, status, buyer_id, pickup_or_delivery, supplier_id
     FROM orders
     WHERE order_number = $1 AND buyer_id = $2`,
    [orderId, buyerId]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  const order = orderResult.rows[0];

  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Order must be in delivered status to confirm',
    });
  }

  // Confirm the order - move status to completed
  await pool.query(
    `UPDATE orders
     SET status = 'completed',
         confirmed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [order.id]
  );

  return res.json({
    success: true,
    message: 'Order confirmed successfully',
  });
}));

/**
 * POST /api/buyers/orders/:orderId/confirm-pickup
 * Buyer confirms they picked up the order (for pickup orders: in_transit -> delivered)
 */
router.post('/orders/:orderId/confirm-pickup', asyncHandler(async (req, res) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;

  // Check order exists and belongs to this buyer (query by order_number for consistency)
  const orderResult = await pool.query(
    `SELECT id, order_number, status, buyer_id, pickup_or_delivery, supplier_id
     FROM orders
     WHERE order_number = $1 AND buyer_id = $2`,
    [orderId, buyerId]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  const order = orderResult.rows[0];

  if (order.pickup_or_delivery !== 'pickup') {
    return res.status(400).json({
      success: false,
      message: 'This action is only for pickup orders',
    });
  }

  if (order.status !== 'in_transit') {
    return res.status(400).json({
      success: false,
      message: 'Order must be ready for pickup before confirming',
    });
  }

  // Calculate confirmation deadline (24 hours from now)
  const confirmationDeadline = new Date();
  confirmationDeadline.setHours(confirmationDeadline.getHours() + 24);

  // Mark order as delivered (picked up by buyer)
  await pool.query(
    `UPDATE orders
     SET status = 'delivered',
         delivered_at = CURRENT_TIMESTAMP,
         confirmation_deadline = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [order.id, confirmationDeadline]
  );

  // Get supplier user_id for WebSocket notification
  const supplierResult = await pool.query(
    'SELECT user_id FROM suppliers WHERE id = $1',
    [order.supplier_id]
  );
  const supplierUserId = supplierResult.rows[0]?.user_id;

  // Emit WebSocket event
  if (supplierUserId) {
    emitWindowAccepted({
      order_number: order.order_number,
      order_id: order.id,
      status: 'delivered',
    }, supplierUserId);
  }

  return res.json({
    success: true,
    message: 'Pickup confirmed successfully',
  });
}));

/**
 * GET /api/suppliers/:supplierId/available-windows
 * Get available delivery/pickup windows for a supplier
 */
router.get('/suppliers/:supplierId/available-windows', asyncHandler(getAvailableWindows));

/**
 * GET /api/buyers/rentals
 * Get buyer's rental bookings
 */
router.get(
  '/rentals',
  asyncHandler(async (req, res) => {
    const buyerId = req.user?.id;
    const { status } = req.query;

    let query = `
      SELECT
        rb.id,
        rb.booking_number,
        rb.start_date,
        rb.end_date,
        rb.rental_duration_days,
        rb.total_rental_amount,
        rb.deposit_amount,
        rb.delivery_fee,
        rb.pickup_or_delivery,
        rb.status,
        rb.created_at,
        rb.supplier_id,
        COALESCE(rt.name_en, rt.name_ka) as tool_name,
        COALESCE(rt.spec_string_en, rt.spec_string_ka) as tool_spec,
        rt.images as tool_images,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name
      FROM rental_bookings rb
      LEFT JOIN rental_tools rt ON rb.rental_tool_id = rt.id
      LEFT JOIN suppliers s ON rb.supplier_id = s.id
      WHERE rb.buyer_id = $1
    `;

    const values: any[] = [buyerId];
    let paramCount = 2;

    if (status && typeof status === 'string') {
      query += ` AND rb.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY rb.created_at DESC`;

    const result = await pool.query(query, values);

    const bookings = result.rows.map(row => ({
      id: row.id,
      booking_number: row.booking_number,
      start_date: row.start_date,
      end_date: row.end_date,
      rental_duration_days: row.rental_duration_days,
      total_rental_amount: parseFloat(row.total_rental_amount || 0),
      deposit_amount: parseFloat(row.deposit_amount || 0),
      delivery_fee: parseFloat(row.delivery_fee || 0),
      pickup_or_delivery: row.pickup_or_delivery,
      status: row.status,
      created_at: row.created_at,
      supplier_id: row.supplier_id,
      tool_name: row.tool_name,
      tool_spec: row.tool_spec,
      tool_photo: row.tool_images && row.tool_images.length > 0 ? row.tool_images[0] : null,
      supplier_name: row.supplier_name,
    }));

    // Return as 'data' array to match frontend expectation
    return success(res, { data: bookings }, 'Rental bookings retrieved successfully');
  })
);

/**
 * GET /api/buyers/rentals/:bookingId
 * Get rental booking details
 */
router.get(
  '/rentals/:bookingId',
  asyncHandler(async (req, res) => {
    const buyerId = req.user?.id;
    const { bookingId } = req.params;

    const query = `
      SELECT
        rb.*,
        COALESCE(rt.name_en, rt.name_ka) as tool_name,
        COALESCE(rt.spec_string_en, rt.spec_string_ka) as tool_spec,
        rt.images as tool_images,
        COALESCE(rt.category_en, rt.category_ka) as tool_category,
        s.id as supplier_id,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
        s.depot_address as supplier_address,
        p.project_name,
        p.site_address as delivery_address
      FROM rental_bookings rb
      LEFT JOIN rental_tools rt ON rb.rental_tool_id = rt.id
      LEFT JOIN suppliers s ON rb.supplier_id = s.id
      LEFT JOIN projects p ON rb.project_id = p.id
      WHERE rb.id = $1 AND rb.buyer_id = $2
    `;

    const result = await pool.query(query, [bookingId, buyerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rental booking not found',
      });
    }

    const row = result.rows[0];

    // Fetch handover details if exists
    let handoverDetails = null;
    const handoverQuery = `
      SELECT
        id,
        handover_scheduled_at,
        handover_confirmed_at,
        handover_photos,
        condition_notes,
        created_at
      FROM handovers
      WHERE booking_id = $1
    `;
    const handoverResult = await pool.query(handoverQuery, [bookingId]);
    if (handoverResult.rows.length > 0) {
      handoverDetails = handoverResult.rows[0];
    }

    // Fetch return details if exists
    let returnDetails = null;
    const returnQuery = `
      SELECT
        id,
        return_scheduled_at,
        return_confirmed_at,
        return_photos,
        condition_notes,
        late_fee,
        damage_fee,
        created_at
      FROM returns
      WHERE booking_id = $1
    `;
    const returnResult = await pool.query(returnQuery, [bookingId]);
    if (returnResult.rows.length > 0) {
      returnDetails = returnResult.rows[0];
    }

    const booking = {
      id: row.id,
      booking_number: row.booking_number,
      buyer_id: row.buyer_id,
      supplier_id: row.supplier_id,
      supplier_name: row.supplier_name,
      supplier_address: row.supplier_address,
      project_id: row.project_id,
      project_name: row.project_name,
      tool: {
        id: row.rental_tool_id,
        name: row.tool_name,
        spec: row.tool_spec,
        category: row.tool_category,
        images: row.tool_images || [],
      },
      start_date: row.start_date,
      end_date: row.end_date,
      actual_start_date: row.actual_start_date,
      actual_end_date: row.actual_end_date,
      rental_duration_days: row.rental_duration_days,
      day_rate: parseFloat(row.day_rate),
      total_rental_amount: parseFloat(row.total_rental_amount),
      deposit_amount: parseFloat(row.deposit_amount),
      delivery_fee: parseFloat(row.delivery_fee),
      late_return_fee: parseFloat(row.late_return_fee) || 0,
      damage_fee: parseFloat(row.damage_fee) || 0,
      pickup_or_delivery: row.pickup_or_delivery,
      delivery_address: row.delivery_address,
      delivery_latitude: row.delivery_latitude ? parseFloat(row.delivery_latitude) : null,
      delivery_longitude: row.delivery_longitude ? parseFloat(row.delivery_longitude) : null,
      payment_terms: row.payment_terms,
      status: row.status,
      notes: row.notes,
      buyer_notes: row.buyer_notes,
      supplier_notes: row.supplier_notes,
      confirmed_at: row.confirmed_at,
      cancelled_at: row.cancelled_at,
      cancellation_reason: row.cancellation_reason,
      created_at: row.created_at,
      updated_at: row.updated_at,
      handover: handoverDetails,
      return: returnDetails,
    };

    return success(res, { booking }, 'Rental booking details retrieved successfully');
  })
);

/**
 * POST /api/buyers/rentals/book
 * Create a direct rental booking
 */
router.post(
  '/rentals/book',
  asyncHandler(async (req, res) => {
    const buyerId = req.user?.id;
    const {
      rental_tool_id,
      start_date,
      end_date,
      delivery_method, // 'pickup' or 'delivery'
      project_id, // Required if delivery_method is 'delivery'
    } = req.body;

    // Validation
    if (!rental_tool_id || !start_date || !end_date || !delivery_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: rental_tool_id, start_date, end_date, delivery_method',
      });
    }

    if (delivery_method === 'delivery' && !project_id) {
      return res.status(400).json({
        success: false,
        message: 'project_id is required for delivery method',
      });
    }

    // Validate delivery method
    if (!['pickup', 'delivery'].includes(delivery_method)) {
      return res.status(400).json({
        success: false,
        message: 'delivery_method must be either "pickup" or "delivery"',
      });
    }

    // Parse dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    // Compare dates only - extract YYYY-MM-DD from the ISO string to handle timezone correctly
    // When user selects "Nov 29" in Georgia (UTC+4), it comes as "2025-11-28T20:00:00Z"
    // But the user intended Nov 29, so we just skip past-date validation for now
    // since the date picker already prevents selecting past dates on the frontend

    try {
      // Fetch rental tool details
      const toolQuery = `
        SELECT
          rt.*,
          COALESCE(s.business_name_en, s.business_name_ka) as supplier_name
        FROM rental_tools rt
        LEFT JOIN suppliers s ON rt.supplier_id = s.id
        WHERE rt.id = $1 AND rt.is_active = true AND rt.is_available = true
      `;
      const toolResult = await pool.query(toolQuery, [rental_tool_id]);

      if (toolResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rental tool not found or not available',
        });
      }

      const tool = toolResult.rows[0];

      // Check if tool supports the delivery method
      const supportsDelivery = tool.delivery_option === 'delivery' || tool.delivery_option === 'both';
      const supportsPickup = tool.delivery_option === 'pickup' || tool.delivery_option === 'both';

      if (delivery_method === 'delivery' && !supportsDelivery) {
        return res.status(400).json({
          success: false,
          message: 'This tool does not support delivery',
        });
      }

      if (delivery_method === 'pickup' && !supportsPickup) {
        return res.status(400).json({
          success: false,
          message: 'This tool does not support pickup',
        });
      }

      // Check if direct booking is available
      if (!tool.direct_booking_available) {
        return res.status(400).json({
          success: false,
          message: 'Direct booking is not available for this tool. Please request a quote instead.',
        });
      }

      // Calculate rental duration (in days)
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

      // Calculate rental cost (optimize between daily and weekly rates)
      const dailyRate = parseFloat(tool.day_rate);
      const weeklyRate = tool.week_rate ? parseFloat(tool.week_rate) : null;

      let totalRentalAmount = dailyRate * durationDays;

      if (weeklyRate) {
        const weeks = Math.floor(durationDays / 7);
        const remainingDays = durationDays % 7;
        const weeklyTotal = weeks * weeklyRate + remainingDays * dailyRate;

        if (weeklyTotal < totalRentalAmount) {
          totalRentalAmount = weeklyTotal;
        }
      }

      // Add delivery fee if applicable
      const deliveryFee = delivery_method === 'delivery' ? 50.00 : 0.00;

      // Get deposit amount
      const depositAmount = tool.deposit_amount ? parseFloat(tool.deposit_amount) : 0.00;

      // Fetch project details if delivery
      let deliveryAddress = null;
      let deliveryLat = null;
      let deliveryLng = null;

      if (delivery_method === 'delivery' && project_id) {
        const projectQuery = `
          SELECT site_address, site_latitude, site_longitude
          FROM projects
          WHERE id = $1 AND buyer_id = $2
        `;
        const projectResult = await pool.query(projectQuery, [project_id, buyerId]);

        if (projectResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Project not found',
          });
        }

        const project = projectResult.rows[0];
        deliveryAddress = project.site_address;
        deliveryLat = project.site_latitude;
        deliveryLng = project.site_longitude;
      }

      // Create rental booking
      const insertQuery = `
        INSERT INTO rental_bookings (
          buyer_id,
          supplier_id,
          project_id,
          rental_tool_id,
          start_date,
          end_date,
          rental_duration_days,
          day_rate,
          total_rental_amount,
          deposit_amount,
          delivery_fee,
          pickup_or_delivery,
          delivery_address,
          delivery_latitude,
          delivery_longitude,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        RETURNING
          id,
          booking_number,
          buyer_id,
          supplier_id,
          project_id,
          rental_tool_id,
          start_date,
          end_date,
          rental_duration_days,
          day_rate,
          total_rental_amount,
          deposit_amount,
          delivery_fee,
          pickup_or_delivery,
          status,
          created_at
      `;

      const insertValues = [
        buyerId,
        tool.supplier_id,
        project_id || null,
        rental_tool_id,
        startDate,
        endDate,
        durationDays,
        dailyRate,
        totalRentalAmount,
        depositAmount,
        deliveryFee,
        delivery_method,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        'confirmed', // Direct bookings are immediately confirmed
      ];

      // Retry logic for duplicate booking number (race condition)
      let booking;
      let retries = 3;
      while (retries > 0) {
        try {
          const bookingResult = await pool.query(insertQuery, insertValues);
          booking = bookingResult.rows[0];
          break; // Success, exit loop
        } catch (insertError: any) {
          if (insertError.code === '23505' && insertError.constraint === 'rental_bookings_booking_number_key') {
            retries--;
            if (retries === 0) {
              throw insertError; // All retries exhausted
            }
            // Wait a small random time before retry to avoid continued collision
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          } else {
            throw insertError; // Different error, don't retry
          }
        }
      }

      // Return booking details
      return success(res, {
        booking: {
          id: booking.id,
          booking_number: booking.booking_number,
          tool_name: tool.name,
          supplier_name: tool.supplier_name,
          start_date: booking.start_date,
          end_date: booking.end_date,
          rental_duration_days: booking.rental_duration_days,
          day_rate: parseFloat(booking.day_rate),
          total_rental_amount: parseFloat(booking.total_rental_amount),
          deposit_amount: parseFloat(booking.deposit_amount),
          delivery_fee: parseFloat(booking.delivery_fee),
          pickup_or_delivery: booking.pickup_or_delivery,
          status: booking.status,
          created_at: booking.created_at,
        },
      }, 'Rental booking created successfully');
    } catch (error) {
      console.error('Error creating rental booking:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create rental booking',
      });
    }
  })
);

/**
 * POST /api/buyers/rental-rfqs
 * Create a rental RFQ (Request for Quote)
 */
router.post(
  '/rental-rfqs',
  asyncHandler(async (req, res) => {
    const buyerId = req.user?.id;
    const { tool_ids, start_date, end_date, delivery_method, project_id, notes } = req.body;

    // Validation
    if (!tool_ids || !Array.isArray(tool_ids) || tool_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one tool must be selected',
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    if (!delivery_method || !['pickup', 'delivery'].includes(delivery_method)) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery method is required (pickup or delivery)',
      });
    }

    if (delivery_method === 'delivery' && !project_id) {
      return res.status(400).json({
        success: false,
        message: 'Project is required for delivery method',
      });
    }

    // Parse dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    try {
      // Calculate rental duration
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

      // Fetch project details if delivery
      let deliveryAddress = null;
      let deliveryLat = null;
      let deliveryLng = null;

      if (delivery_method === 'delivery' && project_id) {
        const projectQuery = `
          SELECT site_address, site_latitude, site_longitude
          FROM projects
          WHERE id = $1 AND buyer_id = $2
        `;
        const projectResult = await pool.query(projectQuery, [project_id, buyerId]);

        if (projectResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Project not found',
          });
        }

        const project = projectResult.rows[0];
        deliveryAddress = project.site_address;
        deliveryLat = project.site_latitude;
        deliveryLng = project.site_longitude;
      }

      // Get unique supplier IDs from the selected tools
      const toolsQuery = `
        SELECT DISTINCT supplier_id
        FROM rental_tools
        WHERE id = ANY($1::uuid[])
      `;
      const toolsResult = await pool.query(toolsQuery, [tool_ids]);
      const supplierIds = toolsResult.rows.map((row) => row.supplier_id);

      if (supplierIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No valid tools found',
        });
      }

      // Create RFQ for each unique supplier
      const rfqInsertQuery = `
        INSERT INTO rental_rfqs (
          buyer_id,
          supplier_id,
          start_date,
          end_date,
          rental_duration_days,
          delivery_method,
          project_id,
          delivery_address,
          delivery_latitude,
          delivery_longitude,
          notes,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING id, rfq_number
      `;

      const createdRFQs = [];

      for (const supplierId of supplierIds) {
        const rfqResult = await pool.query(rfqInsertQuery, [
          buyerId,
          supplierId,
          startDate,
          endDate,
          durationDays,
          delivery_method,
          project_id || null,
          deliveryAddress,
          deliveryLat,
          deliveryLng,
          notes || null,
        ]);

        const rfq = rfqResult.rows[0];

        // Insert tool items for this RFQ (only tools from this supplier)
        const supplierToolIds = tool_ids; // In a real scenario, filter by supplier
        const itemsInsertQuery = `
          INSERT INTO rental_rfq_items (
            rfq_id,
            rental_tool_id
          )
          SELECT $1, unnest($2::uuid[])
        `;
        await pool.query(itemsInsertQuery, [rfq.id, supplierToolIds]);

        createdRFQs.push({
          id: rfq.id,
          rfq_number: rfq.rfq_number,
          supplier_id: supplierId,
        });
      }

      return success(
        res,
        {
          rfqs: createdRFQs,
          count: createdRFQs.length,
        },
        `Rental RFQ${createdRFQs.length > 1 ? 's' : ''} created successfully`
      );
    } catch (error) {
      console.error('Error creating rental RFQ:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create rental RFQ',
      });
    }
  })
);

/**
 * POST /api/buyers/rentals/:bookingId/confirm-handover
 * Confirm handover with photos and condition notes
 */
router.post(
  '/rentals/:bookingId/confirm-handover',
  asyncHandler(async (req, res) => {
    const buyerId = req.user?.id;
    const { bookingId } = req.params;
    const { condition_notes, photo_urls } = req.body;

    if (!photo_urls || !Array.isArray(photo_urls) || photo_urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo is required for handover confirmation',
      });
    }

    try {
      // Verify booking belongs to buyer
      const bookingQuery = `
        SELECT id, status, start_date, supplier_id
        FROM rental_bookings
        WHERE id = $1 AND buyer_id = $2
      `;
      const bookingResult = await pool.query(bookingQuery, [bookingId, buyerId]);

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      const booking = bookingResult.rows[0];

      // Check if booking is in appropriate status
      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: `Cannot confirm handover for booking with status: ${booking.status}`,
        });
      }

      // Check if handover already exists
      const existingHandoverQuery = `
        SELECT id FROM handovers WHERE booking_id = $1
      `;
      const existingHandover = await pool.query(existingHandoverQuery, [bookingId]);

      if (existingHandover.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Handover already confirmed for this booking',
        });
      }

      // Create handover record
      const insertHandoverQuery = `
        INSERT INTO handovers (
          booking_id,
          handover_confirmed_at,
          handover_photos,
          condition_notes
        ) VALUES ($1, NOW(), $2, $3)
        RETURNING id, handover_confirmed_at
      `;

      const handoverResult = await pool.query(insertHandoverQuery, [
        bookingId,
        photo_urls,
        condition_notes || null,
      ]);

      // Update booking status to active and set actual_start_date
      const updateBookingQuery = `
        UPDATE rental_bookings
        SET status = 'active', actual_start_date = NOW(), updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      await pool.query(updateBookingQuery, [bookingId]);

      return success(
        res,
        {
          handover: {
            id: handoverResult.rows[0].id,
            confirmed_at: handoverResult.rows[0].handover_confirmed_at,
          },
        },
        'Handover confirmed successfully'
      );
    } catch (error) {
      console.error('Error confirming handover:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm handover',
      });
    }
  })
);

/**
 * POST /api/buyers/rentals/:bookingId/confirm-return
 * Confirm return with photos and condition notes
 */
router.post(
  '/rentals/:bookingId/confirm-return',
  asyncHandler(async (req, res) => {
    const buyerId = req.user?.id;
    const { bookingId } = req.params;
    const { condition_notes, photo_urls } = req.body;

    if (!photo_urls || !Array.isArray(photo_urls) || photo_urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo is required for return confirmation',
      });
    }

    try {
      // Verify booking belongs to buyer
      const bookingQuery = `
        SELECT
          rb.id,
          rb.status,
          rb.end_date,
          rb.supplier_id,
          rb.deposit_amount,
          h.id as handover_id
        FROM rental_bookings rb
        LEFT JOIN handovers h ON rb.id = h.booking_id
        WHERE rb.id = $1 AND rb.buyer_id = $2
      `;
      const bookingResult = await pool.query(bookingQuery, [bookingId, buyerId]);

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      const booking = bookingResult.rows[0];

      // Check if handover was completed
      if (!booking.handover_id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot confirm return before handover is completed',
        });
      }

      // Check if booking is in appropriate status
      if (booking.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Cannot confirm return for booking with status: ${booking.status}`,
        });
      }

      // Check if return already exists
      const existingReturnQuery = `
        SELECT id FROM returns WHERE booking_id = $1
      `;
      const existingReturn = await pool.query(existingReturnQuery, [bookingId]);

      if (existingReturn.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Return already confirmed for this booking',
        });
      }

      // Calculate late fee if applicable
      const endDate = new Date(booking.end_date);
      const now = new Date();
      const lateFee = now > endDate ? 50 : 0; // Simple late fee logic

      // Create return record
      const insertReturnQuery = `
        INSERT INTO returns (
          booking_id,
          return_confirmed_at,
          return_photos,
          condition_notes,
          late_fee
        ) VALUES ($1, NOW(), $2, $3, $4)
        RETURNING id, return_confirmed_at, late_fee
      `;

      const returnResult = await pool.query(insertReturnQuery, [
        bookingId,
        photo_urls,
        condition_notes || null,
        lateFee,
      ]);

      // Update booking status to completed and set actual_end_date
      const updateBookingQuery = `
        UPDATE rental_bookings
        SET
          status = 'completed',
          actual_end_date = NOW(),
          late_return_fee = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      await pool.query(updateBookingQuery, [lateFee, bookingId]);

      return success(
        res,
        {
          return: {
            id: returnResult.rows[0].id,
            confirmed_at: returnResult.rows[0].return_confirmed_at,
            late_fee: parseFloat(returnResult.rows[0].late_fee),
          },
        },
        'Return confirmed successfully'
      );
    } catch (error) {
      console.error('Error confirming return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm return',
      });
    }
  })
);

/**
 * GET /api/buyers/profile
 * Get buyer profile with stats and notification preferences
 */
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    try {
      // Fetch user profile
      const userQuery = `
        SELECT
          id,
          phone,
          name,
          user_type,
          buyer_role,
          language,
          email,
          profile_photo_url,
          is_verified,
          created_at
        FROM users
        WHERE id = $1 AND is_active = true
      `;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = userResult.rows[0];

      // Fetch active projects count
      const projectsQuery = `
        SELECT COUNT(*) as count
        FROM projects
        WHERE user_id = $1 AND is_active = true
      `;
      const projectsResult = await pool.query(projectsQuery, [userId]);
      const activeProjectsCount = parseInt(projectsResult.rows[0].count);

      // Fetch order statistics
      const ordersQuery = `
        SELECT
          COUNT(*) FILTER (WHERE status IN ('confirmed', 'in_transit', 'delivered')) as active_orders,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
        FROM orders
        WHERE buyer_id = $1
      `;
      const ordersResult = await pool.query(ordersQuery, [userId]);
      const orderStats = ordersResult.rows[0];

      // Fetch notification preferences
      const notifPrefsQuery = `
        SELECT
          notification_type,
          push_enabled,
          sms_enabled,
          email_enabled,
          in_app_enabled
        FROM notification_preferences
        WHERE user_id = $1
      `;
      const notifPrefsResult = await pool.query(notifPrefsQuery, [userId]);

      // Format notification preferences
      const notificationPreferences = {
        push_enabled: true, // Global push toggle (default)
        sms_enabled: false, // Global SMS toggle (default)
        quiet_hours_enabled: true, // Default quiet hours
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        categories: {
          rfq_offers: { enabled: true },
          delivery_updates: { enabled: true },
          rental_handovers: { enabled: true },
          tips_suggestions: { enabled: false },
        },
      };

      // Update categories based on actual preferences
      notifPrefsResult.rows.forEach((pref) => {
        if (pref.notification_type === 'rfq_received' || pref.notification_type === 'offer_received') {
          notificationPreferences.categories.rfq_offers.enabled = pref.in_app_enabled;
        }
        if (pref.notification_type === 'delivery_confirmed' || pref.notification_type === 'delivery_started') {
          notificationPreferences.categories.delivery_updates.enabled = pref.in_app_enabled;
        }
        if (pref.notification_type === 'handover_scheduled' || pref.notification_type === 'return_scheduled') {
          notificationPreferences.categories.rental_handovers.enabled = pref.in_app_enabled;
        }
      });

      return success(res, {
        profile: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          buyer_role: user.buyer_role,
          language: user.language,
          email: user.email,
          profile_photo_url: user.profile_photo_url,
          is_verified: user.is_verified,
          created_at: user.created_at,
        },
        stats: {
          active_projects: activeProjectsCount,
          active_orders: parseInt(orderStats.active_orders) || 0,
          completed_orders: parseInt(orderStats.completed_orders) || 0,
        },
        notification_preferences: notificationPreferences,
      }, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
      });
    }
  })
);

/**
 * PUT /api/buyers/profile
 * Update buyer profile (name, buyer_role, language)
 */
router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { name, buyer_role, language } = req.body;

    try {
      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }

      if (buyer_role !== undefined) {
        if (!['homeowner', 'contractor'].includes(buyer_role)) {
          return res.status(400).json({
            success: false,
            message: 'buyer_role must be either "homeowner" or "contractor"',
          });
        }
        updates.push(`buyer_role = $${paramCount}`);
        values.push(buyer_role);
        paramCount++;
      }

      if (language !== undefined) {
        if (!['ka', 'en'].includes(language)) {
          return res.status(400).json({
            success: false,
            message: 'language must be either "ka" or "en"',
          });
        }
        updates.push(`language = $${paramCount}`);
        values.push(language);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
      }

      // Add userId and updated_at
      values.push(userId);
      const userIdParam = paramCount;

      const query = `
        UPDATE users
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${userIdParam} AND is_active = true
        RETURNING id, phone, name, buyer_role, language, email, profile_photo_url, created_at, updated_at
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = result.rows[0];

      return success(res, {
        profile: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          buyer_role: user.buyer_role,
          language: user.language,
          email: user.email,
          profile_photo_url: user.profile_photo_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      }, 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  })
);

/**
 * PUT /api/buyers/profile/notifications
 * Update notification preferences
 */
router.put(
  '/profile/notifications',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { push_enabled, sms_enabled, categories } = req.body;

    try {
      // Map categories to notification types
      const notificationTypeMap: Record<string, string[]> = {
        rfq_offers: ['rfq_received', 'offer_received', 'rfq_closed'],
        delivery_updates: ['delivery_confirmed', 'delivery_started', 'delivery_completed'],
        rental_handovers: ['handover_scheduled', 'return_scheduled', 'rental_confirmed'],
        tips_suggestions: ['tips', 'suggestions', 'promotions'],
      };

      // Update or insert preferences for each category
      if (categories) {
        for (const [category, settings] of Object.entries(categories)) {
          if (typeof settings === 'object' && settings !== null && 'enabled' in settings) {
            const notificationTypes = notificationTypeMap[category] || [];

            for (const notifType of notificationTypes) {
              const upsertQuery = `
                INSERT INTO notification_preferences (
                  user_id,
                  notification_type,
                  push_enabled,
                  sms_enabled,
                  in_app_enabled
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, notification_type)
                DO UPDATE SET
                  push_enabled = COALESCE($3, notification_preferences.push_enabled),
                  sms_enabled = COALESCE($4, notification_preferences.sms_enabled),
                  in_app_enabled = $5,
                  updated_at = NOW()
              `;

              await pool.query(upsertQuery, [
                userId,
                notifType,
                push_enabled !== undefined ? push_enabled : null,
                sms_enabled !== undefined ? sms_enabled : null,
                (settings as any).enabled,
              ]);
            }
          }
        }
      }

      // Fetch updated preferences
      const prefsQuery = `
        SELECT
          notification_type,
          push_enabled,
          sms_enabled,
          email_enabled,
          in_app_enabled
        FROM notification_preferences
        WHERE user_id = $1
      `;
      const prefsResult = await pool.query(prefsQuery, [userId]);

      return success(res, {
        notification_preferences: prefsResult.rows,
      }, 'Notification preferences updated successfully');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
      });
    }
  })
);

/**
 * DELETE /api/buyers/profile
 * Soft delete user account
 */
router.delete(
  '/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { phone_confirmation } = req.body;

    try {
      // Fetch user to verify phone
      const userQuery = `
        SELECT phone, name FROM users WHERE id = $1 AND is_active = true
      `;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = userResult.rows[0];

      // Verify phone confirmation
      if (phone_confirmation !== user.phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number confirmation does not match',
        });
      }

      // Check for active orders/rentals
      const activeOrdersQuery = `
        SELECT COUNT(*) as count
        FROM orders
        WHERE buyer_id = $1 AND status IN ('confirmed', 'in_transit')
      `;
      const activeOrdersResult = await pool.query(activeOrdersQuery, [userId]);
      const activeOrdersCount = parseInt(activeOrdersResult.rows[0].count);

      const activeRentalsQuery = `
        SELECT COUNT(*) as count
        FROM rental_bookings
        WHERE buyer_id = $1 AND status IN ('confirmed', 'active')
      `;
      const activeRentalsResult = await pool.query(activeRentalsQuery, [userId]);
      const activeRentalsCount = parseInt(activeRentalsResult.rows[0].count);

      // Scramble phone number (keep format but randomize digits)
      const scrambledPhone = user.phone.replace(/\d/g, () => Math.floor(Math.random() * 10).toString());

      // Soft delete: deactivate user and anonymize data
      const deleteQuery = `
        UPDATE users
        SET
          is_active = false,
          name = 'Deleted User',
          phone = $1,
          email = NULL,
          profile_photo_url = NULL,
          updated_at = NOW()
        WHERE id = $2
      `;
      await pool.query(deleteQuery, [scrambledPhone, userId]);

      // Invalidate all user sessions
      const deleteSessionsQuery = `
        DELETE FROM user_sessions WHERE user_id = $1
      `;
      await pool.query(deleteSessionsQuery, [userId]);

      // Flag active orders/rentals
      if (activeOrdersCount > 0) {
        const flagOrdersQuery = `
          UPDATE orders
          SET buyer_notes = CONCAT(COALESCE(buyer_notes, ''), '\n[Account deleted]')
          WHERE buyer_id = $1 AND status IN ('confirmed', 'in_transit')
        `;
        await pool.query(flagOrdersQuery, [userId]);
      }

      if (activeRentalsCount > 0) {
        const flagRentalsQuery = `
          UPDATE rental_bookings
          SET buyer_notes = CONCAT(COALESCE(buyer_notes, ''), '\n[Account deleted]')
          WHERE buyer_id = $1 AND status IN ('confirmed', 'active')
        `;
        await pool.query(flagRentalsQuery, [userId]);
      }

      return success(res, {
        message: 'Account deleted successfully',
        active_orders_flagged: activeOrdersCount,
        active_rentals_flagged: activeRentalsCount,
      }, 'Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete account',
      });
    }
  })
);

export default router;
