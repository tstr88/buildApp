/**
 * Supplier RFQ Controller
 * Handles supplier-side RFQ operations (viewing and responding to RFQs)
 */

import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * GET /api/suppliers/dashboard
 * Get dashboard summary statistics
 */
export async function getSupplierDashboard(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const client = await pool.connect();

    try {
      // Get supplier ID
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [req.user.id]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Get new RFQs count (unviewed)
      const newRFQsResult = await client.query(
        `SELECT COUNT(*) as count
         FROM rfq_recipients rr
         INNER JOIN rfqs r ON r.id = rr.rfq_id
         WHERE rr.supplier_id = $1
         AND rr.viewed_at IS NULL
         AND r.status = 'active'
         AND NOT EXISTS (
           SELECT 1 FROM offers o
           WHERE o.rfq_id = r.id AND o.supplier_id = $1
         )`,
        [supplierId]
      );

      // Get offers sent count (pending)
      const offersSentResult = await client.query(
        `SELECT COUNT(*) as count
         FROM offers
         WHERE supplier_id = $1 AND status = 'pending'`,
        [supplierId]
      );

      // Get today's deliveries (orders with delivery today)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todaysDeliveriesResult = await client.query(
        `SELECT COUNT(*) as count
         FROM orders o
         INNER JOIN offers off ON off.id = o.offer_id
         WHERE off.supplier_id = $1
         AND o.delivery_date::date = CURRENT_DATE
         AND o.status IN ('confirmed', 'in_transit')`,
        [supplierId]
      );

      // Get pending confirmations (offers accepted but order not confirmed, within 24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const pendingConfirmationsResult = await client.query(
        `SELECT COUNT(*) as count
         FROM offers
         WHERE supplier_id = $1
         AND status = 'accepted'
         AND accepted_at >= $2
         AND NOT EXISTS (
           SELECT 1 FROM orders WHERE offer_id = offers.id
         )`,
        [supplierId, twentyFourHoursAgo.toISOString()]
      );

      // Get trust score
      const trustScoreResult = await client.query(
        `SELECT
           spec_reliability_pct,
           on_time_pct,
           issue_rate_pct,
           total_orders
         FROM trust_metrics
         WHERE supplier_id = $1`,
        [supplierId]
      );

      let trustScore = 100;
      let trustTrend: 'up' | 'down' | 'stable' = 'stable';

      if (trustScoreResult.rows.length > 0) {
        const metrics = trustScoreResult.rows[0];
        trustScore = Math.round(
          (metrics.spec_reliability_pct + metrics.on_time_pct + (100 - metrics.issue_rate_pct)) / 3
        );
        // Simple trend calculation (could be enhanced with historical data)
        if (trustScore >= 95) trustTrend = 'up';
        else if (trustScore < 85) trustTrend = 'down';
      }

      // Get recent activities (last 10)
      const activitiesResult = await client.query(
        `(
          SELECT
            'rfq_received' as type,
            r.id,
            'New RFQ from ' || u.name as title,
            'RFQ #' || SUBSTRING(r.id::text, 1, 8) as description,
            rr.notified_at as timestamp
          FROM rfq_recipients rr
          INNER JOIN rfqs r ON r.id = rr.rfq_id
          INNER JOIN projects p ON p.id = r.project_id
          INNER JOIN users u ON u.id = p.user_id
          WHERE rr.supplier_id = $1
          ORDER BY rr.notified_at DESC
          LIMIT 5
        )
        UNION ALL
        (
          SELECT
            'offer_accepted' as type,
            o.id,
            'Offer accepted' as title,
            'RFQ #' || SUBSTRING(o.rfq_id::text, 1, 8) || ' - ₾' || o.total_amount::text as description,
            o.accepted_at as timestamp
          FROM offers o
          WHERE o.supplier_id = $1 AND o.status = 'accepted'
          ORDER BY o.accepted_at DESC
          LIMIT 5
        )
        ORDER BY timestamp DESC
        LIMIT 10`,
        [supplierId]
      );

      // Format activities with relative time
      const activities = activitiesResult.rows.map((activity) => {
        const timestamp = new Date(activity.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let relativeTime = '';
        if (diffMins < 60) {
          relativeTime = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          relativeTime = `${diffHours}h ago`;
        } else {
          relativeTime = `${diffDays}d ago`;
        }

        return {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.timestamp,
          relativeTime,
        };
      });

      res.json({
        success: true,
        stats: {
          newRFQs: parseInt(newRFQsResult.rows[0].count),
          offersSent: parseInt(offersSentResult.rows[0].count),
          todaysDeliveries: parseInt(todaysDeliveriesResult.rows[0].count),
          pendingConfirmations: parseInt(pendingConfirmationsResult.rows[0].count),
          trustScore,
          trustTrend,
        },
        activities,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get supplier dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
}

/**
 * GET /api/suppliers/rfqs
 * Get list of RFQs for supplier (filtered by status)
 */
export async function getSupplierRFQs(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const status = req.query.status as string || 'new';
    const client = await pool.connect();

    try {
      // Get supplier ID and depot location
      const supplierResult = await client.query(
        'SELECT id, depot_latitude, depot_longitude FROM suppliers WHERE user_id = $1',
        [req.user.id]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Supplier profile not found' });
        return;
      }

      const { id: supplierId, depot_latitude, depot_longitude } = supplierResult.rows[0];

      let query = '';
      let params: any[] = [supplierId];

      // Build query based on status
      if (status === 'new') {
        query = `
          SELECT
            rr.id,
            r.id as rfq_id,
            u.user_type as buyer_type,
            u.name as buyer_name,
            CASE WHEN (SELECT COUNT(*) FROM orders o2
                       INNER JOIN offers off2 ON off2.id = o2.offer_id
                       WHERE o2.user_id = u.id) = 0
                 THEN true ELSE false END as is_new_buyer,
            COALESCE(r.delivery_address, p.address) as project_location,
            COALESCE(r.delivery_location_lat, p.latitude) as delivery_lat,
            COALESCE(r.delivery_location_lng, p.longitude) as delivery_lng,
            earth_distance(
              ll_to_earth($2, $3),
              ll_to_earth(
                COALESCE(r.delivery_location_lat, p.latitude)::float8,
                COALESCE(r.delivery_location_lng, p.longitude)::float8
              )
            ) / 1000 as distance_km,
            jsonb_array_length(r.lines) as item_count,
            r.preferred_window_start,
            r.preferred_window_end,
            rr.notified_at as received_at,
            rr.viewed_at
          FROM rfq_recipients rr
          INNER JOIN rfqs r ON r.id = rr.rfq_id
          INNER JOIN projects p ON p.id = r.project_id
          INNER JOIN users u ON u.id = p.user_id
          WHERE rr.supplier_id = $1
          AND r.status = 'active'
          AND NOT EXISTS (
            SELECT 1 FROM offers o
            WHERE o.rfq_id = r.id AND o.supplier_id = $1
          )
          ORDER BY rr.notified_at DESC`;
        params.push(depot_latitude, depot_longitude);
      } else if (status === 'sent') {
        query = `
          SELECT
            o.id,
            r.id as rfq_id,
            u.user_type as buyer_type,
            u.name as buyer_name,
            false as is_new_buyer,
            COALESCE(r.delivery_address, p.address) as project_location,
            COALESCE(r.delivery_location_lat, p.latitude) as delivery_lat,
            COALESCE(r.delivery_location_lng, p.longitude) as delivery_lng,
            earth_distance(
              ll_to_earth($2, $3),
              ll_to_earth(
                COALESCE(r.delivery_location_lat, p.latitude)::float8,
                COALESCE(r.delivery_location_lng, p.longitude)::float8
              )
            ) / 1000 as distance_km,
            jsonb_array_length(r.lines) as item_count,
            r.preferred_window_start,
            r.preferred_window_end,
            o.created_at as received_at,
            o.created_at as viewed_at,
            o.status as offer_status,
            o.total_amount as offer_total
          FROM offers o
          INNER JOIN rfqs r ON r.id = o.rfq_id
          INNER JOIN projects p ON p.id = r.project_id
          INNER JOIN users u ON u.id = p.user_id
          WHERE o.supplier_id = $1
          AND o.status = 'pending'
          ORDER BY o.created_at DESC`;
        params.push(depot_latitude, depot_longitude);
      } else if (status === 'accepted') {
        query = `
          SELECT
            o.id,
            r.id as rfq_id,
            u.user_type as buyer_type,
            u.name as buyer_name,
            false as is_new_buyer,
            COALESCE(r.delivery_address, p.address) as project_location,
            COALESCE(r.delivery_location_lat, p.latitude) as delivery_lat,
            COALESCE(r.delivery_location_lng, p.longitude) as delivery_lng,
            earth_distance(
              ll_to_earth($2, $3),
              ll_to_earth(
                COALESCE(r.delivery_location_lat, p.latitude)::float8,
                COALESCE(r.delivery_location_lng, p.longitude)::float8
              )
            ) / 1000 as distance_km,
            jsonb_array_length(r.lines) as item_count,
            r.preferred_window_start,
            r.preferred_window_end,
            o.accepted_at as received_at,
            o.created_at as viewed_at,
            o.status as offer_status,
            o.total_amount as offer_total
          FROM offers o
          INNER JOIN rfqs r ON r.id = o.rfq_id
          INNER JOIN projects p ON p.id = r.project_id
          INNER JOIN users u ON u.id = p.user_id
          WHERE o.supplier_id = $1
          AND o.status = 'accepted'
          ORDER BY o.accepted_at DESC`;
        params.push(depot_latitude, depot_longitude);
      } else if (status === 'expired') {
        query = `
          SELECT
            o.id,
            r.id as rfq_id,
            u.user_type as buyer_type,
            u.name as buyer_name,
            false as is_new_buyer,
            COALESCE(r.delivery_address, p.address) as project_location,
            COALESCE(r.delivery_location_lat, p.latitude) as delivery_lat,
            COALESCE(r.delivery_location_lng, p.longitude) as delivery_lng,
            earth_distance(
              ll_to_earth($2, $3),
              ll_to_earth(
                COALESCE(r.delivery_location_lat, p.latitude)::float8,
                COALESCE(r.delivery_location_lng, p.longitude)::float8
              )
            ) / 1000 as distance_km,
            jsonb_array_length(r.lines) as item_count,
            r.preferred_window_start,
            r.preferred_window_end,
            o.created_at as received_at,
            o.created_at as viewed_at,
            o.status as offer_status,
            o.total_amount as offer_total
          FROM offers o
          INNER JOIN rfqs r ON r.id = o.rfq_id
          INNER JOIN projects p ON p.id = r.project_id
          INNER JOIN users u ON u.id = p.user_id
          WHERE o.supplier_id = $1
          AND (o.status = 'expired' OR o.status = 'rejected')
          ORDER BY o.created_at DESC`;
        params.push(depot_latitude, depot_longitude);
      }

      const rfqsResult = await client.query(query, params);

      // Format RFQs with relative time
      const rfqs = rfqsResult.rows.map((rfq) => {
        const timestamp = new Date(rfq.received_at);
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let relativeTime = '';
        if (diffMins < 60) {
          relativeTime = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          relativeTime = `${diffHours}h ago`;
        } else {
          relativeTime = `${diffDays}d ago`;
        }

        return {
          ...rfq,
          relative_time: relativeTime,
        };
      });

      // Get counts for all tabs
      const countsResult = await client.query(
        `SELECT
          (SELECT COUNT(*) FROM rfq_recipients rr2
           INNER JOIN rfqs r2 ON r2.id = rr2.rfq_id
           WHERE rr2.supplier_id = $1
           AND r2.status = 'active'
           AND NOT EXISTS (SELECT 1 FROM offers o2 WHERE o2.rfq_id = r2.id AND o2.supplier_id = $1)
          ) as new,
          (SELECT COUNT(*) FROM offers o3 WHERE o3.supplier_id = $1 AND o3.status = 'pending') as sent,
          (SELECT COUNT(*) FROM offers o4 WHERE o4.supplier_id = $1 AND o4.status = 'accepted') as accepted,
          (SELECT COUNT(*) FROM offers o5 WHERE o5.supplier_id = $1 AND o5.status IN ('expired', 'rejected')) as expired`,
        [supplierId]
      );

      res.json({
        success: true,
        rfqs,
        counts: {
          new: parseInt(countsResult.rows[0].new),
          sent: parseInt(countsResult.rows[0].sent),
          accepted: parseInt(countsResult.rows[0].accepted),
          expired: parseInt(countsResult.rows[0].expired),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get supplier RFQs error:', error);
    res.status(500).json({ success: false, error: 'Failed to load RFQs' });
  }
}

/**
 * GET /api/suppliers/rfqs/:rfqId
 * Get detailed RFQ information
 */
export async function getSupplierRFQDetail(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { rfqId } = req.params;
    const client = await pool.connect();

    try {
      // Get supplier ID and depot location
      const supplierResult = await client.query(
        'SELECT id, depot_latitude, depot_longitude FROM suppliers WHERE user_id = $1',
        [req.user.id]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Supplier profile not found' });
        return;
      }

      const { id: supplierId, depot_latitude, depot_longitude } = supplierResult.rows[0];

      console.log('[DEBUG] About to query RFQ:', { rfqId, supplierId, depot_latitude, depot_longitude });

      // Get RFQ details
      const rfqResult = await client.query(
        `SELECT
          r.id,
          r.title,
          r.lines,
          r.preferred_window_start,
          r.preferred_window_end,
          r.additional_notes,
          COALESCE(r.delivery_address, p.address) as project_address,
          COALESCE(r.delivery_location_lat, p.latitude) as delivery_lat,
          COALESCE(r.delivery_location_lng, p.longitude) as delivery_lng,
          earth_distance(
            ll_to_earth($3, $4),
            ll_to_earth(
              COALESCE(r.delivery_location_lat, p.latitude)::float8,
              COALESCE(r.delivery_location_lng, p.longitude)::float8
            )
          ) / 1000 as distance_km,
          u.user_type as buyer_type,
          u.name as buyer_name,
          u.buyer_role,
          CASE WHEN (SELECT COUNT(*) FROM orders o2
                     INNER JOIN offers off2 ON off2.id = o2.offer_id
                     WHERE o2.user_id = u.id) = 0
               THEN true ELSE false END as is_new_buyer,
          p.name as project_location,
          r.created_at
        FROM rfqs r
        LEFT JOIN projects p ON p.id = r.project_id
        INNER JOIN users u ON u.id = r.user_id
        INNER JOIN rfq_recipients rr ON rr.rfq_id = r.id
        WHERE r.id = $1
        AND rr.supplier_id = $2`,
        [rfqId, supplierId, depot_latitude, depot_longitude]
      );

      if (rfqResult.rows.length === 0) {
        res.status(404).json({ success: false, error: 'RFQ not found' });
        return;
      }

      const rfq = rfqResult.rows[0];

      // DEBUG: Log what we got from database
      console.log('[DEBUG] Full RFQ row from database:', JSON.stringify(rfq, null, 2));
      console.log('[DEBUG] RFQ from database:', {
        id: rfq.id,
        preferred_window_start: rfq.preferred_window_start,
        preferred_window_end: rfq.preferred_window_end,
        project_address: rfq.project_address,
        delivery_lat: rfq.delivery_lat,
        delivery_lng: rfq.delivery_lng,
      });

      // Mark as viewed
      await client.query(
        `INSERT INTO rfq_views (rfq_id, supplier_id, viewed_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [rfqId, supplierId]
      );

      // Check if supplier already submitted an offer
      const offerResult = await client.query(
        'SELECT id FROM offers WHERE rfq_id = $1 AND supplier_id = $2',
        [rfqId, supplierId]
      );

      const responseData = {
        success: true,
        rfq: {
          id: rfq.id,
          buyer_type: rfq.buyer_type === 'buyer' ? (rfq.buyer_role === 'homeowner' ? 'homeowner' : 'contractor') : 'contractor',
          buyer_name: rfq.buyer_name,
          is_new_buyer: rfq.is_new_buyer,
          project_location: rfq.project_location,
          project_address: rfq.project_address,
          delivery_lat: rfq.delivery_lat,
          delivery_lng: rfq.delivery_lng,
          distance_km: parseFloat(rfq.distance_km),
          lines: rfq.lines,
          preferred_window_start: rfq.preferred_window_start,
          preferred_window_end: rfq.preferred_window_end,
          additional_notes: rfq.additional_notes,
          created_at: rfq.created_at,
          has_existing_offer: offerResult.rows.length > 0,
        },
      };

      // DEBUG: Log what we're sending in response
      console.log('[DEBUG] Sending response:', {
        preferred_window_start: responseData.rfq.preferred_window_start,
        preferred_window_end: responseData.rfq.preferred_window_end,
        project_address: responseData.rfq.project_address,
      });

      res.json(responseData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get RFQ detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to load RFQ details' });
  }
}

/**
 * POST /api/suppliers/rfqs/:rfqId/offer
 * Submit an offer for an RFQ
 */
export async function submitOffer(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();

  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { rfqId } = req.params;
    const {
      line_prices,
      total_amount,
      delivery_window_start,
      delivery_window_end,
      payment_terms,
      delivery_fee,
      notes,
      expires_at,
    } = req.body;

    // Validation
    if (!line_prices || !Array.isArray(line_prices) || line_prices.length === 0) {
      res.status(400).json({ success: false, error: 'Line prices are required' });
      return;
    }

    if (!total_amount || total_amount <= 0) {
      res.status(400).json({ success: false, error: 'Invalid total amount' });
      return;
    }

    if (!delivery_window_start || !delivery_window_end) {
      res.status(400).json({ success: false, error: 'Delivery window is required' });
      return;
    }

    if (!expires_at) {
      res.status(400).json({ success: false, error: 'Offer expiry is required' });
      return;
    }

    await client.query('BEGIN');

    // Get supplier ID
    const supplierResult = await client.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [req.user.id]
    );

    if (supplierResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, error: 'Supplier profile not found' });
      return;
    }

    const supplierId = supplierResult.rows[0].id;

    // Check if offer already exists
    const existingOffer = await client.query(
      'SELECT id FROM offers WHERE rfq_id = $1 AND supplier_id = $2',
      [rfqId, supplierId]
    );

    if (existingOffer.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ success: false, error: 'Offer already submitted for this RFQ' });
      return;
    }

    // Create offer
    const offerResult = await client.query(
      `INSERT INTO offers (
        rfq_id,
        supplier_id,
        line_prices,
        total_amount,
        delivery_window_start,
        delivery_window_end,
        payment_terms,
        delivery_fee,
        notes,
        expires_at,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        rfqId,
        supplierId,
        JSON.stringify(line_prices),
        total_amount,
        delivery_window_start,
        delivery_window_end,
        payment_terms,
        delivery_fee || 0,
        notes,
        expires_at,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully',
      offer: {
        id: offerResult.rows[0].id,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit offer error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit offer' });
  } finally {
    client.release();
  }
}

/**
 * POST /api/suppliers/rfqs/:rfqId/decline
 * Decline an RFQ
 */
export async function declineRFQ(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { rfqId } = req.params;
    const client = await pool.connect();

    try {
      // Get supplier ID
      const supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [req.user.id]
      );

      if (supplierResult.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Supplier profile not found' });
        return;
      }

      const supplierId = supplierResult.rows[0].id;

      // Mark RFQ recipient as declined (we can use a soft delete or add a declined_at field)
      // For now, we'll just mark it as viewed so it doesn't show in "new" anymore
      await client.query(
        `UPDATE rfq_recipients
         SET viewed_at = COALESCE(viewed_at, CURRENT_TIMESTAMP)
         WHERE rfq_id = $1 AND supplier_id = $2`,
        [rfqId, supplierId]
      );

      res.json({
        success: true,
        message: 'RFQ declined',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Decline RFQ error:', error);
    res.status(500).json({ success: false, error: 'Failed to decline RFQ' });
  }
}
