// Simple Gmail test script
import nodemailer from 'nodemailer';

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

console.log('Testing Gmail credentials...');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set (length: ' + process.env.GMAIL_APP_PASSWORD.length + ')' : 'Not set');

try {
  await transporter.verify();
  console.log('✅ Gmail connection successful!');
  
  // Send test email
  const result = await transporter.sendMail({
    from: `GreenGhost Test <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send to self
    subject: 'GreenGhost Email Test',
    html: '<h1>Test Email</h1><p>This is a test email from GreenGhost.</p>'
  });
  
  console.log('✅ Test email sent successfully:', result.messageId);
} catch (error) {
  console.log('❌ Gmail connection failed:', error.message);
  
  if (error.message.includes('Username and Password not accepted')) {
    console.log('\n📋 Gmail Setup Instructions:');
    console.log('1. Enable 2-Factor Authentication on your Gmail account');
    console.log('2. Go to Google Account Settings → Security → 2-Step Verification → App passwords');
    console.log('3. Generate a new App Password for "Mail"');
    console.log('4. Update GMAIL_APP_PASSWORD with the 16-character password (no spaces)');
    console.log('5. Make sure GMAIL_USER is your full Gmail address');
  }
}