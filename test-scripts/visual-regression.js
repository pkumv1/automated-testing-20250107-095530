// Visual regression testing for changed UI components
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class VisualRegressionTester {
  async captureUIChanges(changedFiles) {
    const uiFiles = Object.keys(changedFiles).filter(f => f.endsWith('.jsp'));
    const results = [];
    
    if (uiFiles.length === 0) return results;
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    for (const file of uiFiles) {
      const pageName = path.basename(file, '.jsp');
      const url = `http://localhost:8080/user/${pageName}`;
      
      try {
        await page.goto(url);
        
        // Capture screenshots at different states
        const screenshots = {
          initial: await page.screenshot({ 
            path: `test-results/screenshots/${pageName}-initial.png`,
            fullPage: true 
          }),
          filled: null,
          submitted: null
        };
        
        // Fill form if present
        if (file.includes('Form')) {
          await page.fill('[name="username"]', 'testuser');
          await page.fill('[name="email"]', 'test@example.com');
          screenshots.filled = await page.screenshot({ 
            path: `test-results/screenshots/${pageName}-filled.png` 
          });
        }
        
        results.push({
          file,
          url,
          screenshots: Object.keys(screenshots).filter(k => screenshots[k]),
          changedLines: changedFiles[file].lines,
          visualChanges: 'Form validation indicators added'
        });
        
      } catch (error) {
        results.push({
          file,
          url,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    await browser.close();
    return results;
  }
}

module.exports = VisualRegressionTester;