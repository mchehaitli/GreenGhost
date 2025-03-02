import { Router } from 'express';
import { db } from '../db';
import { services, plans, planFeatures, insertServiceSchema, insertPlanSchema, insertPlanFeatureSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../auth';
import { fromZodError } from 'zod-validation-error';
import { log } from '../vite';

const router = Router();

// Services Routes
router.get('/api/pricing/services', async (_req, res) => {
  try {
    const allServices = await db.query.services.findMany({
      orderBy: (services, { asc }) => [asc(services.sort_order)]
    });
    return res.json(allServices);
  } catch (error) {
    log('Error fetching services:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.post('/api/pricing/services', requireAuth, async (req, res) => {
  try {
    const validatedData = insertServiceSchema.parse(req.body);
    const [service] = await db.insert(services).values(validatedData).returning();
    return res.status(201).json(service);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

router.patch('/api/pricing/services/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    const validatedData = insertServiceSchema.parse(req.body);
    const [service] = await db.update(services)
      .set(validatedData)
      .where(eq(services.id, id))
      .returning();

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json(service);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/api/pricing/services/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    await db.delete(services).where(eq(services.id, id));
    return res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Plans Routes
router.get('/api/pricing/plans', async (_req, res) => {
  try {
    const allPlans = await db.query.plans.findMany({
      orderBy: (plans, { asc }) => [asc(plans.sort_order)],
      with: {
        features: {
          orderBy: (planFeatures, { asc }) => [asc(planFeatures.sort_order)]
        }
      }
    });
    return res.json(allPlans);
  } catch (error) {
    log('Error fetching plans:', error);
    return res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

router.post('/api/pricing/plans', requireAuth, async (req, res) => {
  try {
    const { features, ...planData } = req.body;
    const validatedPlanData = insertPlanSchema.parse(planData);
    
    const [plan] = await db.insert(plans).values(validatedPlanData).returning();

    if (features && Array.isArray(features)) {
      await Promise.all(
        features.map(async (feature, index) => {
          const validatedFeature = insertPlanFeatureSchema.parse({
            ...feature,
            plan_id: plan.id,
            sort_order: index
          });
          await db.insert(planFeatures).values(validatedFeature);
        })
      );
    }

    const planWithFeatures = await db.query.plans.findFirst({
      where: eq(plans.id, plan.id),
      with: {
        features: {
          orderBy: (planFeatures, { asc }) => [asc(planFeatures.sort_order)]
        }
      }
    });

    return res.status(201).json(planWithFeatures);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to create plan' });
  }
});

router.patch('/api/pricing/plans/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const { features, ...planData } = req.body;
    const validatedPlanData = insertPlanSchema.parse(planData);

    const [plan] = await db.update(plans)
      .set(validatedPlanData)
      .where(eq(plans.id, id))
      .returning();

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (features && Array.isArray(features)) {
      // Delete existing features
      await db.delete(planFeatures).where(eq(planFeatures.plan_id, id));

      // Insert new features
      await Promise.all(
        features.map(async (feature, index) => {
          const validatedFeature = insertPlanFeatureSchema.parse({
            ...feature,
            plan_id: id,
            sort_order: index
          });
          await db.insert(planFeatures).values(validatedFeature);
        })
      );
    }

    const updatedPlan = await db.query.plans.findFirst({
      where: eq(plans.id, id),
      with: {
        features: {
          orderBy: (planFeatures, { asc }) => [asc(planFeatures.sort_order)]
        }
      }
    });

    return res.json(updatedPlan);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to update plan' });
  }
});

router.delete('/api/pricing/plans/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    await db.delete(plans).where(eq(plans.id, id));
    return res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete plan' });
  }
});

export default router;
