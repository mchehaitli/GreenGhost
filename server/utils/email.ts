import nodemailer from 'nodemailer';

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: 'Password Reset Request - GreenGhost Tech',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Reset Your Password</h2>
        <p>You recently requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">GreenGhost Tech - Transforming Lawn Care Management</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
import nodemailer from 'nodemailer';
import { log } from '../vite';

// Configure email transport
const createTransport = () => {
  // For development purposes, use a test account
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
      }
    });
  }

  // For production, use real SMTP settings
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send an email
 */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = createTransport();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Admin Portal" <noreply@example.com>',
      to,
      subject,
      html
    });

    log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    log(`Error sending email: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
  
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetUrl}" target="_blank">Reset Password</a></p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  
  return sendEmail(to, 'Password Reset Request', html);
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail(to: string, code: string) {
  const html = `
    <h1>Verify Your Email</h1>
    <p>Your verification code is: <strong>${code}</strong></p>
    <p>Enter this code to complete your registration.</p>
    <p>This code will expire in 10 minutes.</p>
  `;
  
  return sendEmail(to, 'Email Verification', html);
}
