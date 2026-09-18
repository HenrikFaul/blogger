# Változásjegyzék

## 0.4.0 — 2026-09-18

### Prémium UI/UX Frissítés és Nagyfelbontású Képarchívum
- **Képkatalógus Csere:** 240+ darab, kiváló minőségű Full HD (1920x1080) képet töltöttünk le az Unsplash-ről, 80 különböző témakörhöz (pl. Minimalist Workspace, Cyberpunk City, stb.). A fájlok helytakarékos WebP formátumban kerültek a repository-ba (`public/media/catalog/`), a régi homályos/alacsony felbontású `.jpg` és `.webp` képek pedig végleges törlésre kerültek (`public/media/demo/`).
- **Katalógus Rendszer:** Új `src/config/demo-media.json` katalógus jött létre, metaadatokkal és dinamikus alt/címke lekérdezéssel a könnyebb válogatáshoz.
- **Tartalomszerkesztő (Content Editor) Upgrade:** A `DraftEditor` és `BlockEditor` felülete modern, prémium "Glassmorphism" dizájnt kapott. A felső sáv (topbar) és eszköztár lebegő, áttetsző üveghatású; a folyamatjelző "pill" designra váltott színátmenetes effektekkel. Az írófelület letisztult Notion/Medium stílust tükröz, fókuszált árnyékolással, a készülékelőnézet pedig elegáns animált sziluettekkel dolgozik.
- **Hibajavítás (404):** A dinamikus `Astro.redirect` a `/collections/[slug]` oldalak esetében okozott fejlesztői módos 404-es hibát elhárítottuk.

## 0.3.0 — 2026-09-17

### A Studio v2 szerinti szerkesztőségi főoldal
- A nyitóoldal a `ForgeBlog_Studio_v2` átadási csomag `01-editorial-home` terve szerinti **szerkesztőségi blogfőoldal** lett: nagy serif hero („A gondolatnak tér kell.”), absztrakt vektor-illusztráció, szerzői megjegyzés és a legfrissebb írások rácsos listája.
- A publikus márka **folio.** (a white-label példa), a motor továbbra is ForgeBlog. A hero-szöveg, a navigáció és a márka a `src/config/site.json`-ból jön.
- A `minimal-editorial` téma a Studio v2 tokenekhez igazítva: meleg papírszín `#F7F5EF`, erdőzöld `#294C3B`, tégla akcentus `#BB412B`, serif `EB Garamond`/Georgia címsorok.
- A hat vektor-illusztráció a Studio v2 `assets/` mappájából a `public/media/illustrations/` alá került; a hero az `abstract.svg`-et használja.
- A korábbi marketing-jellegű landing-komponensek (hero-mozaik, galériasáv, mérőszám-sor stb.) törölve, mert nem szerepelnek a szerkesztőségi tervben.
- Új E2E-lefedettség: `e2e/landing.spec.ts` a szerkesztőségi főoldalra (hero, illusztráció, cikkrács, márka, overflow).

### Strukturált adatok, tartalommodell és kódmásolás
- JSON-LD kibővítve: `BreadcrumbList` a cikkoldalakon, `Blog` a főoldalon, `Person` a szerzőoldalakon (a meglévő `WebSite`/`BlogPosting` mellé). A `SeoHead` mostantól típus szerint generálja a sémát.
- Új opcionális `recipe` (recept: név, hozzávalók, lépések, adagszám, idő, tápérték) és `location` (hely: név, cím, ország, koordináták) mező a tartalomsémában — a főzéses és utazási perszónákhoz.
- Kódblokk-másoló gomb a cikkekben (progresszív fejlesztés; vágólap-másolás, hibánál jelölés, billentyűzet-hozzáférhető).

### Javítások
- `tests/update.test.mjs`: a Git-fixture repo mostantól rögzíti a sorvége-politikát (`core.autocrlf=false`), így a teszt Windows alatt is zöld (korábban a globális `core.autocrlf=true` CRLF-fé konvertálta a fájlokat). 92/92 unit teszt sikeres.
- A natív `astro build` ebben a környezetben sikeres (52 oldal); a korábbi „blokkolt build” a hiányzó `node_modules` és a lezárt native-binding fájl miatt volt, `npm ci`-vel helyreáll.
- A nyitóoldal CSS-e egy beszúrási hibától (`mock-bar` csonka szabály) mentes; a zárójelek kiegyensúlyozottak.
- Az `astro check` 10 előzetes típushibája javítva — a `npm run verify` mostantól zöld:
  - `vitest.config.ts`: `getViteConfig` → `defineConfig` a `vitest/config`-ból (a `test` kulcs érvénytelen volt a Vite `UserConfig`-on).
  - `e2e/a11y.spec.ts`: a hibás `axe-playwright` import eltávolítva (`@axe-core/playwright` a helyes), a kategória-útvonal valósra (`/category/utazas/`) cserélve.
  - `src/content.config.test.ts`: a `postSchema` közvetlenül a `lib/content-schemas`-ból importálva (a `collections.posts.schema` unió-típusán nincs `parse`/`safeParse`).
  - `src/components/creator/CreatorApp.tsx`: törölve — nem használt, a fiktív Tailwind-felületre épülő örökölt komponens (a kanonikus belépő továbbra is `WorkspaceApp.tsx`).

