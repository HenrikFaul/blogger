import { safeUrl } from "../safety.js";
import {
  assertDraft,
  documentAssets,
  embedUrl,
  type Draft,
  type DocNode,
  type ImageAsset,
} from "./model.js";
// Escape Markdown before introducing HTML entities; otherwise numeric entities get broken.
// ESM-looking prose must not become executable MDX imports/exports at the start of a line.
const escapeText = (s: string) =>
  s
    .replace(/([\\`*_[\]#|])/g, "\\$1")
    .replace(/&/g, "&amp;")
    .replace(/[<>{}]/g, (c) => `&#${c.charCodeAt(0)};`)
    .replace(
      /^(\s*)(import|export)(?=\s)/gm,
      (_, space, word) => `${space}&#${word.charCodeAt(0)};${word.slice(1)}`,
    )
    .replace(/^(\s*)([+-])/gm, "$1\\$2")
    .replace(/^(\s*\d+)([.)])(?=\s)/gm, "$1\\$2");

const jsxJSON = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
export function imageData(a: ImageAsset) {
  return {
    src: a.src,
    alt: a.decorative ? "" : a.alt,
    decorative: a.decorative,
    caption: a.caption,
    credit: a.credit,
    width: a.width,
    height: a.height,
  };
}
export function serializeDocument(doc: DocNode): {
  body: string;
  gallery: boolean;
  embed: boolean;
} {
  let gallery = false,
    embed = false;
  function node(n: DocNode): string {
    const children = () => n.content?.map(node).join("") || "";
    switch (n.type) {
      case "text": {
        let text = escapeText(n.text || "");
        for (const m of n.marks || []) {
          if (m.type === "bold") text = `**${text}**`;
          else if (m.type === "italic") text = `*${text}*`;
          else if (m.type === "strike") text = `~~${text}~~`;
          else if (m.type === "underline") text = `<u>${text}</u>`;
          else if (m.type === "code")
            text = `<code>{${jsxJSON(n.text || "")}}</code>`;
          else if (m.type === "link") {
            const url = safeUrl(String(m.attrs?.href || ""));
            if (url)
              text = `[${text}](${url.replace(/[()\s]/g, (c) => encodeURIComponent(c))})`;
          }
        }
        return text;
      }
      case "doc":
        return children().trim() + "\n";
      case "paragraph":
        return children() + "\n\n";
      case "heading":
        return (
          "#".repeat(Math.min(4, Math.max(2, Number(n.attrs?.level) || 2))) +
          " " +
          children() +
          "\n\n"
        );
      case "hardBreak":
        return "  \n";
      case "horizontalRule":
        return "\n---\n\n";
      case "blockquote":
        return (
          children()
            .trim()
            .split("\n")
            .map((l) => "> " + l)
            .join("\n") + "\n\n"
        );
      case "bulletList":
      case "orderedList":
      case "taskList":
        return (
          (n.content || [])
            .map((item, i) => {
              const prefix =
                n.type === "orderedList"
                  ? `${Number(n.attrs?.start || 1) + i}. `
                  : n.type === "taskList"
                    ? `- [${item.attrs?.checked ? "x" : " "}] `
                    : "- ";
              return (
                prefix +
                node(item)
                  .trim()
                  .replace(/\n/g, "\n" + " ".repeat(prefix.length))
              );
            })
            .join("\n") + "\n\n"
        );
      case "listItem":
      case "taskItem":
        return children();
      case "codeBlock": {
        const text = n.content?.map((v) => v.text || "").join("") || "";
        const longest = Math.max(
          2,
          ...(text.match(/`+/g) || []).map((s) => s.length),
        );
        const fence = "`".repeat(longest + 1);
        return `${fence}${String(n.attrs?.language || "").replace(/[^a-z0-9-]/gi, "")}\n${text}\n${fence}\n\n`;
      }
      case "image": {
        const a = n.attrs || {};
        const img = {
          src: String(a.src || ""),
          alt: a.decorative ? "" : String(a.alt || ""),
          caption: String(a.caption || ""),
          credit: String(a.credit || ""),
          width: Number(a.width) || undefined,
          height: Number(a.height) || undefined,
        };
        return `<figure>\n<img src={${jsxJSON(img.src)}} alt={${jsxJSON(img.alt)}} width={${jsxJSON(img.width || null)}} height={${jsxJSON(img.height || null)}} loading="lazy" decoding="async" />${img.caption || img.credit ? `\n<figcaption>{${jsxJSON([img.caption, img.credit].filter(Boolean).join(" · "))}}</figcaption>` : ""}\n</figure>\n\n`;
      }
      case "galleryBlock": {
        gallery = true;
        const images = ((n.attrs?.images as ImageAsset[]) || []).map(imageData);
        return `<Gallery images={${jsxJSON(images)}} layout={${jsxJSON(n.attrs?.layout || "editorial-grid")}} columns={${Number(n.attrs?.columns) || 3}} captions={${jsxJSON(n.attrs?.showCaptions === false ? "none" : "below")}} />\n\n`;
      }
      case "embedBlock":
        embed = true;
        return `<VideoEmbed url={${jsxJSON(String(n.attrs?.url || ""))}} title={${jsxJSON(String(n.attrs?.title || "Videó"))}} />\n\n`;
      case "table":
        return `<div className="table-scroll"><table>\n${children()}</table></div>\n\n`;
      case "tableRow":
        return `<tr>${children()}</tr>\n`;
      case "tableCell":
      case "tableHeader": {
        const tag = n.type === "tableHeader" ? "th" : "td";
        return `<${tag}>${children().trim()}</${tag}>`;
      }
      default:
        return children();
    }
  }
  return { body: node(doc), gallery, embed };
}
export function draftToMdx(
  draft: Draft,
  status: "draft" | "review" | "published" = "draft",
): string {
  assertDraft(draft);
  const doc = serializeDocument(draft.document);
  const front = {
    title: draft.title || "Névtelen vázlat",
    slug: draft.slug || `vazlat-${draft.id.slice(0, 8)}`,
    excerpt:
      draft.excerpt || "Kidolgozás alatt álló, még nem nyilvános vázlat.",
    author: draft.author,
    categories: draft.categories.length ? draft.categories : ["alkotas"],
    tags: draft.tags,
    status,
    publishedAt: draft.publishedAt || new Date().toISOString(),
    updatedAt: draft.updatedAt,
    heroTreatment: draft.heroTreatment,
    ...(draft.heroImage ? { heroImage: imageData(draft.heroImage) } : {}),
    seo: {
      ...(draft.seo.title ? { title: draft.seo.title } : {}),
      ...(draft.seo.description ? { description: draft.seo.description } : {}),
      noindex: draft.seo.noindex,
    },
  };
  const yaml = Object.entries(front)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  return `---\n${yaml}\n---\n\n${doc.gallery ? "import Gallery from '../../components/media/Gallery.astro';\n" : ""}${doc.embed ? "import VideoEmbed from '../../components/media/VideoEmbed.astro';\n" : ""}\n${doc.body}`;
}
export { documentAssets, embedUrl };
