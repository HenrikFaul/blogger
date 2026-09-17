import { test, expect } from '@playwright/test';

/**
 * Re-pointed at the real public DOM. The brand link and the hero-mosaic lead story are
 * visible at both viewports, and the appearance control flips the canonical `data-mode`
 * attribute used by every public view.
 */
test.describe('Public Reading Experience', () => {
  test('homepage loads and shows branding', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ForgeBlog/);
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('header .brand').first()).toBeVisible();
  });

  test('can navigate to a post', async ({ page }) => {
    await page.goto('/');

    const firstPostLink = page.locator('.mosaic-lead h3 a').first();
    await expect(firstPostLink).toBeVisible();
    await firstPostLink.click();

    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');

    const themeBtn = page.locator('[data-toggle-mode]').first();
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  });
});
