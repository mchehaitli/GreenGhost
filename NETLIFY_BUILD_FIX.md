# Netlify Build Fix Instructions

## Current Issue
Netlify build fails because `canvas-confetti` dependency is missing from client/package.json

## Solution Applied

### 1. Updated client/package.json
Added missing dependencies:
- ✅ `canvas-confetti: ^1.9.3` - Required for WelcomeAnimation component
- ✅ `xlsx: ^0.18.5` - Required for admin portal data export

### 2. Fixed Netlify Configuration
Updated netlify.toml:
- Changed build command from `build:frontend` to `build` 
- Added VITE_API_URL environment variable
- Set proper base directory to `client`

### 3. Files Ready for Push
- `client/package.json` - Updated with all dependencies
- `client/vite.config.ts` - Complete Vite configuration
- `client/theme.json` - Theme configuration  
- `netlify.toml` - Fixed build configuration

## Next Steps
Push these changes to GitHub:

```bash
git add client/package.json client/vite.config.ts client/theme.json netlify.toml
git commit -m "Fix Netlify build: Add missing dependencies and update config"
git push origin main
```

## Expected Result
- ✅ Netlify build will succeed
- ✅ Frontend will deploy correctly
- ✅ API connections to Render backend will work
- ✅ Admin portal will be functional on live site

## Deployment URLs
- **Backend**: https://greenghosttech-backend.onrender.com ✅ Live
- **Frontend**: Will be live after successful Netlify build
- **Admin Portal**: `/admin` with credentials admin/admin123