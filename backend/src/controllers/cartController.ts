/**
 * Cart Controller
 * Handles shopping cart operations for buyers
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import { success } from '../utils/responseHelpers';

/**
 * Get user's cart with items grouped by supplier
 */
export const getCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await pool.query(
    `SELECT
      ci.*,
      COALESCE(sup.business_name_en, sup.business_name_ka) as supplier_name,
      sup.logo_url as supplier_logo,
      sup.depot_address as supplier_address,
      p.name as project_name,
      p.address as project_address,
      s.images as sku_images,
      s.approx_lead_time_label as lead_time
     FROM cart_items ci
     LEFT JOIN suppliers sup ON ci.supplier_id = sup.id
     LEFT JOIN projects p ON ci.project_id = p.id
     LEFT JOIN skus s ON ci.sku_id = s.id
     WHERE ci.user_id = $1
     ORDER BY ci.supplier_id, ci.created_at`,
    [userId]
  );

  // Generate available delivery timeslots (next 3 days)
  const generateTimeslots = () => {
    const slots = [];
    const now = new Date();

    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Morning, Afternoon, Evening slots
      slots.push(
        { id: `${dateStr}-morning`, date: dateStr, label: `${dayName}, ${monthDay}`, time: '09:00 - 12:00', slot: 'morning' },
        { id: `${dateStr}-afternoon`, date: dateStr, label: `${dayName}, ${monthDay}`, time: '12:00 - 17:00', slot: 'afternoon' },
        { id: `${dateStr}-evening`, date: dateStr, label: `${dayName}, ${monthDay}`, time: '17:00 - 20:00', slot: 'evening' }
      );
    }
    return slots;
  };

  const deliverySlots = generateTimeslots();
  const pickupSlots = generateTimeslots();

  // Group by supplier
  const supplierGroups: Record<string, any> = {};
  let totalItems = 0;
  let totalAmount = 0;

  for (const item of result.rows) {
    const supplierId = item.supplier_id;
    if (!supplierGroups[supplierId]) {
      supplierGroups[supplierId] = {
        supplier_id: supplierId,
        supplier_name: item.supplier_name,
        supplier_logo: item.supplier_logo,
        supplier_address: item.supplier_address,
        items: [],
        subtotal: 0,
        item_count: 0
      };
    }

    const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
    supplierGroups[supplierId].items.push({
      id: item.id,
      sku_id: item.sku_id,
      project_material_id: item.project_material_id,
      project_id: item.project_id,
      project_name: item.project_name,
      project_address: item.project_address,
      name: item.name,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      unit_price: parseFloat(item.unit_price),
      total: itemTotal,
      action_type: item.action_type,
      images: item.sku_images,
      created_at: item.created_at
    });

    supplierGroups[supplierId].subtotal += itemTotal;
    supplierGroups[supplierId].item_count++;
    totalItems++;
    totalAmount += itemTotal;
  }

  return success(res, {
    suppliers: Object.values(supplierGroups),
    summary: {
      total_items: totalItems,
      total_suppliers: Object.keys(supplierGroups).length,
      total_amount: totalAmount
    },
    timeslots: {
      delivery: deliverySlots,
      pickup: pickupSlots
    }
  }, 'Cart retrieved successfully');
};

/**
 * Get cart item count for badge
 */
export const getCartCount = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await pool.query(
    'SELECT COUNT(*) as count FROM cart_items WHERE user_id = $1',
    [userId]
  );

  return success(res, { count: parseInt(result.rows[0].count) }, 'Cart count retrieved');
};

/**
 * Add item to cart
 */
