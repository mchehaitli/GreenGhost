import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { waitlist } from "../db/schema";
import { eq } from "drizzle-orm";
import waitlistRoutes from './routes/waitlist';
import emailTemplateRoutes from './routes/email-templates';
import blogRoutes from './routes/blog';
import emailService from './services/email';

export function registerRoutes(app: Express): Server {
  // Register waitlist routes
  app.use(waitlistRoutes);

  // Register email template routes
  app.use(emailTemplateRoutes);

  // Register blog routes
  app.use(blogRoutes);

  // Add email preview routes
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