import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

router.post('/api/waitlist', async (req, res) => {
  try {
    const { email, zipCode } = req.body;
    
    await db.execute(sql`
      INSERT INTO waitlist (email, zip_code)
      VALUES (${email}, ${zipCode})
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

router.get('/api/waitlist', async (req, res) => {
  try {
    const entries = await db.execute(sql`
      SELECT * FROM waitlist 
      ORDER BY created_at DESC
    `);
    
    res.json(entries.rows);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

export default router;
