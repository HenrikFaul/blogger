import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const route of [
  "/",
  "/posts/",
  "/categories/",
  "/archive/",
  "/series/",
  "/about/",
  "/projects/",
  "/posts/a-part-ahol-nem-kell-sietni/",
]) {
  test(`Public route ${route} has readable content and no overflow`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = await page.goto(route);
    expect(r?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    expect(await page.locator("h1").count()).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
test("Search finds accent-insensitive results and excludes draft", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Keresés a történetek között" })
    .click();
  await page.locator("#global-search-input").fill("feny");
  await expect(page.locator(".search-result")).not.toHaveCount(0);
  const response = await page.request.get("/search.json");
  expect(await response.text()).not.toContain("hello-world");
  await page.keyboard.press("Escape");
  await expect(page.locator("#site-search")).not.toBeVisible();
});
test("Archive filters, clears and sorts real articles", async ({ page }) => {
  await page.goto("/posts/");
  await page
    .locator("[data-archive-query]")
    .fill("biztosan-nem-letezo-tortenet");
  await expect(page.locator("[data-archive-empty]")).toBeVisible();
  await page.getByRole("button", { name: "Szűrők törlése" }).click();
  await expect(page.locator("[data-archive-empty]")).toBeHidden();
  await page.locator("[data-archive-sort]").selectOption("title");
  const titles = await page
    .locator("[data-post-card]:visible")
    .evaluateAll((cards) =>
      cards.map((c) => (c as HTMLElement).dataset.title!),
    );
  expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, "hu")));
});
test("Reading and navigation remain available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/posts/a-part-ahol-nem-kell-sietni/");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator(".article-prose")).toBeVisible();
  await context.close();
});
test("Theme switch survives native page reload", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-toggle-mode]").click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
});
test("Public gallery opens and closes with keyboard", async ({ page }) => {
  await page.goto("/posts/a-feny-apro-tortenetei/");
  await page.locator("[data-gallery-open]").first().click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
for (const route of ["/", "/posts/", "/posts/a-part-ahol-nem-kell-sietni/"])
  test(`@a11y default theme ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
