#!/bin/bash

# GreenGhost Tech Deployment Script
echo "🚀 Preparing GreenGhost Tech for deployment..."

# Step 1: Generate a secure session secret
echo "📝 Generating secure session secret..."
SESSION_SECRET=$(openssl rand -base64 32)
echo "Generated session secret: $SESSION_SECRET"

# Step 2: Create production environment file
echo "🔧 Creating production environment template..."
cat > .env.production << EOF
# Copy this to your Vercel environment variables
DATABASE_URL=postgresql://username:password@host:5432/database_name
SESSION_SECRET=$SESSION_SECRET
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
NODE_ENV=production
EOF

echo "✅ Deployment files created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up Neon database at https://console.neon.tech"
echo "2. Push code to GitHub"
echo "3. Deploy to Netlify"
echo "4. Add environment variables from .env.production"
echo ""
echo "📖 See NETLIFY-DEPLOY.md for Netlify instructions"
echo "📖 See README-DEPLOYMENT.md for Vercel instructions"