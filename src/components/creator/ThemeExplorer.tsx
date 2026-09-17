import { useState } from "react";
import { themeRegistry } from "../../themes/registry";
import { Icon } from "../ui/Icon";
export function ThemeExplorer({
  current,
  onApply,
}: {
  current: string;
  onApply: (key: string, mode: "light" | "dark") => void;
}) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Összes"),
    [mode, setMode] = useState<"light" | "dark">("light");
  const categories = [
    "Összes",
    ...new Set(themeRegistry.map((t) => t.category)),
  ];
  const themes = themeRegistry.filter(
    (t) =>
      (filter === "Összes" || t.category === filter) &&
      `${t.name} ${t.summary} ${t.idealFor}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">A TARTALMADNAK SAJÁT KARAKTERE VAN</span>
          <h1>Egy másik nézőpont.</h1>
          <p>
            {themeRegistry.length} téma · 6 elrendezéscsalád · ugyanaz a
            tartalom, más ritmus.
          </p>
        </div>
        <div className="device-switch">
          <button
            type="button"
            aria-label="Világos témaelőnézet"
            aria-pressed={mode === "light"}
            onClick={() => setMode("light")}
          >
            <Icon name="sun" />
          </button>
          <button
            type="button"
            aria-label="Sötét témaelőnézet"
            aria-pressed={mode === "dark"}
            onClick={() => setMode("dark")}
          >
            <Icon name="moon" />
          </button>
        </div>
      </div>
      <div className="notice">
        <Icon name="info" />
        <p>
          A „Kipróbálom” csak ebben a böngészőben módosítja a nyilvános oldal
          megjelenését. Az éles témához exportáld a beállításfájlt a Beállítások
          oldalon, majd ellenőrizd és telepítsd a változást.
        </p>
      </div>
      <div className="library-tools">
        <div className="search-field">
          <Icon name="search" />
          <input
            aria-label="Témák keresése"
            placeholder="Keress hangulatot, stílust, témát…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="theme-filter" aria-label="Témakategóriák">
        {categories.map((c) => (
          <button
            type="button"
            key={c}
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
          >
            {({Összes:'Összes',minimal:'Letisztult',future:'Digitális',lifestyle:'Életmód',professional:'Szakmai',creative:'Kreatív',retro:'Retró'} as Record<string,string>)[c]||c}
          </button>
        ))}
      </div>
      <p className="form-hint" role="status" style={{ marginBottom: 16 }}>
        {themes.length} megjelenés
      </p>
      <div className="theme-grid">
        {themes.map((t) => (
          <article
            className={`theme-card ${current === t.key ? "current" : ""}`}
            key={t.key}
          >
            <div
              className="theme-preview"
              data-theme={t.key}
              data-mode={mode}
              data-layout={t.layoutVariant}
            >
              <div className="mini-site">
                <div className="mini-nav">
                  <span>ForgeBlog</span>
                  <span>Journal &nbsp; About</span>
                </div>
                <div className="mini-content">
                  <div>
                    <span className="mini-eyebrow">EGY MÁSIK NÉZŐPONT</span>
                    <h3>
                      Stories worth
                      <br />
                      slowing down for.
                    </h3>
                    <div className="mini-lines">
                      <i />
                      <i />
                    </div>
                    <span className="mini-button">Explore the journal</span>
                  </div>
                  <img src={t.preview.image} alt="" loading="lazy" />
                </div>
                <div className="mini-cards">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <div className="theme-card-info">
              <div className="theme-card-title">
                <h2>{t.name}</h2>
                {current === t.key && (
                  <span className="pill">
                    <Icon name="check" size={12} /> Aktív
                  </span>
                )}
              </div>
              <p>{t.summary}</p>
              <div className="theme-card-footer">
                <span className="theme-swatches">
                  {t.preview.accentSwatches.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => onApply(t.key, mode)}
                >
                  {current === t.key ? "Nézet frissítése" : "Kipróbálom"}
                  <Icon name="arrow" size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {themes.length === 0 && (
        <div className="empty-state">
          <Icon name="search" />
          <h2>Nincs ilyen téma.</h2>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setQuery("");
              setFilter("Összes");
            }}
          >
            Szűrők törlése
          </button>
        </div>
      )}
    </>
  );
}
