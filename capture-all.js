import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Define all routes to capture
const routes = [
  { path: '/', name: 'home' },
  { path: '/services', name: 'services' },
  { path: '/blog', name: 'blog' },
  { path: '/pricing', name: 'pricing' },
  { path: '/quote', name: 'quote' },
  { path: '/about', name: 'about' },
  { path: '/waitlist', name: 'waitlist' },
  { path: '/theme', name: 'theme-customization' },
  { path: '/ai-review', name: 'ai-review' },
  // Not including admin pages as they require login
];

// Capture screenshots for all routes
async function captureScreenshots() {
  console.log('🔍 Launching browser to capture screenshots...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Start capturing each page
    for (const route of routes) {
      console.log(`📸 Capturing ${route.name}...`);
      const url = `http://localhost:5000${route.path}`;
      
      try {
        // Navigate to the page
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 30000 // 30 seconds timeout for page load
        });
        
        // Wait a moment for any animations to complete
        await page.waitForTimeout(2000);
        
        // Capture full page screenshot
        const screenshotPath = path.join(screenshotsDir, `${route.name}.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true
        });
        
        console.log(`✅ Saved screenshot: ${route.name}.png`);
      } catch (pageError) {
        console.error(`❌ Error capturing ${route.name}:`, pageError.message);
      }
    }
    
    // Also capture the AI Review page as text for AI tools
    try {
      console.log('📝 Capturing AI Review page text content...');
      await page.goto('http://localhost:5000/ai-review', { waitUntil: 'networkidle0' });
      const content = await page.evaluate(() => {
        return document.body.innerText;
      });
      
      fs.writeFileSync('ai-review-content.txt', content);
      console.log('✅ Saved AI Review content to ai-review-content.txt');
    } catch (textError) {
      console.error('❌ Error capturing AI Review text:', textError);
    }
    
    console.log('🎉 All screenshots captured successfully!');
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

// Generate HTML summary page
function generateHtmlSummary() {
  try {
    const files = fs.readdirSync(screenshotsDir).filter(file => file.endsWith('.png'));
    
    if (files.length === 0) {
      console.log('❌ No screenshots found.');
      return;
    }
    
    // Create HTML content
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>GreenGhost Tech Website Screenshots</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #10b981; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .screenshot { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .screenshot img { width: 100%; height: auto; display: block; }
        .screenshot h3 { margin: 10px; text-transform: capitalize; font-size: 16px; color: #333; }
        .download-all { 
          display: inline-block; 
          margin-top: 20px; 
          margin-bottom: 20px;
          background-color: #10b981; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 4px; 
          text-decoration: none;
          font-weight: bold;
        }
        .note { background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>GreenGhost Tech Website Screenshots</h1>
      <div class="note">
        <p>Here are screenshots of all pages from your GreenGhost Tech website. Click on any screenshot to view it in full size. 
        You can also download all screenshots as a ZIP file using the button below.</p>
      </div>
      <a href="screenshots.zip" class="download-all">Download All Screenshots (ZIP)</a>
      <div class="screenshots">
    `;
    
    // Add each screenshot to the HTML
    files.forEach(file => {
      const pageName = path.basename(file, '.png').replace(/-/g, ' ');
      html += `
        <div class="screenshot">
          <a href="screenshots/${file}" target="_blank">
            <img src="screenshots/${file}" alt="${pageName}" />
          </a>
          <h3>${pageName}</h3>
        </div>
      `;
    });
    
    html += `
      </div>
    </body>
    </html>
    `;
    
    // Write the HTML file
    fs.writeFileSync('screenshot-gallery.html', html);
    console.log('📄 HTML gallery generated: screenshot-gallery.html');
    
  } catch (error) {
    console.error('❌ Error generating HTML gallery:', error);
  }
}

// Create a ZIP file with all screenshots
function createZipFile() {
  return new Promise((resolve, reject) => {
    console.log('📦 Creating ZIP file of all screenshots...');
    exec('zip -r screenshots.zip screenshots ai-review-content.txt', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error creating ZIP file:', error);
        reject(error);
        return;
      }
      console.log('✅ Screenshots ZIP file created successfully!');
      resolve();
    });
  });
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting GreenGhost Tech website capture...');
    
    // Step 1: Capture screenshots
    await captureScreenshots();
    
    // Step 2: Generate HTML summary
    generateHtmlSummary();
    
    // Step 3: Create ZIP file
    await createZipFile();
    
    console.log(`
📸 Website Capture Complete! 📸

Files created:
- screenshots/ directory with all page screenshots
- ai-review-content.txt with text content for AI tools
- screenshot-gallery.html to browse all screenshots
- screenshots.zip with everything packaged for download

To download:
1. Click on "screenshots.zip" in the file browser
2. Use the download button in the preview panel
    `);
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

// Start the process
main();