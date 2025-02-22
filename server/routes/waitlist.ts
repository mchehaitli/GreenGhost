import { Router } from 'express';
import { db } from '../db';
import { waitlist, insertWaitlistSchema, verificationSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { sendVerificationEmail, sendWelcomeEmail, verifyCode } from '../services/email';
import { log } from '../vite';
import { fromZodError } from 'zod-validation-error';

const router = Router();

// Middleware for admin routes
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Step 1: Initial waitlist signup - only creates unverified entry and sends verification code
router.post('/api/waitlist', async (req, res) => {
  try {
    const { email, zip_code } = req.body;

    log(`Received waitlist signup request - Email: ${email}, ZIP: ${zip_code}`);

    // Validate input with Zod schema
    try {
      const validatedData = insertWaitlistSchema.parse({ email, zip_code });
      log('Input validation passed');
    } catch (error) {
      log('Input validation failed:', error);
      const validationError = fromZodError(error);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationError.message
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

    // Send verification email
    try {
      const emailSent = await sendVerificationEmail(normalizedEmail, zip_code);
      if (!emailSent) {
        throw new Error('Failed to send verification email');
      }
      log(`Verification email sent to ${normalizedEmail}`);
    } catch (error) {
      log('Error sending verification email:', error);
      return res.status(500).json({
        error: 'Verification failed',
        details: 'Could not send verification email'
      });
    }

    // Create or update unverified entry
    try {
      if (existingEntry) {
        await db.update(waitlist)
          .set({ zip_code, verified: false })
          .where(eq(waitlist.email, normalizedEmail));
        log(`Updated existing waitlist entry for ${normalizedEmail}`);
      } else {
        await db.insert(waitlist).values({
          email: normalizedEmail,
          zip_code,
          verified: false
        });
        log(`Created new waitlist entry for ${normalizedEmail}`);
      }
    } catch (error) {
      log('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        details: 'Failed to update waitlist entry'
      });
    }

    return res.json({
      status: 'pending_verification',
      message: 'Please check your email for the verification code'
    });
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
    log(`Received verification request - Email: ${email}, Code: ${code}`);

    // Validate input
    try {
      verificationSchema.parse({ email, code });
      log('Verification input validation passed');
    } catch (error) {
      log('Verification input validation failed:', error);
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
      log(`No waitlist entry found for email: ${normalizedEmail}`);
      return res.status(404).json({
        error: 'Not found',
        details: 'No waitlist entry found for this email'
      });
    }

    if (entry.verified) {
      log(`Email ${normalizedEmail} already verified`);
      return res.status(400).json({
        error: 'Already verified',
        details: 'This email is already verified'
      });
    }

    // Verify the code
    const isValid = await verifyCode(normalizedEmail, code);
    if (!isValid) {
      log(`Invalid verification code for ${normalizedEmail}`);
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
      log(`Successfully verified email: ${normalizedEmail}`);

      // Send welcome email
      try {
        await sendWelcomeEmail(normalizedEmail, entry.zip_code);
        log(`Welcome email sent to ${normalizedEmail}`);
      } catch (error) {
        log('Welcome email failed:', error);
        // Continue despite welcome email failure
      }

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

// Admin route to get all entries
router.get('/api/waitlist', requireAuth, async (_req, res) => {
  try {
    const entries = await db.query.waitlist.findMany({
      orderBy: (waitlist, { desc }) => [desc(waitlist.created_at)]
    });
    return res.json(entries);
  } catch (error) {
    log('Fetch entries error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to fetch entries'
    });
  }
});

export default router;