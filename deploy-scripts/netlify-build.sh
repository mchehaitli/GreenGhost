#!/bin/bash

# Netlify Build Script for GreenGhost Tech
echo "🚀 Starting GreenGhost Tech build for Netlify..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Built files are in: dist/public"
    
    # List the contents to verify
    echo "📋 Build output contents:"
    ls -la dist/public/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Ready for Netlify deployment!"