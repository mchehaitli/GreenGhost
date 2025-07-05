# GreenGhost Tech - Deployment Guide

## Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Neon database account (free)

### Step 1: Set Up Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up with GitHub
3. Create a new project named "greenghosttech"
4. Copy the connection string (looks like: `postgresql://username:password@host/database`)

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/greenghosttech.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your greenghosttech repository
5. Vercel will auto-detect the settings

### Step 4: Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
DATABASE_URL = your_neon_connection_string
SESSION_SECRET = generate_random_32_character_string
GMAIL_USER = your_email@gmail.com
GMAIL_APP_PASSWORD = your_gmail_app_specific_password
```

### Step 5: Run Database Migration

After deployment, visit your Vercel URL and the database tables will be created automatically.

## Environment Variables Guide

### DATABASE_URL
- Get from Neon console after creating database
- Format: `postgresql://username:password@host:5432/database_name`

### SESSION_SECRET
- Generate a random 32+ character string
- Use: `openssl rand -base64 32` or online generator

### Gmail Setup
1. Enable 2-factor authentication on Gmail
2. Generate App Password: Google Account → Security → App Passwords
3. Use this app password, not your regular Gmail password

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correct
- Check Neon database is active
- Verify connection string includes all parameters

### Email Issues
- Use Gmail App Password, not regular password
- Ensure 2FA is enabled on Gmail account
- Check GMAIL_USER and GMAIL_APP_PASSWORD are set correctly

### Build Issues
- Ensure all dependencies are in package.json
- Check Node.js version compatibility
- Verify build scripts are correct

## Post-Deployment Checklist

- [ ] Database connected and tables created
- [ ] Admin login working (/login)
- [ ] Email verification working
- [ ] Social media links functional
- [ ] Pricing management accessible
- [ ] Custom domain configured (optional)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test database connection
4. Check email configuration