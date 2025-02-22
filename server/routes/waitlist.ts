import { Router } from 'express';
import { db } from '../../db';
import { waitlist, insertWaitlistSchema } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { sendVerificationEmail, sendWelcomeEmail, verifyToken } from '../services/email';

const router = Router();

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

router.post('/api/waitlist', async (req, res) => {
  try {
    const { email, zipCode } = req.body;
    console.log('Received waitlist submission:', { email, zipCode });

    if (!email || !zipCode) {
      console.error('Missing required fields:', { email, zipCode });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both email and zip code are required'
      });
    }

    // Check for existing email
    const existingEntry = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email.toLowerCase()))
      .limit(1);

    if (existingEntry.length > 0) {
      return res.status(400).json({
        error: 'Duplicate entry',
        details: 'This email is already on the waitlist'
      });
    }

    // Validate input using our Zod schema
    const parsedInput = insertWaitlistSchema.parse({
      email: email.toLowerCase(),
      zip_code: zipCode,
    });

    // Insert into database with verification status
    const result = await db.insert(waitlist)
      .values({
        ...parsedInput,
        verified: false,
        created_at: new Date()
      })
      .returning();

    console.log('Successfully saved to waitlist:', result[0]);

    // Send verification email
    try {
      await sendVerificationEmail(email.toLowerCase(), zipCode);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with the response even if email fails
      // We don't want to roll back the waitlist registration
    }

    res.json({ 
      success: true, 
      data: result[0],
      message: 'Please check your email to verify your waitlist registration.'
    });
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Email verification endpoint
router.get('/api/waitlist/verify', async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({
        error: 'Missing parameters',
        details: 'Both email and token are required'
      });
    }

    const isValid = await verifyToken(email.toString(), token.toString());

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        details: 'Please request a new verification email'
      });
    }

    // Update waitlist entry to verified
    const [updatedEntry] = await db
      .update(waitlist)
      .set({ verified: true })
      .where(eq(waitlist.email, email.toString()))
      .returning();

    if (!updatedEntry) {
      return res.status(404).json({
        error: 'Entry not found',
        details: 'Could not find waitlist entry for this email'
      });
    }

    // Send welcome email after verification
    try {
      await sendWelcomeEmail(email.toString(), updatedEntry.zip_code);
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

// Protect the GET endpoint with authentication middleware
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