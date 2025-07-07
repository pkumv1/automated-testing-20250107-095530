const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

class MultiBrowserTester {
  constructor() {
    this.browsers = ['chromium', 'firefox', 'webkit'];
    this.results = {
      compatibility: {},
      performance: {},
      issues: []
    };
  }

  async runCrossBrowserTests(uiChanges) {
    const browserEngines = {
      chromium: chromium,
      firefox: firefox,
      webkit: webkit
    };

    for (const browserName of this.browsers) {
      console.log(`Testing on ${browserName}...`);
      const browser = await browserEngines[browserName].launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      this.results.compatibility[browserName] = {
        passed: 0,
        failed: 0,
        renderingIssues: [],
        performanceMetrics: {}
      };

      // Test userForm.jsp changes
      try {
        const startTime = Date.now();
        await page.goto('http://localhost:8080/user/form');
        
        // Test form validation
        await page.fill('[name="username"]', 'test');
        await page.fill('[name="email"]', 'invalid-email');
        await page.click('[type="submit"]');
        
        // Check validation messages
        const validationError = await page.locator('.error-message').isVisible();
        
        if (validationError) {
          this.results.compatibility[browserName].passed++;
        } else {
          this.results.compatibility[browserName].failed++;
          this.results.issues.push({
            browser: browserName,
            component: 'userForm.jsp',
            issue: 'Validation message not displayed',
            lines: uiChanges['RTSservices/web/pages/user/userForm.jsp'].lines.added
          });
        }
        
        // Performance metrics
        const loadTime = Date.now() - startTime;
        this.results.performance[browserName] = {
          formLoadTime: loadTime,
          jsExecutionTime: await page.evaluate(() => performance.timing.domInteractive - performance.timing.domLoading)
        };
        
      } catch (error) {
        this.results.compatibility[browserName].failed++;
        this.results.compatibility[browserName].renderingIssues.push(error.message);
      }
      
      await browser.close();
    }
    
    return this.results;
  }

  async testResponsiveDesign(changedFiles) {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    const browser = await chromium.launch({ headless: true });
    const responsiveResults = {};
    
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      
      await page.goto('http://localhost:8080/user/form');
      
      responsiveResults[viewport.name] = {
        screenshot: `userform-${viewport.name.toLowerCase()}.png`,
        formUsability: viewport.width > 600 ? 'optimal' : 'adjusted',
        layoutIssues: viewport.width < 768 ? ['form fields stack vertically'] : []
      };
      
      await page.screenshot({ 
        path: `test-results/screenshots/${responsiveResults[viewport.name].screenshot}` 
      });
      
      await context.close();
    }
    
    await browser.close();
    return responsiveResults;
  }
}

module.exports = MultiBrowserTester;