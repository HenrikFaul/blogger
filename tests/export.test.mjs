import { test } from "node:test";
import assert from "node:assert/strict";
import { draft, asset } from "./helpers.mjs";
import {
  draftToMdx,
  serializeDocument,
} from "../src/lib/creator/serializer.ts";
import { createZip, crc32 } from "../src/lib/creator/zip.ts";
import { sniffImage } from "../src/lib/creator/media.ts";
test("MDX export defaults to draft and preserves Unicode frontmatter safely", () => {
  const d = draft();
  d.title = 'Ősz: "szép"\n---';
  const output = draftToMdx(d);
  assert.ok(output.includes('status: "draft"'));
  assert.ok(
    output.includes('title: "Ősz: \\"szép\\"\\n---"') ||
      output.includes(JSON.stringify(d.title)),
  );
  assert.ok(output.includes('author: "nora"'));
  assert.ok(!output.includes('status: "published"'));
});
test("User prose cannot inject executable MDX or imports", () => {
  const text = '</script> {process.env.SECRET} <iframe src="evil"/> &';
  const result = serializeDocument({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });
  assert.ok(!result.body.includes("</script>"));
  assert.ok(!result.body.includes("{process.env"));
  assert.ok(result.body.includes("&#123;"));
});
test("Code block fence expands around literal backticks", () => {
  const result = serializeDocument({
    type: "doc",
    content: [
      {
        type: "codeBlock",
        attrs: { language: 'js"<bad>' },
        content: [{ type: "text", text: '```\nconst x = "<div>";' }],
      },
    ],
  });
  assert.ok(result.body.startsWith("````jsbad"));
  assert.ok(result.body.includes('const x = "<div>";'));
});
test("Gallery export uses the canonical Astro gallery and JSON-safe props", () => {
  const d = draft();
  d.document.content.push({
    type: "galleryBlock",
    attrs: {
      layout: "filmstrip",
      images: [asset({ alt: '</script> "árvíz"' })],
      columns: 3,
      showCaptions: false,
    },
  });
  const mdx = draftToMdx(d);
  assert.ok(
    mdx.includes("import Gallery from '../../components/media/Gallery.astro'"),
  );
  assert.ok(mdx.includes('layout={"filmstrip"}'));
  assert.ok(mdx.includes('captions={"none"}'));
  assert.ok(!mdx.includes("</script>"));
});
test("Decorative image export never announces its stale alt", () => {
  const d = draft();
  d.heroImage = asset({ decorative: true, alt: "Should be silent" });
  assert.ok(draftToMdx(d).includes('"alt":""'));
});
test("Video exports trusted component, not a raw arbitrary iframe", () => {
  const d = draft();
  d.document.content.push({
    type: "embedBlock",
    attrs: { url: "https://youtu.be/dQw4w9WgXcQ", title: "Film" },
  });
  const output = draftToMdx(d);
  assert.ok(output.includes("import VideoEmbed"));
  assert.ok(!output.includes("<iframe"));
});
test("CRC32 implements the standard test vector", () =>
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926));
for (const bad of [
  "/absolute.txt",
  "../escape.txt",
  "a/../escape.txt",
  "a\\escape.txt",
  "a/./x",
])
  test("ZIP rejects unsafe path " + bad, () =>
    assert.throws(() => createZip([{ path: bad, data: "x" }])),
  );
test("ZIP refuses duplicate names", () => {
  for (const bad of [
    "C:/escape.txt",
    "C:escape.txt",
    "a//b.txt",
    "a/",
    "a\0b",
    "a\nb",
  ]) {
    assert.throws(() => createZip([{ path: bad, data: "x" }]));
  }
  assert.throws(() =>
    createZip([
      { path: "x", data: "a" },
      { path: "x", data: "b" },
    ]),
  );
});
test("ZIP contains standard signatures, UTF-8 flag and valid CRC data", () => {
  const zip = createZip([
    { path: "árvíz.txt", data: "Ősz 🌿" },
    { path: "images/pixel.bin", data: Uint8Array.of(0, 1, 255) },
  ]);
  const v = new DataView(zip.buffer);
  assert.equal(v.getUint32(0, true), 0x04034b50);
  assert.equal(v.getUint16(6, true), 0x800);
  assert.equal(v.getUint32(zip.length - 22, true), 0x06054b50);
  assert.equal(v.getUint16(zip.length - 12, true), 2);
  const len = v.getUint16(26, true);
  const content = zip.slice(30 + len, 30 + len + v.getUint32(18, true));
  assert.equal(crc32(content), v.getUint32(14, true));
});
test("Actual JPEG/PNG/WebP/GIF signatures accepted; SVG and fake image rejected", () => {
  assert.equal(sniffImage(Uint8Array.of(255, 216, 255, 224)).extension, "jpg");
  assert.equal(
    sniffImage(Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10)).extension,
    "png",
  );
  assert.equal(
    sniffImage(new TextEncoder().encode("GIF89a.....")).extension,
    "gif",
  );
  assert.equal(
    sniffImage(new TextEncoder().encode("RIFF0000WEBP")).extension,
    "webp",
  );
  for (const text of [
    '<svg onload="alert(1)"/>',
    "<html>not an image</html>",
    "",
  ])
    assert.equal(sniffImage(new TextEncoder().encode(text)), null);
});

test("ESM-looking user prose is escaped instead of becoming MDX code", () => {
  for (const text of [
    "import X from 'https://evil.test/module'",
    "export const stolen = process.env.SECRET",
  ]) {
    const result = serializeDocument({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    });
    assert.ok(!/^(import|export)\s/m.test(result.body));
    assert.ok(result.body.includes("&#"));
  }
});
