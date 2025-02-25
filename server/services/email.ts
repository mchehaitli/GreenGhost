import nodemailer from 'nodemailer';
import { log } from '../vite';
import { db } from '../db';
import { verificationTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function generateVerificationCode(email: string): Promise<string> {
  // Delete any existing unused tokens for this email
  await db.delete(verificationTokens)
    .where(eq(verificationTokens.email, email));

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + (90 * 1000)); // 90 seconds expiration

  await db.insert(verificationTokens).values({
    email,
    token: code,
    expires_at: expiresAt,
    created_at: new Date(),
    used: false,
  });

  log(`Generated verification code for ${email}: ${code}`);
  return code;
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  try {
    log(`Attempting to verify code for ${email}. Provided code: ${code}`);

    const [storedToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.email, email),
          eq(verificationTokens.token, code),
          eq(verificationTokens.used, false),
          gt(verificationTokens.expires_at, new Date())
        )
      );

    if (!storedToken) {
      log(`No valid token found for email: ${email}`);
      return false;
    }

    // Mark the token as used
    await db
      .update(verificationTokens)
      .set({ used: true })
      .where(eq(verificationTokens.id, storedToken.id));

    log(`Successfully verified code for email: ${email}`);
    return true;
  } catch (error) {
    log('Error during code verification:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendVerificationEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    const code = await generateVerificationCode(email);
    log(`Generated verification code ${code} for ${email}`);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your GreenGhost Tech Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">Verify Your Email 🌿</h1>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining our waitlist! Please use the following 6-digit code to verify your email address:
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <div style="
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              font-size: 32px;
              letter-spacing: 8px;
              font-weight: bold;
              color: #22c55e;
            ">
              ${code}
            </div>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            This verification code will expire in 90 seconds. If you didn't request this code, please ignore this email.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.875rem;">
              GreenGhost Tech | Frisco, Texas<br>
              Revolutionizing lawn care through technology
            </p>
          </div>
        </div>
      `,
    });

    log(`Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log('Failed to send verification email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendWelcomeEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    log(`Sending welcome email to ${email}`);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Welcome to GreenGhost Tech's Waitlist! 🌿",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">Welcome to GreenGhost Tech! 🌿</h1>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for verifying your email! You're now officially part of our growing community of forward-thinking property owners in the ${zipCode} area.
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            You're now entered for a chance to win a full year of FREE automated lawn maintenance! Winner will be announced at launch.
          </p>

          <h2 style="color: #22c55e; margin-top: 30px;">What's Next?</h2>

          <ul style="color: #4b5563; line-height: 1.6;">
            <li>Keep an eye on your inbox for updates about our launch</li>
            <li>You'll be among the first to know when we're ready to begin service in your area</li>
            <li>Early waitlist members get priority access and special pricing</li>
          </ul>

          <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
            Have questions? Reply to this email or contact us at support@greenghosttech.com
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.875rem;">
              GreenGhost Tech | Frisco, Texas<br>
              Revolutionizing lawn care through technology
            </p>
          </div>
        </div>
      `,
    });

    log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log('Failed to send welcome email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  verifyCode,
};