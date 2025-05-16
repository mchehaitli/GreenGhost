import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { waitlist } from "../db/schema";
import { eq } from "drizzle-orm";
import waitlistRoutes from './routes/waitlist';
import emailTemplateRoutes from './routes/email-templates';
import userRoutes from './routes/users';
import emailService from './services/email';
import { setupAuth } from './auth';

export function registerRoutes(app: Express): Server {
  // Set up authentication
  setupAuth(app);
  
  // Register waitlist routes
  app.use(waitlistRoutes);

  // Register email template routes
  app.use(emailTemplateRoutes);
  
  // Register user management routes
  app.use('/api/users', userRoutes);

  // Add email preview routes
  app.post('/api/email/preview/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const { email, template } = req.body;

      if (!email || !['verification', 'welcome'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      let html = template;
      if (!template) {
        // If no template provided, use the default preview template
        html = await emailService.previewEmailTemplate(type as 'verification' | 'welcome', email);
      }

      res.json({ html });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  });

  // Add bulk email sending route
  app.post('/api/email/send-bulk', async (req, res) => {
    try {
      const { template, recipients } = req.body;

      if (!template || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      // Get all waitlist entries for the given recipients
      const entries = await db
        .select()
        .from(waitlist)
        .where(
          recipients.length === 1 
            ? eq(waitlist.email, recipients[0])
            : waitlist.email.in(recipients)
        );

      // Send emails to each recipient
      const results = await Promise.allSettled(
        entries.map(async (entry) => {
          if (template === 'welcome') {
            await emailService.sendWelcomeEmail(entry.email, entry.first_name);
          } else if (template === 'verification') {
            await emailService.sendVerificationEmail(entry.email, '123456'); // Example verification code
          }
        })
      );

      // Count successes and failures
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      res.json({
        message: `Successfully sent ${succeeded} emails${failed > 0 ? `, ${failed} failed` : ''}.`
      });
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      res.status(500).json({ error: 'Failed to send emails' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}