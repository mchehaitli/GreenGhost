import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { quoteRequests } from "@db/schema";
import { insertQuoteSchema } from "@db/schema";
import { eq } from "drizzle-orm";
import waitlistRoutes from './routes/waitlist';

export function registerRoutes(app: Express): Server {
  // Register waitlist routes
  app.use(waitlistRoutes);

  // Quote request endpoints
  app.post("/api/quote", async (req, res) => {
    try {
      // Validate request body against schema
      const validated = insertQuoteSchema.parse(req.body);

      // Insert into database
      const [quote] = await db
        .insert(quoteRequests)
        .values(validated)
        .returning();

      res.json({
        message: "Quote request submitted successfully",
        quoteId: quote.id,
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all quote requests (admin only - would need auth middleware in production)
  app.get("/api/quotes", async (_req, res) => {
    try {
      const quotes = await db.select().from(quoteRequests).orderBy(quoteRequests.createdAt);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quotes" });
    }
  });

  // Get specific quote request
  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const [quote] = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.id, parseInt(req.params.id)));

      if (!quote) {
        return res.status(404).json({ message: "Quote request not found" });
      }

      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quote" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}