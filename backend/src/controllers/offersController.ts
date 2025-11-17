/**
 * Offers Controller
 * Handles offer comparison and acceptance for buyers
 */

import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * GET /api/buyers/rfqs/:rfqId/offers
 * Get all offers for a specific RFQ with supplier trust metrics
 */
export async function getOffersForRFQ(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { rfqId } = req.params;
    const userId = req.user.id;

    // First, verify the user owns the RFQ
    const rfqCheck = await pool.query(
      `SELECT r.id
       FROM rfqs r
       JOIN projects p ON r.project_id = p.id
       WHERE r.id = $1 AND p.user_id = $2`,
      [rfqId, userId]
    );

    if (rfqCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'RFQ not found',
      });
      return;
    }

    // Get all offers for this RFQ with supplier details and trust metrics
    const offersQuery = `
      SELECT
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
        o.created_at,
        s.business_name as supplier_name,
        u.phone as supplier_phone,
        COALESCE(tm.spec_reliability_pct, 0) as spec_reliability_pct,
        COALESCE(tm.on_time_pct, 0) as on_time_pct,
        COALESCE(tm.issue_rate_pct, 0) as issue_rate_pct,
        COALESCE(tm.sample_size, 0) as trust_sample_size
      FROM offers o
      JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN trust_metrics tm ON s.id = tm.supplier_id
      WHERE o.rfq_id = $1
      ORDER BY o.total_amount ASC, o.created_at ASC
    `;

    const offersResult = await pool.query(offersQuery, [rfqId]);

    res.json({
      success: true,
      data: offersResult.rows,
      message: 'Offers retrieved successfully',
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve offers',
    });
  }
}

/**
 * POST /api/buyers/offers/:offerId/accept
 * Accept an offer and create an order
 */
export async function acceptOffer(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();

  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { offerId } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Get offer details and verify ownership
    const offerQuery = `
      SELECT
        o.*,
        r.project_id,
        r.title as rfq_title,
        r.lines as rfq_lines,
        r.delivery_address,
        r.delivery_location_lat as delivery_latitude,
        r.delivery_location_lng as delivery_longitude,
        r.user_id as rfq_owner_id
      FROM offers o
      JOIN rfqs r ON o.rfq_id = r.id
      WHERE o.id = $1 AND r.user_id = $2
    `;

    const offerResult = await client.query(offerQuery, [offerId, userId]);

    if (offerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Offer not found or you do not have permission',
      });
      return;
    }

    const offer = offerResult.rows[0];

    // Check if offer is still valid
    if (offer.status !== 'pending') {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: `Offer cannot be accepted. Current status: ${offer.status}`,
      });
      return;
    }

    if (new Date(offer.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'Offer has expired',
      });
      return;
    }

    // Calculate totals
    const totalAmount = parseFloat(offer.total_amount);
    const deliveryFee = parseFloat(offer.delivery_fee) || 0;
    const taxAmount = 0; // TODO: Calculate tax if needed
    const grandTotal = totalAmount + deliveryFee + taxAmount;

    // Create order items from offer line_prices and rfq lines
    const rfqLines = offer.rfq_lines;
    const linePrices = offer.line_prices;

    const orderItems = rfqLines.map((line: any, index: number) => {
      const priceInfo = linePrices.find((lp: any) => lp.line_index === index) || linePrices[index];
      return {
        sku_id: line.sku_id || null,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        unit_price: priceInfo?.unit_price || 0,
        total: priceInfo?.total_price || 0,
        spec_notes: line.spec_notes,
      };
    });

    // Create the order
    const orderQuery = `
      INSERT INTO orders (
        buyer_id,
        supplier_id,
        project_id,
        offer_id,
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
        status,
        confirmed_at
      ) VALUES (
        $1, $2, $3, $4, 'material', $5, $6, $7, $8, $9, 'delivery',
        $10, $11, $12, $13, $14, $15, 'confirmed', NOW()
      )
      RETURNING *
    `;

    const orderValues = [
      userId,
      offer.supplier_id,
      offer.project_id,
      offerId,
      JSON.stringify(orderItems),
      totalAmount,
      deliveryFee,
      taxAmount,
      grandTotal,
      offer.delivery_address,
      offer.delivery_latitude,
      offer.delivery_longitude,
      offer.delivery_window_start,
      offer.delivery_window_end,
      offer.payment_terms,
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];

    // Update offer status to accepted
    await client.query(
      `UPDATE offers
       SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [offerId]
    );

    // Expire all other pending offers for this RFQ
    await client.query(
      `UPDATE offers
       SET status = 'expired', updated_at = NOW()
       WHERE rfq_id = $1 AND id != $2 AND status = 'pending'`,
      [offer.rfq_id, offerId]
    );

    // Update RFQ status to closed
    await client.query(
      `UPDATE rfqs
       SET status = 'closed', updated_at = NOW()
       WHERE id = $1`,
      [offer.rfq_id]
    );

    await client.query('COMMIT');

    // Return the created order
    res.status(201).json({
      success: true,
      data: {
        order,
        message: 'Offer accepted and order created successfully',
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Accept offer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept offer',
    });
  } finally {
    client.release();
  }
}

/**
 * POST /api/buyers/offers/:offerId/reject
 * Reject an offer
 */
export async function rejectOffer(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { offerId } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user.id;

    // Get offer details and verify ownership
    const offerQuery = `
      SELECT
        o.*,
        r.user_id as rfq_owner_id
      FROM offers o
      JOIN rfqs r ON o.rfq_id = r.id
      WHERE o.id = $1 AND r.user_id = $2
    `;

    const offerResult = await pool.query(offerQuery, [offerId, userId]);

    if (offerResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Offer not found or you do not have permission',
      });
      return;
    }

    const offer = offerResult.rows[0];

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      res.status(400).json({
        success: false,
        error: `Offer cannot be rejected. Current status: ${offer.status}`,
      });
      return;
    }

    // Update offer status to rejected
    await pool.query(
      `UPDATE offers
       SET status = 'rejected', rejected_at = NOW(), rejection_reason = $1, updated_at = NOW()
       WHERE id = $2`,
      [rejection_reason || null, offerId]
    );

    res.json({
      success: true,
      message: 'Offer rejected successfully',
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject offer',
    });
  }
}
