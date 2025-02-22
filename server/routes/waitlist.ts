import { Router } from 'express';
import { db } from '../db';
import { waitlist, insertWaitlistSchema } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { sendVerificationEmail, sendWelcomeEmail, verifyCode } from '../services/email';

const router = Router();

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

router.post('/api/waitlist', async (req, res) => {
  try {
    console.log('Received waitlist submission:', req.body);
    const { email, zipCode } = req.body;

    if (!email || !zipCode) {
      console.error('Missing required fields:', { email, zipCode });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both email and zip code are required'
      });
    }

    // Check for existing email that is already verified
    const [existingEntry] = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email.toLowerCase()));

    if (existingEntry?.verified) {
      console.log('Found existing verified entry:', existingEntry);
      return res.status(400).json({
        error: 'Duplicate entry',
        details: 'This email is already on our waitlist'
      });
    }

    // Delete any existing unverified entries for this email
    if (existingEntry && !existingEntry.verified) {
      console.log('Removing existing unverified entry for:', email);
      await db
        .delete(waitlist)
        .where(eq(waitlist.id, existingEntry.id));
    }

    // Send verification email with code
    console.log('Sending verification email to:', email);
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(email.toLowerCase(), zipCode);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        error: 'Email verification failed',
        details: 'Unable to send verification code. Please try again.'
      });
    }

    if (!emailSent) {
      return res.status(500).json({
        error: 'Email verification failed',
        details: 'Unable to send verification code. Please try again.'
      });
    }

    // Validate input using our Zod schema
    const parsedInput = insertWaitlistSchema.parse({
      email: email.toLowerCase(),
      zip_code: zipCode,
    });

    // Insert into database with verification status
    const [newEntry] = await db.insert(waitlist)
      .values({
        ...parsedInput,
        verified: false,
        created_at: new Date()
      })
      .returning();

    console.log('Created waitlist entry:', newEntry);
    
    // Send response with pending_verification status
    const response = { 
      status: 'pending_verification',
      message: 'Please check your email for a verification code.'
    };
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Code verification endpoint
router.post('/api/waitlist/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('Verifying code for email:', email);

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing parameters',
        details: 'Both email and verification code are required'
      });
    }

    const isValid = await verifyCode(email.toLowerCase(), code);

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid or expired code',
        details: 'Please check the code and try again'
      });
    }

    // Update waitlist entry to verified
    const [updatedEntry] = await db
      .update(waitlist)
      .set({ verified: true })
      .where(eq(waitlist.email, email.toLowerCase()))
      .returning();

    if (!updatedEntry) {
      return res.status(404).json({
        error: 'Entry not found',
        details: 'Could not find waitlist entry for this email'
      });
    }

    // Send welcome email after verification
    try {
      await sendWelcomeEmail(email.toLowerCase(), updatedEntry.zip_code);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with the response even if welcome email fails
    }

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to GreenGhost Tech!'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/api/waitlist', requireAuth, async (req, res) => {
  try {
    console.log('Fetching waitlist entries...');
    const entries = await db
      .select({
        id: waitlist.id,
        email: waitlist.email,
        zip_code: waitlist.zip_code,
        verified: waitlist.verified,
        created_at: waitlist.created_at
      })
      .from(waitlist)
      .orderBy(sql`${waitlist.created_at} DESC`);

    console.log(`Retrieved ${entries.length} entries`);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ 
      error: 'Failed to fetch waitlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
