import { test, expect } from '@playwright/test';

/**
 * These journeys were originally written against selectors from an imagined Tailwind
 * build (`article.group`, `button.md:hidden`, English placeholders) that this Astro
 * codebase never had, so they could never pass. Re-pointed at the real public DOM.
 */
test.describe('Public Visitor Journeys', () => {
  test('E2E-PUB-001: Read a long-form article', async ({ page }) => {
    // 1. Start from homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/ForgeBlog/);

    // 2. Follow the lead story link in the hero mosaic.
    const firstStory = page.locator('.mosaic-lead h3 a').first();
    await expect(firstStory).toBeVisible();
    await firstStory.click();

    // 3. Verify article structure
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('.article-prose')).toBeVisible();

    // 4. Verify no draft/review UI is visible to public
    await expect(page.locator('.creator-toolbar')).toHaveCount(0);
  });

  test('E2E-PUB-002: Navigate mobile site', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // The mobile menu disclosure must be reachable and must actually open the menu.
    const menuButton = page.locator('[data-toggle-menu]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.locator('#mobile-navigation')).toBeVisible();
  });

  test('E2E-PUB-003: Use search', async ({ page }) => {
    await page.goto('/');

    // The header exposes a search trigger that opens the real search dialog.
    await page.locator('[data-open-search]').click();
    const searchInput = page.locator('#site-search input').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('tervez');
  });
});
