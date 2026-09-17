import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import {
  safeUrl,
  safeImageUrl,
  slugify,
  normalizeSearch,
  escapeXml,
  jsonForHtml,
} from "../src/lib/safety.ts";
import {
  postSchema,
  imageSchema,
  authorSchema,
  categorySchema,
  seriesSchema,
} from "../src/lib/content-schemas.ts";
import { InstanceConfigSchema } from "../src/config/schema.ts";
import { resolveSiteEnvironment } from "../src/config/site-runtime.mjs";
import {
  isPublic,
  readingMinutes,
  getSlug,
  validateReferences,
} from "../src/lib/public-content.ts";
import { themeRegistry } from "../src/themes/registry.ts";
const yaml = createRequire(import.meta.url)("js-yaml");
const valid = {
  title: "Érvényes tesztcikk",
  excerpt: "Ez a kivonat megfelel a tartalomsémának.",
  author: "nora",
  categories: ["alkotas"],
  status: "published",
  publishedAt: "2026-09-01",
};
for (const url of [
  "javascript:alert(1)",
  "data:text/html,<script>x</script>",
  "//evil.test",
  "/\\evil.test",
  "/%2f%2fevil.test",
  "https://user:password@example.test",
  "https://a.test/\nb",
  "file:///etc/passwd",
])
  test("URL allowlist rejects " + JSON.stringify(url), () =>
    assert.equal(safeUrl(url), undefined),
  );
test("Safe local / HTTP(S) / anchor links and normalized URLs", () => {
  assert.equal(safeUrl("/posts/hello/"), "/posts/hello/");
  assert.equal(safeUrl("https://magazine.test"), "https://magazine.test/");
  assert.equal(safeUrl("#chapter-2"), "#chapter-2");
  assert.equal(safeImageUrl("#chapter-2"), undefined);
  assert.equal(safeImageUrl("blob:https://site.test/1"), undefined);
});
test("Hungarian slug/search normalization, bounded URL length", () => {
  assert.equal(slugify("Árvíztűrő TÜKÖRFÚRÓ gép!"), "arvizturo-tukorfuro-gep");
  assert.equal(normalizeSearch(" FÉNY "), "feny");
  assert.ok(slugify("abc ".repeat(80)).length <= 100);
});
test("XML and script-context JSON are escaped", () => {
  assert.equal(escapeXml('<b a="x">&'), "&lt;b a=&quot;x&quot;&gt;&amp;");
  assert.ok(
    !jsonForHtml({ x: "</script><script>alert(1)</script>&" }).includes("<"),
  );
  assert.equal(JSON.parse(jsonForHtml({ x: "</script>" })).x, "</script>");
});
test("Valid publication coerces date; draft remains default", () => {
  assert.ok(postSchema.parse(valid).publishedAt instanceof Date);
  assert.equal(
    postSchema.parse({ ...valid, status: undefined }).status,
    "draft",
  );
});
for (const [name, change] of [
  ["missing date", { publishedAt: undefined }],
  ["unsafe slug", { slug: "../../private" }],
  ["blank title", { title: " " }],
  ["short excerpt", { excerpt: "x" }],
  ["unknown theme", { themeOverride: "no-theme" }],
  ["empty categories", { categories: [] }],
  ["invalid date", { publishedAt: "no date" }],
])
  test("Publication schema rejects " + name, () =>
    assert.equal(postSchema.safeParse({ ...valid, ...change }).success, false),
  );
