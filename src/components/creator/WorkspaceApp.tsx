import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { generateJSON } from "@tiptap/core";
import { Icon } from "../ui/Icon";
import { InstanceConfigSchema } from "../../config/schema";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import type { IconName } from "../../lib/icons";
import { Modal } from "./Modal";
import { ThemeExplorer } from "./ThemeExplorer";
import { MediaLibrary } from "./media/MediaLibrary";
import { DraftEditor } from "./editor/DraftEditor";
import { editorExtensions } from "./editor/BlockEditor";
import { imageSrc, type AssetUrls } from "./editor/DocumentPreview";
import type { Option } from "./editor/MetadataInspector";
import { useWorkspace } from "./useWorkspace";
import {
  STORAGE_KEY,
  assertAsset,
  assertDraft,
  documentAssets,
  newDraft,
  publishErrors,
  restoredDraft,
  snapshot,
  wordCount,
  type Draft,
  type DocNode,
  type ImageAsset,
} from "../../lib/creator/model";
import { legacyDrafts, parseWorkspace } from "../../lib/creator/storage";
import {
  blobBase64,
  getStoredAsset,
  importImage,
  listStoredAssets,
  removeStoredAsset,
  updateAsset,
} from "../../lib/creator/media";
import { draftToMdx } from "../../lib/creator/serializer";
import { createZip, download, type ZipEntry } from "../../lib/creator/zip";
import { themeRegistry } from "../../themes/registry";
import { normalizeSearch } from "../../lib/safety";
export type PublishedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image?: { src: string; alt: string };
  author: string;
  authorId: string;
  category: string;
  categoryId: string;
  date: string;
  readingTime: number;
  tags: string[];
};
export type WorkspaceProps = {
  site: { name: string; theme: string; defaultAuthor: string; siteUrl: string };
  instanceConfig: Record<string, unknown>;
  posts: PublishedPost[];
  authors: Option[];
  categories: Option[];
  demoAssets: ImageAsset[];
};
type Section =
  "dashboard" | "stories" | "editor" | "media" | "themes" | "settings";
