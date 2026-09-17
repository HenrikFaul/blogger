import { test, expect } from '@playwright/test';

/**
 * Editorial homepage contract, matching the ForgeBlog Studio v2 design reference
 * (handoff/01-editorial-home.json): a serif hero ("A gondolatnak tér kell.") with an
 * abstract illustration, an author note, and a grid of real published posts.
 */
test.describe('Editorial homepage (folio.)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the serif hero with the editorial headline', async ({ page }) => {
    await expect(page.locator('#editorial-heading')).toBeVisible();
    await expect(page.locator('#editorial-heading')).toContainText(/A gondolatnak/);
    await expect(page.locator('#editorial-heading')).toContainText(/tér kell\./);

    // The hero carries the call-to-action and the author attribution.
    const hero = page.locator('.editorial-hero');
    await expect(hero.locator('.hero-actions .btn-primary')).toBeVisible();
    await expect(hero.locator('.editorial-author')).toContainText(/személyes folyóirata/);
  });

  test('renders the abstract hero illustration and post grid', async ({ page }) => {
    // Hero media is the abstract vector illustration, not a photograph.
    await expect(page.locator('.editorial-hero-media img')).toBeVisible();
    await expect(page.locator('.editorial-hero-media img')).toHaveAttribute(
      'src',
      /abstract\.svg/,
    );

    // The grid shows the latest published posts, each linking to a real route.
    const cards = page.locator('.editorial-posts .post-card');
    expect(await cards.count()).toBeGreaterThan(0);
    await expect(cards.first().locator('h3 a')).toBeVisible();
  });

  test('brands the page as folio.', async ({ page }) => {
    await expect(page).toHaveTitle(/folio\./);
    await expect(page.locator('header .brand').first()).toContainText(/folio\./);
  });

  test('exposes exactly one h1 and no horizontal overflow on small screens', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});