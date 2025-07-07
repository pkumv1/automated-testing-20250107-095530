const SelfHealingTest = require('./self-healing-base');
const SelfHealingAPI = require('./self-healing-api');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class ChangeAwareTestExecutor {
  constructor() {
    this.selfHealingUI = new SelfHealingTest();
    this.selfHealingAPI = new SelfHealingAPI();
    this.results = {
      ui: [],
      api: [],
      healing: {
        attempted: 0,
        successful: 0,
        strategies: {}
      }
    };
  }

  async executeUITests(tests, changeDetails) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    for (const test of tests) {
      const result = {
        testName: test.name,
        targetFile: test.file,
        linesCovered: test.linesCovered,
        status: 'pending'
      };
      
      try {
        await page.goto(`http://localhost:8080${test.url}`);
        
        // Test form elements with self-healing
        for (const element of test.elements) {
          const selectors = {
            tier1: `#${element.id}`,
            tier2: `[name="${element.id}"]`,
            tier3: `.form-control[placeholder*="${element.id}"]`,
            tier4: `text=${element.id}`,
            tier5: `//input[contains(@id, "${element.id}")]`
          };
          
          const healResult = await this.selfHealingUI.healAndRetry(
            page,
            async (el) => {
              if (element.action === 'click') {
                await el.click();
              } else {
                await el.fill('test-value');
              }
            },
            selectors
          );
          
          if (healResult.healingLevel !== 'tier1') {
            this.results.healing.attempted++;
            if (healResult.success) this.results.healing.successful++;
          }
        }
        
        result.status = 'passed';
      } catch (error) {
        result.status = 'failed';
        result.error = error.message;
      }
      
      this.results.ui.push(result);
    }
    
    await browser.close();
  }

  async executeAPITests(tests, changeDetails) {
    for (const test of tests) {
      const result = {
        testName: test.name,
        endpoint: test.endpoint,
        targetFunction: test.targetFunction,
        linesCovered: test.linesCovered,
        status: 'pending'
      };
      
      try {
        const apiResult = await this.selfHealingAPI.testEndpoint(test, changeDetails);
        
        if (apiResult.healing) {
          this.results.healing.attempted++;
          if (apiResult.success) {
            this.results.healing.successful++;
            result.healedEndpoint = apiResult.healedEndpoint;
          }
        }
        
        result.status = apiResult.success ? 'passed' : 'failed';
        result.response = apiResult.response;
      } catch (error) {
        result.status = 'failed';
        result.error = error.message;
      }
      
      this.results.api.push(result);
    }
  }

  async generateHealingReport() {
    const healingRate = this.results.healing.attempted > 0 
      ? (this.results.healing.successful / this.results.healing.attempted * 100).toFixed(2)
      : 0;
      
    return {
      totalTests: this.results.ui.length + this.results.api.length,
      passedTests: [...this.results.ui, ...this.results.api].filter(t => t.status === 'passed').length,
      healingAttempts: this.results.healing.attempted,
      healingSuccesses: this.results.healing.successful,
      healingRate: `${healingRate}%`,
      strategies: this.results.healing.strategies
    };
  }
}

module.exports = ChangeAwareTestExecutor;