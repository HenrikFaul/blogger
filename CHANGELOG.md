# Változásjegyzék

## 0.3.0 — 2026-09-17

### A designplan szerinti nyitóoldal
- A nyitóoldal a csatolt `designplan.png` szerinti ForgeBlog termékoldal lett: bejelentősáv, hero-mozaik (kiemelt történet + csempék + idézet + eszközsáv), „Kiemelt történetek” sáv, „Fedezd fel téma szerint” chip-sor, munkatér-bemutató, galériasáv, mérőszám-sor és záró CTA-sáv.
- Az oldal kizárólag a valós, publikált tartalomgyűjteményből táplálkozik; nincs kitalált statisztika vagy működés nélküli gomb. A bemutatószámok és a landing-szöveg a `src/config/site.json` `home` blokkjából jönnek, így white-label instance felül tudja írni.
- A nyitóoldal a kanonikus témajelzőket használja, így mind a 26 téma és a világos/sötét mód automatikusan átszínezi. Mobilnézetben nincs vízszintes túlcsordulás.
- Új séma: `announcement` és `home` blokk az `InstanceConfigSchema`-ban, teljes alapértelmezéssel; a régi konfigurációk érvényesek maradnak.
- Új E2E-lefedettség: `e2e/landing.spec.ts` (6 eset × 2 viewport) a tervezett szekciókra.

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
