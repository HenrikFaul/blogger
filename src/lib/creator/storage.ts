import {
  STORAGE_KEY,
  assertDraft,
  newDraft,
  type Workspace,
  type Draft,
} from "./model";
export type StorageLike = Pick<Storage, "getItem" | "setItem">;
export function emptyWorkspace(themeKey = "minimal-editorial"): Workspace {
  return {
    version: 3,
    revision: 0,
    writer: "",
    drafts: [],
    appearance: { themeKey, mode: "light" },
    savedAt: "",
  };
}
export function parseWorkspace(raw: string): Workspace {
  if (raw.length > 8000000) throw new Error("A biztonsági mentés túl nagy.");
  const v = JSON.parse(raw) as Workspace;
  if (
    v?.version !== 3 ||
    !Array.isArray(v.drafts) ||
    v.drafts.length > 200 ||
    !Number.isSafeInteger(v.revision) ||
    v.revision < 0 ||
    typeof v.writer !== "string" ||
    !v.appearance ||
    typeof v.appearance.themeKey !== "string" ||
    !["light", "dark"].includes(v.appearance.mode)
  )
    throw new Error(
      "Ismeretlen vagy sérült munkatér-formátum. Az eredeti adatok megmaradtak.",
    );
  const ids = new Set<string>();
  v.drafts.forEach((d) => {
    assertDraft(d);
    if (ids.has(d.id)) throw new Error("Ismétlődő vázlatazonosító.");
    ids.add(d.id);
    d.history.forEach((h) => {
      if (
        !h ||
        typeof h.id !== "string" ||
        typeof h.at !== "string" ||
        typeof h.label !== "string"
      )
        throw new Error("Hibás helyreállítási pont.");
      assertDraft({ ...h.draft, history: [] });
    });
  });
  return v;
}
/** CAS at the storage boundary. Web Locks in the caller close the check/write race between tabs. */
export function persistWorkspace(
  storage: StorageLike,
  value: Workspace,
  expectedRevision: number,
  writer: string,
): Workspace {
  const raw = storage.getItem(STORAGE_KEY);
  const current = raw ? parseWorkspace(raw) : emptyWorkspace();
  if (current.revision !== expectedRevision)
    throw new Error(
      "CONFLICT: Egy másik böngészőfül újabb változatot mentett.",
    );
  const next = {
    ...value,
    revision: current.revision + 1,
    writer,
    savedAt: new Date().toISOString(),
  };
  const rawNext = JSON.stringify(next);
  parseWorkspace(rawNext);
  storage.setItem(STORAGE_KEY, rawNext);
  return next;
}
export function readWorkspace(
  storage: StorageLike,
  themeKey = "minimal-editorial",
): Workspace {
  const raw = storage.getItem(STORAGE_KEY);
  return raw ? parseWorkspace(raw) : emptyWorkspace(themeKey);
}
/** Legacy input is migrated without deleting its original storage key. HTML is imported later by Tiptap's safe schema. */
export function legacyDrafts(
  storage: StorageLike,
  author: string,
  category: string,
): { draft: Draft; html: string }[] {
  const raw = storage.getItem("forge-local-drafts");
  if (!raw) return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      "A korábbi vázlatok sérültek. Exportáld az eredeti forge-local-drafts adatot a beállításoknál.",
    );
  }
  if (!Array.isArray(data))
    throw new Error("A korábbi vázlatok formátuma nem támogatott.");
  return data.slice(0, 200).map((old) => {
    const d = newDraft(
      author,
      category,
      typeof old.title === "string" ? old.title.slice(0, 100) : "Régi vázlat",
    );
    d.excerpt =
      typeof old.excerpt === "string" ? old.excerpt.slice(0, 300) : "";
    return {
      draft: d,
      html:
        typeof old.content === "string"
          ? old.content
          : typeof old.html === "string"
            ? old.html
            : "",
    };
  });
}
