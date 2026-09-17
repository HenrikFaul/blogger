# Változásjegyzék

## 0.3.0 — 2026-09-17

### A Studio v2 szerinti szerkesztőségi főoldal
- A nyitóoldal a `ForgeBlog_Studio_v2` átadási csomag `01-editorial-home` terve szerinti **szerkesztőségi blogfőoldal** lett: nagy serif hero („A gondolatnak tér kell.”), absztrakt vektor-illusztráció, szerzői megjegyzés és a legfrissebb írások rácsos listája.
- A publikus márka **folio.** (a white-label példa), a motor továbbra is ForgeBlog. A hero-szöveg, a navigáció és a márka a `src/config/site.json`-ból jön.
- A `minimal-editorial` téma a Studio v2 tokenekhez igazítva: meleg papírszín `#F7F5EF`, erdőzöld `#294C3B`, tégla akcentus `#BB412B`, serif `EB Garamond`/Georgia címsorok.
- A hat vektor-illusztráció a Studio v2 `assets/` mappájából a `public/media/illustrations/` alá került; a hero az `abstract.svg`-et használja.
- A korábbi marketing-jellegű landing-komponensek (hero-mozaik, galériasáv, mérőszám-sor stb.) törölve, mert nem szerepelnek a szerkesztőségi tervben.
- Új E2E-lefedettség: `e2e/landing.spec.ts` a szerkesztőségi főoldalra (hero, illusztráció, cikkrács, márka, overflow).

### Javítások
- `tests/update.test.mjs`: a Git-fixture repo mostantól rögzíti a sorvége-politikát (`core.autocrlf=false`), így a teszt Windows alatt is zöld (korábban a globális `core.autocrlf=true` CRLF-fé konvertálta a fájlokat). 92/92 unit teszt sikeres.
- A natív `astro build` ebben a környezetben sikeres (52 oldal); a korábbi „blokkolt build” a hiányzó `node_modules` és a lezárt native-binding fájl miatt volt, `npm ci`-vel helyreáll.
- A nyitóoldal CSS-e egy beszúrási hibától (`mock-bar` csonka szabály) mentes; a zárójelek kiegyensúlyozottak.
- Az `astro check` 10 előzetes típushibája javítva — a `npm run verify` mostantól zöld:
  - `vitest.config.ts`: `getViteConfig` → `defineConfig` a `vitest/config`-ból (a `test` kulcs érvénytelen volt a Vite `UserConfig`-on).
  - `e2e/a11y.spec.ts`: a hibás `axe-playwright` import eltávolítva (`@axe-core/playwright` a helyes), a kategória-útvonal valósra (`/category/utazas/`) cserélve.
  - `src/content.config.test.ts`: a `postSchema` közvetlenül a `lib/content-schemas`-ból importálva (a `collections.posts.schema` unió-típusán nincs `parse`/`safeParse`).
  - `src/components/creator/CreatorApp.tsx`: törölve — nem használt, a fiktív Tailwind-felületre épülő örökölt komponens (a kanonikus belépő továbbra is `WorkspaceApp.tsx`).

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
