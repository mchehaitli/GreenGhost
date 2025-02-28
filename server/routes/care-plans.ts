import { Router } from 'express';
import { db } from '../db';
import { carePlans } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all care plans
router.get('/', async (req, res) => {
  try {
    const plans = await db.query.carePlans.findMany({
      orderBy: (carePlans, { asc }) => [asc(carePlans.base_price)]
    });
    res.json(plans);
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
    const updatedPlan = await db
      .update(carePlans)
      .set({ 
        base_price,
        updated_at: new Date()
      })
      .where(eq(carePlans.id, parseInt(id)))
      .returning();

    if (!updatedPlan.length) {
      return res.status(404).json({ error: 'Care plan not found' });
    }

    res.json(updatedPlan[0]);
  } catch (error) {
    console.error('Error updating care plan:', error);
    res.status(500).json({ error: 'Failed to update care plan' });
  }
});

export default router;