
import { Router } from 'express';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { sendPasswordResetEmail } from '../utils/email';
import { users, passwordResetTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

const router = Router();
const scryptAsync = promisify(scrypt);

// Wrap route handlers with try-catch
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get current user
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// Password reset request
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Check if user exists
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    // For security reasons, still return success even if the email doesn't exist
    return res.status(200).json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent' 
    });
  }
  
  // Generate token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
  
  // Save token in database
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
    used: false
  });
  
  // Send email with reset link
  await sendPasswordResetEmail(user.email, token);
  
  res.status(200).json({ 
    success: true, 
    message: 'If an account with that email exists, a password reset link has been sent' 
  });
}));

// Reset password with token
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }
  
  // Validate password
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  // Find valid token
  const now = new Date();
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);
  
  if (!resetToken) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  // Get user
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
  
  // Update user password
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user.id));
  
  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, resetToken.id));
  
  res.status(200).json({ 
    success: true, 
    message: 'Password has been reset successfully' 
  });
}));

export default router;
