import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureLogo() {
  console.log('Launching browser to capture logo...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();

    // Navigate to the home page
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });

    // Wait for the ghost icon to be visible
    await page.waitForSelector('svg.ghost-icon', { visible: true });

    // Get the ghost icon element
    const logoElement = await page.$('svg.ghost-icon');

    if (logoElement) {
      // Capture just the logo area with high quality settings
      const screenshotPath = path.join(__dirname, 'ghost-logo.png');
      await logoElement.screenshot({
        path: screenshotPath,
        type: 'png',
        omitBackground: true // This will make the background transparent
      });

      console.log(`Logo saved as: ${screenshotPath}`);
      console.log('To download, you can click on ghost-logo.png in the file browser and download it from there.');
    } else {
      console.error('Could not find ghost icon');
    }

  } catch (error) {
    console.error('Error capturing logo:', error);
  } finally {
    await browser.close();
  }
}

captureLogo();