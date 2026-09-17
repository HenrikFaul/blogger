import { useCallback, useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { Icon } from "../../ui/Icon";
import { BlockEditor } from "./BlockEditor";
import { MetadataInspector, type Option } from "./MetadataInspector";
import { DocumentPreview, imageSrc, type AssetUrls } from "./DocumentPreview";
import { slugify } from "../../../lib/safety";
import {
  publishErrors,
  type Draft,
  type DocNode,
  type Snapshot,
} from "../../../lib/creator/model";
export function DraftEditor({
  draft,
  authors,
  categories,
  urls,
  saveState,
  onPatch,
  onSave,
  onBack,
  onMedia,
  onExport,
  onGit,
  onRestore,
  onEditorReady,
  usedSlugs,
}: {
  draft: Draft;
  authors: Option[];
  categories: Option[];
  urls: AssetUrls;
  saveState: string;
  onPatch: (p: Partial<Draft>) => void;
  onSave: () => void;
  onBack: () => void;
  onMedia: () => void;
  onExport: () => void;
  onGit: () => void;
  onRestore: (h: Snapshot) => void;
  onEditorReady: (e: Editor | null) => void;
  usedSlugs: string[];
}) {
  const [mode, setMode] = useState<"write" | "split" | "preview">("write"),
    [device, setDevice] = useState<"monitor" | "tablet" | "phone">("monitor"),
    [mobile, setMobile] = useState("write"),
    [validation, setValidation] = useState(false);
  const changed = useCallback(
    (d: DocNode) => onPatch({ document: d }),
    [onPatch],
  );
  const errors = validation ? publishErrors(draft, usedSlugs) : [];
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const size = () => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [draft.title]);
  const preview = (
    <section className="preview-panel" aria-label="Élő cikkelőnézet">
      <div className="preview-panel-head">
        <span>Élő előnézet · még nem nyilvános</span>
        <div className="device-switch">
          {(["monitor", "tablet", "phone"] as const).map((d) => (
            <button
              type="button"
              key={d}
              aria-label={
                d === "monitor"
                  ? "Asztali előnézet"
                  : d === "tablet"
                    ? "Tablet előnézet"
                    : "Mobil előnézet"
              }
              aria-pressed={device === d}
              onClick={() => setDevice(d)}
            >
              <Icon name={d} size={15} />
            </button>
          ))}
        </div>
      </div>
      <div className="preview-scroll">
        <article className="live-preview" data-device={device}>
          <div className="eyebrow">
            {categories
              .filter((c) => draft.categories.includes(c.id))
              .map((c) => c.name)
              .join(" · ")}
          </div>
          <h1>{draft.title || "Egy jó történet itt kezdődik."}</h1>
          <p className="preview-excerpt">{draft.excerpt}</p>
          <div className="byline">
            <img
              className="avatar"
              src={
                authors.find((a) => a.id === draft.author)?.avatar ||
                "/media/nora.svg"
              }
              alt=""
            />
            <span>{authors.find((a) => a.id === draft.author)?.name}</span>
            <span>·</span>
            <span>Helyi vázlat</span>
          </div>
          {draft.heroImage && draft.heroTreatment !== "hidden" && (
            <img
              className="preview-hero"
              src={imageSrc(draft.heroImage, urls)}
              alt={draft.heroImage.decorative ? "" : draft.heroImage.alt}
            />
          )}
          <DocumentPreview document={draft.document} urls={urls} />
        </article>
      </div>
    </section>
  );
  return (
    <main id="workspace-content" className="editor-shell">
      <h1 className="sr-only">Történet szerkesztése</h1>
      <div className="editor-topbar">
        <button
          type="button"
          className="text-link"
          onClick={onBack}
          style={{ fontSize: 11 }}
        >
          <Icon name="arrow-left" size={15} />
          Történeteim
        </button>
        <span
          className="save-state"
          data-state={
            saveState === "error"
              ? "error"
              : saveState === "saved"
                ? "saved"
                : "pending"
          }
        >
          <Icon
            name={
              saveState === "saved"
                ? "check"
                : saveState === "error"
                  ? "warning"
                  : "clock"
            }
            size={14}
          />
          {saveState === "saved"
            ? "Böngészőben mentve"
            : saveState === "error"
              ? "Mentési probléma"
              : "Mentés folyamatban…"}
        </span>
        <div className="editor-toolbar-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setMode(mode === "split" ? "write" : "split")}
            aria-pressed={mode === "split"}
          >
            <Icon name="grid" />
            Osztott
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setMode(mode === "preview" ? "write" : "preview")}
            aria-pressed={mode === "preview"}
          >
            <Icon name="eye" />
            Előnézet
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onExport}
          >
            <Icon name="download" />
            Export
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onSave}
          >
            <Icon name="save" />
            Mentés
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setValidation(true);
              onGit();
            }}
          >
            <Icon name="branch" />
            Git / publikálás
          </button>
        </div>
      </div>
      <div className="publishing-steps">
        {[
          ["1", "Helyi vázlat", "Csak ebben a böngészőben"],
          ["2", "Git-mentés", "Külön munkaverzió"],
          ["3", "Ellenőrzés", "Pull request és preview"],
          ["4", "Éles oldal", "Összevonás + sikeres build"],
        ].map(([n, title, sub]) => (
          <div
            className={`publishing-step ${Number(n) <= (draft.git ? 2 : 1) ? "active" : ""}`}
            key={n}
          >
            <span className="step-number">{n}</span>
            <span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </span>
          </div>
        ))}
      </div>
      {errors.length > 0 && (
        <div className="notice notice-error editor-validation" role="alert">
          <div>
            <strong>A publikálás előtt még szükséges:</strong>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div
        className="mobile-editor-tabs"
        role="tablist"
        aria-label="Szerkesztőnézet"
      >
        {[
          ["write", "Írás"],
          ["metadata", "Beállítások"],
          ["preview", "Előnézet"],
        ].map(([id, label]) => (
          <button
            type="button"
            role="tab"
            key={id}
            aria-selected={mobile === id}
            onClick={() => {
              setMobile(id);
              setMode("write");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "preview" && <div className="preview-full">{preview}</div>}
      <div
        hidden={mode === "preview"}
        className={`editor-grid ${mode === "split" ? "split" : ""}`}
        data-mobile-panel={mobile}
      >
        <section className="writing-panel" aria-label="Cikk szerkesztése">
          <div className="editor-title-section">
            <label className="form-label" htmlFor="draft-title">
              A TÖRTÉNETED
            </label>
            <textarea
              ref={titleRef}
              id="draft-title"
              className="title-input"
              placeholder="Adj egy jó címet…"
              value={draft.title}
              maxLength={100}
              rows={1}
              onChange={(e) => {
                const title = e.target.value.replace(/\n/g, "");
                onPatch({
                  title,
                  ...(!draft.slugEdited
                    ? { slug: slugify(title).slice(0, 100) }
                    : {}),
                });
              }}
            />
            <div className="editor-url">
              <Icon name="link" size={12} />
              /posts/{draft.slug || "a-torteneted-cime"}/
            </div>
          </div>
          <BlockEditor
            document={draft.document}
            onChange={changed}
            onReady={onEditorReady}
            onMedia={onMedia}
            urls={urls}
          />
        </section>
        {(mode === "split" || mobile === "preview") && preview}
        <MetadataInspector
          draft={draft}
          onPatch={onPatch}
          onMedia={onMedia}
          onRestore={onRestore}
          authors={authors}
          categories={categories}
          urls={urls}
        />
      </div>
    </main>
  );
}
