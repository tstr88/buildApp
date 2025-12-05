const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'buildapp_dev',
  user: process.env.DB_USER || 'buildapp_user',
  password: process.env.DB_PASSWORD || ''
});

async function fixIllustrations() {
  const client = await pool.connect();
  try {
    // Get the project
    const result = await client.query(
      "SELECT id, instructions FROM projects WHERE id = '490e9a88-56e1-4b01-97ea-b7d5121b4fa8'"
    );

    if (result.rows.length === 0) {
      console.log('Project not found');
      return;
    }

    const project = result.rows[0];
    let instructions = project.instructions;

    console.log('Current instructions:');
    instructions.forEach((inst, i) => {
      console.log(`Step ${inst.step}: ${inst.illustration_type}`);
    });

    // Map of correct illustration types for slab template
    const correctTypes = {
      '1': 'site_preparation',
      '2': 'gravel_base',
      '3': 'formwork',
      '4': 'rebar',
      '5': 'concrete_pour',
      '6': 'smoothing',
      '7': 'curing',
      '8': 'completion'
    };

    // Update illustration types
    instructions = instructions.map(inst => {
      const stepNum = String(inst.step);
      if (correctTypes[stepNum]) {
        return { ...inst, illustration_type: correctTypes[stepNum] };
      }
      return inst;
    });

    console.log('\nUpdated instructions:');
    instructions.forEach((inst, i) => {
      console.log(`Step ${inst.step}: ${inst.illustration_type}`);
    });

    // Save back to database
    await client.query(
      'UPDATE projects SET instructions = $1 WHERE id = $2',
      [JSON.stringify(instructions), project.id]
    );

    console.log('\nDatabase updated successfully!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

fixIllustrations();
