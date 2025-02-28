import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all care plans
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM care_plans
      ORDER BY base_price ASC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching care plans:', error);
    res.status(500).json({ error: 'Failed to fetch care plans' });
  }
});

// Update care plan price
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { base_price } = req.body;

  try {
    const result = await db.query(`
      UPDATE care_plans
      SET base_price = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `, [base_price, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Care plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating care plan:', error);
    res.status(500).json({ error: 'Failed to update care plan' });
  }
});

export default router;
