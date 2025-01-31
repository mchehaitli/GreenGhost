import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { quoteRequests } from "@db/schema";
import { insertQuoteSchema } from "@db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

const upload = multer({ dest: "uploads/" });

export function registerRoutes(app: Express): Server {
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

  // Theme upload endpoint
  app.post("/api/theme/upload", upload.single("theme"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read the uploaded file
      const themeContent = await fs.readFile(req.file.path, "utf-8");

      // Validate JSON structure
      const theme = JSON.parse(themeContent);
      if (!theme.variant || !theme.primary || !theme.appearance || !theme.radius === undefined) {
        throw new Error("Invalid theme format");
      }

      // Write to theme.json
      await fs.writeFile("theme.json", JSON.stringify(theme, null, 2));

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      res.json({ message: "Theme updated successfully" });
    } catch (error) {
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