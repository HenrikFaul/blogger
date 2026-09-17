import { test, expect } from '@playwright/test';

/**
 * Re-pointed at the real public DOM. The hero call-to-action and the story lead are
 * genuine, always-visible elements of the landing page, so the journeys work at both
 * desktop and mobile viewports without depending on a hidden desktop nav.
 */
test.describe('Public Visitor Journeys', () => {
  test('Homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Navigation works', async ({ page }) => {
    await page.goto('/');

    // The hero call-to-action links to the stories index.
    await page.locator('.landing-hero .hero-actions .btn-primary').first().click();
    await expect(page).toHaveURL(/.*\/posts/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Creator Workspace is accessible (mock)', async ({ page }) => {
    await page.goto('/creator/');

    // The single creator entry point renders its dashboard heading.
    await expect(page.locator('.workspace-heading h1')).toBeVisible();
  });
});
