import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Generate HTML summary page
function generateHtmlSummary() {
  try {
    const files = fs.readdirSync(screenshotsDir).filter(file => file.endsWith('.png'));
    
    if (files.length === 0) {
      console.log('No screenshots found. Run screenshot.js first.');
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
    console.log('HTML summary generated: screenshot-gallery.html');
    
  } catch (error) {
    console.error('Error generating HTML summary:', error);
  }
}

// Create a ZIP file with all screenshots
function createZipFile() {
  return new Promise((resolve, reject) => {
    console.log('Creating ZIP file of all screenshots...');
    exec('zip -r screenshots.zip screenshots', (error, stdout, stderr) => {
      if (error) {
        console.error('Error creating ZIP file:', error);
        reject(error);
        return;
      }
      console.log('Screenshots ZIP file created successfully!');
      resolve();
    });
  });
}

// Main function
async function packageScreenshots() {
  try {
    // Generate HTML summary
    generateHtmlSummary();
    
    // Create ZIP file
    await createZipFile();
    
    console.log('\nAll done! You can now:');
    console.log('1. Open screenshot-gallery.html to view all screenshots');
    console.log('2. Download screenshots.zip for all screenshots in a single file');
    console.log('3. Access individual screenshots in the screenshots/ directory');
    
  } catch (error) {
    console.error('Error packaging screenshots:', error);
  }
}

packageScreenshots();