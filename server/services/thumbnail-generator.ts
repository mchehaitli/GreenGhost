import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { log } from '../vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure thumbnails directory exists
const thumbnailsDir = path.join(__dirname, '../../public/thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configuration for Puppeteer in Replit environment
const CHROME_PATH = '/usr/bin/chromium-browser';
const PUPPETEER_LAUNCH_TIMEOUT = 30000; // 30 seconds timeout

export async function generateThumbnail(htmlContent: string, templateId: number): Promise<string> {
  let browser;
  const startTime = Date.now();

  try {
    log('Launching browser for thumbnail generation...');
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu',
        '--headless=new',
      ],
      defaultViewport: { width: 600, height: 400 },
      timeout: PUPPETEER_LAUNCH_TIMEOUT,
    });

    log(`Browser launched successfully in ${Date.now() - startTime}ms`);
    const page = await browser.newPage();

    // Apply some basic styling to ensure proper rendering
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            .container {
              width: 600px;
              height: 400px;
              padding: 20px;
              box-sizing: border-box;
              overflow: hidden;
              font-family: Arial, sans-serif;
              background-color: white;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    await page.setContent(styledHtml, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 10000,
    });

    // Generate a unique filename
    const filename = `template-${templateId}-${Date.now()}.png`;
    const filepath = path.join(thumbnailsDir, filename);

    log('Taking screenshot...');
    // Take screenshot
    await page.screenshot({
      path: filepath,
      type: 'png',
      clip: { x: 0, y: 0, width: 600, height: 400 },
      omitBackground: true,
    });

    log(`Thumbnail generated successfully in ${Date.now() - startTime}ms:`, filename);
    // Return the public URL for the thumbnail
    return `/thumbnails/${filename}`;
  } catch (error) {
    log('Error generating thumbnail:', error instanceof Error ? error.message : 'Unknown error');
    log('Error details:', error);
    // Return a default thumbnail URL or throw the error depending on requirements
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        log('Browser closed successfully');
      } catch (error) {
        log('Error closing browser:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}