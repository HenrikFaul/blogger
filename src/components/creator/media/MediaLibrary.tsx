import { useRef, useState } from "react";
import { Icon } from "../../ui/Icon";
import { Modal } from "../Modal";
import {
  LAYOUTS,
  type GalleryLayout,
  type ImageAsset,
  type DocNode,
} from "../../../lib/creator/model";
import {
  ReactGallery,
  imageSrc,
  type AssetUrls,
} from "../editor/DocumentPreview";
const labels: Record<GalleryLayout, string> = {
  "editorial-grid": "Rács",
  masonry: "Mozaik",
  justified: "Sorok",
  carousel: "Lapozható",
  filmstrip: "Filmszalag",
  lightbox: "Kontaktlap",
  "full-bleed": "Teljes széles",
  comparison: "Előtte / utána",
  stacked: "Egymás alatt",
  mixed: "Vegyes média",
};
export function MediaLibrary({
  assets,
  urls,
  onUpload,
  onUpdate,
  onDelete,
  onInsert,
  onHero,
  onClose,
}: {
  assets: ImageAsset[];
  urls: AssetUrls;
  onUpload: (files: File[]) => Promise<void>;
  onUpdate: (a: ImageAsset) => Promise<void>;
  onDelete: (a: ImageAsset) => Promise<void>;
  onInsert?: (n: DocNode) => void;
  onHero?: (a: ImageAsset) => void;
  onClose?: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [layout, setLayout] = useState<GalleryLayout>("editorial-grid"),
    [columns, setColumns] = useState(3),
    [captions, setCaptions] = useState(true),
    [editing, setEditing] = useState<ImageAsset | null>(null),
    [busy, setBusy] = useState(false),
    [dragging, setDragging] = useState(false),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const picked = selected
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is ImageAsset => !!a);
  const shown = assets.filter(
    (a) =>
      (filter === "all" ||
        (filter === "own" && !a.demo) ||
        (filter === "demo" && a.demo) ||
        (filter === "alt" && !a.decorative && !a.alt.trim())) &&
      `${a.name} ${a.alt} ${a.caption}`
        .toLocaleLowerCase("hu-HU")
        .includes(query.toLocaleLowerCase("hu-HU")),
  );
  const upload = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      await onUpload(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feltöltési hiba.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const insert = () => {
    if (!picked.length) return;
    if (picked.some((a) => !a.decorative && !a.alt.trim())) {
      setError(
        "Adj alternatív szöveget minden kiválasztott képhez, vagy jelöld őket dekoratívnak.",
      );
      return;
    }
    if (layout === "comparison" && picked.length !== 2) {
      setError("Az összehasonlító nézethez pontosan 2 kép kell.");
      return;
    }
    if (picked.length === 1) {
      const a = picked[0];
      onInsert?.({
        type: "image",
        attrs: {
          src: a.src,
          alt: a.decorative ? "" : a.alt,
          decorative: a.decorative,
          width: a.width,
          height: a.height,
          caption: a.caption,
          credit: a.credit,
          asset: a,
        },
      });
    } else
      onInsert?.({
        type: "galleryBlock",
        attrs: { images: picked, layout, columns, showCaptions: captions },
      });
  };
  return (
    <>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">KÉPEK, AMELYEK MESÉLNEK</span>
          <h1>Médiatár.</h1>
          <p>
            {assets.length} kép · {assets.filter((a) => !a.demo).length} helyi
            feltöltés. A fájlok a böngésződben maradnak, amíg nem exportálod
            vagy Gitbe mented őket.
          </p>
        </div>
        {onClose && (
          <button type="button" className="btn btn-outline" onClick={onClose}>
            <Icon name="arrow-left" />
            Vissza a szerkesztőhöz
          </button>
        )}
      </div>
      <div className="media-layout">
        <div>
          <div
            className={`dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!busy) void upload(Array.from(e.dataTransfer.files));
            }}
          >
            <Icon name="upload" />
            <p>Húzd ide a képeidet, vagy válassz a gépedről.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              {busy ? "Képek ellenőrzése és mentése…" : "Képek feltöltése"}
            </button>
            <input
              ref={input}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => void upload(Array.from(e.target.files || []))}
            />
            <p>
              <small>
                JPEG, PNG, WebP, GIF · képenként legfeljebb 10 MB ·
                tartalomalapú duplikációszűrés
              </small>
            </p>
          </div>
          {error && (
            <div className="notice notice-error" role="alert">
              {error}
            </div>
          )}
          <div className="library-tools">
            <div className="search-field">
              <Icon name="search" />
              <input
                aria-label="Médiatár keresése"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Képnév, leírás vagy képaláírás…"
              />
            </div>
            <select
              className="field-select"
              aria-label="Média szűrése"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Minden kép</option>
              <option value="own">Saját feltöltések</option>
              <option value="demo">Bemutatóképek</option>
              <option value="alt">Hiányzó alternatív szöveg</option>
            </select>
          </div>
          <p className="form-hint" role="status" style={{ marginBottom: 14 }}>
            {shown.length} találat · {picked.length} kijelölve
          </p>
          <div className="media-grid">
            {shown.map((a) => (
              <article
                className={`media-card ${selected.includes(a.id) ? "selected" : ""}`}
                key={a.id}
              >
                <button
                  type="button"
                  className="media-select"
                  aria-pressed={selected.includes(a.id)}
                  aria-label={`${a.name} kijelölése`}
                  onClick={() =>
                    setSelected((s) =>
                      s.includes(a.id)
                        ? s.filter((v) => v !== a.id)
                        : s.length < 50
                          ? [...s, a.id]
                          : s,
                    )
                  }
                >
                  <img
                    src={imageSrc(a, urls)}
                    alt={a.decorative ? "" : a.alt}
                    loading="lazy"
                  />
                  <span className="selection-indicator">
                    {selected.includes(a.id) && <Icon name="check" size={14} />}
                  </span>
                </button>
                <div className="media-card-info">
                  <strong title={a.name}>{a.name}</strong>
                  <p>
                    {a.width} × {a.height} · {Math.round(a.size / 1024)} KB
                  </p>
                  <span className="pill">
                    {a.demo
                      ? "Bemutatókép"
                      : a.decorative
                        ? "Dekoratív"
                        : a.alt
                          ? "ALT rendben"
                          : "ALT szükséges"}
                  </span>
                  <div className="media-card-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setEditing({ ...a })}
                    >
                      Leírás / adatok
                    </button>
                    {!a.demo && (
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`${a.name} törlése`}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Törlöd ezt a képet? A cikkekben használt képet a rendszer nem engedi törölni.",
                            )
                          )
                            void onDelete(a).catch((e) => setError(e.message));
                        }}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {shown.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="image" size={24} />
              </div>
              <h2>Még nincs ilyen kép.</h2>
              <p>Tölts fel képeket, vagy töröld a szűrőt.</p>
            </div>
          )}
        </div>
        <aside className="gallery-builder">
          <h2>A történet képekben.</h2>
          <p>
            Válassz képeket, majd állítsd össze a galériát. A kiválasztás
            sorrendje az olvasási sorrend.
          </p>
          <div className="builder-title">
            <span>{picked.length} kiválasztott kép</span>
            <button type="button" onClick={() => setSelected([])}>
              Kijelölés törlése
            </button>
          </div>
          <div className="selected-media">
            {picked.map((a, i) => (
              <div className="selected-media-row" key={a.id}>
                <img src={imageSrc(a, urls)} alt="" />
                <strong>
                  {i + 1}. {a.name}
                </strong>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={`${a.name} előrébb`}
                  disabled={i === 0}
                  onClick={() =>
                    setSelected((s) => {
                      const n = [...s];
                      [n[i - 1], n[i]] = [n[i], n[i - 1]];
                      return n;
                    })
                  }
                >
                  <Icon name="arrow-up" />
                </button>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={`${a.name} hátrébb`}
                  disabled={i === picked.length - 1}
                  onClick={() =>
                    setSelected((s) => {
                      const n = [...s];
                      [n[i], n[i + 1]] = [n[i + 1], n[i]];
                      return n;
                    })
                  }
                >
                  <Icon name="arrow-down" />
                </button>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={`${a.name} kijelölésének törlése`}
                  onClick={() =>
                    setSelected((s) => s.filter((id) => id !== a.id))
                  }
                >
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
          <div className="builder-section">
            <div className="builder-title">Elrendezés</div>
            <div className="layout-grid">
              {LAYOUTS.map((l) => (
                <button
                  key={l}
                  type="button"
                  className="layout-choice"
                  aria-pressed={layout === l}
                  onClick={() => setLayout(l)}
                >
                  <Icon
                    name={
                      l === "masonry"
                        ? "image"
                        : l === "carousel"
                          ? "arrow"
                          : l === "comparison"
                            ? "copy"
                            : "grid"
                    }
                  />
                  {labels[l]}
                </button>
              ))}
            </div>
          </div>
          <div className="builder-section builder-options">
            <label className="form-label">
              Oszlopok
              <select
                className="form-input"
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="form-check">
              <input
                type="checkbox"
                checked={captions}
                onChange={(e) => setCaptions(e.target.checked)}
              />
              Képaláírások
            </label>
          </div>
          {picked.length > 0 && (
            <div className="builder-preview">
              <ReactGallery
                images={picked}
                urls={urls}
                layout={layout}
                columns={columns}
                showCaptions={captions}
              />
            </div>
          )}
          <div className="builder-section">
            {onInsert ? (
              <button
                className="btn btn-primary btn-block"
                type="button"
                disabled={!picked.length}
                onClick={insert}
              >
                <Icon name="plus" />
                {picked.length === 1 ? "Kép beszúrása" : "Galéria beszúrása"}
              </button>
            ) : (
              <p className="form-hint">
                A beszúráshoz előbb nyiss meg egy vázlatot, és ott válaszd a
                Médiatár gombot.
              </p>
            )}
            {onHero && (
              <button
                type="button"
                className="btn btn-outline btn-block"
                style={{ marginTop: 9 }}
                disabled={picked.length !== 1}
                onClick={() => {
                  const a = picked[0];
                  if (!a.decorative && !a.alt.trim()) {
                    setError("A borítóképnek először adj alternatív szöveget.");
                    return;
                  }
                  onHero(a);
                }}
              >
                Beállítás borítóképnek
              </button>
            )}
          </div>
        </aside>
      </div>
      {editing && (
        <Modal
          title="Kép adatai"
          onClose={() => setEditing(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditing(null)}
              >
                Mégse
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await onUpdate(editing);
                    setEditing(null);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Mentési hiba.");
                  }
                }}
              >
                Adatok mentése
              </button>
            </>
          }
        >
          <img
            src={imageSrc(editing, urls)}
            alt=""
            style={{
              maxHeight: 220,
              objectFit: "contain",
              width: "100%",
              borderRadius: 8,
              marginBottom: 20,
            }}
          />
          <label className="form-label" htmlFor="asset-alt">
            Alternatív szöveg
          </label>
          <input
            id="asset-alt"
            className="form-input"
            maxLength={400}
            disabled={editing.decorative}
            value={editing.alt}
            onChange={(e) => setEditing({ ...editing, alt: e.target.value })}
          />
          <p className="form-hint">
            Röviden mondd el, mit mutat a kép. A képernyőolvasót használó
            látogatóknak is legyen érthető.
          </p>
          <label className="form-check" style={{ marginTop: 15 }}>
            <input
              type="checkbox"
              checked={editing.decorative}
              onChange={(e) =>
                setEditing({ ...editing, decorative: e.target.checked })
              }
            />
            A kép kizárólag dekoráció, nincs tartalmi jelentése.
          </label>
          {[
            ["caption", "Képaláírás"],
            ["credit", "Forrás / alkotó / licenc"],
          ].map(([key, label]) => (
            <label className="form-label" style={{ marginTop: 18 }} key={key}>
              {label}
              <input
                className="form-input"
                maxLength={400}
                value={editing[key as "caption" | "credit"]}
                onChange={(e) =>
                  setEditing({ ...editing, [key]: e.target.value })
                }
              />
            </label>
          ))}
          {editing.demo && (
            <div className="notice" style={{ marginTop: 18 }}>
              Bemutatókép: a megadott adatok a böngésző helyi beállításai. Éles
              használat előtt ellenőrizd a kép felhasználási jogait.
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
