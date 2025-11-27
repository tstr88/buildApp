/**
 * Orders Controller
 * Handles direct order creation and management
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { emitOrderCreated } from '../websocket';

/**
 * POST /api/buyers/orders/direct
 * Create a direct order with immediate checkout
 */
export async function createDirectOrder(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();

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
      supplier_id,
      project_id,
      items, // Array of { sku_id, description, quantity, unit, unit_price }
      pickup_or_delivery,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      promised_window_start,
      promised_window_end,
      payment_terms,
      negotiable,
      notes,
    } = req.body;

    // Validation
    if (!supplier_id || !items || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Supplier ID and items are required',
      });
      return;
    }

    if (!pickup_or_delivery || !['pickup', 'delivery'].includes(pickup_or_delivery)) {
      res.status(400).json({
        success: false,
        error: 'Valid pickup_or_delivery option required (pickup or delivery)',
      });
      return;
    }

    if (pickup_or_delivery === 'delivery' && !delivery_address) {
      res.status(400).json({
        success: false,
        error: 'Delivery address required for delivery orders',
      });
      return;
    }

    await client.query('BEGIN');

    // Verify supplier exists and is active
    const supplierCheck = await client.query(
      'SELECT id, business_name_en, business_name_ka, min_order_value, payment_terms FROM suppliers WHERE id = $1 AND is_active = true',
      [supplier_id]
    );

    if (supplierCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Supplier not found or inactive',
      });
      return;
    }

    const supplier = supplierCheck.rows[0];

    // Verify all SKUs belong to this supplier and are available for direct order
    const skuIds = items.filter((item: any) => item.sku_id).map((item: any) => item.sku_id);

    if (skuIds.length > 0) {
      const skuCheck = await client.query(
        `SELECT id, name_ka, name_en, direct_order_available, delivery_options, base_price
         FROM skus
         WHERE id = ANY($1) AND supplier_id = $2 AND is_active = true`,
        [skuIds, supplier_id]
      );

      if (skuCheck.rows.length !== skuIds.length) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: 'Some SKUs are invalid, inactive, or from different supplier',
        });
        return;
      }

      // Verify all SKUs support direct orders
      const nonDirectSKUs = skuCheck.rows.filter((sku: any) => !sku.direct_order_available);
      if (nonDirectSKUs.length > 0) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: 'Some SKUs are not available for direct orders',
        });
        return;
      }

      // Verify delivery option is supported
      const unsupportedDelivery = skuCheck.rows.filter((sku: any) => {
        if (pickup_or_delivery === 'pickup' && sku.delivery_options === 'delivery') return true;
        if (pickup_or_delivery === 'delivery' && sku.delivery_options === 'pickup') return true;
        return false;
      });

      if (unsupportedDelivery.length > 0) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: `Some SKUs do not support ${pickup_or_delivery} option`,
        });
        return;
      }
    }

    // Calculate totals
    let total_amount = 0;
    const processedItems = items.map((item: any) => {
      const subtotal = (item.unit_price || 0) * (item.quantity || 0);
      total_amount += subtotal;
      return {
        sku_id: item.sku_id || null,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: subtotal,
      };
    });

    // Check minimum order value
    if (supplier.min_order_value && total_amount < parseFloat(supplier.min_order_value)) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: `Order total (${total_amount}) is below minimum order value (${supplier.min_order_value})`,
      });
      return;
    }

    const delivery_fee = 0; // TODO: Calculate based on supplier settings
    const tax_amount = 0; // TODO: Calculate based on tax rules
    const grand_total = total_amount + delivery_fee + tax_amount;

    // Normalize payment_terms - ensure it's a valid enum value
    let normalizedPaymentTerms = payment_terms || 'cod';
    if (typeof normalizedPaymentTerms !== 'string') {
      normalizedPaymentTerms = 'cod';
    }
    // Ensure it's a valid payment_terms enum value
    const validPaymentTerms = ['cod', 'net_7', 'net_15', 'net_30', 'prepaid'];
    if (!validPaymentTerms.includes(normalizedPaymentTerms)) {
      normalizedPaymentTerms = 'cod';
    }

    // Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (
        buyer_id,
        supplier_id,
        project_id,
        order_type,
        items,
        total_amount,
        delivery_fee,
        tax_amount,
        grand_total,
        pickup_or_delivery,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        promised_window_start,
        promised_window_end,
        payment_terms,
        negotiable,
        status,
        notes
      ) VALUES (
        $1, $2, $3, 'material', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        'pending'::order_status,
        $17
      )
      RETURNING id, order_number, created_at`,
      [
        userId,
        supplier_id,
        project_id,
        JSON.stringify(processedItems),
        total_amount,
        delivery_fee,
        tax_amount,
        grand_total,
        pickup_or_delivery,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        promised_window_start,
        promised_window_end,
        normalizedPaymentTerms,
        negotiable || false,
        notes,
      ]
    );

    const order = orderResult.rows[0];

    // Get supplier's user_id for WebSocket notification
    const supplierUserResult = await client.query(
      'SELECT user_id FROM suppliers WHERE id = $1',
      [supplier_id]
    );
    const supplierUserId = supplierUserResult.rows[0]?.user_id;

    await client.query('COMMIT');

    // Emit WebSocket event to supplier
    if (supplierUserId) {
      emitOrderCreated({
        order_number: order.order_number,
        order_id: order.id,
        buyer_id: userId,
        total_amount,
        pickup_or_delivery,
        status: 'pending',
      }, supplierUserId);
    }

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        total_amount,
        grand_total,
      },
      message: 'Direct order created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create direct order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create direct order',
    });
  } finally {
    client.release();
  }
}

/**
 * GET /api/buyers/orders
 * Get buyer's orders
 */
export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        o.id,
        o.order_number,
        o.supplier_id,
        o.project_id,
        o.order_type,
        o.total_amount,
        o.delivery_fee,
        o.grand_total,
        o.pickup_or_delivery,
        o.promised_window_start,
        o.promised_window_end,
        o.payment_terms,
        o.status,
        o.created_at,
        o.updated_at,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
        p.name as project_name
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN projects p ON o.project_id = p.id
      WHERE o.buyer_id = $1
    `;

    const params: any[] = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      message: 'Orders retrieved successfully',
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve orders',
    });
  }
}

