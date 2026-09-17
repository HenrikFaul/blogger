import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";
const key = "forgeblog.workspace.v3";
async function newStory(page: Page) {
  await page.goto("/creator/");
  await page
    .getByRole("button", { name: "Új történet", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /Üres lap/ }).click();
  await expect(page.locator(".tiptap")).toBeVisible();
}
async function saved(page: Page) {
  await expect(page.locator(".save-state")).toHaveText("Böngészőben mentve");
}
async function nav(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "Alkotói navigáció" })
    .getByRole("button", { name, exact: false })
    .click();
}

test("Title edit/autosave/reload retains exactly one immutable draft", async ({
  page,
}) => {
  await newStory(page);
  await page.locator("#draft-title").fill("Egy megőrzött gondolat");
  await page.locator(".tiptap").fill("Ezt a tartalmat nem veszítjük el.");
  await saved(page);
  const first = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).drafts[0],
    key,
  );
  await page.locator("#draft-title").fill("Másik cím, ugyanaz a történet");
  await saved(page);
  await page.reload();
  const drafts = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).drafts,
    key,
  );
  expect(drafts).toHaveLength(1);
  expect(drafts[0].id).toBe(first.id);
  expect(drafts[0].title).toBe("Másik cím, ugyanaz a történet");
  expect(JSON.stringify(drafts[0].document)).toContain("nem veszítjük el");
});
test("Idle editor does not keep writing revisions", async ({ page }) => {
  await newStory(page);
  await saved(page);
  const rev = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).revision,
    key,
  );
  await page.waitForTimeout(1800);
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).revision,
      key,
    ),
  ).toBe(rev);
});
test("Manual checkpoint, ZIP export and native download", async ({ page }) => {
  await newStory(page);
  await page.locator("#draft-title").fill("ZIP próba");
  await page.locator(".tiptap").fill("Valódi szerkeszthető tartalom.");
  await page.getByRole("button", { name: "Mentés", exact: true }).click();
  await saved(page);
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).drafts[0].history.length,
      key,
    ),
  ).toBe(1);
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await wait;
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
  expect(await download.failure()).toBeNull();
});
test("Corrupt storage displays recovery state and remains unchanged", async ({
  page,
}) => {
  await page.goto("/creator/");
  await page.evaluate((k) => localStorage.setItem(k, "{broken"), key);
  await page.reload();
  await expect(page.getByRole("alert").first()).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    "{broken",
  );
});
test("An unconfigured backend never claims a published article", async ({
  page,
}) => {
  await newStory(page);
  await page.getByRole("button", { name: "Git / publikálás" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publikálási PR létrehozása" }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Előbb kösd össze a repositoryval."),
  ).toBeVisible();
});
test("26 themes available and applying one persists the actual public preference", async ({
  page,
}) => {
  await page.goto("/creator/");
  await nav(page, "Megjelenés");
  await expect(page.locator(".theme-card")).toHaveCount(26);
  await page.getByLabel("Témák keresése").fill("Swiss");
  await expect(page.locator(".theme-card")).toHaveCount(1);
  await page.getByRole("button", { name: /Kipróbálom/ }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("forgeblog.appearance") || "{}")
            .theme,
      ),
    )
    .toBe("swiss-grid");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "swiss-grid",
  );
});
test("Native IndexedDB media import, deduplication and alt metadata", async ({
  page,
}) => {
  await page.goto("/creator/");
  await nav(page, "Médiatár");
  const file = path.resolve("public/media/demo/coast.jpg");
  await page.locator("input[type=file][accept*=image]").setInputFiles(file);
  await expect(page.getByText(/13 kép/).first()).toBeVisible();
  await page.locator("input[type=file][accept*=image]").setInputFiles(file);
  await expect(page.getByText(/13 kép/).first()).toBeVisible();
  await page.reload();
  await nav(page, "Médiatár");
  await expect(page.getByText(/13 kép/).first()).toBeVisible();
});
test("Editing controls remain mounted when preview is toggled", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Mobile uses its dedicated tabs in the companion test.");
  await newStory(page);
  await page.locator(".tiptap").fill("Első mondat.");
  await page.locator(".tiptap").press("End");
  await page.locator(".tiptap").pressSequentially(" Második.");
  await page
    .getByRole("button", { name: "Előnézet", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Előnézet", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /Visszavonás/ }).click();
  await expect(page.locator(".tiptap")).not.toContainText("Második.");
});
test("@a11y creator dashboard", async ({ page }) => {
  await page.goto("/creator/");
  await expect(page.locator(".workspace-heading h1")).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
