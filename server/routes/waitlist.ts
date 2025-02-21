import { Router } from 'express';
import { db } from '../db';
import { waitlist, insertWaitlistSchema } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.post('/api/waitlist', async (req, res) => {
  try {
    const { email, zipCode } = req.body;

    // Validate input using our Zod schema
    const parsedInput = insertWaitlistSchema.parse({
      email,
      zip_code: zipCode,
    });

    await db.insert(waitlist).values(parsedInput);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

router.get('/api/waitlist', async (req, res) => {
  try {
    const entries = await db.select().from(waitlist).orderBy(waitlist.created_at);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

export default router;