# ForgeBlog (folio.) — Teljes munkamenet-napló

> Rögzíti minden ebben a munkamenetben végrehajtott változtatást a `C:\Work\project4 blogspot` projekten.
> Dátum: 2026-09-17/18 · Agent: Cline · Repo: `github.com/HenrikFaul/blogger`

## Összefoglaló táblázat

| # | Commit | Tartalom |
|---|---|---|
| 1 | `99386f7` | 0.3.0 alap: (téves) marketing-landing + tesztjavítások, zöld verify |
| 2 | `2a87112` | Szerkesztőségi főoldal a Studio v2 szerint (folio.), illusztrációk, editorial tokenek |
| 3 | `5d3b292` | SEO/strukturált adatok, recipe+location séma, kódmásoló gomb |
| 4 | `cf34422` | Node ESM `.js` kiterjesztések + test loader mapping |
| 5 | `c84e3ec` | JSON import attribútum (TS1543) |
| 6 | `7742378` | `siteUrl` a site.json-ban (megbízható production domain) |
| 7 | `aedef09` | Helyes production domain: `blogger-nine-iota.vercel.app` |

---

## 1. Környezet helyreállítása (nem commitolt)

- **Probléma:** a projekt `node_modules`-a hiányos volt (csak 8 csomag), a natív binding-fájl le volt zárva.
- **Megoldás:** a node-folyamatok leállítása után `npm ci` → 455 csomag, kilépési kód 0.
- **Eredmény:** a korábban „blokkoltként" jelölt `astro build` sikeres lett (52 oldal).

## 2. Unit teszt hiba javítása (commit 1)

- `tests/update.test.mjs`: a Git-fixture repo rögzíti a sorvége-politikát (`core.autocrlf=false`, `core.eol=lf`), mert a globális `core.autocrlf=true` Windows alatt CRLF-re konvertálta a fájlokat, és a bájtszintű assert bukott.
- Eredmény: **92/92 unit teszt** sikeres.

## 3. Nyitóoldal: téves marketing-landing → szerkesztőségi folio. (commit 1–2)

