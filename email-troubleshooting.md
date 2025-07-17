# Email Configuration Guide

## Email Address Configuration

The system now uses dedicated email addresses for different purposes:

**📧 Email Addresses:**
- **verify@greenghost.io** - Verification emails (6-digit codes)
- **welcome@greenghost.io** - Welcome emails after signup
- **noreply@greenghost.io** - Marketing emails and newsletters
- **contact@greenghost.io** - General contact (displayed on website)
- **support@greenghost.io** - Administrative communications

## Current Issue
The Gmail SMTP authentication is failing with error: "Please log in with your web browser and then try again"

## Required Steps to Fix Gmail Authentication

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings: https://myaccount.google.com/
- Navigate to Security → 2-Step Verification
- Enable 2-Step Verification if not already enabled

### 2. Generate App Password
- In Google Account settings: Security → 2-Step Verification → App passwords
- Select "Mail" as the app type
- Generate a new 16-character app password
- Use this password (not your regular Gmail password) in GMAIL_APP_PASSWORD

### 3. Account Security Settings
- Ensure "Less secure app access" is NOT enabled (it should be disabled)
- Make sure your @greenghost.io email is a proper Gmail/Google Workspace account

### 4. Google Workspace Configuration (if applicable)
If @greenghost.io is a Google Workspace domain:
- Admin console → Security → API controls → Domain-wide delegation
- Ensure SMTP/IMAP access is enabled for your organization

### 5. Alternative Email Providers
If Gmail continues to have issues, consider:
- SendGrid (recommended for production)
- Mailgun
- Amazon SES
- Postmark

## Testing Email Connection
The system will test the connection before sending emails. Check server logs for connection status.

## Current Configuration
- Service: Gmail SMTP
- Host: smtp.gmail.com
- Port: 587 (TLS)
- Authentication: Username/Password (App Password)