/**
 * GET /api/buyers/orders/:id
 * Get order detail
 */
export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id;

    console.log('[getOrderById] Looking for order:', { orderId: id, userId });

    const query = `
      SELECT
        o.*,
        COALESCE(s.business_name_en, s.business_name_ka) as supplier_name,
        s.depot_address as supplier_address,
        u.phone as supplier_phone,
        u.email as supplier_email,
        p.name as project_name,
        p.address as project_address
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN projects p ON o.project_id = p.id
      WHERE o.order_number = $1 AND o.buyer_id = $2
    `;

    const result = await pool.query(query, [id, userId]);

    console.log('[getOrderById] Query result:', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log('[getOrderById] Order not found for:', { orderId: id, userId });
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Order retrieved successfully',
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order',
    });
  }
}

/**
 * GET /api/suppliers/:supplierId/available-windows
 * Get available delivery/pickup windows for a supplier
 *
 * Returns available days and hourly time slots
 * Same-day delivery/pickup cutoff is 2PM - after that, only future days are available
 */
export async function getAvailableWindows(req: Request, res: Response): Promise<void> {
  try {
    // TODO: Use req.params.supplierId to fetch supplier-specific windows from database

    // Get timezone offset from query param (in minutes, e.g., -240 for UTC+4)
    // Note: JavaScript's getTimezoneOffset() returns positive for west of UTC
    // So UTC+4 (Georgia) returns -240
    const timezoneOffset = parseInt(req.query.tzOffset as string) || 0;

    // Calculate user's current local time
    const now = new Date();
    // Convert server time to UTC, then to user's local time
    // User's offset from UTC in ms = -timezoneOffset * 60 * 1000
    const userLocalTime = new Date(now.getTime() - timezoneOffset * 60 * 1000);

    const currentHour = userLocalTime.getUTCHours(); // Use UTC hours since we adjusted the time
    const SAME_DAY_CUTOFF_HOUR = 14; // 2PM cutoff for same-day orders
    const BUSINESS_START_HOUR = 8;   // 8AM
    const BUSINESS_END_HOUR = 18;    // 6PM (supplier hours: Mon-Sat, 8AM-6PM)

    // Helper to create date with specific hours in user's local timezone
    // Returns a Date object representing the correct UTC time
    const createDate = (daysOffset: number, hours: number, minutes: number = 0) => {
      // We want to create a time that, when displayed in the user's timezone, shows the correct hour.
      //
      // Example: User is in UTC+4 (Georgia), tzOffset = -240
      // They want 4 PM local time.
      // 4 PM in UTC+4 = 12:00 UTC
      // So we need: UTC hour = local hour - (offset in hours)
      // offset in hours = -240 / -60 = 4
      // UTC hour = 16 - 4 = 12 ✓
      //
      // JavaScript Date works in the server's local timezone, so we:
      // 1. Create a date for the target day
      // 2. Set it to the desired LOCAL hour for the USER
      // 3. Then subtract the user's timezone offset to get correct UTC

      // Start with current date
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      date.setHours(hours, minutes, 0, 0);

      // Now 'date' is set to 'hours' in SERVER's timezone
      // We need to adjust so that when converted to user's timezone, it shows 'hours'
      //
      // User's offset from UTC (in ms): -timezoneOffset * 60 * 1000
      // (negative because getTimezoneOffset returns positive for west of UTC)
      //
      // Server's offset from UTC (in ms): -date.getTimezoneOffset() * 60 * 1000
      //
      // Adjustment needed: (userOffset - serverOffset)
      const serverOffsetMs = date.getTimezoneOffset() * 60 * 1000;
      const userOffsetMs = timezoneOffset * 60 * 1000;
      const adjustmentMs = userOffsetMs - serverOffsetMs;

      return new Date(date.getTime() + adjustmentMs);
    };

    // Helper to get user's local date for a given offset
    const getUserLocalDate = (daysOffset: number) => {
      const date = new Date(userLocalTime);
      date.setUTCDate(date.getUTCDate() + daysOffset);
      return date;
    };

    // Helper to format day label using user's local date
    const formatDayLabel = (daysOffset: number) => {
      if (daysOffset === 0) return 'Today';
      if (daysOffset === 1) return 'Tomorrow';
      const date = getUserLocalDate(daysOffset);
      // Format in UTC since userLocalTime is adjusted to represent user's local time in UTC
      const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getUTCMonth()];
      const day = date.getUTCDate();
      return `${weekday}, ${month} ${day}`;
    };

    // Generate available days (next 7 days)
    const availableDays = [];
    const startDay = currentHour >= SAME_DAY_CUTOFF_HOUR ? 1 : 0; // Skip today if past cutoff

    for (let dayOffset = startDay; dayOffset <= 7; dayOffset++) {
      const userDate = getUserLocalDate(dayOffset);
      const dayOfWeek = userDate.getUTCDay();

      // Skip Sunday only (supplier hours: Mon-Sat)
      // TODO: Make this configurable per supplier from database
      if (dayOfWeek === 0) continue;

      const dayDate = createDate(dayOffset, 12); // Use noon to avoid date boundary issues
      availableDays.push({
        id: `day-${dayOffset}`,
        offset: dayOffset,
        label: formatDayLabel(dayOffset),
        date: `${userDate.getUTCFullYear()}-${String(userDate.getUTCMonth() + 1).padStart(2, '0')}-${String(userDate.getUTCDate()).padStart(2, '0')}`,
        fullDate: dayDate.toISOString(),
      });
    }

    // Generate hourly time slots for each day
    const generateTimeSlots = (dayOffset: number) => {
      const slots = [];
      let startHour = BUSINESS_START_HOUR;

      // For today, start from current hour + 2 (minimum 2 hour lead time)
      if (dayOffset === 0) {
        startHour = Math.max(BUSINESS_START_HOUR, currentHour + 2);
      }

      for (let hour = startHour; hour < BUSINESS_END_HOUR; hour++) {
        const slotStart = createDate(dayOffset, hour, 0);
        const slotEnd = createDate(dayOffset, hour + 1, 0);

        const formatHour = (h: number) => {
          const period = h >= 12 ? 'PM' : 'AM';
          const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
          return `${displayHour}:00 ${period}`;
        };

        slots.push({
          id: `slot-${dayOffset}-${hour}`,
          label: `${formatHour(hour)} - ${formatHour(hour + 1)}`,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          hour: hour, // Send hour for frontend display
          available: true,
        });
      }

      return slots;
    };

    // Build response with days and their time slots
    const daysWithSlots = availableDays.map(day => ({
      ...day,
      timeSlots: generateTimeSlots(day.offset),
    }));

    res.json({
      success: true,
      data: {
        sameDayCutoff: `${SAME_DAY_CUTOFF_HOUR > 12 ? SAME_DAY_CUTOFF_HOUR - 12 : SAME_DAY_CUTOFF_HOUR}:00 ${SAME_DAY_CUTOFF_HOUR >= 12 ? 'PM' : 'AM'}`,
        currentTime: now.toISOString(),
        isSameDayAvailable: currentHour < SAME_DAY_CUTOFF_HOUR,
        days: daysWithSlots,
      },
      message: 'Available windows retrieved successfully',
    });
  } catch (error) {
    console.error('Get available windows error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve available windows',
    });
  }
}
