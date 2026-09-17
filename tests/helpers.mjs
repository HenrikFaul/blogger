import { newDraft } from "../src/lib/creator/model.ts";
export function draft() {
  return {
    ...newDraft("nora", "alkotas", "Egy jól működő történet"),
    excerpt: "Ez egy valódi, tesztelhető cikk rövid összefoglalója.",
    publishedAt: "2026-09-01T08:00:00.000Z",
    document: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Az írásnak biztos otthon kell." }],
        },
      ],
    },
  };
}
export function asset(overrides = {}) {
  return {
    id: "demo-coast",
    name: "coast.jpg",
    src: "/media/demo/coast.jpg",
    alt: "Mediterrán tengerpart",
    decorative: false,
    caption: "A parton",
    credit: "Felhasználói referencia",
    width: 344,
    height: 189,
    size: 1000,
    type: "image/jpeg",
    demo: true,
    ...overrides,
  };
}
export class MemoryStorage {
  data = new Map();
  writes = 0;
  getItem(k) {
    return this.data.get(k) ?? null;
  }
  setItem(k, v) {
    this.writes++;
    this.data.set(k, String(v));
  }
}
