import nodemailer from 'nodemailer';
import { renderToString } from 'react-dom/server';
import emailService from '../services/email';

// Configure email transport (for development, use ethereal.email)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal-user',
    pass: process.env.EMAIL_PASS || 'ethereal-password',
  },
});

// Utility function to send an email
async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: '"GreenGhost Tech" <noreply@greenghosttech.com>',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Send verification email with code
export async function sendVerificationEmail(email: string, code: string) {
  const subject = 'Verify your email address';
  const html = emailService.renderVerificationEmail(email, code);
  return sendEmail(email, subject, html);
}

// Send welcome email after verification
export async function sendWelcomeEmail(email: string, zipCode: string) {
  const subject = 'Welcome to GreenGhost Tech!';
  const html = emailService.renderWelcomeEmail(email, zipCode);
  return sendEmail(email, subject, html);
}

// Send a password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  const subject = 'Reset your password';
  const html = emailService.renderPasswordResetEmail(email, token);
  return sendEmail(email, subject, html);
}

// Preview email templates
export async function previewEmailTemplate(type: 'verification' | 'welcome' | 'reset', email: string) {
  switch (type) {
    case 'verification':
      return emailService.renderVerificationEmail(email, '123456');
    case 'welcome':
      return emailService.renderWelcomeEmail(email, '12345');
    case 'reset':
      return emailService.renderPasswordResetEmail(email, 'sample-token');
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

// Export utils
export const emailUtils = {
  sendVerificationEmail,
  sendWelcomeEmail,
  previewEmailTemplate,
  sendPasswordResetEmail
};

export default emailUtils;