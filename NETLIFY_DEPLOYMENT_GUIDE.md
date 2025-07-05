# GreenGhost Tech - Netlify Deployment Guide

## Overview
This guide will help you deploy your GreenGhost Tech website to Netlify's free hosting. Since your app has both frontend and backend components, we'll deploy them separately:

- **Frontend**: Netlify (Static hosting)
- **Backend**: Railway/Render (Free backend hosting)
- **Database**: Neon PostgreSQL (Free tier)

## Prerequisites
- GitHub account
- Netlify account (free)
- Railway or Render account (free for backend)

## Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `greenghosttech-website`
3. Make it public (required for Netlify free plan)
4. Don't initialize with README (we'll push existing code)

### 1.2 Push Your Code to GitHub
Run these commands in your project root:
```bash
git init
git add .
git commit -m "Initial commit - GreenGhost Tech website"
git remote add origin https://github.com/YOUR_USERNAME/greenghosttech-website.git
git branch -M main
git push -u origin main
```

## Step 2: Configure Frontend for Static Deployment

### 2.1 Update Vite Configuration
Your frontend needs to work without the backend for static hosting. We'll configure it to use external APIs.

### 2.2 Update API Endpoints
You'll need to update the API base URL to point to your deployed backend service.

## Step 3: Deploy Backend to Render (Recommended Free Option)

### 3.1 Setup Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### 3.2 Configure Backend Deployment
1. Click "New +" → "Web Service"
2. Select your `greenghosttech-website` repository
3. Configure these settings:
   - **Name**: `greenghosttech-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3.3 Set Environment Variables in Render
In the Environment section, add these variables:
```
NODE_ENV=production
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_session_secret
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
PORT=10000
```

### 3.4 Deploy
Click "Create Web Service" - Render will build and deploy automatically.

## Step 4: Deploy Frontend to Netlify

### 4.1 Connect Repository to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
   - **Base directory**: Leave empty

### 4.2 Set Environment Variables in Netlify
In Netlify dashboard, go to Site settings → Environment variables:
```
VITE_API_URL=https://your-render-app.onrender.com
```

### 4.3 Configure Redirects for SPA
Create a `_redirects` file in your `client/public` directory:
```
/*    /index.html   200
```

## Step 5: Update Frontend API Configuration

### 5.1 Create Environment Configuration
Update your frontend to use the deployed backend URL:

```typescript
// In client/src/lib/queryClient.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  // ... rest of the function
}
```

## Step 6: Database Setup

### 6.1 Use Existing Neon Database
Your current Neon PostgreSQL database can continue to be used. Make sure:
1. The connection string is added to Railway environment variables
2. The database allows connections from Railway's IP ranges

### 6.2 Run Database Migrations
In Railway, you can run migrations by adding a build script:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "postbuild": "npm run db:push"
  }
}
```

## Step 7: Configure CORS for Cross-Origin Requests

Update your backend CORS configuration to allow requests from your Netlify domain:

```typescript
// In server/index.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-netlify-site.netlify.app',
    'https://your-custom-domain.com' // if you have one
  ],
  credentials: true
}));
```

## Step 8: Testing and Verification

### 8.1 Test Backend Deployment
1. Visit your Railway app URL
2. Test API endpoints: `https://your-app.up.railway.app/api/user`
3. Check logs in Railway dashboard

### 8.2 Test Frontend Deployment
1. Visit your Netlify site URL
2. Test all functionality including:
   - Waitlist signup
   - Navigation
   - Admin login (if applicable)
   - Pricing calculator

## Step 9: Custom Domain (Optional)

### 9.1 Add Custom Domain to Netlify
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records as instructed

### 9.2 Update CORS Configuration
Remember to add your custom domain to the CORS origins list in your backend.

## Step 10: Monitoring and Maintenance

### 10.1 Set Up Monitoring
- Use Netlify's built-in analytics
- Monitor Railway logs for backend issues
- Set up uptime monitoring if needed

### 10.2 Regular Updates
- Keep dependencies updated
- Monitor free tier limits
- Backup database regularly

## Troubleshooting Common Issues

### Frontend Issues
- **Build fails**: Check Node.js version compatibility
- **API calls fail**: Verify CORS and API URL configuration
- **Routes don't work**: Ensure `_redirects` file is properly configured

### Backend Issues
- **Deploy fails**: Check build logs in Railway
- **Database connection fails**: Verify DATABASE_URL and firewall settings
- **CORS errors**: Update allowed origins list

### Environment Variables
- **Variables not loading**: Ensure they're set in both Netlify and Railway
- **API keys not working**: Verify secret values are correctly copied

## Cost Considerations

### Free Tier Limits
- **Netlify**: 100GB bandwidth, 300 build minutes/month
- **Railway**: $5 credit monthly (sufficient for small apps)
- **Neon**: 512MB storage, 1 project on free tier

### Scaling Options
When you outgrow free tiers:
- Netlify Pro: $19/month
- Railway: Pay-as-you-go after credit
- Neon Pro: $29/month

## Next Steps After Deployment

1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure backups for critical data
4. Plan for scaling as your user base grows
5. Consider implementing CDN for better performance

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Railway Documentation](https://docs.railway.app/)
- [Neon Documentation](https://neon.tech/docs/)

---

**Note**: This guide assumes you want to keep your current database and backend logic. If you prefer a fully static site, we can modify the approach to use serverless functions or remove backend dependencies entirely.