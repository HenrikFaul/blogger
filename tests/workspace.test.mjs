import { test } from "node:test";
import assert from "node:assert/strict";
import { draft, asset, MemoryStorage } from "./helpers.mjs";
import {
  STORAGE_KEY,
  newDraft,
  assertDocument,
  assertDraft,
  assertAsset,
  publishErrors,
  snapshot,
  restoredDraft,
  documentAssets,
  LAYOUTS,
  embedUrl,
} from "../src/lib/creator/model.ts";
import {
  emptyWorkspace,
  readWorkspace,
  parseWorkspace,
  persistWorkspace,
  legacyDrafts,
} from "../src/lib/creator/storage.ts";
test("New drafts have immutable independent IDs even with identical titles", () => {
  const a = newDraft("nora", "alkotas", "Same"),
    b = newDraft("nora", "alkotas", "Same");
  assert.notEqual(a.id, b.id);
  assert.equal(a.slug, b.slug);
  assertDraft(a);
});
test("Valid authored document can pass publication checks", () =>
  assert.deepEqual(publishErrors(draft()), []));
test("Local draft status cannot impersonate published", () =>
  assert.throws(() => assertDraft({ ...draft(), status: "published" })));
test("All ten gallery layouts validate through one canonical enum", () => {
  assert.equal(LAYOUTS.length, 10);
  for (const layout of LAYOUTS)
    assertDocument({
      type: "doc",
      content: [{ type: "galleryBlock", attrs: { layout, images: [asset()] } }],
    });
});
for (const node of [
  { type: "script", text: "alert(1)" },
  { type: "heading", attrs: { level: 1 } },
  { type: "image", attrs: { src: "javascript:alert(1)" } },
  {
    type: "text",
    text: "link",
    marks: [{ type: "link", attrs: { href: "data:text/html,hello" } }],
  },
  { type: "galleryBlock", attrs: { layout: "random", images: [] } },
  { type: "image", attrs: { src: "/media/uploads/untracked.jpg" } },
  { type: "embedBlock", attrs: { url: "https://evil.test/video" } },
])
  test("Imported document guard rejects " + JSON.stringify(node), () =>
    assert.throws(() => assertDocument({ type: "doc", content: [node] })),
  );
