/**
 * Database Seed Script
 * Populates database with test data for local development
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database...\n');

    // 1. Create test users
    console.log('Creating test users...');

    const users = [
      { phone: '+995555000001', name: 'Admin User', user_type: 'admin', buyer_role: null },
      { phone: '+995555000002', name: 'Giorgi Beridze', user_type: 'buyer', buyer_role: 'homeowner' },
      { phone: '+995555000003', name: 'Nino Kapanadze', user_type: 'buyer', buyer_role: 'contractor' },
      { phone: '+995555000004', name: 'Tbilisi Concrete Plant', user_type: 'supplier', buyer_role: null },
      { phone: '+995555000005', name: 'Kavkaz Materials', user_type: 'supplier', buyer_role: null },
      { phone: '+995555000006', name: 'ProTools Rental', user_type: 'supplier', buyer_role: null },
    ];

    const userIds: Record<string, string> = {};

    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (phone, name, user_type, buyer_role, is_verified, language)
         VALUES ($1, $2, $3, $4, true, 'ka')
         RETURNING id`,
        [user.phone, user.name, user.user_type, user.buyer_role]
      );
      userIds[user.phone] = result.rows[0].id;
      console.log(`  ✓ ${user.name} (${user.phone})`);
    }

    // 2. Create supplier profiles
    console.log('\nCreating supplier profiles...');

    const supplierIds: Record<string, string> = {};

    const supplier1 = await client.query(
      `INSERT INTO suppliers (user_id, business_name, tax_id, depot_latitude, depot_longitude, depot_address, is_verified, categories)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)
       RETURNING id`,
      [
        userIds['+995555000004'],
        'Tbilisi Concrete Plant LLC',
        '123456789',
        41.7151,
        44.8271,
        'Vazha-Pshavela Ave 71, Tbilisi',
        ['concrete', 'aggregates'],
      ]
    );
    supplierIds['concrete'] = supplier1.rows[0].id;

    const supplier2 = await client.query(
      `INSERT INTO suppliers (user_id, business_name, tax_id, depot_latitude, depot_longitude, depot_address, is_verified, categories)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)
       RETURNING id`,
      [
        userIds['+995555000005'],
        'Kavkaz Materials LLC',
        '987654321',
        41.7000,
        44.8000,
        'Kakheti Highway 15, Tbilisi',
        ['steel', 'aggregates', 'blocks'],
      ]
    );
    supplierIds['materials'] = supplier2.rows[0].id;

    const supplier3 = await client.query(
      `INSERT INTO suppliers (user_id, business_name, tax_id, depot_latitude, depot_longitude, depot_address, is_verified, categories)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)
       RETURNING id`,
      [
        userIds['+995555000006'],
        'ProTools Rental LLC',
        '555666777',
        41.7200,
        44.8300,
        'Chavchavadze Ave 33, Tbilisi',
        ['rental_tools'],
      ]
    );
    supplierIds['rental'] = supplier3.rows[0].id;

    console.log('  ✓ 3 supplier profiles created');

    // 3. Create sample SKUs
    console.log('\nCreating sample SKUs...');

    await client.query(
      `INSERT INTO skus (supplier_id, name, category, unit, base_price, direct_order_available)
       VALUES
       ($1, 'Concrete M300', 'concrete', 'm³', 180.00, true),
       ($1, 'Concrete M400', 'concrete', 'm³', 200.00, true)`,
      [supplierIds['concrete']]
    );

    await client.query(
      `INSERT INTO skus (supplier_id, name, category, unit, base_price, direct_order_available)
       VALUES
       ($1, 'Rebar 12mm', 'steel', 'ton', 850.00, true),
       ($1, 'Concrete Blocks 20cm', 'blocks', 'unit', 1.50, true),
       ($1, 'Gravel 5-20mm', 'aggregates', 'm³', 45.00, true)`,
      [supplierIds['materials']]
    );

    console.log('  ✓ 5 SKUs created');

    // 4. Create sample templates
    console.log('\nCreating sample templates...');

    await client.query(
      `INSERT INTO templates (slug, title_ka, title_en, description_ka, description_en, category, fields, is_published)
       VALUES
       ('fence', 'ღობე', 'Fence', 'აშენე ღობე', 'Build a fence', 'fence', '[]', true),
       ('slab', 'ბეტონის ფილა', 'Concrete Slab', 'ჩაასხი ბეტონის ფილა', 'Pour a concrete slab', 'foundation', '[]', true)`
    );

    console.log('  ✓ 2 templates created');

    console.log('\n====================================');
    console.log('✅ Database seeded successfully!');
    console.log('====================================\n');
    console.log('Test accounts (OTP: 123456):');
    console.log('  Admin:      +995555000001');
    console.log('  Buyer 1:    +995555000002 (Homeowner)');
    console.log('  Buyer 2:    +995555000003 (Contractor)');
    console.log('  Supplier 1: +995555000004 (Concrete)');
    console.log('  Supplier 2: +995555000005 (Materials)');
    console.log('  Supplier 3: +995555000006 (Rental Tools)');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);
