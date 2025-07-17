import { MailService } from '@sendgrid/mail';
import { log } from '../vite';
import { db } from '../db';
import { verificationTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SendGrid
const mailService = new MailService();

// Email addresses for different purposes
const EMAIL_ADDRESSES = {
  verification: 'verify@greenghost.io',
  welcome: 'welcome@greenghost.io',
  marketing: 'noreply@greenghost.io',
  contact: 'contact@greenghost.io',
  admin: 'support@greenghost.io'
};

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  log('SendGrid email service initialized');
} else {
  log('SENDGRID_API_KEY not found, email service will use fallback logging');
}

// Test the SendGrid connection
async function testSendGridConnection(): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      log('SendGrid API key not configured');
      return false;
    }
    
    // SendGrid doesn't have a verify method, so we'll just check if the API key exists
    log('SendGrid connection ready');
    return true;
  } catch (error) {
    log('SendGrid connection failed:', error instanceof Error ? error.message : 'Unknown error');
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

export async function sendVerificationEmailSendGrid(email: string, zipCode: string): Promise<boolean> {
  try {
    const code = await generateVerificationCode(email);
    log(`Generated verification code ${code} for ${email}`);

    // Always log the code for development and fallback
    log(`==================================================`);
    log(`Verification code for ${email}: ${code}`);
    log(`ZIP Code: ${zipCode}`);
    log(`==================================================`);

    // Try to send email with SendGrid
    try {
      const connectionTest = await testSendGridConnection();
      if (!connectionTest) {
        log('SendGrid connection test failed, using fallback logging');
        return true; // Still allow signup to continue
      }

      const verificationTemplate = await readTemplate('verification-email.html');
      const content = verificationTemplate
        .replace('{{verificationCode}}', code);

      const emailHtml = await renderEmailTemplate(content, 'Verify Your Email');

      await mailService.send({
        to: email,
        from: EMAIL_ADDRESSES.verification,
        subject: "Your GreenGhost Verification Code",
        html: emailHtml,
      });

      log(`Verification email sent successfully via SendGrid to ${email}`);
      return true;
    } catch (emailError) {
      log('SendGrid email error:', emailError instanceof Error ? emailError.message : 'Unknown email error');
      log(`Continuing with signup for ${email} without email`);
      return true; // Still allow signup to continue
    }
  } catch (error) {
    log('Failed to send verification email via SendGrid:', error instanceof Error ? error.message : 'Unknown error');
    log(`FALLBACK: Check logs above for verification code for ${email}`);
    return true; // Always return true to allow signup to continue
  }
}

export async function sendWelcomeEmailSendGrid(email: string, zipCode: string): Promise<boolean> {
  try {
    log(`Sending welcome email via SendGrid to ${email}`);

    if (!process.env.SENDGRID_API_KEY) {
      log('SendGrid not configured, skipping welcome email');
      return false;
    }

    const welcomeTemplate = await readTemplate('welcome-email.html');
    const content = welcomeTemplate
      .replace('{{dashboardUrl}}', 'https://app.greenghost.io/dashboard');

    const emailHtml = await renderEmailTemplate(content, 'Welcome to GreenGhost');

    await mailService.send({
      to: email,
      from: EMAIL_ADDRESSES.welcome,
      subject: "Welcome to GreenGhost's Waitlist!",
      html: emailHtml,
    });

    log(`Welcome email sent successfully via SendGrid to ${email}`);
    return true;
  } catch (error) {
    log('Failed to send welcome email via SendGrid:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export { testSendGridConnection };