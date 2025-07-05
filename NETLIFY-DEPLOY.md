# 🚀 Deploy to Netlify - 5 Minutes

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
git commit -m "Ready for Netlify deployment"
git push origin main
```

## Step 4: Deploy to Netlify (2 minutes)
1. Go to [app.netlify.com](https://app.netlify.com) → Sign up with GitHub
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Netlify auto-detects build settings → Click "Deploy site"

## Step 5: Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:

**Copy from `.env.production` file:**
- `DATABASE_URL` = Your Neon connection string
- `SESSION_SECRET` = Generated secret from deploy.sh
- `GMAIL_USER` = your-email@gmail.com  
- `GMAIL_APP_PASSWORD` = Get from Gmail settings
- `NODE_ENV` = production

### Gmail App Password Setup:
1. Gmail → Manage Account → Security → 2-Step Verification → App Passwords
2. Generate password for "Mail"
3. Use this 16-character password (not your regular Gmail password)

## Step 6: Redeploy (30 seconds)
After adding environment variables:
- Go to "Deploys" tab → Click "Trigger deploy"

## That's It! 🎉
Your site will be live at: `https://amazing-name-123456.netlify.app`

**Test checklist:**
- [ ] Homepage loads
- [ ] Admin login works (/login)
- [ ] Pricing page displays
- [ ] Waitlist signup functional

## Netlify Features You Get:
- ✅ **Free hosting** - No cost for your site
- ✅ **Auto-deploys** - Updates when you push to GitHub
- ✅ **HTTPS** - Secure connection included
- ✅ **Custom domain** - Add your own domain later
- ✅ **Form handling** - Contact forms work automatically

## Need Help?
- Check Netlify function logs in dashboard → Functions tab
- Verify all environment variables are set
- See Netlify docs: [docs.netlify.com](https://docs.netlify.com)

## Alternative: Vercel
If you prefer Vercel, see `README-DEPLOYMENT.md` for Vercel instructions.