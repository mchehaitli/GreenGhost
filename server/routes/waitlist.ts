import { Router } from 'express';
import { db } from '../db';
import { waitlist, insertWaitlistSchema, verificationSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { sendVerificationEmail, sendWelcomeEmail, verifyCode } from '../services/email';
import { log } from '../vite';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';

const router = Router();

// Middleware for admin routes
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Step 1: Initial waitlist signup - creates unverified entry and sends verification code
router.post('/api/waitlist', async (req, res) => {
  try {
    log('Received waitlist signup request');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check for existing verified entry
    const existingEntry = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, normalizedEmail)
    });

    if (existingEntry?.verified) {
      log(`Email ${normalizedEmail} already verified on waitlist`);
      return res.status(400).json({
        error: 'Already registered',
        details: 'This email is already on our waitlist'
      });
    }

    // Create or update unverified entry and send verification email
    try {
      if (existingEntry) {
        await db.update(waitlist)
          .set({ verified: false })
          .where(eq(waitlist.email, normalizedEmail));
        log(`Updated existing waitlist entry for ${normalizedEmail}`);
      } else {
        await db.insert(waitlist).values({
          email: normalizedEmail,
          verified: false
        });
        log(`Created new waitlist entry for ${normalizedEmail}`);
      }

      // Send verification email
      try {
        await sendVerificationEmail(normalizedEmail);
        log(`Verification email sent to ${normalizedEmail}`);
      } catch (error) {
        log('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
      }

      return res.json({
        status: 'pending_verification',
        message: 'Please check your email for the verification code'
      });
    } catch (error) {
      log('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        details: 'Failed to update waitlist entry'
      });
    }
  } catch (error) {
    log('Waitlist signup error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to process signup'
    });
  }
});

// Step 2: Verify email with code
router.post('/api/waitlist/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    try {
      verificationSchema.parse({ email, code });
    } catch (error) {
      const validationError = fromZodError(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationError.message
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if entry exists
    const entry = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, normalizedEmail)
    });

    if (!entry) {
      return res.status(404).json({
        error: 'Not found',
        details: 'No waitlist entry found for this email'
      });
    }

    // Verify the code
    const isValid = await verifyCode(normalizedEmail, code);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid code',
        details: 'The verification code is incorrect or expired'
      });
    }

    // Update verification status
    try {
      await db.update(waitlist)
        .set({ verified: true })
        .where(eq(waitlist.email, normalizedEmail));

      return res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      log('Database error during verification:', error);
      return res.status(500).json({
        error: 'Database error',
        details: 'Failed to update verification status'
      });
    }
  } catch (error) {
    log('Verification error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to verify email'
    });
  }
});

// Step 3: Update ZIP code after verification
router.post('/api/waitlist/update', async (req, res) => {
  try {
    const { email, zipCode } = req.body;

    // Validate ZIP code
    const zipCodeSchema = z.object({
      zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must be numeric")
    });

    try {
      zipCodeSchema.parse({ zipCode });
    } catch (error) {
      const validationError = fromZodError(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationError.message
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if entry exists and is verified
    const entry = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, normalizedEmail)
    });

    if (!entry) {
      return res.status(404).json({
        error: 'Not found',
        details: 'No waitlist entry found for this email'
      });
    }

    if (!entry.verified) {
      return res.status(400).json({
        error: 'Not verified',
        details: 'Email must be verified before updating ZIP code'
      });
    }

    // Update ZIP code
    try {
      await db.update(waitlist)
        .set({ zip_code: zipCode })
        .where(eq(waitlist.email, normalizedEmail));

      // Send welcome email
      try {
        await sendWelcomeEmail(normalizedEmail, zipCode);
      } catch (error) {
        log('Welcome email failed:', error);
        // Continue despite welcome email failure
      }

      return res.json({
        success: true,
        message: 'ZIP code updated successfully'
      });
    } catch (error) {
      log('Database error during ZIP code update:', error);
      return res.status(500).json({
        error: 'Database error',
        details: 'Failed to update ZIP code'
      });
    }
  } catch (error) {
    log('ZIP code update error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to update ZIP code'
    });
  }
});

// Get all waitlist entries (admin only)
router.get('/api/waitlist', requireAuth, async (_req, res) => {
  try {
    const entries = await db.query.waitlist.findMany({
      orderBy: (waitlist, { desc }) => [desc(waitlist.created_at)]
    });
    return res.json(entries);
  } catch (error) {
    log('Error fetching waitlist entries:', error);
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to fetch entries'
    });
  }
});

export default router;