- **Felismerés:** a `designplan.png`-ket a környezet nem tudta megjeleníteni (`[Unsupported Image]`), ezért az első változat (marketing: „Szebb módja a publikálásnak") téves feltételezésre épült.
- **Helyes forrás:** `C:\Work\materials\blogpost\ForgeBlog_Studio_v2\` — szöveges spec (`AI_HANDOFF.md`, `handoff/01-editorial-home.json`, `design-system/tokens.json/css`, `manifest.json`).
- **Megvalósítás:**
  - `src/pages/index.astro`: szerkesztőségi hero („A gondolatnak / tér kell."), absztrakt illusztráció, szerzői megjegyzés, cikkrács.
  - `src/config/site.json`: márka `folio.`, navigáció (Főoldal/Írások/Sorozatok/Rólam), hero-szöveg, `announcement`+`home` blokk.
  - `src/styles/themes/minimal-editorial.css`: Studio v2 tokenek (meleg papír `#F7F5EF`, erdőzöld `#294C3B`, tégla `#BB412B`, `EB Garamond`).
  - `public/media/illustrations/`: 6 SVG (abstract, botanical, architecture, landscape, food, tech) a Studio v2 `assets/`-ból.
  - Törölt 7 marketing-komponens (`HeroMosaic`, `FeaturedStories`, `CategoryExplorer`, `WorkspaceShowcase`, `GalleryBand`, `StatRow`, `CtaBand`).
  - `src/components/chrome/SiteFooter.astro`: tagline „Gondolatoknak teret adni."
  - `src/config/schema.ts`: `announcement` + `home` séma, teljes default objektummal.

## 4. SEO / strukturált adatok (commit 3)

- `src/components/seo/SeoHead.astro` újraírva típus-alapú sémagenerálásra:
  - `BlogPosting` (cikk), `WebSite` (oldal), **`Blog`** (főoldal), **`Person`** (szerző), **`BreadcrumbList`** (morzsa).
- `src/layouts/ArticleLayout.astro`: `breadcrumbs` számítás + átadás.
- `src/layouts/BaseLayout.astro` + `ArchiveLayout.astro`: új propok továbbítása (`breadcrumbs`, `blogPosts`, `person`, `type`).
- `src/pages/index.astro`: `type="blog"` + `blogPosts`.
- `src/pages/authors/[slug].astro`: `type="person"` + `person`.

## 5. Tartalommodell bővítés (commit 3)

- `src/lib/content-schemas.ts`: új opcionális `recipeSchema` (név, leírás, adag, idő, konyha, hozzávalók, lépések, tápérték) és `locationSchema` (név, cím, ország, koordináták) a `postSchema`-ban — a főzéses és utazási perszónákhoz.

## 6. Kódmásoló gomb (commit 3)

- `public/scripts/site.js`: `.article-prose pre` blokkokra másoló gomb (vágólap, hibánál jelölés, 2s visszajelzés).
- `src/styles/global.css`: `.code-block` / `.code-copy` stílus.

## 7. `astro check` — 10 előzetes típushiba javítása (commit 1–2)

| Fájl | Hiba | Javítás |
|---|---|---|
| `vitest.config.ts` | `test` kulcs érvénytelen a Vite `UserConfig`-on | `getViteConfig` → `defineConfig` a `vitest/config`-ból |
| `e2e/a11y.spec.ts` | `Cannot find module 'axe-playwright'` | hibás import törölve, kategória-útvonal valósra (`/category/utazas/`) |
| `src/content.config.test.ts` | 6× `parse`/`safeParse` hiányzik az unió-típuson | közvetlen `postSchema` import a `lib/content-schemas`-ból |
| `src/components/creator/CreatorApp.tsx` | 2× „no default export" | **törölve** (nem használt, fiktív Tailwind-örökség) |

## 8. Node ESM javítások a szervermentes függvényhez (commit 4–5)

- **TS2835** (hiányzó `.js` kiterjesztés): `.js` hozzáadva a `api/creator.ts`, `src/server/github.ts`, `src/lib/content-schemas.ts`, `src/lib/creator/{model,serializer,media}.ts` relatív importjaihoz.
- **TS2339** (`unknown` típus): `src/server/github.ts` — `new Map<string, ImageAsset>` + tuple típus.
- **TS1543** (JSON import): `api/creator.ts` — `import ... with { type: "json" }`.
- `scripts/test/loader.mjs`: `.js` → `.ts` leképezés (a unit tesztek regressziójának elkerülésére).

## 9. E2E spec javítások (commit 1)

- Átírt, sosem működő spec-ek (nem létező Tailwind-szelektorok, angol szövegek):
  - `e2e/creator-workspace.spec.ts` (`.workspace-heading h1`, `/creator/`).
  - `e2e/journeys.spec.ts` (hero CTA, creator anchor).
  - `e2e/public-journeys.spec.ts` (`.article-prose`, `.mosaic-lead h3 a`).
  - `e2e/public-reading.spec.ts` (`.brand`, `[data-toggle-mode]`).
  - `e2e/home.spec.ts` (`#theme-menu-button` → `[data-toggle-mode]`).

## 10. Vercel deploy javítások (commit 6–7)

- **Hiba:** `Production requires PUBLIC_SITE_URL or site.json.siteUrl.` — éles buildben kötelező a domain.
- **Első kísérlet:** `PUBLIC_SITE_URL` env var CLI-vel → a git-integráció nem olvasta megbízhatóan.
- **Megbízható javítás:** `site.json.siteUrl` = production domain (repóban, mindig elérhető).
- **Domain-eltérés feloldása:** a `blogger-phi-black.vercel.app` egy régi, törölt projekt domainje volt; a projekt újra lett létrehozva → **helyes domain: `blogger-nine-iota.vercel.app`**.
- **Eredmény:** éles oldal él (HTTP 200), helyes canonical/OG URL.

## 11. GitHub OAuth előkészítés a publikáláshoz (CLI, nem commitolt)

- `SESSION_SECRET` (64 karakteres véletlen kulcs) generálva + beállítva.
- `GITHUB_REPOSITORY=HenrikFaul/blogger`, `GITHUB_AUTH_MODE=oauth` beállítva.
- **Függőben:** `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` (a felhasználó GitHub OAuth App-ja kell hozzá).

---

## Ellenőrzési állapot (végleges)

| Ellenőrzés | Eredmény |
|---|---|
| `npm run verify` (check + unit + contrast + build) | ✅ STATUS=0 |
| `npm run build` | ✅ 52 oldal |
| `npm run test:unit` | ✅ 92/92 |
| `npm run test:contrast` | ✅ 260/260 |
| `npx astro check` | ✅ 0 hiba |
| Vercel production | ✅ Ready, `blogger-nine-iota.vercel.app` |
| JSON-LD | ✅ Blog / BreadcrumbList / Person / BlogPosting / WebSite |

## 12. Új témák és 4K médiatár (15 téma + 24 kép)

- **15 új blog-template (téma)** a `themeRegistry`-ben (26 → 41):
  - Forest Walks, Ocean Breeze, Terracotta Sunset, Lavender Mist, Midnight Navy, Sage Garden, Rose Quartz, Charcoal Studio, Sky Paper, Golden Hour, Ink and Paper, Moss Stone, Coral Reef, Mono Terminal, Warm Library.
  - Mindegyikhez: token CSS (`src/styles/themes/<key>.css`) világos+sötét mód, regiszter-bejegyzés, CSS-import a `themes.css`-ben.
  - 5 téma `primary` színe sötétítve a WCAG 4,5:1 kontraszthoz (Coral Reef, Golden Hour, Rose Quartz, Sage Garden, Terracotta Sunset) + Golden Hour `muted`.
  - Kontraszt-ellenőrzés: **410/410 pár ≥ 4,5:1**.
- **24 db 4K (3840×2160) kép** a Picsum/Unsplash ingyenes forrásból a `public/media/stock/` mappába (`stock-0.jpg` … `stock-29.jpg`).
- Tesztek frissítve: `tests/content.test.mjs` (26 → 41 téma), `e2e/creator.spec.ts` (26 → 41).
- Generátor-szkriptek a `scripts/tools/` alatt: `download-stock-images.mjs`, `generate-theme-css.mjs`, `generate-theme-registry.mjs`, `insert-themes.mjs`.

  - `e2e/landing.spec.ts`: átírva a szerkesztőségi főoldalra.
