import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  { path: '/how-it-works', name: 'how-it-works' },
  { path: '/blog', name: 'blog' },
  { path: '/pricing', name: 'pricing' },
  { path: '/quote', name: 'quote' },
  { path: '/about', name: 'about' },
  { path: '/waitlist', name: 'waitlist' },
  { path: '/theme', name: 'theme-customization' },
  { path: '/ai-review', name: 'ai-review' },
  // Not including admin pages as they require login
];

async function captureScreenshots() {
  console.log('Launching browser to capture screenshots...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Start capturing each page
    for (const route of routes) {
      console.log(`Capturing ${route.name}...`);
      const url = `http://localhost:5000${route.path}`;
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      // Wait a moment for any animations to complete
      await page.waitForTimeout(1000);
      
      // Capture full page screenshot
      const screenshotPath = path.join(screenshotsDir, `${route.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true
      });
      
      console.log(`Saved screenshot: ${screenshotPath}`);
    }
    
    console.log('All screenshots captured successfully!');
    console.log(`Screenshots are saved in: ${screenshotsDir}`);
    console.log('To download, you can click on any screenshot in the file browser and download it from there.');
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();