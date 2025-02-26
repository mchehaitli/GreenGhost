import { Router } from 'express';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { sendPasswordResetEmail } from '../utils/email';
import { users, passwordResetTokens } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();
const scryptAsync = promisify(scrypt);

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log('Received password reset request');

    // Find valid token first
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      console.log('Invalid or expired token');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // If token is valid, then validate password
    if (!password || typeof password !== 'string') {
      console.log('Invalid password format - not a string');
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 8) {
      console.log('Password too short');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(password)) {
      console.log('Missing uppercase letter');
      return res.status(400).json({ error: 'Password must contain an uppercase letter' });
    }

    if (!/[a-z]/.test(password)) {
      console.log('Missing lowercase letter');
      return res.status(400).json({ error: 'Password must contain a lowercase letter' });
    }

    if (!/[0-9]/.test(password)) {
      console.log('Missing number');
      return res.status(400).json({ error: 'Password must contain a number' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user's password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    console.log('Password reset successful');
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Helper functions
function generateToken(length = 32) {
  return randomBytes(length).toString('hex');
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Processing forgot password request');

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Don't reveal whether a user exists
      console.log('User not found for email');
      return res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
    }

    // Generate reset token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: false // Added to track token usage
    });

    // Send reset email
    await sendPasswordResetEmail(email, token);
    console.log('Reset email sent successfully');

    res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

export default router;