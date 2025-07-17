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
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email addresses for different purposes
// Note: Gmail SMTP requires using the authenticated account as sender,
// but we can set the display name and reply-to to show the intended service
const EMAIL_ADDRESSES = {
  verification: `verify@greenghost.io`,
  welcome: `welcome@greenghost.io`, 
  marketing: `noreply@greenghost.io`,
  contact: `contact@greenghost.io`,
  admin: `support@greenghost.io`
};

// Gmail configuration with proper From field handling
const getEmailConfig = (serviceType: 'verification' | 'welcome' | 'marketing' | 'contact' | 'admin') => {
  const gmailUser = process.env.GMAIL_USER;
  return {
    from: `${EMAIL_ADDRESSES[serviceType]} <${gmailUser}>`,
    replyTo: EMAIL_ADDRESSES[serviceType]
  };
};

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
    const code = await generateVerificationCode(email);
    log(`Generated verification code ${code} for ${email}`);

    // Always log the code for development and fallback
    log(`==================================================`);
    log(`Verification code for ${email}: ${code}`);
    log(`ZIP Code: ${zipCode}`);
    log(`==================================================`);

    // Try to send email but don't fail if it doesn't work
    try {
      const connectionTest = await testEmailConnection();
      if (!connectionTest) {
        log('Email connection test failed, using fallback logging');
        return true; // Still allow signup to continue
      }
    } catch (error) {
      log('Email connection error, using fallback logging:', error instanceof Error ? error.message : 'Unknown error');
      return true; // Still allow signup to continue
    }

    const verificationTemplate = await readTemplate('verification-email.html');
    const content = verificationTemplate
      .replace('{{verificationCode}}', code);

    const emailHtml = await renderEmailTemplate(content, 'Verify Your Email');

    const emailConfig = getEmailConfig('verification');
    await transporter.sendMail({
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      to: email,
      subject: "Your GreenGhost Verification Code",
      html: emailHtml,
    });

    log(`Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log('Failed to send verification email:', error instanceof Error ? error.message : 'Unknown error');
    log(`FALLBACK: Check logs above for verification code for ${email}`);
    return true; // Always return true to allow signup to continue
  }
}

export async function sendWelcomeEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    log(`Sending welcome email to ${email}`);

    const welcomeTemplate = await readTemplate('welcome-email.html');
    const content = welcomeTemplate
      .replace('{{dashboardUrl}}', 'https://app.greenghost.io/dashboard');

    const emailHtml = await renderEmailTemplate(content, 'Welcome to GreenGhost');

    const emailConfig = getEmailConfig('welcome');
    await transporter.sendMail({
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      to: email,
      subject: "Welcome to GreenGhost's Waitlist!",
      html: emailHtml,
    });

    log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log('Failed to send welcome email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendMarketingEmail(
  to: string, 
  subject: string, 
  htmlContent: string
): Promise<boolean> {
  try {
    const emailConfig = getEmailConfig('marketing');
    await transporter.sendMail({
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      to,
      subject,
      html: htmlContent,
    });
    
    log(`Marketing email sent successfully to ${to}`);
    return true;
  } catch (error) {
    log('Failed to send marketing email:', error instanceof Error ? error.message : 'Unknown error');
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
  sendMarketingEmail,
  verifyCode,
  testConnection,
};