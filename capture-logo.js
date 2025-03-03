import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureLogo() {
  console.log('Launching browser to capture logo...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/nix/store/chromium-unwrapped/bin/chromium',
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();

    // Navigate to the home page
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });

    // Wait for the logo to be visible
    await page.waitForSelector('.flex.items-center.gap-2', { visible: true });

    // Get the logo element
    const logoElement = await page.$('.flex.items-center.gap-2');

    if (logoElement) {
      // Capture just the logo area
      const screenshotPath = path.join(__dirname, 'ghost-logo.jpg');
      await logoElement.screenshot({
        path: screenshotPath,
        type: 'jpeg',
        quality: 100
      });

      console.log(`Logo saved as: ${screenshotPath}`);
    } else {
      console.error('Could not find logo element');
    }

  } catch (error) {
    console.error('Error capturing logo:', error);
  } finally {
    await browser.close();
  }
}

captureLogo();