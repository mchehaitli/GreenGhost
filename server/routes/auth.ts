import { Router } from 'express';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { sendPasswordResetEmail } from '../utils/email';
import { users, passwordResetTokens } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

const router = Router();
const scryptAsync = promisify(scrypt);

// Wrap route handlers with try-catch
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Don't reveal whether a user exists
  if (!user) {
    return res.json({
      message: 'If an account exists with this email, you will receive a password reset link.'
    });
  }

  // Generate reset token and expiry
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  // Save token to database
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
    used: false
  });

  // Send reset email
  await sendPasswordResetEmail(email, token);

  return res.json({
    message: 'If an account exists with this email, you will receive a password reset link.'
  });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  // Find and validate token
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
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Get the user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, resetToken.userId))
    .limit(1);

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Hash new password
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedPassword = `${buf.toString('hex')}.${salt}`;

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

  return res.json({ message: 'Password has been reset successfully' });
}));

export default router;