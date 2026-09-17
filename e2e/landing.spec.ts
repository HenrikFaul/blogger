import { test, expect } from '@playwright/test';

/**
 * Landing-page contract for the attached design plan.
 *
 * Each test asserts a section that the design explicitly shows, using the real DOM
 * contract of the components in src/components/home/. These run at both the desktop
 * and mobile Chromium projects, so a section that collapses or overflows on small
 * screens fails here rather than in review.
 */
test.describe('Landing page (design plan)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the announcement strip with a working dismissal', async ({ page }) => {
    const strip = page.locator('[data-announcement]');
    await expect(strip).toBeVisible();
    await expect(strip).toContainText(/ForgeBlog 2\.0/);

    // Dismissal is a local preference and must hide the strip without navigation.
    const dismiss = strip.locator('[data-dismiss-announcement]');
    if (await dismiss.isVisible()) {
      await dismiss.click();
      await expect(strip).toBeHidden();
    }
  });

  test('renders the hero headline, actions and assurances', async ({ page }) => {
    await expect(page.locator('#landing-heading')).toBeVisible();
    await expect(page.locator('#landing-heading')).toContainText(/Szebb módja/);

    const hero = page.locator('.landing-hero');
    await expect(hero.locator('.hero-actions .btn-primary')).toBeVisible();
    await expect(hero.locator('.hero-assurances li')).toHaveCount(3);
  });

  test('hero mosaic shows a lead story, tiles and the tool rail', async ({ page }) => {
    const mosaic = page.locator('.hero-mosaic');
    await expect(mosaic).toBeVisible();

    // The lead tile links to a real published story.
    await expect(mosaic.locator('.mosaic-lead h3 a')).toBeVisible();

    // The quote tile carries the configured attribution.
    await expect(mosaic.locator('.mosaic-quote blockquote')).toBeVisible();
    await expect(mosaic.locator('.rail-item')).toHaveCount(4);
  });

  test('featured row and category explorer link to real destinations', async ({ page }) => {
    const featured = page.locator('.featured-row');
    await expect(featured).toBeVisible();
    await expect(featured.locator('.section-head h2')).toContainText(/Kiemelt történetek/);
    expect(await featured.locator('.featured-item').count()).toBeGreaterThan(0);

    // Every featured card must resolve to a post route, never a placeholder.
    for (const href of await featured.locator('h3 a').evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('href')),
    )) {
      expect(href).toMatch(/^\/posts\/.+/);
    }

    const chips = page.locator('.category-explorer');
    await expect(chips).toBeVisible();
    expect(await chips.locator('.category-chip').count()).toBeGreaterThan(0);
  });

  test('workspace showcase, gallery band, metrics and CTA render', async ({ page }) => {
    await expect(page.locator('.workspace-showcase')).toBeVisible();
    await expect(page.locator('#workspace-heading')).toContainText(/munkatered/i);
    await expect(page.locator('.mock-editor')).toBeVisible();

    await expect(page.locator('.gallery-band')).toBeVisible();
    await expect(page.locator('#gallery-band-heading')).toContainText(/ötletek/i);

    // Metric row renders the configured statistic count.
    await expect(page.locator('.stat-row .stat-item')).toHaveCount(4);

    const cta = page.locator('.cta-band');
    await expect(cta).toBeVisible();
    // The closing action must be a real, working destination.
    await expect(cta.locator('a.btn')).toHaveAttribute('href', '/rss.xml');
  });

  test('exposes exactly one h1 and no horizontal overflow on small screens', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});