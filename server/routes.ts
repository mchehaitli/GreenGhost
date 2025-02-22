import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { waitlist } from "../db/schema";
import { eq } from "drizzle-orm";
import waitlistRoutes from './routes/waitlist';

export function registerRoutes(app: Express): Server {
  // Register waitlist routes
  app.use(waitlistRoutes);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}