test("Images need meaningful alt or explicit decoration", () => {
  assert.equal(
    imageSchema.safeParse({ src: "/x.jpg", alt: "" }).success,
    false,
  );
  assert.equal(
    imageSchema.safeParse({ src: "/x.jpg", alt: "", decorative: true }).success,
    true,
  );
  assert.equal(
    imageSchema.safeParse({ src: "javascript:alert(1)", alt: "Alt" }).success,
    false,
  );
});
test("Draft/review/future/invalid content never becomes public", () => {
  for (const status of ["draft", "review", "archived"])
    assert.equal(isPublic({ ...valid, status }), false);
  assert.equal(isPublic({ ...valid, publishedAt: "2099-01-01" }), false);
  assert.equal(isPublic({ ...valid, publishedAt: "x" }), false);
  assert.equal(isPublic(valid, new Date("2026-09-17")), true);
});
test("Public IDs and reading time are deterministic", () => {
  assert.equal(getSlug({ id: "hello.mdx", data: {} }), "hello");
  assert.equal(readingMinutes("word ".repeat(211)), 2);
  assert.equal(readingMinutes(""), 1);
});
test("Duplicate slug and broken author/category/series/related refs fail", () => {
  const a = {
    id: "a",
    data: {
      slug: "same",
      author: "missing",
      categories: ["missing"],
      series: "missing",
      relatedPosts: ["missing"],
    },
  };
  const errors = validateReferences([a, { ...a, id: "b" }], [], [], []);
  for (const term of ["Duplicate", "author", "category", "series", "related"])
    assert.ok(errors.some((e) => e.includes(term)));
});
test("Central config validates current site, rejects fake feature and locale claims", () => {
  const config = JSON.parse(
    fs.readFileSync(new URL("../src/config/site.json", import.meta.url)),
  );
  assert.equal(InstanceConfigSchema.safeParse(config).success, true);
  assert.equal(
    InstanceConfigSchema.safeParse({ ...config, language: "en" }).success,
    false,
  );
  assert.equal(
    InstanceConfigSchema.safeParse({
      ...config,
      features: { ...config.features, commentsEnabled: true },
    }).success,
    false,
  );
});
test("Canonical domain / preview noindex / production missing domain guards", () => {
  assert.equal(resolveSiteEnvironment({ siteUrl: "" }, {}).noindex, true);
  assert.equal(
    resolveSiteEnvironment(
      { siteUrl: "https://magazine.test" },
      { VERCEL_ENV: "preview" },
    ).noindex,
    true,
  );
  assert.equal(
    resolveSiteEnvironment({ siteUrl: "https://magazine.test" }, {}).noindex,
    false,
  );
  assert.throws(() =>
    resolveSiteEnvironment({ siteUrl: "" }, { VERCEL_ENV: "production" }),
  );
  for (const siteUrl of [
    "https://example.com",
    "http://public.test",
    "https://public.test/path",
    "https://u:p@public.test",
  ])
    assert.throws(() => resolveSiteEnvironment({ siteUrl }, {}));
});
test("Every included content file validates against the actual shared schema", () => {
  for (const [collection, schema] of [
    ["posts", postSchema],
    ["authors", authorSchema],
    ["categories", categorySchema],
    ["series", seriesSchema],
  ]) {
    const dir = new URL("../src/content/" + collection + "/", import.meta.url);
    for (const filename of fs.readdirSync(dir)) {
      const raw = fs.readFileSync(new URL(filename, dir), "utf8");
      const value = filename.endsWith(".json")
        ? JSON.parse(raw)
        : yaml.load(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || "");
      assert.equal(
        schema.safeParse(value).success,
        true,
        `${collection}/${filename}: ${schema.safeParse(value).error}`,
      );
    }
  }
});
test("26 distinct theme definitions, six families, real light/dark token sheets", () => {
  assert.equal(themeRegistry.length, 26);
  assert.equal(new Set(themeRegistry.map((t) => t.key)).size, 26);
  assert.equal(new Set(themeRegistry.map((t) => t.layoutVariant)).size, 6);
  for (const theme of themeRegistry) {
    const css = fs.readFileSync(
      new URL("../src/styles/themes/" + theme.key + ".css", import.meta.url),
      "utf8",
    );
    assert.ok(css.includes('[data-mode="light"]'));
    assert.ok(css.includes('[data-mode="dark"]'));
    assert.ok(css.includes("--primary"));
    assert.equal(theme.supportsDarkMode, true);
  }
});