### Vercel deploy és szervermentes függvény
- Node ESM javítások a `api/creator.ts` szervermentes függvényhez:
  - TS2835: `.js` kiterjesztés a relatív importokon (`api/creator.ts`, `src/server/github.ts`, `src/lib/content-schemas.ts`, `src/lib/creator/*`).
  - TS2339: `new Map<string, ImageAsset>` + tuple típus a `src/server/github.ts`-ben.
  - TS1543: `import ... with { type: "json" }` a JSON importhoz.
  - `scripts/test/loader.mjs`: `.js` → `.ts` leképezés (unit teszt regresszió ellen).
- Vercel production deploy javítva: `site.json.siteUrl` = `https://blogger-nine-iota.vercel.app` (a `PUBLIC_SITE_URL` env var megbízhatatlan volt a git-integrációban).
- GitHub OAuth előkészítés a publikáláshoz: `GITHUB_REPOSITORY=HenrikFaul/blogger`, `GITHUB_AUTH_MODE=oauth`, `SESSION_SECRET` generálva és beállítva (a `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` a felhasználó GitHub OAuth App-jából függ).
- Részletes napló: `versioning/SESSION_LOG.md` és `versioning/VERSION_MANIFEST.md`.

### Új témák és 4K médiatár
- **15 új blog-template** (26 → 41 téma): Forest Walks, Ocean Breeze, Terracotta Sunset, Lavender Mist, Midnight Navy, Sage Garden, Rose Quartz, Charcoal Studio, Sky Paper, Golden Hour, Ink and Paper, Moss Stone, Coral Reef, Mono Terminal, Warm Library — mindegyik saját token-CSS-sel (világos+sötét), regiszter-bejegyzéssel és CSS-importtal.
- **24 db 4K (3840×2160) kép** a Picsum/Unsplash ingyenes forrásból a `public/media/stock/`-ba.
- Kontraszt-ellenőrzés: **410/410 pár ≥ 4,5:1** (5 téma primary színe sötétítve a WCAG-hez).
- Generátor-szkriptek a `scripts/tools/` alatt (letöltés + témagenerálás).

A részletes fájlszintű összehasonlítás: `docs/FILE_CHANGES.json`. A forrásellenőrzés és a diagnosztikai tesztek nem teszik igazolttá a production buildet vagy az éles OAuth-integrációt.

## 0.2.0 — 2026-09-17

### Nyilvános élmény
- Külön teljes oldalszélesség és olvasószélesség; egységes világos editorial felület és 26 valós témaváltozat.
- Új magazinfőoldal, tartalomlisták, kategória/szerző/címke/sorozat oldalak, archívum és cikkelrendezés.
- Működő ékezetfüggetlen keresés, valós témaszűrők, rendezés, üres/hibaállapotok, mobilmenü, billentyűzetes keresőbezárás.
- Valós cikkszámok, tényleges szerzőadatok és portrék; olvasási idő és frissítési dátum kapcsolók bekötése.
- Progresszív galériák, tíz elrendezés, billentyűzetes nagyító, összehasonlító csúszka; külső videó csak kérésre.
- Közös publikálhatósági szabály a listákhoz, útvonalakhoz, kereséshez és RSS-hez; vázlat és jövőbeli dátum szűrése.
- Helyi/preview noindex; valódi canonical-domain ellenőrzés; JSON-LD és XML biztonságos sorosítása.

### Írás és adatmegőrzés
- Párhuzamos szerkesztők helyett egyetlen munkatér; Tiptap, eszköztár, blokkmenü, táblázat, kép/galéria/videó, előnézet.
- Stabil UUID-k; csak módosításkor induló autosave; CAS-revízió és elérhető Web Locks; tárolóhibáknál nem törlő helyreállítás.
- Méretkorlátos ellenőrzőpontok; visszaállítás új másolatként; a média kiválasztása és a teljes előnézet nem bontja le a szerkesztőt.
- Képfájl-ellenőrzés, IndexedDB-médiatároló, SHA-256 deduplikáció, ALT/dekoratív metaadatok.
- Valódi, Unicode-kompatibilis ZIP-export, MDX és saját képek; teljes JSON/mediamentés és ellenőrzött import.
- Szöveges `import`/`export` sorok, HTML/MDX-szintaxis és veszélyes URL-ek kezelése; importált dokumentumtípusok korlátozása.

### Git és üzemeltetés
- Opcionális szerveroldali GitHub App/OAuth folyamat, PKCE/state, titkosított HttpOnly session, Origin/CSRF és repo-jogosultság ellenőrzés.
- Vázlatonkénti ág, expected-head és nem kényszerített ref-frissítés, atomikus commit, külön publikálási PR; nincs automatikus merge vagy deployment-siker állítás.
- Kanonikus webhely-konfiguráció; példadomain és élesítéskor hiányzó domain elutasítása.
- Destruktív/hardcoded upstream automerge helyett csak felülvizsgálható patch-et előállító frissítésvizsgáló.
- CI-minőségkapu, natív E2E tesztforrások, helyreállítási útmutató, őszinte QA-jelentés és követelménymátrix.

A részletes fájlszintű összehasonlítás: `docs/FILE_CHANGES.json`. A forrásellenőrzés és a diagnosztikai tesztek nem teszik igazolttá a production buildet vagy az éles OAuth-integrációt.
