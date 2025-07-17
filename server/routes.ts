import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { waitlist } from "../db/schema";
import { eq } from "drizzle-orm";
import waitlistRoutes from './routes/waitlist';
import emailTemplateRoutes from './routes/email-templates';
import userRoutes from './routes/users';
import { registerPricingRoutes } from './routes/pricing';
import emailService from './services/email';
import { resetAdminPassword } from './auth';

export function registerRoutes(app: Express): Server {
  // Register waitlist routes
  app.use(waitlistRoutes);

  // Register email template routes
  app.use(emailTemplateRoutes);
  
  // Register user management routes
  app.use(userRoutes);
  
  // Register pricing routes
  registerPricingRoutes(app);

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

  // Add email connection test route
  app.post('/api/email/test-connection', async (req, res) => {
    try {
      const testResult = await emailService.testConnection();
      res.json({ 
        success: testResult.success, 
        message: testResult.message,
        details: testResult.details 
      });
    } catch (error) {
      console.error('Error testing email connection:', error);
      res.status(500).json({ error: 'Failed to test email connection' });
    }
  });

  // Add test email route
  app.post('/api/email/test/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const { email } = req.body;

      if (!email || !['verification', 'welcome'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      // Send test email
      let success = false;
      if (type === 'verification') {
        success = await emailService.sendVerificationEmail(email, '12345');
      } else if (type === 'welcome') {
        success = await emailService.sendWelcomeEmail(email, '12345');
      }

      if (success) {
        res.json({ message: `Test ${type} email sent successfully to ${email}` });
      } else {
        res.status(500).json({ error: 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ error: 'Failed to send test email' });
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

  // Admin password reset endpoint (security note: in production, this should be better protected)
  app.post('/api/admin/reset-password', async (req, res) => {
    try {
      const { newPassword, secretKey } = req.body;
      
      // Simple security check - require a secret key for this sensitive operation
      // In production, this should use a more robust authentication method
      const expectedSecretKey = process.env.ADMIN_RESET_KEY || 'greenghost-secure-reset-key';
      
      if (!secretKey || secretKey !== expectedSecretKey) {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid or missing secret key" 
        });
      }
      
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long"
        });
      }
      
      const result = await resetAdminPassword(newPassword);
      res.json(result);
    } catch (error) {
      console.error('Error resetting admin password:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}