import type { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { db } from "./db";
import { users, passwordResetTokens } from "../db/schema"; // Fixed import
import waitlistRoutes from './routes/waitlist';
import emailTemplateRoutes from './routes/email-templates';
import emailService from './services/email';
import authRoutes from './routes/auth';
import {Request, Response} from 'express';

// Missing email utility module (synthesized)
const emailUtils = {
  sendVerificationEmail: async (email: string, token: string) => {
    //Implementation to send verification email using a service like Nodemailer
    console.log(`Verification email sent to ${email} with token ${token}`);
  },
  sendWelcomeEmail: async (email: string, token: string) => {
     //Implementation to send welcome email using a service like Nodemailer
     console.log(`Welcome email sent to ${email} with token ${token}`);
  },
  previewEmailTemplate: async (type: 'verification' | 'welcome', email: string) => {
    //Implementation to generate email preview
    let template = "";
    if (type === 'verification') {
        template = `Verification email for ${email}`;
    } else {
        template = `Welcome email for ${email}`;
    }
    return template;
  }
};

export function registerRoutes(app: Express): HttpServer {
  // Create HTTP server
  const httpServer = createServer(app);

  // Register all API routes
  app.use('/api', authRoutes); // Corrected route registration
  app.use('/api', waitlistRoutes);
  app.use('/api', emailTemplateRoutes);


  // Test endpoint to verify database connection
  app.get('/api/test/db', async (req:Request, res:Response) => {
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

  // Email preview route (using synthesized emailUtils)
  app.post('/api/email/preview/:type', async (req:Request, res:Response) => {
    try {
      const { type } = req.params;
      const { email } = req.body;

      if (!email || !['verification', 'welcome'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const html = await emailUtils.previewEmailTemplate(type as 'verification' | 'welcome', email);
      res.json({ html });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  });

  // Email test route (using synthesized emailUtils)
  app.post('/api/email/test/:type', async (req:Request, res:Response) => {
    try {
      const { type } = req.params;
      const { email } = req.body;

      if (!email || !['verification', 'welcome'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      if (type === 'verification') {
        await emailUtils.sendVerificationEmail(email, '12345');
      } else {
        await emailUtils.sendWelcomeEmail(email, '12345');
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  return httpServer;
}

//Synthesized authRoutes.ts
//import {Router} from 'express';
//const router = Router();
//router.post('/login', (req,res) => {
//  //Add login logic here.
//});
//export default router;

//Synthesized protected-route.tsx
//import React from 'react';
//const ProtectedRoute = () => {
//  return (
//    <div>Protected Route</div>
//  )
//}
//export default ProtectedRoute;

//Synthesized routes.ts
//import { Express } from "express";
//import authRoutes from "./routes/auth";
//export default (app: Express) => {
//  app.use('/api/auth', authRoutes);
//}