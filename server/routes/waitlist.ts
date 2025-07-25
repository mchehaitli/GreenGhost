import { Router } from 'express';
import { db } from '../db';
import { waitlist } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { log } from '../vite';
import { requireAuth } from '../auth';
import emailService from '../services/email';
import { format, subHours, startOfDay, startOfMonth, startOfYear, subDays } from 'date-fns';

const router = Router();

// Cleanup expired entries
const VERIFICATION_TIMEOUT = 90 * 1000; // 90 seconds in milliseconds

const cleanupExpiredEntries = async () => {
  try {
    const now = new Date();
    await db.delete(waitlist)
      .where(
        eq(waitlist.verified, false),
      );
  } catch (error) {
    log('Error cleaning up expired entries:', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Run cleanup every minute
setInterval(cleanupExpiredEntries, 60 * 1000);

// Delete waitlist entry (admin only)
router.delete('/api/waitlist/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await db.delete(waitlist).where(eq(waitlist.id, id));
    return res.sendStatus(200);
  } catch (error) {
    log('Error deleting waitlist entry:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Update waitlist entry (admin only)
router.patch('/api/waitlist/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { 
      email, 
      first_name, 
      last_name, 
      phone_number, 
      street_address, 
      city, 
      state, 
      zip_code, 
      notes 
    } = req.body;

    console.log('Received update request for entry:', { id, ...req.body }); // Debug log

    const updates: any = {};

    // Only include fields that are present in the request
    if (email !== undefined) updates.email = email;
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (street_address !== undefined) updates.street_address = street_address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (zip_code !== undefined) updates.zip_code = zip_code;
    if (notes !== undefined) updates.notes = notes;

    console.log('Updating with fields:', updates); // Debug log

    const result = await db.update(waitlist)
      .set(updates)
      .where(eq(waitlist.id, id))
      .returning();

    console.log('Update result:', result); // Debug log

    if (!result || result.length === 0) {
      throw new Error('No rows updated');
    }

    const updatedEntry = result[0];
    return res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return res.status(500).json({ 
      error: 'Failed to update entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Step 1: Initial waitlist signup
router.post('/api/waitlist', async (req, res) => {
  try {
    log('Received waitlist signup request');
    log('Request body:', req.body);

    const { email, zip_code } = req.body;

    if (!email || !zip_code) {
      log('Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both email and zip_code are required'
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

    // Set expiration time for verification
    const expiresAt = new Date(Date.now() + VERIFICATION_TIMEOUT);

    try {
      // Create or update unverified entry
      if (existingEntry) {
        await db.update(waitlist)
          .set({
            zip_code,
            verified: false,
            expires_at: expiresAt
          })
          .where(eq(waitlist.email, normalizedEmail));
        log(`Updated existing waitlist entry for ${normalizedEmail}`);
      } else {
        await db.insert(waitlist).values({
          email: normalizedEmail,
          zip_code,
          verified: false,
          expires_at: expiresAt
        });
        log(`Created new waitlist entry for ${normalizedEmail}`);
      }

      // Always try to send verification email but don't fail if it doesn't work
      try {
        const emailSent = await emailService.sendVerificationEmail(normalizedEmail, zip_code);
        if (!emailSent) {
          log(`Failed to send verification email to ${normalizedEmail}, but continuing with signup`);
        } else {
          log(`Verification email sent to ${normalizedEmail}`);
        }
      } catch (emailError) {
        log('Email service error:', emailError instanceof Error ? emailError.message : 'Unknown email error');
        log(`Continuing with signup for ${normalizedEmail} without email`);
      }

      return res.json({
        status: 'pending_verification',
        message: 'Please check your email for the verification code (or check server logs in development)'
      });
    } catch (error) {
      log('Database error:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({
        error: 'Server error',
        details: 'Failed to process signup'
      });
    }
  } catch (error) {
    log('Waitlist signup error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to process signup'
    });
  }
});

// Verification route
router.post('/api/waitlist/verify', async (req, res) => {
  try {
    log(`Received verification request`);
    log('Request body:', JSON.stringify(req.body, null, 2));

    const { email, code } = req.body;

    if (!email || !code) {
      log('Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both email and code are required'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Log the normalized values we're checking
    log(`Attempting to verify email: ${normalizedEmail} with code: ${code}`);

    // Check if entry exists and hasn't expired
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

    // Check if verification has expired
    if (entry.expires_at && entry.expires_at < new Date()) {
      log(`Verification expired for ${normalizedEmail}`);
      return res.status(400).json({
        error: 'Verification expired',
        details: 'The verification period has expired. Please sign up again.'
      });
    }

    // Verify the code
    const isValid = await emailService.verifyCode(normalizedEmail, code);
    log(`Verification result for ${normalizedEmail}: ${isValid ? 'valid' : 'invalid'}`);

    if (!isValid) {
      log(`Invalid verification code for ${normalizedEmail}`);
      return res.status(400).json({
        error: 'Invalid code',
        details: 'The verification code is incorrect'
      });
    }

    try {
      await db.update(waitlist)
        .set({
          verified: true,
          expires_at: null // Clear expiration once verified
        })
        .where(eq(waitlist.email, normalizedEmail));
      log(`Successfully verified email: ${normalizedEmail}`);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(normalizedEmail, entry.zip_code);
        log(`Welcome email sent to ${normalizedEmail}`);
      } catch (error) {
        log('Error sending welcome email:', error instanceof Error ? error.message : 'Unknown error');
      }

      return res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      log('Database error during verification:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({
        error: 'Database error',
        details: 'Failed to update verification status'
      });
    }
  } catch (error) {
    log('Verification error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to verify email'
    });
  }
});

// Get all waitlist entries (admin only)
router.get('/api/waitlist', requireAuth, async (req, res) => {
  try {
    log('Waitlist GET request received');
    log('User authenticated:', req.user ? req.user.username : 'No user');
    log('Session ID:', req.sessionID);
    log('Is authenticated:', req.isAuthenticated());
    
    const entries = await db.query.waitlist.findMany({
      orderBy: (waitlist, { desc }) => [desc(waitlist.created_at)]
    });
    
    log(`Returning ${entries.length} waitlist entries`);
    return res.json(entries);
  } catch (error) {
    log('Error fetching waitlist entries:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to fetch entries'
    });
  }
});

// Analytics route (admin only)
router.get('/api/waitlist/analytics', requireAuth, async (_req, res) => {
  try {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const startOfThisMonth = startOfMonth(now);
    const startOfThisYear = startOfYear(now);

    // Get all entries within the last year
    const entries = await db.query.waitlist.findMany({
      where: eq(waitlist.verified, true),
      orderBy: (waitlist, { desc }) => [desc(waitlist.created_at)]
    });

    // Calculate daily breakdown for last 7 days
    const daily = {
      total: entries.filter(entry => new Date(entry.created_at) >= startOfToday).length,
      breakdown: Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(now, i), 'MMM dd');
        const count = entries.filter(entry => 
          format(new Date(entry.created_at), 'MMM dd') === date
        ).length;
        return { date, count };
      }).reverse() // Show oldest to newest
    };

    const monthly = {
      total: entries.filter(entry => new Date(entry.created_at) >= startOfThisMonth).length
    };

    const yearly = {
      total: entries.filter(entry => new Date(entry.created_at) >= startOfThisYear).length
    };

    // Calculate distribution by city, ZIP, and latest signups
    const locationDistribution = entries.reduce((acc: { 
      cities: Record<string, number>,
      zips: Record<string, number>,
      latestByZip: Record<string, any[]>
    }, entry) => {
      if (entry.city) {
        const cityKey = `${entry.city}, ${entry.state || 'Unknown'}`;
        acc.cities[cityKey] = (acc.cities[cityKey] || 0) + 1;
      }
      if (entry.zip_code) {
        acc.zips[entry.zip_code] = (acc.zips[entry.zip_code] || 0) + 1;

        // Track latest signups by ZIP
        if (!acc.latestByZip[entry.zip_code]) {
          acc.latestByZip[entry.zip_code] = [];
        }
        acc.latestByZip[entry.zip_code].push({
          email: entry.email,
          created_at: entry.created_at,
          zip_code: entry.zip_code,
          city: entry.city,
          state: entry.state
        });
      }
      return acc;
    }, { cities: {}, zips: {}, latestByZip: {} });

    // Format city distribution
    const cityDistribution = Object.entries(locationDistribution.cities)
      .map(([city, count]) => ({
        name: city,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities

    // Format ZIP distribution with latest signups
    const zipDistribution = Object.entries(locationDistribution.zips)
      .map(([zip, count]) => ({
        name: zip,
        count,
        latest: locationDistribution.latestByZip[zip]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5) // Latest 5 signups per ZIP
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 ZIP codes

    return res.json({
      daily,
      monthly,
      yearly,
      cityDistribution,
      zipDistribution
    });
  } catch (error) {
    log('Error fetching analytics:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      error: 'Server error',
      details: 'Failed to fetch analytics data'
    });
  }
});

export default router;