import nodemailer from 'nodemailer';
import { log } from '../vite';
import { db } from '../db';
import { verificationTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

let transporter: nodemailer.Transporter | null = null;

async function createTestAccount() {
  try {
    log('Creating test email account...');
    const testAccount = await nodemailer.createTestAccount();
    return testAccount;
  } catch (error) {
    log('Error creating test account:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    log('Creating new transporter...');
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    try {
      log('Verifying SMTP connection...');
      await transporter.verify();
      log('SMTP connection verified successfully');
    } catch (error) {
      log('SMTP verification failed:', error instanceof Error ? error.message : 'Unknown error');
      transporter = null;
      throw error;
    }
  }

  return transporter;
}

async function generateVerificationCode(email: string): Promise<string> {
  try {
    log(`Generating verification code for ${email}`);

    await db.delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.email, email),
          eq(verificationTokens.used, false)
        )
      );

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + (90 * 1000)); // 90 seconds expiration

    await db.insert(verificationTokens).values({
      email,
      token: code,
      expires_at: expiresAt,
      created_at: new Date(),
      used: false,
    });

    log(`Generated code stored successfully for ${email}`);
    return code;
  } catch (error) {
    log('Error generating verification code:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  try {
    log(`Verifying code for email: ${email}`);
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

    await db
      .update(verificationTokens)
      .set({ used: true })
      .where(eq(verificationTokens.id, storedToken.id));

    log(`Code verified successfully for ${email}`);
    return true;
  } catch (error) {
    log('Error verifying code:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendVerificationEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    const code = await generateVerificationCode(email);
    log(`Generated verification code for ${email}`);

    const transport = await getTransporter();
    log(`Sending verification email to ${email}`);

    const mailOptions = {
      from: `"GreenGhost Tech" <${process.env.SMTP_USER || 'noreply@greenghosttech.com'}>`,
      to: email,
      subject: "Your GreenGhost Tech Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">Verify Your Email 🌿</h1>

          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining our waitlist! Please use the following code to verify your email address:
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
    };

    const info = await transport.sendMail(mailOptions);
    log('Verification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    log('Error sending verification email:', error instanceof Error ? error.message : 'Unknown error');
    transporter = null; // Reset transporter on error
    return false;
  }
}

export async function sendWelcomeEmail(email: string, zipCode: string): Promise<boolean> {
  try {
    const transport = await getTransporter();
    log(`Sending welcome email to ${email}`);

    const mailOptions = {
      from: `"GreenGhost Tech" <${process.env.SMTP_USER || 'noreply@greenghosttech.com'}>`,
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
    };

    const info = await transport.sendMail(mailOptions);
    log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    log('Error sending welcome email:', error instanceof Error ? error.message : 'Unknown error');
    transporter = null; // Reset transporter on error
    return false;
  }
}

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  verifyCode,
};