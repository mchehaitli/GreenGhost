import { Router } from 'express';
import { db } from '../db';
import { waitlist, insertWaitlistSchema, verificationSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { sendVerificationEmail, sendWelcomeEmail, verifyCode } from '../services/email';
import { log } from '../vite';

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

    // Validate input with Zod schema
    try {
      insertWaitlistSchema.parse({ email, zip_code });
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid input data'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check for existing verified entry
    const existingEntry = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, normalizedEmail)
    });

    if (existingEntry?.verified) {
      return res.status(400).json({
        error: 'Already registered',
        details: 'This email is already on our waitlist'
      });
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(normalizedEmail, zip_code);
    if (!emailSent) {
      return res.status(500).json({
        error: 'Verification failed',
        details: 'Could not send verification email'
      });
    }

    // Create or update unverified entry
    if (existingEntry) {
      await db.update(waitlist)
        .set({ zip_code, verified: false })
        .where(eq(waitlist.email, normalizedEmail));
    } else {
      await db.insert(waitlist).values({
        email: normalizedEmail,
        zip_code,
        verified: false
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

    // Validate input
    try {
      verificationSchema.parse({ email, code });
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid verification data'
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

    if (entry.verified) {
      return res.status(400).json({
        error: 'Already verified',
        details: 'This email is already verified'
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
    await db.update(waitlist)
      .set({ verified: true })
      .where(eq(waitlist.email, normalizedEmail));

    // Send welcome email
    try {
      await sendWelcomeEmail(normalizedEmail, entry.zip_code);
    } catch (error) {
      log('Welcome email failed:', error);
      // Continue despite welcome email failure
    }

    return res.json({
      success: true,
      message: 'Email verified successfully'
    });
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
      orderBy: [{ created_at: 'desc' }]
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