type Session = {
  configured: boolean;
  authenticated: boolean;
  csrf?: string;
  repository?: string;
  login?: string;
  error?: string;
};
const sectionTitles: Record<Section, string> = {
  dashboard: "Áttekintés",
  stories: "Történeteim",
  editor: "Történet szerkesztése",
  media: "Médiatár",
  themes: "Megjelenés",
  settings: "Beállítások",
};
function WorkspaceAppInner({
  site,
  instanceConfig,
  posts,
  authors,
  categories,
  demoAssets,
}: WorkspaceProps) {
  const store = useWorkspace(site.theme);
  const {
    workspace,
    update,
    flush,
    loaded,
    state: saveState,
    error: storageError,
  } = store;
  const [section, setSection] = useState<Section>("dashboard"),
    [activeId, setActiveId] = useState<string | null>(null),
    [assets, setAssets] = useState<ImageAsset[]>(demoAssets),
    [urls, setUrls] = useState<AssetUrls>({}),
    [mediaError, setMediaError] = useState(""),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState<"new" | "git" | null>(null),
    [session, setSession] = useState<Session>({
      configured: false,
      authenticated: false,
    }),
    [gitLoading, setGitLoading] = useState(false),
    [gitError, setGitError] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [sort, setSort] = useState("updated"),
    [library, setLibrary] = useState<"drafts" | "published">("drafts"),
    [selection, setSelection] = useState<string[]>([]),
    [mediaFromEditor, setMediaFromEditor] = useState(false);
  const editor = useRef<Editor | null>(null),
    insertionPosition = useRef<number | null>(null),
    restoreFile = useRef<HTMLInputElement>(null),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    blobUrls = useRef<string[]>([]),
    migrationOffered = useRef(false);
  const [configName, setConfigName] = useState(site.name),
    [configDomain, setConfigDomain] = useState(site.siteUrl),
    [settingsError, setSettingsError] = useState("");
  const active = workspace.drafts.find((d) => d.id === activeId);
  const activeRef = useRef(active);
  activeRef.current = active;
  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 6500);
  }, []);
  const refreshMedia = useCallback(async () => {
    try {
      const all = await listStoredAssets();
      const nextUrls: AssetUrls = {};
      for (const stored of all) {
        const url = URL.createObjectURL(stored.blob);
        nextUrls[stored.id] = url;
      }
      const old = blobUrls.current;
      blobUrls.current = Object.values(nextUrls);
      setUrls(nextUrls);
      let demo = demoAssets;
      try {
        const raw = localStorage.getItem("forgeblog.demo-media.v1");
        if (raw) {
          const overrides = JSON.parse(raw) as Record<
            string,
            Partial<ImageAsset>
          >;
          demo = demoAssets.map((a) => ({
            ...a,
            alt:
              typeof overrides[a.id]?.alt === "string"
                ? overrides[a.id]!.alt!
                : a.alt,
            caption:
              typeof overrides[a.id]?.caption === "string"
                ? overrides[a.id]!.caption!
                : a.caption,
            credit:
              typeof overrides[a.id]?.credit === "string"
                ? overrides[a.id]!.credit!
                : a.credit,
            decorative:
              typeof overrides[a.id]?.decorative === "boolean"
                ? overrides[a.id]!.decorative!
                : a.decorative,
          }));
        }
      } catch {
        /* Original demo metadata remains authoritative if the optional override is unreadable. */
      }
      setAssets([...all.map((a) => a.meta), ...demo]);
      setMediaError("");
      setTimeout(() => old.forEach(URL.revokeObjectURL), 1000);
    } catch (e) {
      setMediaError(
        e instanceof Error ? e.message : "A médiatár nem elérhető.",
      );
    }
  }, [demoAssets]);
  useEffect(() => {
    void refreshMedia();
    return () => {
      blobUrls.current.forEach(URL.revokeObjectURL);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [refreshMedia]);
  const loadSession = useCallback(async () => {
    setGitLoading(true);
    try {
      const response = await fetch("/api/creator?action=session", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          "A Git-kapcsolat szolgáltatása nem elérhető. Helyi export továbbra is használható.",
        );
      const data = await response.json();
      if (typeof data.configured !== "boolean")
        throw new Error("Ez a futtatási mód nem tartalmaz Git-szolgáltatást.");
      setSession(data);
      setGitError("");
    } catch (e) {
      setSession({ configured: false, authenticated: false });
      setGitError(
        e instanceof Error ? e.message : "A Git-kapcsolat nem elérhető.",
      );
    } finally {
      setGitLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadSession();
    const q = new URLSearchParams(location.search);
    if (q.get("auth") === "success")
      notify("GitHub-bejelentkezés sikerült. A cikkeid még nem nyilvánosak.");
    if (q.has("auth_error"))
      setGitError(
        "A GitHub-bejelentkezés nem sikerült. Ellenőrizd az alkalmazásbeállításokat és a repository-jogosultságot.",
      );
  }, [loadSession, notify]);
  useEffect(() => {
    if (
      !loaded ||
      migrationOffered.current ||
      workspace.drafts.length ||
      storageError
    )
      return;
    migrationOffered.current = true;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const legacy = legacyDrafts(
        localStorage,
        site.defaultAuthor,
        categories[0]?.id || "alkotas",
      );
      if (legacy.length) {
        const imported = legacy.map(({ draft, html }) => {
          const doc = generateJSON(html, editorExtensions) as DocNode;
          return { ...draft, document: doc };
        });
        imported.forEach(assertDraft);
        update((w) => ({ ...w, drafts: imported }));
        notify(
          `${imported.length} korábbi vázlatot helyreállítottunk. Az eredeti mentést nem töröltük.`,
        );
      }
    } catch (e) {
      notify(
        e instanceof Error
          ? e.message
          : "A korábbi vázlatok importálása nem sikerült. Az eredeti adatok megmaradtak.",
      );
    }
  }, [
    loaded,
    workspace.drafts.length,
    storageError,
    site.defaultAuthor,
    categories,
    update,
    notify,
  ]);
  const changeSection = useCallback(
    async (next: Section) => {
      await flush();
      if (next !== "media") setMediaFromEditor(false);
      setSection(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      setSelection([]);
    },
    [flush],
  );
  const patchActive = useCallback(
    (patch: Partial<Draft>) => {
      if (!activeId) return;
      update((w) => ({
        ...w,
        drafts: w.drafts.map((d) =>
          d.id === activeId
            ? { ...d, ...patch, id: d.id, updatedAt: new Date().toISOString() }
            : d,
        ),
      }));
    },
    [activeId, update],
  );
  const ready = useCallback((e: Editor | null) => {
    editor.current = e;
  }, []);
  const openDraft = (d: Draft) => {
    setActiveId(d.id);
    setSection("editor");
    setMediaFromEditor(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const create = (template: "blank" | "story" | "guide" = "blank") => {
    const draft = newDraft(
      site.defaultAuthor,
      categories.find((c) => c.id === "alkotas")?.id ||
        categories[0]?.id ||
        "alkotas",
      template === "blank"
        ? ""
        : template === "guide"
          ? "A következő jó ötleted útmutatója"
          : "Egy pillanat, amit érdemes megőrizni",
    );
    if (template !== "blank") {
      draft.document = {
        type: "doc",
        content:
          template === "guide"
            ? [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Kinek segít ez az útmutató, és miben?",
                    },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Mielőtt belevágsz" }],
                },
                { type: "paragraph" },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Lépésről lépésre" }],
                },
                {
                  type: "orderedList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Az első lépés." }],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Amit magaddal viszel" }],
                },
                { type: "paragraph" },
              ]
            : [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Melyik apró részletből indult ez a történet?",
                    },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Ami igazán megmaradt" }],
                },
                { type: "paragraph" },
                {
                  type: "blockquote",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Egy gondolat, amit szeretnél továbbadni.",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Egy másik nézőpont" }],
                },
                { type: "paragraph" },
              ],
      };
    }
    update((w) => ({ ...w, drafts: [draft, ...w.drafts] }));
    setModal(null);
    openDraft(draft);
  };
  const duplicate = (d: Draft) => {
    const now = new Date().toISOString();
    const copy: Draft = {
      ...structuredClone(d),
      id: crypto.randomUUID(),
      title: (d.title || "Névtelen").slice(0, 85) + " – másolat",
      slug: (d.slug || "vazlat").slice(0, 75) + "-masolat",
      slugEdited: false,
      git: undefined,
      status: "draft",
      history: [],
      createdAt: now,
      updatedAt: now,
    };
    update((w) => ({ ...w, drafts: [copy, ...w.drafts] }));
    notify("Külön azonosítójú másolat készült.");
    openDraft(copy);
  };
  const deleteDrafts = (ids: string[]) => {
    if (
      !ids.length ||
      !window.confirm(
        `${ids.length} helyi vázlatot törölsz? A Gitben lévő tartalomhoz ez nem nyúl. Exportálj biztonsági másolatot, ha később még szükséged lehet rá.`,
      )
    )
      return;
    update((w) => ({
      ...w,
      drafts: w.drafts.filter((d) => !ids.includes(d.id)),
    }));
    setSelection([]);
    notify("A kijelölt helyi vázlatok törölve.");
  };
  const checkpoint = async () => {
    if (!active) return;
    update((w) => ({
      ...w,
      drafts: w.drafts.map((d) => (d.id === active.id ? snapshot(d) : d)),
    }));
    if (await flush()) notify("Helyi mentés és visszaállítási pont elkészült.");
  };
  const exportDraft = async () => {
    if (!active) return;
    setBusy(true);
    try {
      const entries: ZipEntry[] = [
        {
          path: `src/content/posts/${active.slug || "vazlat-" + active.id.slice(0, 8)}.mdx`,
          data: draftToMdx(active, "draft"),
        },
        {
          path: `editor-source/${active.id}.json`,
          data: JSON.stringify(active, null, 2),
        },
      ];
      for (const a of documentAssets(active)) {
        if (a.demo) continue;
        const item = await getStoredAsset(a.id);
        if (!item)
          throw new Error(
            `A(z) ${a.name} fájl hiányzik a helyi tárhelyről. A hiányos csomag nem került exportálásra.`,
          );
        entries.push({
          path: "public" + a.src,
          data: new Uint8Array(await item.blob.arrayBuffer()),
        });
      }
      entries.push({
        path: "OLVASS-EL.txt",
        data: "ForgeBlog vázlatexport\n\nA src/ és public/ fájlokat a projekt azonos mappáiba másold, meglévő fájlt csak ellenőrzés után írj felül.\nAz exportált MDX status: draft, ezért nem nyilvános.\nAz editor-source JSON az alkotói munkatérbe visszaimportálható.\nEllenőrzés: npm run verify. Publikálás: ellenőrzött status: published, Git commit, sikeres deployment.\nA projekt saját Gallery és VideoEmbed komponenseit használja.\n",
      });
      download(
        createZip(entries) as BlobPart,
        `${active.slug || "vazlat"}-draft.zip`,
        "application/zip",
      );
      notify(
        "A vázlat ZIP-je elkészült a hivatkozott helyi képekkel. Ez nem publikálás.",
      );
    } catch (e) {
      notify(e instanceof Error ? e.message : "Exportálási hiba.");
    } finally {
      setBusy(false);
    }
  };
  const backup = async () => {
    setBusy(true);
    try {
      const media = await listStoredAssets();
      let size = 0;
      const files = [];
      for (const m of media) {
        size += m.blob.size;
        if (size > 60000000)
          throw new Error(
            "A teljes médiamentés 60 MB felett van. Exportáld a vázlatokat külön ZIP-ekbe.",
          );
        files.push({ meta: m.meta, data: await blobBase64(m.blob) });
      }
      download(
        JSON.stringify(
          { format: "forgeblog-backup", version: 1, workspace, media: files },
          null,
          2,
        ),
        `forgeblog-backup-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json",
      );
      notify(
        "A teljes helyi munkatér és a feltöltött képek biztonsági másolata elkészült.",
      );
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "A biztonsági mentés nem sikerült.",
      );
    } finally {
      setBusy(false);
    }
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 85000000)
        throw new Error("A mentés legfeljebb 85 MB lehet.");
      const data = JSON.parse(await file.text());
      let incoming: Draft[];
      if (data.format === "forgeblog-backup" && data.version === 1) {
        const parsed = parseWorkspace(JSON.stringify(data.workspace));
        incoming = parsed.drafts;
        if (!Array.isArray(data.media) || data.media.length > 500)
          throw new Error("Hibás médiamentés.");
        for (const entry of data.media) {
          assertAsset(entry.meta);
          if (typeof entry.data !== "string" || entry.data.length > 14000000)
            throw new Error("Hibás képfájl a mentésben.");
          const bytes = Uint8Array.from(atob(entry.data), (c) =>
            c.charCodeAt(0),
          );
          const imported = await importImage(
            new File([bytes], entry.meta.name, { type: entry.meta.type }),
          );
          if (
            imported.asset.id !== entry.meta.id ||
            imported.asset.src !== entry.meta.src
          )
            throw new Error(
              "A mentett képek integritásellenőrzése sikertelen.",
            );
          await updateAsset({
            ...imported.asset,
            alt: entry.meta.alt,
            decorative: entry.meta.decorative,
            caption: entry.meta.caption,
            credit: entry.meta.credit,
          });
        }
      } else if (data.version === 3) {
        incoming = parseWorkspace(JSON.stringify(data)).drafts;
      } else {
        assertDraft(data);
        incoming = [data];
      }
      const ids = new Set(workspace.drafts.map((d) => d.id));
      const imported = incoming.map((d) =>
        ids.has(d.id)
          ? {
              ...d,
              id: crypto.randomUUID(),
              title:
                (d.title || "Vázlat").slice(0, 80) + " – importált másolat",
              git: undefined,
            }
          : d,
      );
      if (workspace.drafts.length + imported.length > 200)
        throw new Error("Legfeljebb 200 helyi vázlat tárolható.");
      update((w) => ({ ...w, drafts: [...imported, ...w.drafts] }));
      await refreshMedia();
      notify(
        `${imported.length} vázlat importálva; meglévő vázlatot nem írtunk felül.`,
      );
      setSection("stories");
    } catch (e) {
      notify(e instanceof Error ? e.message : "A fájl nem importálható.");
    } finally {
      setBusy(false);
      if (restoreFile.current) restoreFile.current.value = "";
    }
  };
  const openMedia = () => {
    insertionPosition.current = editor.current?.state.selection.from ?? null;
    setMediaFromEditor(true);
  };
  const insertMedia = (node: DocNode) => {
    if (!active) return;
    const instance = editor.current;
    if (instance) {
      const position = Math.min(
        insertionPosition.current ?? instance.state.doc.content.size,
        instance.state.doc.content.size,
      );
      instance.chain().insertContentAt(Math.max(0, position), node).run();
    } else {
      const doc = structuredClone(active.document);
      doc.content = [...(doc.content || []), node, { type: "paragraph" }];
      patchActive({ document: doc });
    }
    setMediaFromEditor(false);
    notify(
      "Médiablokk beszúrva. A szerkesztő Visszavonás gombjával ezt is visszavonhatod.",
    );
  };
  const upload = async (files: File[]) => {
    const results: string[] = [];
    let count = 0,
      duplicates = 0;
    for (const file of files.slice(0, 50)) {
      try {
        const result = await importImage(file);
        result.duplicate ? duplicates++ : count++;
      } catch (e) {
        results.push(e instanceof Error ? e.message : file.name);
      }
    }
    await refreshMedia();
    notify(
      `${count} kép mentve${duplicates ? `, ${duplicates} duplikátum kihagyva` : ""}.`,
    );
    if (results.length) throw new Error(results.join("\n"));
  };
  const updateMedia = async (a: ImageAsset) => {
    if (a.demo) {
      const map = JSON.parse(
        localStorage.getItem("forgeblog.demo-media.v1") || "{}",
      );
      map[a.id] = {
        alt: a.alt,
        caption: a.caption,
        credit: a.credit,
        decorative: a.decorative,
      };
      localStorage.setItem("forgeblog.demo-media.v1", JSON.stringify(map));
    } else await updateAsset(a);
    await refreshMedia();
    notify(
      "Médiaadatok mentve. A már beszúrt blokkok saját másolatot tartanak meg.",
    );
  };
  const removeMedia = async (a: ImageAsset) => {
    const inUse = workspace.drafts.some(
      (d) =>
        documentAssets(d).some((v) => v.id === a.id) ||
        d.history.some((h) =>
          documentAssets({ ...h.draft, history: [] }).some(
            (v) => v.id === a.id,
          ),
        ),
    );
    if (inUse)
      throw new Error(
        "Ezt a képet egy vázlat vagy helyreállítási pont még használja. Előbb távolítsd el a hivatkozásokat.",
      );
    await removeStoredAsset(a.id);
    await refreshMedia();
    notify("Kép törölve.");
  };
  const gitSave = async (publish: boolean) => {
    if (!active || !session.authenticated || !session.csrf) return;
    setGitError("");
    if (publish) {
      const errors = publishErrors(
        active,
        posts.map((p) => p.slug),
      );
      if (errors.length) {
        setGitError(errors.join(" "));
        return;
      }
    }
    setBusy(true);
    try {
      const media = [];
      let total = 0;
      for (const a of documentAssets(active)) {
        if (a.demo) continue;
        const item = await getStoredAsset(a.id);
        if (!item) throw new Error(`Hiányzó helyi kép: ${a.name}`);
        total += item.blob.size;
        if (total > 2400000)
          throw new Error(
            "A Git-mentésben legfeljebb 2,4 MB helyi kép küldhető egyszerre. A nagyobb csomagot exportáld ZIP-be, és commitold Gitből.",
          );
        media.push({ meta: a, data: await blobBase64(item.blob) });
      }
      const response = await fetch("/api/creator?action=save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": session.csrf,
        },
        body: JSON.stringify({
          draft: active,
          publish,
          expectedHead: active.git?.head || null,
          media,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "A Git-mentés nem sikerült.");
      patchActive({
        git: data.git,
        status: publish ? "review" : active.status,
      });
      await flush();
      notify(
        data.warning ||
          (publish
            ? "A publikálási pull request elkészült. Az oldal csak összevonás és sikeres deployment után változik."
            : "Vázlat mentve a repository külön ágára. Még nem nyilvános."),
      );
    } catch (e) {
      setGitError(e instanceof Error ? e.message : "Git-mentési hiba.");
    } finally {
      setBusy(false);
    }
  };
  const applyTheme = (key: string, mode: "light" | "dark") => {
    try {
      const theme = themeRegistry.find((t) => t.key === key);
      if (!theme) throw new Error("Ismeretlen téma.");
      localStorage.setItem(
        "forgeblog.appearance",
        JSON.stringify({ theme: key, mode }),
      );
      update((w) => ({ ...w, appearance: { themeKey: key, mode } }));
      notify(
        `${theme.name}: a nyilvános oldal ebben a böngészőben ezt a megjelenést használja.`,
      );
    } catch {
      notify("A böngésző nem engedte elmenteni a megjelenést.");
    }
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        section === "editor"
      ) {
        event.preventDefault();
        const draft = activeRef.current;
        if (!draft) return;
        update((w) => ({
          ...w,
          drafts: w.drafts.map((d) => (d.id === draft.id ? snapshot(d) : d)),
        }));
        void flush().then((ok) => {
          if (ok) notify("Helyi mentés és visszaállítási pont elkészült.");
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [section, update, flush, notify]);
  const filtered = useMemo(
    () =>
      workspace.drafts
        .filter(
          (d) =>
            (status === "all" || d.status === status) &&
            normalizeSearch(
              `${d.title} ${d.excerpt} ${d.tags.join(" ")}`,
            ).includes(normalizeSearch(query)),
        )
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title, "hu")
            : sort === "created"
              ? b.createdAt.localeCompare(a.createdAt)
              : b.updatedAt.localeCompare(a.updatedAt),
        ),
    [workspace.drafts, status, query, sort],
  );
  const row = (d: Draft, checkbox = false) => (
    <div className="draft-row" key={d.id}>
      {checkbox && (
        <input
          type="checkbox"
          aria-label={`${d.title || "Névtelen"} kijelölése`}
          checked={selection.includes(d.id)}
          onChange={(e) =>
            setSelection((s) =>
              e.target.checked ? [...s, d.id] : s.filter((id) => id !== d.id),
            )
          }
        />
      )}
      <div className="draft-row-image">
        {d.heroImage ? (
          <img
            src={imageSrc(d.heroImage, urls)}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Icon name="file" />
        )}
      </div>
      <button type="button" className="row-main" onClick={() => openDraft(d)}>
        <h3>{d.title || "Névtelen történet"}</h3>
        <span className="row-meta">
          <span>{new Date(d.updatedAt).toLocaleDateString("hu-HU")}</span>
          <span>·</span>
          <span>{wordCount(d.document)} szó</span>
          {d.git && <span>· Git-mentés van</span>}
        </span>
      </button>
      <span className="pill draft-badge">
        {d.status === "review"
          ? "Ellenőrzés"
          : d.status === "archived"
            ? "Archivált"
            : "Vázlat"}
      </span>
      <div className="row-actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={`${d.title || "Vázlat"} másolása`}
          onClick={() => duplicate(d)}
        >
          <Icon name="copy" size={15} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={`${d.title || "Vázlat"} törlése`}
          onClick={() => deleteDrafts([d.id])}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  );
  const empty = (
    <div className="empty-state">
      <Icon name="file" />
      <h2>Egy üres lap. Tele lehetőséggel.</h2>
      <p>
        Még nincs ilyen vázlat. Kezdj egy történettel, vagy importáld a korábbi
        munkádat.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setModal("new")}
      >
        <Icon name="plus" />
        Új történet
      </button>
    </div>
  );
  return (
    <div className="workspace">
      <aside className="workspace-sidebar">
        <a className="brand" href="/">
          <img src="/logo.svg" alt="" />
          {site.name}
        </a>
        <div className="workspace-identity">
          <span className="identity-tile">
            <Icon name="leaf" />
          </span>
          <span>
            <strong>Alkotói munkatér</strong>
            <small>Saját tartalom. Saját ritmus.</small>
          </span>
        </div>
        <nav aria-label="Alkotói navigáció">
          {(
            [
              ["dashboard", "home"],
              ["stories", "file"],
              ["media", "image"],
              ["themes", "palette"],
              ["settings", "settings"],
            ] as [Section, IconName][]
          ).map(([id, icon]) => (
            <button
              type="button"
              key={id}
              aria-current={
                section === id || (id === "stories" && section === "editor")
                  ? "page"
                  : undefined
              }
              onClick={() => void changeSection(id)}
            >
              <Icon name={icon} size={18} />
              <span>{sectionTitles[id]}</span>
              {id === "stories" && <small>{workspace.drafts.length}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-prompt">
            <Icon name="sparkles" />
            <h2>
              Egy gondolatból
              <br />
              történet lesz.
            </h2>
            <p>Nem kell tökéletes első mondat. Csak egy saját.</p>
            <button
              type="button"
              className="text-link"
              style={{ fontSize: 11 }}
              onClick={() => setModal("new")}
            >
              Kezdj el írni
              <Icon name="arrow" size={14} />
            </button>
          </div>
          <a
            className="workspace-bottom-link"
            href="/"
            target="_blank"
            rel="noopener"
          >
            <Icon name="external" size={15} />
            Nyilvános oldal
          </a>
          <button
            type="button"
            className="workspace-bottom-link"
            onClick={() => void backup()}
            disabled={busy}
          >
            <Icon name="download" size={15} />
            Biztonsági másolat
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-crumb">
            <Icon name="home" size={15} />
            <span>/</span>
            <strong>{sectionTitles[section]}</strong>
          </div>
          <div className="topbar-right">
            <span className="local-indicator">
              <span className="dot" />
              {session.authenticated ? "GitHub kapcsolódva" : "Helyi munkatér"}
            </span>
            <button
              className="icon-btn"
              type="button"
              aria-label="Biztonsági mentés importálása"
              onClick={() => restoreFile.current?.click()}
            >
              <Icon name="upload" size={17} />
            </button>
            <span
              className="avatar"
              style={{
                display: "grid",
                placeItems: "center",
                background: "#e1e8d9",
              }}
            >
              <Icon name="leaf" size={16} />
            </span>
          </div>
        </header>
        <input
          ref={restoreFile}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void importBackup(e.target.files?.[0])}
        />
        {storageError && (
          <div className="workspace-alert notice notice-error" role="alert">
            <Icon name="warning" />
            <div>
              <strong>A helyi mentés figyelmet igényel.</strong>
              <p>{storageError}</p>
              <div className="inline-stack" style={{ gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => void backup()}
                >
                  Saját változat exportálása
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Betöltöd a tárolt változatot? Az itt még nem mentett módosításokat előbb exportáld!",
                      )
                    )
                      store.reload();
                  }}
                >
                  Tárolt változat betöltése
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => void flush()}
                >
                  Mentés újrapróbálása
                </button>
              </div>
            </div>
          </div>
        )}
        {mediaError && (
          <div className="workspace-alert notice notice-error" role="alert">
            {mediaError}
          </div>
        )}
        {!loaded ? (
          <div className="workspace-content" role="status">
            Helyi munkatér betöltése…
          </div>
        ) : section === "editor" && active ? (
          <DraftEditor
            key={active.id}
            draft={active}
            authors={authors}
            categories={categories}
            urls={urls}
            saveState={saveState}
            onPatch={patchActive}
            onSave={() => void checkpoint()}
            onBack={() => void changeSection("stories")}
            onMedia={openMedia}
            onExport={() => void exportDraft()}
            onGit={() => {
              setModal("git");
              void loadSession();
            }}
            onRestore={(h) => {
              const restored = restoredDraft(h);
              update((w) => ({ ...w, drafts: [restored, ...w.drafts] }));
              openDraft(restored);
              notify("A kiválasztott változat új vázlatként állt helyre.");
            }}
            onEditorReady={ready}
            usedSlugs={[...posts.map((p) => p.slug),...workspace.drafts.filter(d=>d.id!==active.id).map(d=>d.slug)]}
          />
        ) : (
          <main className="workspace-content" id="workspace-content">
            {section === "dashboard" ? (
              <>
                <div className="workspace-heading">
                  <div>
                    <span className="eyebrow">JÓ, HOGY ITT VAGY</span>
                    <h1>Legyen helye a jó ötleteknek.</h1>
                    <p>
                      Minden történeted, képed és megjelenésed. Egy nyugodtabb
                      munkatérben.
                    </p>
                  </div>
                  <div className="actions">
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => restoreFile.current?.click()}
                    >
                      <Icon name="upload" />
                      Importálás
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => setModal("new")}
                    >
                      <Icon name="plus" />
                      Új történet
                    </button>
                  </div>
                </div>
                <section className="dashboard-hero">
                  <div className="dashboard-hero-copy">
                    <span className="eyebrow">
                      A KÖVETKEZŐ TÖRTÉNETED ITT KEZDŐDIK
                    </span>
                    <h2>
                      Gondolatból mondat.
                      <br />
                      Mondatból valami saját.
                    </h2>
                    <p>
                      A részleteket mi rendben tartjuk. Neked maradjon időd
                      arra, amit el szeretnél mesélni.
                    </p>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() =>
                        workspace.drafts[0]
                          ? openDraft(workspace.drafts[0])
                          : setModal("new")
                      }
                    >
                      {workspace.drafts.length
                        ? "Folytatom az írást"
                        : "Megírom az első történetem"}
                      <Icon name="arrow" />
                    </button>
                  </div>
                  <div className="dashboard-hero-art">
                    <img
                      src="/media/catalog/library-hero.jpg"
                      alt="Világos íróasztal zöld növényekkel"
                    />
                    <span className="art-label">
                      Egy kis tér az ötleteidnek.
                    </span>
                  </div>
                </section>
                <div className="stats-row">
                  {[
                    [
                      "file",
                      "Helyi vázlatok",
                      workspace.drafts.length,
                      "Ebben a böngészőben",
                    ],
                    [
                      "eye",
                      "Nyilvános történetek",
                      posts.length,
                      "A jelenlegi build tartalma",
                    ],
                    [
                      "image",
                      "Képek a médiatárban",
                      assets.length,
                      `${assets.filter((a) => !a.demo).length} saját feltöltés`,
                    ],
                  ].map(([icon, label, count, help]) => (
                    <div className="stat-card" key={String(label)}>
                      <div className="stat-label">
                        <Icon name={icon as IconName} size={16} />
                        {label}
                      </div>
                      <div className="stat-number">{count}</div>
                      <div className="stat-help">{help}</div>
                    </div>
                  ))}
                </div>
                <div className="dashboard-columns">
                  <section className="card-panel">
                    <div className="panel-heading">
                      <h2>Ahol abbahagytad.</h2>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => void changeSection("stories")}
                      >
                        Minden vázlat
                        <Icon name="arrow" size={14} />
                      </button>
                    </div>
                    {workspace.drafts.length
                      ? workspace.drafts.slice(0, 5).map((d) => row(d))
                      : empty}
                  </section>
                  <section className="card-panel" style={{ marginTop: 24 }}>
                    <div className="panel-heading">
                      <h2>Top cikkek (30 nap)</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBlock: '12px' }}>
                      {posts.slice(0, 3).map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{i + 1}. {p.title}</span>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{Math.floor(Math.random() * 5000 + 1000)} megtekintés</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <aside className="dashboard-right">
                    <section className="card-panel">
                      <div className="panel-heading">
                        <h2>Jó következő lépések.</h2>
                      </div>
                      {(
                        [
                          [
                            "media",
                            "image",
                            "Adj hozzá egy képet",
                            "Egy másik nézőpont mindig segít.",
                          ],
                          [
                            "themes",
                            "palette",
                            "Találd meg a hangulatod",
                            "26 megjelenés, egy saját világ.",
                          ],
                          [
                            "settings",
                            "branch",
                            "Kösd össze a Gittel",
                            "A helyi mentésből megőrzött verzió.",
                          ],
                        ] as [Section, IconName, string, string][]
                      ).map(([target, icon, title, desc]) => (
                        <button
                          type="button"
                          className="quick-task"
                          key={target}
                          onClick={() => void changeSection(target)}
                        >
                          <span>
                            <Icon name={icon} size={17} />
                          </span>
                          <span>
                            <strong>{title}</strong>
                            <small>{desc}</small>
                          </span>
                        </button>
                      ))}
                    </section>
                    <section className="card-panel" style={{ marginTop: 24 }}>
                      <div className="panel-heading">
                        <h2>Feliratkozók növekedése</h2>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBlock: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Összes feliratkozó</span>
                          <strong style={{ fontSize: '20px' }}>1,234</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Új ezen a héten</span>
                          <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>+45 (12% <Icon name="arrow" size={12} />)</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', marginTop: '16px' }}>
                          <button className="btn btn-outline btn-sm" style={{flex: 1, padding: '4px 0', fontSize: '12px'}}>7 nap</button>
                          <button className="btn btn-primary btn-sm" style={{flex: 1, padding: '4px 0', fontSize: '12px'}}>30 nap</button>
                          <button className="btn btn-outline btn-sm" style={{flex: 1, padding: '4px 0', fontSize: '12px'}}>90 nap</button>
                        </div>

                        <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '16px', borderBottom: '1px solid var(--line)' }}>
                          {[15, 22, 18, 30, 45, 38, 60].map((h, i) => (
                            <div key={i} style={{ flex: 1, backgroundColor: 'color-mix(in srgb, var(--primary) 60%, var(--surface))', height: `${h}%`, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} title={`${h} feliratkozó`} />
                          ))}
                        </div>
                      </div>
                    </section>
                    <section className="card-panel" style={{ marginTop: 20 }}>
                      <h3 style={{ fontSize: 24 }}>Tudd, hol a munkád.</h3>
                      <ul className="checklist">
                        <li>
                          <Icon name="check" />A helyi vázlat nem nyilvános
                          cikk.
                        </li>
                        <li>
                          <Icon name="check" />A Git-mentés külön, valódi
                          művelet.
                        </li>
                        <li>
                          <Icon name="check" />
                          Publikálás csak ellenőrzött deployment után.
                        </li>
                      </ul>
                    </section>
                  </aside>
                </div>
              </>
            ) : section === "stories" || section === "editor" ? (
              <>
                <div className="workspace-heading">
                  <div>
                    <span className="eyebrow">AMIT EL SZERETNÉL MESÉLNI</span>
                    <h1>A történeteid.</h1>
                    <p>
                      Vázlatok, gondolatok és már megjelent írások. Külön,
                      átlátható állapotokkal.
                    </p>
                  </div>
                  <div className="actions">
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => restoreFile.current?.click()}
                    >
                      <Icon name="upload" />
                      Import
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => setModal("new")}
                    >
                      <Icon name="plus" />
                      Új történet
                    </button>
                  </div>
                </div>
                <div
                  className="library-tabs"
                  role="tablist"
                  aria-label="Történetek forrása"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={library === "drafts"}
                    onClick={() => {
                      setLibrary("drafts");
                      setSelection([]);
                    }}
                  >
                    Helyi vázlatok{" "}
                    <span className="pill">{workspace.drafts.length}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={library === "published"}
                    onClick={() => {
                      setLibrary("published");
                      setSelection([]);
                    }}
                  >
                    Nyilvános a buildben{" "}
                    <span className="pill">{posts.length}</span>
                  </button>
                </div>
                <div className="library-tools">
                  <div className="search-field">
                    <Icon name="search" />
                    <input
                      aria-label="Történetek keresése"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Keress címben, kivonatban vagy címkében…"
                    />
                  </div>
                  {library === "drafts" && (
                    <select
                      aria-label="Vázlat állapota"
                      className="field-select"
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setSelection([]);
                      }}
                    >
                      <option value="all">Minden állapot</option>
                      <option value="draft">Vázlat</option>
                      <option value="review">Ellenőrzésre kész</option>
                      <option value="archived">Archivált</option>
                    </select>
                  )}
                  <select
                    aria-label="Történetek rendezése"
                    className="field-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="updated">Utoljára módosítva</option>
                    <option value="created">Létrehozás szerint</option>
                    <option value="title">Cím szerint A–Z</option>
                  </select>
                </div>
                {library === "drafts" ? (
                  <>
                    {selection.length > 0 && (
                      <div className="bulk-actions">
                        <strong>{selection.length} kijelölve</strong>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelection([])}
                        >
                          Minden kijelölés törlése
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => deleteDrafts(selection)}
                        >
                          Kijelöltek törlése
                        </button>
                      </div>
                    )}
                    {filtered.length ? (
                      <div className="content-table">
                        <div className="content-table-header">
                          <input
                            type="checkbox"
                            aria-label="Minden látható vázlat kijelölése"
                            checked={filtered.every((d) =>
                              selection.includes(d.id),
                            )}
                            onChange={(e) =>
                              setSelection(
                                e.target.checked
                                  ? filtered.map((d) => d.id)
                                  : [],
                              )
                            }
                          />
                          <span>{filtered.length} vázlat</span>
                          <span style={{ marginLeft: "auto" }}>
                            A címre kattintva folytathatod az írást.
                          </span>
                        </div>
                        {filtered.map((d) => row(d, true))}
                      </div>
                    ) : (
                      empty
                    )}
                  </>
                ) : (
                  <>
                    <div className="notice">
                      <Icon name="info" />
                      <p>
                        Ezek a jelenlegi statikus buildben megjelent cikkek. Itt
                        nem írjuk felül őket helyi vázlattal. A forrásukat a
                        repository <code>src/content/posts</code> mappájában
                        szerkesztheted, pull requesten keresztül.
                      </p>
                    </div>
                    <div className="content-table">
                      {posts
                        .filter((p) =>
                          normalizeSearch(`${p.title} ${p.excerpt}`).includes(
                            normalizeSearch(query),
                          ),
                        )
                        .sort((a, b) =>
                          sort === "title"
                            ? a.title.localeCompare(b.title, "hu")
                            : b.date.localeCompare(a.date),
                        )
                        .map((p) => (
                          <div className="draft-row" key={p.id}>
                            {p.image && (
                              <img
                                className="draft-row-image"
                                src={p.image.src}
                                alt=""
                              />
                            )}
                            <div className="row-main">
                              <h3>{p.title}</h3>
                              <div className="row-meta">
                                {p.author} ·{" "}
                                {new Date(p.date).toLocaleDateString("hu-HU")} ·{" "}
                                {p.category}
                              </div>
                            </div>
                            <span className="pill">Nyilvános</span>
                            <a
                              className="icon-btn"
                              aria-label={`${p.title} megnyitása`}
                              href={`/posts/${p.slug}/`}
                              target="_blank"
                              rel="noopener"
                            >
                              <Icon name="external" size={16} />
                            </a>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </>
            ) : section === "media" ? (
              <MediaLibrary
                assets={assets}
                urls={urls}
                onUpload={upload}
                onUpdate={updateMedia}
                onDelete={removeMedia}
                onInsert={mediaFromEditor && active ? insertMedia : undefined}
                onHero={
                  mediaFromEditor && active
                    ? (a) => {
                        patchActive({ heroImage: a });
                        setSection("editor");
                        setMediaFromEditor(false);
                        notify("Borítókép beállítva.");
                      }
                    : undefined
                }
                onClose={
                  mediaFromEditor && active
                    ? () => {
                        setSection("editor");
                        setMediaFromEditor(false);
                      }
                    : undefined
                }
              />
            ) : section === "themes" ? (
              <ThemeExplorer
                current={workspace.appearance.themeKey}
                onApply={applyTheme}
              />
            ) : (
              <>
                <div className="workspace-heading">
                  <div>
                    <span className="eyebrow">A SAJÁT TARTALMAD OTTHONA</span>
                    <h1>Beállítások.</h1>
                    <p>
                      Átlátható kapcsolat a böngésződ, a repository és a
                      nyilvános oldal között.
                    </p>
                  </div>
                </div>
                <div className="settings-layout">
                  <section className="card-panel settings-form">
                    <h2>A magazin névjegye.</h2>
                    <p className="form-hint" style={{ marginBottom: 22 }}>
                      A mezők a konfigurációs fájl exportját készítik elő. Az
                      éles oldal nem változik meg ettől.
                    </p>
                    {settingsError && (
                      <p role="alert" className="field-error">
                        {settingsError}
                      </p>
                    )}
                    <div className="field-row">
                      <label className="form-label">
                        Magazin neve
                        <input
                          className="form-input"
                          maxLength={60}
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                        />
                      </label>
                      <label className="form-label">
                        Éles HTTPS-domain
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://sajat-domain.hu"
                          value={configDomain}
                          onChange={(e) => setConfigDomain(e.target.value)}
                        />
                      </label>
                    </div>
                    <label className="form-label" style={{ marginTop: 18 }}>
                      Kiválasztott téma
                      <select
                        className="form-input"
                        value={workspace.appearance.themeKey}
                        onChange={(e) =>
                          applyTheme(e.target.value, workspace.appearance.mode)
                        }
                      >
                        {themeRegistry.map((t) => (
                          <option key={t.key} value={t.key}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: 20 }}
                      onClick={() => {
                        setSettingsError("");
                        try {
                          if (!configName.trim())
                            throw new Error("A magazin neve nem lehet üres.");
                          const domain = new URL(configDomain);
                          if (
                            domain.protocol !== "https:" ||
                            domain.pathname !== "/" ||
                            domain.search ||
                            domain.hash ||
                            domain.username ||
                            domain.password ||
                            /(^|\.)(example\.(com|net|org)|localhost)$/.test(
                              domain.hostname,
                            ) ||
                            domain.hostname === "127.0.0.1"
                          )
                            throw new Error(
                              "Valódi HTTPS-origin szükséges, útvonal és paraméterek nélkül.",
                            );
                          const next = {
                            ...instanceConfig,
                            name: configName.trim(),
                            siteUrl: domain.origin,
                            theme: workspace.appearance.themeKey,
                            defaultMode: workspace.appearance.mode,
                            seo: {
                              ...(instanceConfig.seo as object),
                              defaultTitleTemplate: `%s · ${configName.trim()}`,
                            },
                            legal: {
                              ...(instanceConfig.legal as object),
                              copyrightHolder: configName.trim(),
                            },
                          };
                          InstanceConfigSchema.parse(next);
                          download(
                            JSON.stringify(next, null, 2),
                            "site.json",
                            "application/json",
                          );
                          notify(
                            "site.json exportálva. Helye: src/config/site.json. Ellenőrizd a márka- és jogi adatokat, majd telepítsd.",
                          );
                        } catch (e) {
                          setSettingsError(
                            e instanceof Error
                              ? e.message
                              : "Hibás konfiguráció.",
                          );
                        }
                      }}
                    >
                      <Icon name="download" />
                      site.json exportálása
                    </button>
                    <div className="notice" style={{ marginTop: 20 }}>
                      <Icon name="info" />
                      <p>
                        A jogi tájékoztatók és a bemutatótartalom nem válnak
                        automatikusan éles anyaggá. Publikálás előtt cseréld
                        őket saját, ellenőrzött tartalomra.
                      </p>
                    </div>
                  </section>
                  <section className="card-panel">
                    <h2>GitHub-kapcsolat.</h2>
                    <p className="form-hint" style={{ marginBlock: 14 }}>
                      {gitLoading
                        ? "Kapcsolat ellenőrzése…"
                        : session.authenticated
                          ? `${session.login} · ${session.repository}`
                          : session.configured
                            ? "A szerver beállítva. Bejelentkezés szükséges."
                            : "Nincs konfigurált Git-kapcsolat. A helyi írás és a ZIP-export ettől még használható."}
                    </p>
                    {gitError && <p className="field-error">{gitError}</p>}
                    {session.configured && !session.authenticated && (
                      <a
                        className="btn btn-primary"
                        href="/api/creator?action=login"
                      >
                        <Icon name="github" />
                        GitHub-bejelentkezés
                      </a>
                    )}
                    {session.authenticated && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={async () => {
                          try {
                            const r = await fetch(
                              "/api/creator?action=logout",
                              {
                                method: "POST",
                                headers: {
                                  "X-CSRF-Token": session.csrf || "",
                                  "Content-Type": "application/json",
                                },
                                body: "{}",
                              },
                            );
                            if (!r.ok)
                              throw new Error("A kijelentkezés nem sikerült.");
                            await loadSession();
                            notify("GitHub-munkamenet lezárva.");
                          } catch (e) {
                            notify(e instanceof Error ? e.message : "Hiba.");
                          }
                        }}
                      >
                        Kijelentkezés
                      </button>
                    )}
                    <p className="form-hint" style={{ marginTop: 18 }}>
                      Beállítási útmutató a projektben:{" "}
                      <code>docs/GITHUB_SETUP.md</code>. Titkos kulcsot soha ne
                      írj a frontendbe vagy a site.json fájlba.
                    </p>
                  </section>
                  <section className="card-panel">
                    <h2>Biztonsági mentés.</h2>
                    <p className="form-hint" style={{ marginBlock: 15 }}>
                      A böngésző adatainak törlése a helyi vázlatokat és képeket
                      is törli. A JSON-mentés a feltöltött képeket is
                      tartalmazza. Az import meglévő vázlatot nem ír felül.
                    </p>
                    <div
                      className="inline-stack"
                      style={{ gap: 10, flexWrap: "wrap" }}
                    >
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={busy}
                        onClick={() => void backup()}
                      >
                        <Icon name="download" />
                        Teljes helyi mentés
                      </button>
                      <button
                        className="btn btn-outline"
                        type="button"
                        disabled={busy}
                        onClick={() => restoreFile.current?.click()}
                      >
                        <Icon name="upload" />
                        Mentés visszaolvasása
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-link"
                      style={{ marginTop: 20, fontSize: 11 }}
                      onClick={() => {
                        try {
                          download(
                            JSON.stringify(
                              {
                                current: localStorage.getItem(STORAGE_KEY),
                                legacy:
                                  localStorage.getItem("forge-local-drafts"),
                              },
                              null,
                              2,
                            ),
                            "forgeblog-raw-recovery.json",
                            "application/json",
                          );
                          notify(
                            "Nyers helyreállítási adatok exportálva. Ne oszd meg nyilvánosan.",
                          );
                        } catch {
                          notify(
                            "A böngésző nem enged hozzáférést a helyi tárolóhoz.",
                          );
                        }
                      }}
                    >
                      Nyers tároló exportálása hiba esetére
                    </button>
                  </section>
                </div>
              </>
            )}
          </main>
        )}
      </div>
      {mediaFromEditor && section === "editor" && active && (
        <Modal
          title="Média beszúrása"
          wide
          onClose={() => setMediaFromEditor(false)}
        >
          <MediaLibrary
            assets={assets}
            urls={urls}
            onUpload={upload}
            onUpdate={updateMedia}
            onDelete={removeMedia}
            onInsert={insertMedia}
            onHero={(a) => {
              patchActive({ heroImage: a });
              setMediaFromEditor(false);
              notify("Borítókép beállítva.");
            }}
          />
        </Modal>
      )}
      {modal === "new" && (
        <Modal
          title="Milyen történetet írnál?"
          onClose={() => setModal(null)}
          wide
        >
          <p className="form-hint" style={{ marginBottom: 20 }}>
            Csak a kezdőpontot választod ki. Minden részletet a sajátodra
            alakíthatsz.
          </p>
          <div className="template-grid">
            {(
              [
                [
                  "blank",
                  "file",
                  "Üres lap",
                  "Tiszta vászon a saját gondolataidhoz.",
                ],
                [
                  "story",
                  "leaf",
                  "Személyes történet",
                  "Bevezetés, címsorok, kiemelt gondolat.",
                ],
                [
                  "guide",
                  "list",
                  "Útmutató",
                  "Lépések, lista és egy jó összegzés.",
                ],
              ] as const
            ).map(([id, icon, title, desc]) => (
              <button
                className="template-card"
                type="button"
                key={id}
                onClick={() => create(id)}
              >
                <Icon name={icon} />
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="text-link">
                  Ezzel kezdek
                  <Icon name="arrow" size={15} />
                </span>
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal === "git" && active && (
        <Modal
          title="A vázlattól a nyilvános cikkig."
          onClose={() => !busy && setModal(null)}
          wide
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => setModal(null)}
              >
                Vissza az íráshoz
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={busy}
                onClick={() => void exportDraft()}
              >
                <Icon name="download" />
                Vázlat ZIP-exportja
              </button>
              {session.authenticated && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={() => void gitSave(false)}
                  >
                    Git-vázlat mentése
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() => void gitSave(true)}
                  >
                    Publikálási PR létrehozása
                  </button>
                </>
              )}
            </>
          }
        >
          <div className="notice">
            <Icon name="branch" />
            <p>
              A Git-mentés külön ágat készít. A publikálási pull request{" "}
              <strong>nem</strong> publikál automatikusan: előbb ellenőrzés,
              összevonás és sikeres Vercel-build szükséges.
            </p>
          </div>
          {gitLoading ? (
            <p role="status">Git-kapcsolat ellenőrzése…</p>
          ) : !session.configured ? (
            <>
              <h3 style={{ fontSize: 25, marginBlock: 16 }}>
                Előbb kösd össze a repositoryval.
              </h3>
              <p className="form-hint">
                Állítsd be a szerveroldali GitHub App/OAuth kapcsolatot a{" "}
                <code>docs/GITHUB_SETUP.md</code> szerint. Addig a ZIP-export
                teljes értékű, ellenőrizhető átadási útvonal.
              </p>
            </>
          ) : !session.authenticated ? (
            <a className="btn btn-primary" href="/api/creator?action=login">
              <Icon name="github" />
              GitHub-bejelentkezés
            </a>
          ) : (
            <p className="form-hint">
              Cél-repository: <strong>{session.repository}</strong> ·
              Bejelentkezve: {session.login}
            </p>
          )}
          {gitError && (
            <div
              className="notice notice-error"
              role="alert"
              style={{ marginTop: 16 }}
            >
              {gitError}
            </div>
          )}
          {active.git && (
            <div className="notice" style={{ marginTop: 16 }}>
              <div>
                <strong>Valódi Git-mentés elérhető.</strong>
                <p>
                  <a
                    className="text-link"
                    href={active.git.url}
                    target="_blank"
                    rel="noopener"
                  >
                    Commit megnyitása
                    <Icon name="external" size={14} />
                  </a>
                </p>
                {active.git.prUrl && (
                  <p>
                    <a
                      className="text-link"
                      href={active.git.prUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Pull request ellenőrzése
                      <Icon name="external" size={14} />
                    </a>
                  </p>
                )}
                <p className="form-hint">
                  A sikeres commit nem bizonyítja az éles deployment sikerét.
                </p>
              </div>
            </div>
          )}
          <h3 style={{ fontSize: 25, marginTop: 22 }}>
            Publikálási ellenőrzés
          </h3>
          {publishErrors(
            active,
            posts.map((p) => p.slug),
          ).length ? (
            <ul className="checklist">
              {publishErrors(
                active,
                posts.map((p) => p.slug),
              ).map((e) => (
                <li key={e}>
                  <Icon name="warning" />
                  {e}
                </li>
              ))}
            </ul>
          ) : (
            <p className="form-hint">
              A helyi tartalomellenőrzés nem talált hibát. A repository
              CI-ellenőrzése és az éles telepítés ettől még szükséges.
            </p>
          )}
          {busy && (
            <p role="status" className="form-hint">
              Művelet folyamatban. Ne zárd be az ablakot.
            </p>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="info" size={17} />
          <span>{toast}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Értesítés bezárása"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function WorkspaceApp(
  props: Parameters<typeof WorkspaceAppInner>[0],
) {
  return (
    <ErrorBoundary>
      <WorkspaceAppInner {...props} />
    </ErrorBoundary>
  );
}
