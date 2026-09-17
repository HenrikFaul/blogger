import { test, expect } from '@playwright/test';

/**
 * The original spec asserted on strings ("Jó újra látni!", "Új bejegyzés") this
 * workspace never rendered. Re-pointed at the real dashboard: its heading, the
 * "Új történet" action and the editor that opens from the new-story dialog.
 * Selectors match the proven contract in creator.spec.ts.
 */
test.describe('Creator Workspace', () => {
  test('can open creator workspace', async ({ page }) => {
    await page.goto('/creator/');

    // The workspace shell renders its dashboard heading.
    await expect(page.locator('.workspace-heading h1')).toBeVisible();

    // The primary create action is present.
    await expect(
      page.getByRole('button', { name: 'Új történet', exact: true }).first(),
    ).toBeVisible();
  });

  test('can open editor and see preview split screen', async ({ page }) => {
    await page.goto('/creator/');

    // Open the new-story dialog and start from a blank draft.
    await page
      .getByRole('button', { name: 'Új történet', exact: true })
      .first()
      .click();
    await page.getByRole('button', { name: /Üres lap/ }).click();

    // The editor surface must mount once a draft exists.
    await expect(page.locator('.tiptap').first()).toBeVisible();

    // The editor exposes a preview control for the split view.
    await expect(
      page.getByRole('button', { name: 'Előnézet', exact: true }).first(),
    ).toBeVisible();
  });
});
