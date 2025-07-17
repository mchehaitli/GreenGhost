# GreenGhost Deployment Checklist

## Pre-Deployment Setup

### ✅ Repository Setup
- [ ] Create GitHub repository `greenghost-website`
- [ ] Push code to GitHub
- [ ] Verify all files are committed

### ✅ Backend Deployment (Railway)
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=your_neon_database_url`
  - [ ] `SESSION_SECRET=your_session_secret`
  - [ ] `GMAIL_USER=your_gmail_address`
  - [ ] `GMAIL_APP_PASSWORD=your_gmail_app_password`
- [ ] Deploy backend
- [ ] Test API endpoints
- [ ] Note Railway app URL

### ✅ Frontend Deployment (Netlify)
- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist/public`
- [ ] Set environment variables:
  - [ ] `VITE_API_URL=https://your-railway-app.up.railway.app`
- [ ] Deploy frontend
- [ ] Test website functionality

## Post-Deployment Testing

### ✅ Frontend Testing
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Responsive design on mobile/tablet
- [ ] All pages accessible
- [ ] No console errors

### ✅ Backend Testing
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] CORS properly configured
- [ ] Error handling works

### ✅ Integration Testing
- [ ] Waitlist signup (when email is fixed)
- [ ] Admin login functionality
- [ ] Pricing calculator
- [ ] Quote form submission
- [ ] Cross-origin requests work

## Domain & DNS (Optional)

### ✅ Custom Domain Setup
- [ ] Purchase domain
- [ ] Add domain to Netlify
- [ ] Configure DNS records
- [ ] Update CORS settings in backend
- [ ] Test SSL certificate

## Monitoring & Maintenance

### ✅ Setup Monitoring
- [ ] Enable Netlify analytics
- [ ] Monitor Railway logs
- [ ] Set up uptime monitoring
- [ ] Configure error tracking

### ✅ Performance Optimization
- [ ] Enable CDN
- [ ] Optimize images
- [ ] Check loading speeds
- [ ] Monitor bandwidth usage

## Troubleshooting

### Common Issues
- **Build fails**: Check Node.js version and dependencies
- **CORS errors**: Verify API URL and origins configuration
- **Routes don't work**: Ensure `_redirects` file exists
- **API calls fail**: Check environment variables and network connectivity

### Quick Fixes
- Clear build cache in Netlify
- Restart Railway deployment
- Check environment variable values
- Verify database connectivity

## Success Criteria
- [ ] Website loads at Netlify URL
- [ ] All pages navigable
- [ ] Basic functionality works
- [ ] No critical errors in console
- [ ] Mobile responsive
- [ ] Backend API accessible

## Next Steps After Deployment
1. Fix Gmail authentication for waitlist emails
2. Set up custom domain
3. Configure analytics tracking
4. Plan for scaling and optimization
5. Regular backups and updates