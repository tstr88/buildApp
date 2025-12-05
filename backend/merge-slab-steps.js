const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'buildapp_dev',
  user: process.env.DB_USER || 'buildapp_user',
  password: process.env.DB_PASSWORD || ''
});

async function mergeSlabSteps() {
  const client = await pool.connect();
  try {
    // Get all slab projects
    const result = await client.query(
      "SELECT id, instructions, template_slug FROM projects WHERE template_slug IN ('concrete_slab', 'slab')"
    );

    console.log(`Found ${result.rows.length} slab projects to update`);

    for (const project of result.rows) {
      let instructions = project.instructions;

      if (!Array.isArray(instructions) || instructions.length === 0) {
        console.log(`Skipping project ${project.id} - no instructions`);
        continue;
      }

      console.log(`\nProcessing project ${project.id}:`);
      console.log('Before:', instructions.map(i => `Step ${i.step}: ${i.title_en || i.title_ka}`).join(', '));

      // Find step 5 (Pour Concrete) and step 6 (Level Surface/Smoothing)
      const step5 = instructions.find(i => i.step === 5);
      const step6 = instructions.find(i => i.step === 6);

      if (!step5 || !step6) {
        console.log(`Skipping - missing step 5 or 6`);
        continue;
      }

      // Check if step 6 is the smoothing step (not already merged)
      if (step6.title_en && !step6.title_en.toLowerCase().includes('level') && !step6.title_en.toLowerCase().includes('smooth')) {
        console.log(`Skipping - step 6 is already "${step6.title_en}", not smoothing`);
        continue;
      }

      // Merge step 6 into step 5
      const mergedStep5 = {
        ...step5,
        title_ka: 'ბეტონის მოსხმა და გასწორება',
        title_en: 'Pour & Level Concrete',
        description_ka: step5.description_ka.replace(/\.$/, '') + ' და გაასწორეთ ზედაპირი.',
        description_en: step5.description_en.replace(/\.$/, '') + ' and level the surface.',
        illustration_type: 'concrete_pour',
        duration_minutes: (step5.duration_minutes || 60) + (step6.duration_minutes || 30),
        tools_needed: [...new Set([...(step5.tools_needed || []), ...(step6.tools_needed || [])])],
        substeps: [
          ...(step5.substeps || []),
          { text_ka: 'გაანაწილეთ ნიჩბით თანაბრად', text_en: 'Spread evenly with shovel' },
          { text_ka: 'გაათრიეთ რეიკა ყალიბის გასწვრივ', text_en: 'Pull screed along the formwork' },
          { text_ka: 'გამოიყენეთ ფლოუტი საბოლოო გასწორებისთვის', text_en: 'Use float for final smoothing' },
        ],
        tips_ka: [...(step5.tips_ka || []), ...(step6.tips_ka || [])],
        tips_en: [...(step5.tips_en || []), ...(step6.tips_en || [])],
      };

      // Remove step 6 and renumber subsequent steps
      const newInstructions = instructions
        .filter(i => i.step !== 6)
        .map(i => {
          if (i.step === 5) {
            return mergedStep5;
          }
          if (i.step > 6) {
            // Renumber: 7 -> 6, 8 -> 7
            const newStep = i.step - 1;
            return {
              ...i,
              step: newStep,
              // Update illustration types for renumbered steps
              illustration_type: newStep === 6 ? 'curing' : (newStep === 7 ? 'completion' : i.illustration_type)
            };
          }
          return i;
        });

      console.log('After:', newInstructions.map(i => `Step ${i.step}: ${i.title_en || i.title_ka}`).join(', '));

      // Save back to database
      await client.query(
        'UPDATE projects SET instructions = $1 WHERE id = $2',
        [JSON.stringify(newInstructions), project.id]
      );

      console.log(`Updated project ${project.id}`);
    }

    console.log('\nAll slab projects updated successfully!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

mergeSlabSteps();
