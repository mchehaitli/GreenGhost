import { Router } from 'express';
import { db } from '../db';
import { servicePricing, insertServicePricingSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../auth';
import { fromZodError } from 'zod-validation-error';
import { log } from '../vite';

const router = Router();

// Get all pricing entries
router.get('/api/pricing', requireAuth, async (_req, res) => {
  try {
    const pricing = await db.query.servicePricing.findMany({
      orderBy: (servicePricing, { desc }) => [desc(servicePricing.created_at)]
    });
    return res.json(pricing);
  } catch (error) {
    log('Error fetching pricing:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// Create new pricing entry
router.post('/api/pricing', requireAuth, async (req, res) => {
  try {
    const validatedData = insertServicePricingSchema.parse(req.body);
    const [pricing] = await db.insert(servicePricing)
      .values(validatedData)
      .returning();
    return res.status(201).json(pricing);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to create pricing entry' });
  }
});

// Update pricing entry
router.patch('/api/pricing/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pricing ID' });
    }

    const validatedData = insertServicePricingSchema.parse(req.body);

    const [pricing] = await db.update(servicePricing)
      .set({
        ...validatedData,
        updated_at: new Date(),
      })
      .where(eq(servicePricing.id, id))
      .returning();

    if (!pricing) {
      return res.status(404).json({ error: 'Pricing entry not found' });
    }

    return res.json(pricing);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to update pricing entry' });
  }
});

// Toggle pricing entry active status
router.post('/api/pricing/:id/toggle', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pricing ID' });
    }

    const pricing = await db.query.servicePricing.findFirst({
      where: eq(servicePricing.id, id)
    });

    if (!pricing) {
      return res.status(404).json({ error: 'Pricing entry not found' });
    }

    const [updatedPricing] = await db.update(servicePricing)
      .set({
        is_active: !pricing.is_active,
        updated_at: new Date(),
      })
      .where(eq(servicePricing.id, id))
      .returning();

    return res.json(updatedPricing);
  } catch (error) {
    log('Error toggling pricing status:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to toggle pricing status' });
  }
});

export default router;
