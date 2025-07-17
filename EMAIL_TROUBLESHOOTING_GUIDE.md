# Email Delivery Troubleshooting Guide

## Current Issue
Gmail authentication is failing with "Username and Password not accepted" error.

## Gmail Setup Requirements (Recommended)

### Step 1: Verify 2FA is Enabled
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Ensure "2-Step Verification" is turned ON
3. If not enabled, set it up first

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Scroll down to "App passwords"
4. Click "Generate new app password"
5. Select "Mail" or "Other (Custom name)"
6. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### Step 3: Important Notes
- App password should be 16 characters (spaces are automatically removed)
- Don't use your regular Gmail password
- Make sure your Gmail account allows "Less secure app access" is OFF (we use App Password instead)

### Step 4: Alternative Gmail Configuration
If still failing, try this enhanced configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

## Alternative Email Services

If Gmail continues to fail, consider these alternatives:

### Option 1: SendGrid (Professional)
- More reliable for transactional emails
- Better deliverability rates
- Free tier: 100 emails/day
- Setup: Get SendGrid API key

### Option 2: Nodemailer with Other Providers
- Outlook/Hotmail
- Yahoo Mail
- Custom SMTP server

## Current Fallback System
The system currently:
- ✅ Allows signups to continue
- ✅ Logs verification codes to server console
- ✅ Maintains full functionality
- ✅ Users can verify using logged codes

## Testing Email Configuration
Run this test to verify email setup:
```bash
node test-email.js
```

## Debugging Steps
1. **Verify Environment Variables**
   - GMAIL_USER should be your full email (user@gmail.com)
   - GMAIL_APP_PASSWORD should be 16 characters

2. **Check Gmail Account**
   - Confirm 2FA is enabled
   - Generate fresh App Password
   - Try logging into Gmail web interface

3. **Test Different Configuration**
   - Try explicit SMTP settings
   - Test with different port (465 vs 587)
   - Enable/disable TLS settings

## Production Recommendations
1. **Use SendGrid** for reliable email delivery
2. **Set up proper domain authentication** (SPF, DKIM, DMARC)
3. **Monitor email delivery rates**
4. **Implement email templates** with professional design

The current fallback system ensures your application works while we resolve email delivery issues.