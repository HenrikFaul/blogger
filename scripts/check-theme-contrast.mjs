/** Token contrast regression check; this is not a complete WCAG visual audit. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, "src/styles/themes");
const pairs = [
  ["ink", "page"],
  ["ink", "surface"],
  ["muted", "page"],
  ["muted", "surface"],
  ["primary", "on-primary"],
];
function luminance(hex) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
const results = [];
for (const filename of fs
  .readdirSync(directory)
  .filter((n) => n.endsWith(".css"))
  .sort()) {
  const text = fs.readFileSync(path.join(directory, filename), "utf8");
  const blocks = [
    ...text.matchAll(/\[data-mode="(light|dark)"\]\s*\{([^}]+)\}/g),
  ];
  if (blocks.length !== 2)
    throw new Error(`${filename}: expected light and dark tokens.`);
  for (const [, mode, block] of blocks) {
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})(?=\s*;)/g)].map(
        (m) => [m[1], m[2]],
      ),
    );
    for (const [foreground, background] of pairs) {
      if (!tokens[foreground] || !tokens[background])
        throw new Error(
          `${filename}/${mode}: missing ${foreground}/${background}`,
        );
      const [low, high] = [
        luminance(tokens[foreground]),
        luminance(tokens[background]),
      ].sort((a, b) => a - b);
      const ratio = (high + 0.05) / (low + 0.05);
      results.push({
        theme: filename.replace(".css", ""),
        mode,
        foreground,
        background,
        ratio: Number(ratio.toFixed(4)),
        passed: ratio >= 4.5,
      });
    }
  }
}
const failed = results.filter((v) => !v.passed);
console.log(
  JSON.stringify(
    {
      scope:
        "Five base text/background token pairs, light and dark; not a full visual WCAG audit.",
      comparisons: results.length,
      passed: results.length - failed.length,
      failed: failed.length,
      results,
    },
    null,
    2,
  ),
);
if (failed.length) process.exitCode = 1;
