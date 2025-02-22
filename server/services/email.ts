import nodemailer from 'nodemailer';
import { log } from '../vite';
import crypto from 'crypto';
import { db } from '../db';
import { verificationTokens } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate a verification token
async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

  // Store token in database
  await db.insert(verificationTokens).values({
    email,
    token,
    expires_at: expiresAt,
    created_at: new Date(),
  });

  return token;
}

// Verify a token
export async function verifyToken(email: string, token: string): Promise<boolean> {
  const [storedToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.email, email))
    .where(eq(verificationTokens.token, token));

  if (!storedToken) {
    return false;
  }

  // Check if token is expired
  if (new Date() > storedToken.expires_at) {
    return false;
  }

  // Delete the used token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, storedToken.id));

  return true;
}

export async function sendVerificationEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    const token = await generateVerificationToken(email);
    const verificationLink = `${process.env.APP_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(email)}&token=${token}`;

    log(`Sending verification email to ${email}`);

    const mailOptions = {
      from: `"GreenGhost Tech" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email for GreenGhost Tech's Waitlist",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">Verify Your Email 🌿</h1>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining our waitlist! Please verify your email address to complete your registration.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationLink}" 
               style="background-color: #22c55e; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px;
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #4b5563; line-height: 1.6;">
            This verification link will expire in 24 hours. If you didn't request this verification, please ignore this email.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.875rem;">
              GreenGhost Tech | Frisco, Texas<br>
              Revolutionizing lawn care through technology
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    log('Verification email sent successfully');
    return true;
  } catch (error) {
    log(`Error sending verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    log(`Sending welcome email to ${email}`);

    const mailOptions = {
      from: `"GreenGhost Tech" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to GreenGhost Tech's Waitlist! 🌿",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">Welcome to GreenGhost Tech! 🌿</h1>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for verifying your email! You're now officially part of our growing community of forward-thinking property owners in the ${zipCode} area.
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            You're now entered for a chance to win a full year of FREE automated lawn maintenance! We'll notify all winners before our beta launch in Summer 2025.
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
    };

    await transporter.sendMail(mailOptions);
    log('Welcome email sent successfully');
    return true;
  } catch (error) {
    log(`Error sending welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}