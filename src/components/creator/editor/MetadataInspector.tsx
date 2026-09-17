import { useState } from "react";
import { Icon } from "../../ui/Icon";
import { textOf, type Draft, type Snapshot } from "../../../lib/creator/model";
import { imageSrc, type AssetUrls } from "./DocumentPreview";
export type Option = { id: string; name: string; avatar?: string };
export function MetadataInspector({
  draft,
  onPatch,
  onMedia,
  onRestore,
  authors,
  categories,
  urls,
}: {
  draft: Draft;
  onPatch: (p: Partial<Draft>) => void;
  onMedia: () => void;
  onRestore: (h: Snapshot) => void;
  authors: Option[];
  categories: Option[];
  urls: AssetUrls;
}) {
  const [tab, setTab] = useState("article");
  const field = (
    label: string,
    key: "slug" | "excerpt",
    max: number,
    multiline = false,
  ) => (
    <div>
      <label className="form-label" htmlFor={`meta-${key}`}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={`meta-${key}`}
          className="form-input"
          maxLength={max}
          value={draft[key]}
          onChange={(e) => onPatch({ [key]: e.target.value })}
        />
      ) : (
        <input
          id={`meta-${key}`}
          className="form-input"
          maxLength={max}
          value={draft[key]}
          onChange={(e) =>
            onPatch({
              [key]: e.target.value,
              ...(key === "slug" ? { slugEdited: true } : {}),
            })
          }
        />
      )}
      <div className="input-counter">
        {draft[key].length} / {max}
      </div>
    </div>
  );
  const localDate = (iso: string) => {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  return (
    <aside className="metadata-panel" aria-label="Cikkbeállítások">
      <div
        className="metadata-tabs"
        role="tablist"
        aria-label="Beállítások típusa"
      >
        {[
          ["article", "Cikk"],
          ["seo", "SEO"],
          ["history", "Verziók"],
        ].map(([key, label]) => (
          <button
            type="button"
            role="tab"
            key={key}
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="metadata-body" role="tabpanel">
        {tab === "article" ? (
          <>
            {field("URL-részlet", "slug", 100)}
            <div>
              <label className="form-label" htmlFor="meta-author">
                Szerző
              </label>
              <select
                id="meta-author"
                className="form-input"
                value={draft.author}
                onChange={(e) => onPatch({ author: e.target.value })}
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            {field("Rövid kivonat", "excerpt", 300, true)}
            <fieldset>
              <legend className="form-label">Témák</legend>
              <div className="checkbox-group">
                {categories.map((c) => (
                  <label key={c.id} className="form-check">
                    <input
                      type="checkbox"
                      checked={draft.categories.includes(c.id)}
                      onChange={(e) =>
                        onPatch({
                          categories: e.target.checked
                            ? [...draft.categories, c.id]
                            : draft.categories.filter((id) => id !== c.id),
                        })
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label className="form-label" htmlFor="meta-tags">
                Címkék
              </label>
              <input
                id="meta-tags"
                className="form-input"
                maxLength={400}
                value={draft.tags.join(", ")}
                onChange={(e) =>
                  onPatch({
                    tags: e.target.value
                      .split(",")
                      .map((v) => v.trimStart())
                      .slice(0, 15),
                  })
                }
                onBlur={() =>
                  onPatch({
                    tags: [
                      ...new Set(
                        draft.tags.map((v) => v.trim()).filter(Boolean),
                      ),
                    ],
                  })
                }
              />
              <p className="form-hint">
                Vesszővel elválasztva. A meglévő téma nem ugyanaz, mint egy
                szabad címke.
              </p>
            </div>
            <div>
              <span className="form-label">
                Borítókép <span className="optional">(nem kötelező)</span>
              </span>
              {draft.heroImage ? (
                <>
                  <div className="cover-preview">
                    <img
                      src={imageSrc(draft.heroImage, urls)}
                      alt={
                        draft.heroImage.decorative ? "" : draft.heroImage.alt
                      }
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Borítókép eltávolítása"
                      onClick={() => onPatch({ heroImage: undefined })}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-link"
                    style={{ fontSize: 11, marginTop: 8 }}
                    onClick={onMedia}
                  >
                    Másik kép választása
                  </button>
                  <label className="form-label" style={{ marginTop: 12 }}>
                    Alternatív szöveg
                    <input
                      className="form-input"
                      value={draft.heroImage.alt}
                      maxLength={400}
                      disabled={draft.heroImage.decorative}
                      onChange={(e) =>
                        onPatch({
                          heroImage: {
                            ...draft.heroImage!,
                            alt: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={draft.heroImage.decorative}
                      onChange={(e) =>
                        onPatch({
                          heroImage: {
                            ...draft.heroImage!,
                            decorative: e.target.checked,
                          },
                        })
                      }
                    />
                    Dekoratív borítókép
                  </label>
                </>
              ) : (
                <button
                  type="button"
                  className="cover-picker"
                  onClick={onMedia}
                >
                  <Icon name="image" />
                  Válassz borítóképet
                </button>
              )}
            </div>
            <details className="metadata-details">
              <summary>Megjelenés és állapot</summary>
              <div>
                <label className="form-label">
                  Szerkesztési állapot
                  <select
                    className="form-input"
                    value={draft.status}
                    onChange={(e) =>
                      onPatch({ status: e.target.value as Draft["status"] })
                    }
                  >
                    <option value="draft">Vázlat</option>
                    <option value="review">Ellenőrzésre kész</option>
                    <option value="archived">Archivált helyi vázlat</option>
                  </select>
                </label>
                <label className="form-label">
                  Tervezett megjelenés
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={localDate(draft.publishedAt)}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      onPatch({
                        publishedAt: Number.isFinite(date.getTime())
                          ? date.toISOString()
                          : "",
                      });
                    }}
                  />
                </label>
                <p className="form-hint">
                  A géped helyi időzónája. A mentett időpont UTC. Jövőbeli cikk
                  csak az időpont után készült új buildben válik nyilvánossá;
                  nincs háttérben futó automatikus ütemezés.
                </p>
                <label className="form-label">
                  Borító elrendezése
                  <select
                    className="form-input"
                    value={draft.heroTreatment}
                    onChange={(e) =>
                      onPatch({
                        heroTreatment: e.target.value as Draft["heroTreatment"],
                      })
                    }
                  >
                    <option value="standard">Normál</option>
                    <option value="split">Osztott</option>
                    <option value="full-bleed">Széles</option>
                    <option value="hidden">Rejtett</option>
                  </select>
                </label>
              </div>
            </details>
            <details className="metadata-details">
              <summary>Tartalomjegyzék</summary>
              <div>
                <ul className="outline-list">
                  {draft.document.content
                    ?.filter((n) => n.type === "heading")
                    .map((n, i) => (
                      <li key={i}>{textOf(n)}</li>
                    ))}
                </ul>
                <p className="form-hint">A cikk valódi címsoraiból készül.</p>
              </div>
            </details>
          </>
        ) : tab === "seo" ? (
          <>
            {[
              ["title", "Keresőcím", 60],
              ["description", "Keresőleírás", 160],
            ].map(([key, label, max]) => (
              <div key={key}>
                <label className="form-label" htmlFor={`seo-${key}`}>
                  {label}
                </label>
                <textarea
                  id={`seo-${key}`}
                  className="form-input"
                  maxLength={Number(max)}
                  value={draft.seo[key as "title" | "description"]}
                  onChange={(e) =>
                    onPatch({ seo: { ...draft.seo, [key]: e.target.value } })
                  }
                />
                <p className="input-counter">
                  {draft.seo[key as "title" | "description"].length} / {max}
                </p>
              </div>
            ))}
            <label className="form-check">
              <input
                type="checkbox"
                checked={draft.seo.noindex}
                onChange={(e) =>
                  onPatch({ seo: { ...draft.seo, noindex: e.target.checked } })
                }
              />
              A keresők ne indexeljék ezt a cikket.
            </label>
            <div className="seo-preview">
              <small>/posts/{draft.slug || "url-reszlet"}/</small>
              <strong>
                {draft.seo.title || draft.title || "A történet címe"}
              </strong>
              <p>
                {draft.seo.description ||
                  draft.excerpt ||
                  "A rövid leírás itt fog megjelenni."}
              </p>
            </div>
            <p className="form-hint">
              Szemléltető előnézet, nem ígéret a kereső találati oldalára. Az
              éles kanonikus domain a közös webhely-konfigurációból származik.
            </p>
          </>
        ) : (
          <>
            <div>
              <h3 style={{ fontSize: 23 }}>Megőrzött változatok.</h3>
              <p className="form-hint">
                A Mentés gomb ellenőrzőpontot is készít. Legfeljebb 20 pont /
                vázlat. A visszaállítás mindig új másolat, nem írja felül az
                aktuális munkát.
              </p>
            </div>
            {draft.history.length ? (
              draft.history.map((h) => (
                <div className="history-item" key={h.id}>
                  <strong>{h.label}</strong>
                  <p>{new Date(h.at).toLocaleString("hu-HU")}</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => onRestore(h)}
                  >
                    Visszaállítás másolatként
                  </button>
                </div>
              ))
            ) : (
              <p className="form-hint">Még nincs kézi ellenőrzőpont.</p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
