import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users } from "../db/schema";
import waitlistRoutes from './routes/waitlist';
import emailTemplateRoutes from './routes/email-templates';
import emailService from './services/email';
import authRoutes from './routes/auth';

export function registerRoutes(app: Express): Server {
  // Register API routes first
  app.use('/api', authRoutes);
  app.use('/api', waitlistRoutes);
  app.use('/api', emailTemplateRoutes);

  // Test endpoint to verify database connection
  app.get('/api/test/db', async (req, res) => {
    try {
      // Simple query to test database connection
      const allUsers = await db.select().from(users);
      res.json({ 
        message: 'Database connection successful',
        userCount: allUsers.length 
      });
    } catch (error) {
      console.error('Database test failed:', error);
      res.status(500).json({ 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Add email preview routes with API prefix
  app.post('/api/email/preview/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const { email } = req.body;

      if (!email || !['verification', 'welcome'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const html = await emailService.previewEmailTemplate(type as 'verification' | 'welcome', email);
      res.json({ html });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  });

  app.post('/api/email/test/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const { email } = req.body;

      if (!email || !['verification', 'welcome'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      if (type === 'verification') {
        await emailService.sendVerificationEmail(email, '12345');
      } else {
        await emailService.sendWelcomeEmail(email, '12345');
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}