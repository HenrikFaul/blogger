/** The editable document is JSON, never executable HTML or MDX. IDs never depend on titles/slugs. */
import { slugify, safeUrl, safeImageUrl } from "../safety.js";
export const STORAGE_KEY = "forgeblog.workspace.v3";
export const LAYOUTS = [
  "editorial-grid",
  "masonry",
  "justified",
  "carousel",
  "stacked",
  "filmstrip",
  "comparison",
  "full-bleed",
  "lightbox",
  "mixed",
] as const;
export type GalleryLayout = (typeof LAYOUTS)[number];
export type ImageAsset = {
  id: string;
  name: string;
  src: string;
  alt: string;
  decorative: boolean;
  caption: string;
  credit: string;
  width: number;
  height: number;
  size: number;
  type: string;
  hash?: string;
  demo?: boolean;
};
export type DocNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: DocNode[];
};
export type Snapshot = {
  id: string;
  at: string;
  label: string;
  draft: Omit<Draft, "history">;
};
export type Draft = {
  id: string;
  title: string;
  slug: string;
  slugEdited: boolean;
  excerpt: string;
  author: string;
  categories: string[];
  tags: string[];
  status: "draft" | "review" | "archived";
  publishedAt: string;
  heroImage?: ImageAsset;
  heroTreatment: "standard" | "full-bleed" | "split" | "hidden";
  document: DocNode;
  seo: { title: string; description: string; noindex: boolean };
  createdAt: string;
  updatedAt: string;
  history: Snapshot[];
  git?: {
    branch: string;
    head: string;
    path: string;
    url: string;
    prUrl?: string;
  };
};
export type Workspace = {
  version: 3;
  revision: number;
  writer: string;
  drafts: Draft[];
  appearance: { themeKey: string; mode: "light" | "dark" };
  savedAt: string;
};
export const emptyDoc = (): DocNode => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});
export function newDraft(
  author = "nora",
  category = "alkotas",
  title = "",
): Draft {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    slug: slugify(title),
    slugEdited: false,
    excerpt: "",
    author,
    categories: [category],
    tags: [],
    status: "draft",
    publishedAt: now,
    heroTreatment: "standard",
    document: emptyDoc(),
    seo: { title: "", description: "", noindex: false },
    createdAt: now,
    updatedAt: now,
    history: [],
  };
}
export function textOf(doc: DocNode): string {
  return (
    doc.text ??
    doc.content?.map(textOf).join(doc.type === "doc" ? "\n" : " ") ??
    ""
  );
}
export function wordCount(doc: DocNode): number {
  return textOf(doc).trim().split(/\s+/u).filter(Boolean).length;
}
export function snapshot(draft: Draft, label = "Kézi ellenőrzőpont"): Draft {
  const { history, ...saved } = draft;
  const next = {
    ...draft,
    history: [
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        label,
        draft: structuredClone(saved),
      },
      ...history,
    ].slice(0, 20),
  };
  while (next.history.length > 1 && JSON.stringify(next).length > 1900000)
    next.history.pop();
  return next;
}
export function restoredDraft(item: Snapshot): Draft {
  const now = new Date().toISOString();
  return {
    ...structuredClone(item.draft),
    id: crypto.randomUUID(),
    title: `${(item.draft.title || "Névtelen").slice(0, 72)} – visszaállított másolat`,
    slug: `${(item.draft.slug || "vazlat").slice(0, 80)}-visszaallitott`,
    slugEdited: false,
    status: "draft",
    git: undefined,
    createdAt: now,
    updatedAt: now,
    history: [],
  };
}
const nodeTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "hardBreak",
  "horizontalRule",
  "image",
  "galleryBlock",
  "embedBlock",
  "taskList",
  "taskItem",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
]);
const markTypes = new Set([
  "bold",
  "italic",
  "strike",
  "underline",
  "code",
  "link",
]);
/** Reject unknown nodes and unsafe attributes. This guard is shared with the server and imports. */
export function assertDocument(doc: unknown): asserts doc is DocNode {
  let count = 0;
  function walk(v: unknown, depth: number) {
    if (++count > 25000 || depth > 30)
      throw new Error("A dokumentum túl nagy vagy túl mélyen beágyazott.");
    if (!v || typeof v !== "object" || Array.isArray(v))
      throw new Error("Hibás dokumentumcsomópont.");
    const n = v as DocNode;
    if (!nodeTypes.has(n.type))
      throw new Error(`Nem támogatott blokk: ${n.type}`);
    if (
      n.text !== undefined &&
      (typeof n.text !== "string" || n.text.length > 500000)
    )
      throw new Error("Hibás szöveg.");
    if (n.attrs && (typeof n.attrs !== "object" || Array.isArray(n.attrs)))
      throw new Error("Hibás blokkattribútum.");
    if (n.type === "heading" && ![2, 3, 4].includes(Number(n.attrs?.level)))
      throw new Error("H2–H4 címsor használható.");
    if (n.type === "image") {
      if (!safeImageUrl(String(n.attrs?.src || "")))
        throw new Error("Nem biztonságos képútvonal.");
      if (n.attrs?.asset) {
        assertAsset(n.attrs.asset);
        if ((n.attrs.asset as ImageAsset).src !== n.attrs.src)
          throw new Error("A kép és a médiametaadat útvonala eltér.");
      } else if (String(n.attrs?.src).startsWith("/media/uploads/"))
        throw new Error(
          "A helyi képhez hiányzik az exportálható médiametaadat.",
        );
    }
    if (n.type === "galleryBlock") {
      const images = n.attrs?.images;
      if (
        !Array.isArray(images) ||
        images.length > 50 ||
        !LAYOUTS.includes(n.attrs?.layout as GalleryLayout)
      )
        throw new Error("Hibás galéria.");
      images.forEach(assertAsset);
    }
    if (n.type === "embedBlock" && !embedUrl(String(n.attrs?.url || "")))
      throw new Error("Nem támogatott beágyazás.");
    if (n.marks) {
      if (!Array.isArray(n.marks) || n.marks.length > 10)
        throw new Error("Hibás formázás.");
      n.marks.forEach((m) => {
        if (
          !markTypes.has(m.type) ||
          (m.type === "link" && !safeUrl(String(m.attrs?.href || "")))
        )
          throw new Error("Nem biztonságos szövegformázás vagy hivatkozás.");
      });
    }
    if (n.content) {
      if (!Array.isArray(n.content)) throw new Error("Hibás tartalom.");
      n.content.forEach((c) => walk(c, depth + 1));
    }
  }
  walk(doc, 0);
  if ((doc as DocNode).type !== "doc")
    throw new Error("A gyökérelem csak doc lehet.");
}
export function assertAsset(value: unknown): asserts value is ImageAsset {
  const a = value as ImageAsset;
  if (
    !a ||
    typeof a !== "object" ||
    typeof a.id !== "string" ||
    typeof a.name !== "string" ||
    !safeImageUrl(a.src) ||
    typeof a.alt !== "string" ||
    typeof a.decorative !== "boolean" ||
    typeof a.caption !== "string" ||
    typeof a.credit !== "string" ||
    !Number.isFinite(a.size) ||
    a.size < 0 ||
    a.size > 10 * 1024 * 1024 ||
    !Number.isFinite(a.width) ||
    a.width < 1 ||
    !Number.isFinite(a.height) ||
    a.height < 1 ||
    a.width > 16000 ||
    a.height > 16000 ||
    a.width * a.height > 40000000 ||
    typeof a.type !== "string" ||
    a.alt.length > 1000 ||
    a.caption.length > 2000 ||
    a.credit.length > 1000 ||
    a.name.length > 300 ||
    a.id.length > 100 || (a.demo === true && !a.src.startsWith("/media/demo/"))
  )
    throw new Error("Hibás médiametaadat.");
}
export function assertDraft(value: unknown): asserts value is Draft {
  const d = value as Draft;
  if (
    !d ||
    typeof d !== "object" ||
    typeof d.id !== "string" ||
    !/^[a-zA-Z0-9-]{8,80}$/.test(d.id)
  )
    throw new Error("Hibás vázlatazonosító.");
  for (const key of [
    "title",
    "slug",
    "excerpt",
    "author",
    "publishedAt",
    "createdAt",
    "updatedAt",
  ] as const)
    if (typeof d[key] !== "string") throw new Error(`Hibás mező: ${key}`);
  if (d.title.length > 100 || d.slug.length > 100 || d.excerpt.length > 300)
    throw new Error("A cím, címrészlet vagy kivonat túl hosszú.");
  if (
    !["draft", "review", "archived"].includes(d.status) ||
    !Array.isArray(d.categories) ||
    !Array.isArray(d.tags) ||
    [...d.categories, ...d.tags].some(
      (s) => typeof s !== "string" || s.length > 100,
    ) ||
    !Array.isArray(d.history) ||
    d.history.length > 20
  )
    throw new Error("Hibás vázlatállapot.");
  if (
    !d.seo ||
    typeof d.seo.title !== "string" ||
    typeof d.seo.description !== "string" ||
    typeof d.seo.noindex !== "boolean" ||
    d.seo.title.length > 60 ||
    d.seo.description.length > 160
  )
    throw new Error("Hibás keresőmetaadat.");
  if (
    !["standard", "full-bleed", "split", "hidden"].includes(d.heroTreatment) ||
    typeof d.slugEdited !== "boolean" ||
    d.categories.length > 20 ||
    d.tags.length > 30
  )
    throw new Error("Hibás megjelenési vagy kategóriabeállítás.");
  if (d.git) {
    const link=(raw:unknown)=>{try{const u=new URL(String(raw));return u.protocol==='https:'&&u.hostname==='github.com'&&!u.port&&!u.username&&!u.password;}catch{return false;}};
    if(typeof d.git.branch!=='string'||!d.git.branch.startsWith('forgeblog/draft-')||typeof d.git.head!=='string'||!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(d.git.head)||!/^src\/content\/posts\/[a-z0-9-]+\.mdx$/.test(d.git.path)||!link(d.git.url)||(d.git.prUrl&&!link(d.git.prUrl))) throw new Error('Nem érvényes Git-metaadat. A bejelentkezési token soha nem része a vázlatnak.');
  }
  if (d.heroImage) assertAsset(d.heroImage);
  assertDocument(d.document);
  if (JSON.stringify(d).length > 2000000)
    throw new Error("A vázlat túllépi a 2 MB-os dokumentumkorlátot.");
}
export function publishErrors(
  draft: Draft,
  usedSlugs: string[] = [],
): string[] {
  const e: string[] = [];
  if (!draft.title.trim()) e.push("Adj címet a történetnek.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug))
    e.push("Az URL-részlet kisbetűt, számot és kötőjelet tartalmazhat.");
  if (
    usedSlugs.includes(draft.slug) &&
    draft.git?.path !== `src/content/posts/${draft.slug}.mdx`
  )
    e.push("Ez az URL már egy létező cikkhez tartozik. Válassz másikat.");
  if (draft.excerpt.trim().length < 10)
    e.push("A kivonat legyen legalább 10 karakter.");
  if (!draft.author || !draft.categories.length)
    e.push("Válassz szerzőt és legalább egy témát.");
  if (wordCount(draft.document) < 1) e.push("A cikk még üres.");
  if (!Number.isFinite(new Date(draft.publishedAt).getTime()))
    e.push("Adj meg érvényes megjelenési dátumot.");
  const check = (a: { alt?: unknown; decorative?: unknown }) => {
    if (a.decorative !== true && !String(a.alt || "").trim())
      e.push("Minden képhez kell alternatív szöveg, vagy jelöld dekoratívnak.");
  };
  if (draft.heroImage) check(draft.heroImage);
  const walk = (n: DocNode) => {
    if (n.type === "image") check(n.attrs || {});
    if (n.type === "galleryBlock") {
      ((n.attrs?.images as ImageAsset[]) || []).forEach(check);
      if (
        n.attrs?.layout === "comparison" &&
        ((n.attrs?.images as ImageAsset[]) || []).length !== 2
      )
        e.push("Az összehasonlító galériához pontosan két kép szükséges.");
    }
    n.content?.forEach(walk);
  };
  walk(draft.document);
  try {
    assertDraft(draft);
  } catch (error) {
    e.push(error instanceof Error ? error.message : "Hibás vázlat.");
  }
  return [...new Set(e)];
}
export function documentAssets(d: Draft): ImageAsset[] {
  const assets = new Map<string, ImageAsset>();
  if (d.heroImage) assets.set(d.heroImage.id, d.heroImage);
  function walk(n: DocNode) {
    if (n.type === "image" && n.attrs?.asset) {
      const a = n.attrs.asset as ImageAsset;
      assets.set(a.id, a);
    }
    if (n.type === "galleryBlock")
      for (const a of (n.attrs?.images as ImageAsset[]) || [])
        assets.set(a.id, a);
    n.content?.forEach(walk);
  }
  walk(d.document);
  return [...assets.values()];
}
export function embedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return null;
    let id = "";
    if (["www.youtube.com", "youtube.com"].includes(u.hostname)) {
      id =
        u.searchParams.get("v") ||
        u.pathname.match(/^\/embed\/([\w-]{11})$/)?.[1] ||
        "";
    } else if (u.hostname === "youtu.be") id = u.pathname.slice(1);
    if (/^[\w-]{11}$/.test(id))
      return `https://www.youtube-nocookie.com/embed/${id}`;
    if (
      ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(u.hostname)
    ) {
      const v = u.pathname.match(/(?:\/video)?\/(\d{6,12})$/)?.[1];
      if (v) return `https://player.vimeo.com/video/${v}`;
    }
    return null;
  } catch {
    return null;
  }
}
