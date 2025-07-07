const { chromium } = require('playwright');

class SelfHealingTest {
  constructor() {
    this.selectors = {
      tier1: (id) => `#${id}`,
      tier2: (className) => `.${className}`,
      tier3: (name) => `[name="${name}"]`,
      tier4: (text) => `text=${text}`,
      tier5: (xpath) => `xpath=${xpath}`,
      tier6: async (page, description) => {
        // AI fallback - simplified pattern matching
        const elements = await page.$$('*');
        for (const el of elements) {
          const text = await el.textContent();
          if (text && text.includes(description)) return el;
        }
        return null;
      }
    };
  }

  async findElement(page, selectors) {
    for (const [tier, selector] of Object.entries(selectors)) {
      try {
        if (tier === 'tier6') {
          const element = await this.selectors.tier6(page, selector);
          if (element) return element;
        } else {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) return element;
        }
      } catch (e) {
        continue;
      }
    }
    throw new Error('Element not found with any selector strategy');
  }

  async healAndRetry(page, action, selectors, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const element = await this.findElement(page, selectors);
        await action(element);
        return { success: true, healingLevel: Object.keys(selectors)[i] };
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await page.waitForTimeout(1000);
      }
    }
  }
}

module.exports = SelfHealingTest;