import nodemailer from 'nodemailer';
import { log } from '../vite';
import { db } from '../db';
import { verificationTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Test the email connection
async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    log('Email connection verified successfully');
    return true;
  } catch (error) {
    log('Email connection failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Template reading functions
async function readTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  return await fs.readFile(templatePath, 'utf-8');
}

async function renderEmailTemplate(content: string, title: string): Promise<string> {
  const baseTemplate = await readTemplate('base-email.html');
  return baseTemplate.replace('{{{content}}}', content).replace('{{title}}', title);
}

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
    // Test connection first
    const connectionTest = await testEmailConnection();
    if (!connectionTest) {
      log('Email connection test failed, cannot send verification email');
      return false;
    }

    const code = await generateVerificationCode(email);
    log(`Generated verification code ${code} for ${email}`);

    const verificationTemplate = await readTemplate('verification-email.html');
    const content = verificationTemplate
      .replace('{{verificationCode}}', code);

    const emailHtml = await renderEmailTemplate(content, 'Verify Your Email');

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your GreenGhost Tech Verification Code",
      html: emailHtml,
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

    const welcomeTemplate = await readTemplate('welcome-email.html');
    const content = welcomeTemplate
      .replace('{{dashboardUrl}}', 'https://app.greenghosttech.com/dashboard');

    const emailHtml = await renderEmailTemplate(content, 'Welcome to GreenGhost Tech');

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Welcome to GreenGhost Tech's Waitlist!",
      html: emailHtml,
    });

    log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log('Failed to send welcome email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function testConnection(): Promise<{success: boolean, message: string, details?: string}> {
  try {
    await transporter.verify();
    return {
      success: true,
      message: 'Email connection successful',
      details: `Connected to Gmail SMTP with ${process.env.GMAIL_USER}`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: 'Email connection failed',
      details: errorMessage
    };
  }
}

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  verifyCode,
  testConnection,
};