/**
 * Suppliers Controller
 * Handles supplier-specific endpoints
 */

import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * POST /api/suppliers/onboard
 * Create a new supplier account with initial catalog
 */
export async function onboardSupplier(req: Request, res: Response): Promise<void> {
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
      business_name,
      depot_lat,
      depot_lng,
      depot_address,
      delivery_zone,
      categories,
      skus,
      payment_methods,
      min_order_value,
      about,
    } = req.body;

    // Validation
    if (!business_name || !business_name.trim()) {
      res.status(400).json({
        success: false,
        error: 'Business name is required',
      });
      return;
    }

    if (!depot_lat || !depot_lng) {
      res.status(400).json({
        success: false,
        error: 'Depot location is required',
      });
      return;
    }

    // Validate Georgia bounds
    const GEORGIA_BOUNDS = {
      minLat: 41.0,
      maxLat: 43.5,
      minLng: 40.0,
      maxLng: 46.7,
    };

    if (
      depot_lat < GEORGIA_BOUNDS.minLat ||
      depot_lat > GEORGIA_BOUNDS.maxLat ||
      depot_lng < GEORGIA_BOUNDS.minLng ||
      depot_lng > GEORGIA_BOUNDS.maxLng
    ) {
      res.status(400).json({
        success: false,
        error: 'Depot location must be within Georgia',
      });
      return;
    }

    if (!categories || categories.length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one category is required',
      });
      return;
    }

    if (!skus || skus.length < 1) {
      res.status(400).json({
        success: false,
        error: 'At least 1 product is required',
      });
      return;
    }

    if (!payment_methods || payment_methods.length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one payment method is required',
      });
      return;
    }

    // Map frontend payment method names to database enum values
    const paymentMethodMapping: Record<string, string> = {
      'cashOnDelivery': 'cod',
      'bankTransfer': 'net_7',
      'prepay': 'advance_100'
    };
    const mappedPaymentMethods = payment_methods.map(
      (method: string) => paymentMethodMapping[method] || 'cod'
    );

    await client.query('BEGIN');

    // Check if user already has a supplier profile
    const existingSupplier = await client.query(
      'SELECT id FROM suppliers WHERE user_id = $1',
      [userId]
    );

    if (existingSupplier.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({
        success: false,
        error: 'Supplier profile already exists for this user',
      });
      return;
    }

    // Update user type to supplier
    await client.query(
      'UPDATE users SET user_type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['supplier', userId]
    );

    // Create supplier profile (using bilingual columns)
    const supplierResult = await client.query(
      `INSERT INTO suppliers (
        user_id,
        business_name_ka,
        business_name_en,
        depot_latitude,
        depot_longitude,
        depot_address,
        delivery_zones,
        categories,
        payment_terms,
        about_ka,
        about_en,
        min_order_value,
        is_verified,
        is_active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        userId,
        business_name, // Store in both languages for now
        business_name,
        depot_lat,
        depot_lng,
        depot_address,
        JSON.stringify({ delivery_zone }),
        categories,
        mappedPaymentMethods,
        about || null, // Store in both languages for now
        about || null,
        min_order_value || null,
        false, // is_verified
        true,  // is_active
      ]
    );

    const supplierId = supplierResult.rows[0].id;

    // Insert SKUs
    for (const sku of skus) {
      await client.query(
        `INSERT INTO skus (
          supplier_id,
          name_ka,
          name_en,
          unit_ka,
          unit_en,
          base_price,
          delivery_options,
          direct_order_available,
          approx_lead_time_label,
          category_ka,
          category_en,
          is_active,
          stock_status,
          images,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          supplierId,
          sku.name, // Store in both languages for now
          sku.name,
          sku.unit,
          sku.unit,
          sku.base_price,
          sku.delivery_option,
          sku.direct_order_enabled,
          sku.lead_time,
          categories[0] || 'other', // Store in both languages for now
          categories[0] || 'other',
          true, // is_active
          'available', // stock_status
          [], // images
        ]
      );
    }

    // Initialize trust metrics
    await client.query(
      `INSERT INTO trust_metrics (
        supplier_id,
        spec_reliability_pct,
        on_time_pct,
        issue_rate_pct,
        sample_size,
        total_orders,
        total_disputes,
        total_late_deliveries,
        total_spec_mismatches,
        total_ratings,
        created_at,
        updated_at
      ) VALUES ($1, 100, 100, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [supplierId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Supplier onboarded successfully',
      supplier: {
        id: supplierId,
        business_name,
        user_id: userId,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Supplier onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to onboard supplier',
    });
  } finally {
    client.release();
  }
}
