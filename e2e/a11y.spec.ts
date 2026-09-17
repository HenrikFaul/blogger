import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (a11y) checks', () => {
  const pagesToTest = [
    { name: 'Home Page', path: '/' },
    { name: 'Blog Index', path: '/posts/' },
    { name: 'Category Page', path: '/category/utazas/' },
    { name: 'About Page', path: '/about/' },
  ];

  for (const { name, path } of pagesToTest) {
    test(`Should not have any automatically detectable accessibility issues on ${name}`, async ({ page }) => {
      await page.goto(path);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
