const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'buildapp_dev',
  user: 'buildapp_user',
  password: 'buildapp_password'
});

async function checkRFQs() {
  const supplierId = '5bbd07cd-54bf-459a-8d9a-baa35b2968ae';

  const result = await pool.query(`
    SELECT
      r.id,
      r.status as rfq_status,
      rr.viewed_at,
      o.id as offer_id,
      o.status as offer_status
    FROM rfq_recipients rr
    INNER JOIN rfqs r ON rr.rfq_id = r.id
    LEFT JOIN offers o ON o.rfq_id = r.id AND o.supplier_id = rr.supplier_id
    WHERE rr.supplier_id = $1
    ORDER BY r.created_at DESC
  `, [supplierId]);

  console.log('\n=== ALL RFQs for supplier ===');
  result.rows.forEach(row => {
    console.log(`RFQ: ${row.id.substring(0, 8)}`);
    console.log(`  RFQ Status: ${row.rfq_status}`);
    console.log(`  Viewed At: ${row.viewed_at ? 'YES' : 'NO'}`);
    console.log(`  Has Offer: ${row.offer_id ? 'YES' : 'NO'}`);
    console.log(`  Offer Status: ${row.offer_status || 'N/A'}`);
    console.log('');
  });

  await pool.end();
}

checkRFQs().catch(console.error);