export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {
    project_material_id,
    project_id,
    sku_id,
    supplier_id,
    name,
    description,
    quantity,
    unit,
    unit_price,
    action_type = 'direct_order'
  } = req.body;

  // Validate required fields
  if (!supplier_id) {
    return res.status(400).json({ success: false, message: 'supplier_id is required' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Valid quantity is required' });
  }
  if (!unit) {
    return res.status(400).json({ success: false, message: 'unit is required' });
  }
  if (unit_price === undefined || unit_price < 0) {
    return res.status(400).json({ success: false, message: 'Valid unit_price is required' });
  }

  // Verify supplier exists
  const supplierCheck = await pool.query(
    'SELECT id FROM suppliers WHERE id = $1 AND is_active = true',
    [supplier_id]
  );

  if (supplierCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  // If project_material_id provided, verify it exists and isn't already in cart
  if (project_material_id) {
    const materialCheck = await pool.query(
      `SELECT pm.id, pm.cart_item_id, p.user_id
       FROM project_materials pm
       JOIN projects p ON pm.project_id = p.id
       WHERE pm.id = $1`,
      [project_material_id]
    );

    if (materialCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project material not found' });
    }

    if (materialCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (materialCheck.rows[0].cart_item_id) {
      return res.status(400).json({ success: false, message: 'This material is already in cart' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert cart item
    const result = await client.query(
      `INSERT INTO cart_items (
        user_id, project_material_id, project_id, sku_id, supplier_id,
        name, description, quantity, unit, unit_price, action_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        project_material_id || null,
        project_id || null,
        sku_id || null,
        supplier_id,
        name,
        description || null,
        quantity,
        unit,
        unit_price,
        action_type
      ]
    );

    const cartItem = result.rows[0];

    // The trigger will update the project_material status automatically

    await client.query('COMMIT');

    return success(res, { cart_item: cartItem }, 'Item added to cart', 201);

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error adding to cart:', err);

    if (err.constraint === 'unique_cart_material') {
      return res.status(400).json({ success: false, message: 'This material is already in cart' });
    }

    return res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  } finally {
    client.release();
  }
};

/**
 * Add multiple items to cart (bulk add from project materials)
 */
export const bulkAddToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'items array is required' });
  }

  // Validate all items have supplier_id
  for (const item of items) {
    if (!item.supplier_id) {
      return res.status(400).json({ success: false, message: `All items must have a supplier_id. Missing for: ${item.name || 'unknown item'}` });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const addedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        // Check if material already in cart
        if (item.project_material_id) {
          const existingCheck = await client.query(
            'SELECT id FROM cart_items WHERE project_material_id = $1',
            [item.project_material_id]
          );
          if (existingCheck.rows.length > 0) {
            errors.push({ name: item.name, error: 'Already in cart' });
            continue;
          }
        }

        const result = await client.query(
          `INSERT INTO cart_items (
            user_id, project_material_id, project_id, sku_id, supplier_id,
            name, description, quantity, unit, unit_price, action_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            userId,
            item.project_material_id || null,
            item.project_id || null,
            item.sku_id || null,
            item.supplier_id,
            item.name,
            item.description || null,
            item.quantity,
            item.unit,
            item.unit_price,
            item.action_type || 'direct_order'
          ]
        );

        addedItems.push(result.rows[0].id);
      } catch (itemErr: any) {
        errors.push({ name: item.name, error: itemErr.message });
      }
    }

    await client.query('COMMIT');

    return success(res, {
      added_count: addedItems.length,
      added_ids: addedItems,
      errors: errors.length > 0 ? errors : undefined
    }, `${addedItems.length} items added to cart`, 201);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error bulk adding to cart:', err);
    return res.status(500).json({ success: false, message: 'Failed to add items to cart' });
  } finally {
    client.release();
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { cartItemId } = req.params;
  const { quantity, action_type } = req.body;

  // Verify cart item belongs to user
  const check = await pool.query(
    'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
    [cartItemId, userId]
  );

  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (quantity !== undefined) {
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }
    updates.push(`quantity = $${paramCount}`);
    values.push(quantity);
    paramCount++;
  }

  if (action_type !== undefined) {
    if (!['direct_order', 'rfq'].includes(action_type)) {
      return res.status(400).json({ success: false, message: 'action_type must be "direct_order" or "rfq"' });
    }
    updates.push(`action_type = $${paramCount}`);
    values.push(action_type);
    paramCount++;
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(cartItemId);

  const result = await pool.query(
    `UPDATE cart_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return success(res, { cart_item: result.rows[0] }, 'Cart item updated');
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { cartItemId } = req.params;

  // Verify cart item belongs to user
  const check = await pool.query(
    'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
    [cartItemId, userId]
  );

  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  // The trigger will update the project_material status automatically
  await pool.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);

  return success(res, null, 'Item removed from cart');
};

/**
 * Clear entire cart
 */
export const clearCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await pool.query(
    'DELETE FROM cart_items WHERE user_id = $1 RETURNING id',
    [userId]
  );

  return success(res, { removed_count: result.rows.length }, 'Cart cleared');
};

/**
 * Checkout cart - creates orders/RFQs
 */
export const checkoutCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {
    supplier_id, // Optional: checkout only one supplier's items
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    delivery_window_start,
    delivery_window_end,
    pickup_or_delivery = 'delivery',
    payment_terms = 'cod',
    notes
  } = req.body;

  // Get cart items (optionally filtered by supplier)
  let query = `
    SELECT ci.*, sup.id as supplier_id
    FROM cart_items ci
    JOIN suppliers sup ON ci.supplier_id = sup.id
    WHERE ci.user_id = $1
  `;
  const params: any[] = [userId];

  if (supplier_id) {
    query += ' AND ci.supplier_id = $2';
    params.push(supplier_id);
  }

  query += ' ORDER BY ci.supplier_id';

  const cartResult = await pool.query(query, params);

  if (cartResult.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in cart to checkout' });
  }

  // Group items by supplier and action_type
  const groups: Record<string, { supplier_id: string; action_type: string; items: any[] }> = {};

  for (const item of cartResult.rows) {
    const key = `${item.supplier_id}_${item.action_type}`;
    if (!groups[key]) {
      groups[key] = {
        supplier_id: item.supplier_id,
        action_type: item.action_type,
        items: []
      };
    }
    groups[key].items.push(item);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const createdOrders: any[] = [];
    const createdRFQs: any[] = [];
    const processedCartItemIds: string[] = [];

    for (const group of Object.values(groups)) {
      if (group.action_type === 'direct_order') {
        // Create direct order
        const items = group.items.map(item => ({
          sku_id: item.sku_id,
          description: item.name,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unit_price: parseFloat(item.unit_price),
          total: parseFloat(item.quantity) * parseFloat(item.unit_price),
          project_material_id: item.project_material_id
        }));

        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

        // Get project_id from the first item (all items in group should be from same project)
        const projectId = group.items[0]?.project_id || null;

        const orderResult = await client.query(
          `INSERT INTO orders (
            buyer_id, supplier_id, project_id, order_type, items, total_amount,
            delivery_fee, tax_amount, grand_total,
            pickup_or_delivery, delivery_address, delivery_latitude, delivery_longitude,
            promised_window_start, promised_window_end,
            payment_terms, negotiable, status, notes
          ) VALUES ($1, $2, $3, 'material', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, 'pending', $16)
          RETURNING id, order_number`,
          [
            userId,
            group.supplier_id,
            projectId,
            JSON.stringify(items),
            totalAmount,
            0, // delivery_fee
            0, // tax_amount
            totalAmount,
            pickup_or_delivery,
            delivery_address || null,
            delivery_latitude || null,
            delivery_longitude || null,
            delivery_window_start || null,
            delivery_window_end || null,
            payment_terms,
            notes || null
          ]
        );

        const order = orderResult.rows[0];
        createdOrders.push(order);

        // Update project_materials to link to this order
        for (let i = 0; i < items.length; i++) {
          if (items[i].project_material_id) {
            await client.query(
              `UPDATE project_materials
               SET status = 'ordered', order_id = $1, order_line_index = $2, updated_at = CURRENT_TIMESTAMP
               WHERE id = $3`,
              [order.id, i, items[i].project_material_id]
            );
          }
        }

        // Track cart items to remove
        processedCartItemIds.push(...group.items.map(i => i.id));

      } else if (group.action_type === 'rfq') {
        // Create RFQ
        const lines = group.items.map((item, idx) => ({
          line_index: idx,
          sku_id: item.sku_id,
          description: item.name,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          spec_notes: item.description,
          project_material_id: item.project_material_id
        }));

        // Get project_id from the first item
        const projectId = group.items[0]?.project_id || null;

        const rfqResult = await client.query(
          `INSERT INTO rfqs (
            buyer_id, project_id, lines, preferred_window_start, preferred_window_end,
            delivery_location_lat, delivery_location_lng, delivery_address,
            delivery_preference, additional_notes, status, expires_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', NOW() + INTERVAL '7 days')
          RETURNING id`,
          [
            userId,
            projectId,
            JSON.stringify(lines),
            delivery_window_start || null,
            delivery_window_end || null,
            delivery_latitude || null,
            delivery_longitude || null,
            delivery_address || null,
            pickup_or_delivery,
            notes || null
          ]
        );

        const rfqId = rfqResult.rows[0].id;

        // Add recipient
        await client.query(
          'INSERT INTO rfq_recipients (rfq_id, supplier_id) VALUES ($1, $2)',
          [rfqId, group.supplier_id]
        );

        createdRFQs.push({ id: rfqId, supplier_id: group.supplier_id });

        // Update project_materials to link to this RFQ
        for (const item of group.items) {
          if (item.project_material_id) {
            await client.query(
              `UPDATE project_materials
               SET status = 'rfq_sent', rfq_id = $1, updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [rfqId, item.project_material_id]
            );
          }
        }

        // Track cart items to remove
        processedCartItemIds.push(...group.items.map(i => i.id));
      }
    }

    // Remove processed items from cart
    if (processedCartItemIds.length > 0) {
      await client.query(
        'DELETE FROM cart_items WHERE id = ANY($1::uuid[])',
        [processedCartItemIds]
      );
    }

    await client.query('COMMIT');

    return success(res, {
      orders: createdOrders,
      rfqs: createdRFQs,
      processed_items: processedCartItemIds.length
    }, 'Checkout completed successfully', 201);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during checkout:', err);
    return res.status(500).json({ success: false, message: 'Checkout failed' });
  } finally {
    client.release();
  }
};
