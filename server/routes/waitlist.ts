import { Router } from 'express';
import { db } from '../db';
import { waitlist, insertWaitlistSchema, verificationSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail, sendWelcomeEmail, verifyCode } from '../services/email';
import { log } from '../vite';
import { fromZodError } from 'zod-validation-error';

const router = Router();

// Step 1: Initial waitlist signup
router.post('/api/waitlist', async (req, res) => {
  try {
    log('Received waitlist signup request');
    const { email } = req.body;

    try {
      insertWaitlistSchema.parse({ email });
    } catch (error) {
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

// Step 2: Verify email
router.post('/api/waitlist/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

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

    // Update verification status and send welcome email
    try {
      await db.update(waitlist)
        .set({ verified: true })
        .where(eq(waitlist.email, normalizedEmail));

      try {
        await sendWelcomeEmail(normalizedEmail);
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

export default router;