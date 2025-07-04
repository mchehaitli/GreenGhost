import type { Express } from "express";
import { db } from "@db";
import { plans, planFeatures, pricingContent } from "@db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { requireAuth } from "../auth";

export function registerPricingRoutes(app: Express) {
  // Get all pricing plans with features (public)
  app.get("/api/pricing/plans", async (req, res) => {
    try {
      // Get plans and features separately then combine them
      const plansData = await db.select().from(plans).orderBy(asc(plans.sort_order), asc(plans.id));
      const featuresData = await db.select().from(planFeatures).orderBy(asc(planFeatures.sort_order), asc(planFeatures.id));
      
      // Combine plans with their features
      const plansWithFeatures = plansData.map(plan => ({
        ...plan,
        features: featuresData.filter(feature => feature.plan_id === plan.id)
      }));
      
      res.json(plansWithFeatures);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      res.status(500).json({ error: "Failed to fetch pricing plans" });
    }
  });

  // Get pricing page content (public)
  app.get("/api/pricing/content", async (req, res) => {
    try {
      const content = await db.query.pricingContent.findFirst({
        orderBy: [desc(pricingContent.updated_at)],
      });
      
      if (!content) {
        // Return default content if none exists
        res.json({
          page_title: "Simple, Transparent Pricing",
          page_subtitle: "Choose the perfect plan for your lawn. All plans include our innovative service approach and dedicated support team.",
        });
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error("Error fetching pricing content:", error);
      res.status(500).json({ error: "Failed to fetch pricing content" });
    }
  });

  // Admin routes (require authentication)
  app.get("/api/admin/pricing/plans", requireAuth, async (req, res) => {
    try {
      // Get plans and features separately then combine them
      const plansData = await db.select().from(plans).orderBy(asc(plans.sort_order), asc(plans.id));
      const featuresData = await db.select().from(planFeatures).orderBy(asc(planFeatures.sort_order), asc(planFeatures.id));
      
      // Combine plans with their features
      const plansWithFeatures = plansData.map(plan => ({
        ...plan,
        features: featuresData.filter(feature => feature.plan_id === plan.id)
      }));
      
      res.json(plansWithFeatures);
    } catch (error) {
      console.error("Error fetching admin pricing plans:", error);
      res.status(500).json({ error: "Failed to fetch pricing plans" });
    }
  });

  app.get("/api/admin/pricing/content", requireAuth, async (req, res) => {
    try {
      const content = await db.query.pricingContent.findFirst({
        orderBy: [desc(pricingContent.updated_at)],
      });
      
      if (!content) {
        res.json({
          page_title: "Simple, Transparent Pricing",
          page_subtitle: "Choose the perfect plan for your lawn. All plans include our innovative service approach and dedicated support team.",
        });
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error("Error fetching pricing content:", error);
      res.status(500).json({ error: "Failed to fetch pricing content" });
    }
  });

  // Create new pricing plan
  app.post("/api/admin/pricing/plans", requireAuth, async (req, res) => {
    try {
      const [plan] = await db.insert(plans).values(req.body).returning();
      res.json(plan);
    } catch (error) {
      console.error("Error creating pricing plan:", error);
      res.status(500).json({ error: "Failed to create pricing plan" });
    }
  });

  // Update pricing plan
  app.put("/api/admin/pricing/plans/:id", requireAuth, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const [plan] = await db
        .update(plans)
        .set(req.body)
        .where(eq(plans.id, planId))
        .returning();
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error updating pricing plan:", error);
      res.status(500).json({ error: "Failed to update pricing plan" });
    }
  });

  // Delete pricing plan
  app.delete("/api/admin/pricing/plans/:id", requireAuth, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      await db.delete(plans).where(eq(plans.id, planId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting pricing plan:", error);
      res.status(500).json({ error: "Failed to delete pricing plan" });
    }
  });

  // Create new plan feature
  app.post("/api/admin/pricing/features", requireAuth, async (req, res) => {
    try {
      const [feature] = await db.insert(planFeatures).values(req.body).returning();
      res.json(feature);
    } catch (error) {
      console.error("Error creating plan feature:", error);
      res.status(500).json({ error: "Failed to create plan feature" });
    }
  });

  // Update plan feature
  app.put("/api/admin/pricing/features/:id", requireAuth, async (req, res) => {
    try {
      const featureId = parseInt(req.params.id);
      const [feature] = await db
        .update(planFeatures)
        .set(req.body)
        .where(eq(planFeatures.id, featureId))
        .returning();
      
      if (!feature) {
        return res.status(404).json({ error: "Feature not found" });
      }
      
      res.json(feature);
    } catch (error) {
      console.error("Error updating plan feature:", error);
      res.status(500).json({ error: "Failed to update plan feature" });
    }
  });

  // Delete plan feature
  app.delete("/api/admin/pricing/features/:id", requireAuth, async (req, res) => {
    try {
      const featureId = parseInt(req.params.id);
      await db.delete(planFeatures).where(eq(planFeatures.id, featureId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting plan feature:", error);
      res.status(500).json({ error: "Failed to delete plan feature" });
    }
  });

  // Update pricing content
  app.post("/api/admin/pricing/content", requireAuth, async (req, res) => {
    try {
      // Delete existing content first
      await db.delete(pricingContent);
      
      // Insert new content
      const [content] = await db.insert(pricingContent).values(req.body).returning();
      res.json(content);
    } catch (error) {
      console.error("Error updating pricing content:", error);
      res.status(500).json({ error: "Failed to update pricing content" });
    }
  });
}