import { Router } from 'express';
import { db } from '../../db';
import { waitlist, insertWaitlistSchema } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.post('/api/waitlist', async (req, res) => {
  try {
    const { email, zipCode } = req.body;
    console.log('Received waitlist submission:', { email, zipCode });

    // Validate input using our Zod schema
    const parsedInput = insertWaitlistSchema.parse({
      email,
      zip_code: zipCode,
    });

    const result = await db.insert(waitlist).values(parsedInput).returning();
    console.log('Successfully saved to waitlist:', result);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/api/waitlist', async (req, res) => {
  try {
    console.log('Fetching waitlist entries...');
    const entries = await db.select({
      id: waitlist.id,
      email: waitlist.email,
      zip_code: waitlist.zip_code,
      created_at: waitlist.created_at
    })
    .from(waitlist)
    .orderBy(sql`${waitlist.created_at} DESC`);
    
    console.log('Retrieved entries:', entries);
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