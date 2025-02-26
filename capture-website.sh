#!/bin/bash

echo "🔍 Starting website screenshot capture process..."

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Run the screenshot capture script
echo "📸 Capturing screenshots of all pages..."
node screenshot.js

# Package screenshots and create summary
echo "📦 Creating screenshot gallery and ZIP file..."
node package-screenshots.js

echo "✅ Process complete!"
echo "📊 View your screenshot gallery: screenshot-gallery.html"
echo "📥 Download all screenshots: screenshots.zip"