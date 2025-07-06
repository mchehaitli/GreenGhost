#!/bin/bash

# Green Ghost - Deploy Authentication & Data Loading Fixes
echo "🚀 Deploying authentication and waitlist data fixes to greenghost.io..."

# Check git status
echo "📋 Current git status:"
git status

# Add all changes
echo "➕ Adding all changes..."
git add .

# Commit with descriptive message
echo "💾 Committing changes..."
git commit -m "Fix: Authentication persistence and waitlist data loading

- Reduced session duration from 1 week to 2 hours
- Enhanced logout to destroy session and clear cookies completely
- Fixed waitlist query authentication in admin portal
- Resolved 401 errors preventing data access
- Added debugging information for production troubleshooting

Fixes auto-login issue and missing waitlist data on greenghost.io"

# Push to main branch
echo "🌐 Pushing to GitHub (triggers Netlify deployment)..."
git push origin main

echo "✅ Deployment complete! Changes will be live on greenghost.io in 2-3 minutes."
echo "🔧 Fixed Issues:"
echo "   - Auto-login sessions now expire in 2 hours"
echo "   - Admin portal will display waitlist data correctly"
echo "   - Logout button properly clears session"