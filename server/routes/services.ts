import { Router } from 'express';
import { db } from '../db';
import { services } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const allServices = await db.query.services.findMany({
      orderBy: (services, { asc }) => [asc(services.category), asc(services.name)]
    });
    res.json(allServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Update service price
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { price_per_sqft } = req.body;

  try {
    const updatedService = await db
      .update(services)
      .set({ 
        price_per_sqft,
        updated_at: new Date()
      })
      .where(eq(services.id, parseInt(id)))
      .returning();

    res.json(updatedService[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

export default router;