test("Document traversal has size and depth limits", () => {
  let node = { type: "paragraph" };
  for (let i = 0; i < 33; i++) node = { type: "blockquote", content: [node] };
  assert.throws(() => assertDocument({ type: "doc", content: [node] }));
  assert.throws(() =>
    assertDocument({
      type: "doc",
      content: Array.from({ length: 25001 }, () => ({ type: "paragraph" })),
    }),
  );
});
test("Media metadata limits and unsafe src are enforced", () => {
  assertAsset(asset());
  assert.throws(() => assertAsset(asset({ width: 17000 })));
  assert.throws(() => assertAsset(asset({ src: "data:image/svg+xml,x" })));
  assert.throws(() => assertAsset(asset({ size: 11000000 })));
});
test("Publication check catches missing alt, duplicate slug and comparison count", () => {
  const d = draft();
  d.heroImage = asset({ alt: "" });
  d.document.content.push({
    type: "galleryBlock",
    attrs: { layout: "comparison", images: [asset()] },
  });
  const errors = publishErrors(d, [d.slug]);
  assert.ok(errors.some((e) => e.includes("alternatív")));
  assert.ok(errors.some((e) => e.includes("URL")));
  assert.ok(errors.some((e) => e.includes("két kép")));
});
test("Asset collection deduplicates hero + inline + gallery by immutable asset ID", () => {
  const d = draft(),
    a = asset();
  d.heroImage = a;
  d.document.content.push(
    { type: "image", attrs: { src: a.src, asset: a, alt: a.alt } },
    { type: "galleryBlock", attrs: { layout: "masonry", images: [a] } },
  );
  assert.equal(documentAssets(d).length, 1);
});
test("Video providers allowlisted; credentials, custom ports and lookalike hosts fail", () => {
  assert.equal(
    embedUrl("https://youtu.be/dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    embedUrl("https://vimeo.com/123456789"),
    "https://player.vimeo.com/video/123456789",
  );
  for (const u of [
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "javascript:x",
    "https://a:b@youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com:444/watch?v=dQw4w9WgXcQ",
  ])
    assert.equal(embedUrl(u), null);
});
test("Snapshot restore is a new independent draft, never an overwrite", () => {
  let d = draft();
  d.git = { head: "x", branch: "b", path: "p", url: "https://github.com/a/b" };
  d = snapshot(d);
  d.title = "changed";
  const copy = restoredDraft(d.history[0]);
  assert.notEqual(copy.id, d.id);
  assert.notEqual(copy.title, d.title);
  assert.equal(copy.git, undefined);
  assert.equal(copy.status, "draft");
  assert.equal(d.history[0].draft.title, "Egy jól működő történet");
  assertDraft(copy);
});
test("Snapshots bounded to 20 and a safe serialized document size", () => {
  let d = draft();
  for (let i = 0; i < 30; i++) d = snapshot(d);
  assert.equal(d.history.length, 20);
  d.document = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "a".repeat(140000) }],
      },
    ],
  };
  for (let i = 0; i < 30; i++) d = snapshot(d);
  assert.ok(JSON.stringify(d).length < 2000000);
  assertDraft(d);
});
test("Storage save is CAS, increments once and reloads exactly one draft", () => {
  const s = new MemoryStorage(),
    w = emptyWorkspace();
  w.drafts = [draft()];
  const a = persistWorkspace(s, w, 0, "a");
  assert.equal(a.revision, 1);
  const b = persistWorkspace(
    s,
    { ...a, drafts: [{ ...a.drafts[0], title: "Updated" }] },
    1,
    "a",
  );
  assert.equal(b.revision, 2);
  assert.equal(s.writes, 2);
  assert.equal(readWorkspace(s).drafts.length, 1);
  assert.equal(readWorkspace(s).drafts[0].title, "Updated");
});
test("Stale tab cannot overwrite a newer stored revision", () => {
  const s = new MemoryStorage();
  persistWorkspace(s, emptyWorkspace(), 0, "other");
  const prior = s.getItem(STORAGE_KEY);
  assert.throws(
    () => persistWorkspace(s, emptyWorkspace(), 0, "stale"),
    /CONFLICT/,
  );
  assert.equal(s.getItem(STORAGE_KEY), prior);
});
test("Invalid runtime/imported state never replaces good storage", () => {
  const s = new MemoryStorage(),
    w = persistWorkspace(s, emptyWorkspace(), 0, "a"),
    prior = s.getItem(STORAGE_KEY);
  assert.throws(() =>
    persistWorkspace(
      s,
      { ...w, drafts: [{ ...draft(), status: "published" }] },
      1,
      "a",
    ),
  );
  assert.equal(s.getItem(STORAGE_KEY), prior);
});
test("Quota failure preserves previous bytes and unpersisted working document", () => {
  const s = new MemoryStorage();
  const original = s.setItem.bind(s);
  const w = persistWorkspace(s, emptyWorkspace(), 0, "a"),
    prior = s.getItem(STORAGE_KEY);
  s.setItem = () => {
    throw new Error("QuotaExceededError");
  };
  const next = { ...w, drafts: [draft()] };
  assert.throws(() => persistWorkspace(s, next, 1, "a"), /Quota/);
  assert.equal(s.getItem(STORAGE_KEY), prior);
  assert.equal(next.drafts.length, 1);
  s.setItem = original;
});
test("Corrupt storage fails closed without deleting or replacing the raw backup", () => {
  const s = new MemoryStorage();
  s.setItem(STORAGE_KEY, '{"broken');
  assert.throws(() => readWorkspace(s));
  assert.throws(() => persistWorkspace(s, emptyWorkspace(), 0, "a"));
  assert.equal(s.getItem(STORAGE_KEY), '{"broken');
});
test("Duplicate imported IDs, unexpected versions and oversize input rejected", () => {
  const d = draft();
  assert.throws(() =>
    parseWorkspace(JSON.stringify({ ...emptyWorkspace(), drafts: [d, d] })),
  );
  assert.throws(() =>
    parseWorkspace(JSON.stringify({ ...emptyWorkspace(), version: 999 })),
  );
  assert.throws(() => parseWorkspace(" ".repeat(8000001)));
});
test("Legacy import is nondestructive and produces new IDs", () => {
  const s = new MemoryStorage();
  s.setItem(
    "forge-local-drafts",
    JSON.stringify([{ title: "Régi", content: "<p>Szöveg</p>" }]),
  );
  const before = s.getItem("forge-local-drafts"),
    a = legacyDrafts(s, "nora", "alkotas");
  assert.equal(a[0].html, "<p>Szöveg</p>");
  assert.equal(a[0].draft.title, "Régi");
  assert.equal(s.getItem("forge-local-drafts"), before);
});
