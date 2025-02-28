import { Router } from 'express';
import { db } from '../db';
import { services, insertServiceSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all services
router.get('/api/services', async (req, res) => {
  try {
    const allServices = await db.query.services.findMany({
      orderBy: (services, { asc }) => [asc(services.category), asc(services.name)],
    });
    res.json(allServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create new service
router.post('/api/services', async (req, res) => {
  try {
    const validatedData = insertServiceSchema.parse(req.body);
    const newService = await db.insert(services).values(validatedData).returning();
    res.status(201).json(newService[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid service data' });
  }
});

// Update service
router.patch('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedService = await db
      .update(services)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(services.id, parseInt(id)))
      .returning();

    if (updatedService.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(updatedService[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid update data' });
  }
});

// Delete service (soft delete by setting active to false)
router.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedService = await db
      .update(services)
      .set({ active: false, updated_at: new Date() })
      .where(eq(services.id, parseInt(id)))
      .returning();

    if (updatedService.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
