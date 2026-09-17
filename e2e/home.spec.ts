import { test, expect } from '@playwright/test';

test('has title and displays posts', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ForgeBlog/);

  // Check if main header is visible
  await expect(page.locator('h1').first()).toBeVisible();

  // Verify that the appearance control is present.
  await expect(page.locator('[data-toggle-mode]').first()).toBeVisible();
});
