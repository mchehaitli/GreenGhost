# 🚀 Quick Deploy to Vercel - 5 Minutes

## Step 1: Run Deployment Helper
```bash
./deploy.sh
```
This generates your secure session secret and environment template.

## Step 2: Set Up Free Database (2 minutes)
1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up with GitHub
3. Create project: "greenghosttech"
4. Copy the connection string from the dashboard

## Step 3: Push to GitHub (1 minute)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 4: Deploy to Vercel (2 minutes)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Import your repository
3. Vercel auto-detects settings → Click "Deploy"

## Step 5: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

**Copy from `.env.production` file:**
- `DATABASE_URL` = Your Neon connection string
- `SESSION_SECRET` = Generated secret from deploy.sh
- `GMAIL_USER` = your-email@gmail.com  
- `GMAIL_APP_PASSWORD` = Get from Gmail settings

### Gmail App Password Setup:
1. Gmail → Manage Account → Security → 2-Step Verification → App Passwords
2. Generate password for "Mail"
3. Use this 16-character password (not your regular Gmail password)

## That's It! 🎉
Your site will be live at: `https://your-app-name.vercel.app`

**Test checklist:**
- [ ] Homepage loads
- [ ] Admin login works (/login)
- [ ] Pricing page displays
- [ ] Waitlist signup functional

## Need Help?
- Check Vercel logs for errors
- Verify all environment variables are set
- See full guide in `README-DEPLOYMENT.md`