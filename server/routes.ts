import type { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { db } from "./db";
import waitlistRoutes from './routes/waitlist';
import emailTemplateRoutes from './routes/email-templates';
import {Request, Response} from 'express';
import {waitlist} from '../db/schema';


export function registerRoutes(app: Express): HttpServer {
  // Create HTTP server
  const httpServer = createServer(app);

  // Register all API routes
  app.use('/api', waitlistRoutes);
  app.use('/api', emailTemplateRoutes);

  // Test endpoint to verify database connection
  app.get('/api/test/db', async (req:Request, res:Response) => {
    try {
      // Simple query to test database connection
      const waitlistCount = await db.select().from(waitlist);
      res.json({ 
        message: 'Database connection successful',
        waitlistCount: waitlistCount.length 
      });
    } catch (error) {
      console.error('Database test failed:', error);
      res.status(500).json({ 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  return httpServer;
}