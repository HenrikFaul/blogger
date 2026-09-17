# ForgeBlog 0.2.0 — tényleges ellenőrzési jelentés

> **0.3.0 frissítés (2026. szept. 17., helyi Windows-környezet, Node 24):** a korábban „blokkoltként” jelölt natív build ezen a gépen `npm ci` után sikeresen lefut. Az alábbi mérések a tényleges, helyben futtatott eredmények.

| Ellenőrzés | Tényleges eredmény (0.3.0) |
|---|---|
| `npm ci` | 455 csomag, kilépési kód 0 |
| `npm run build` (natív Astro) | 52 oldal, kilépési kód 0 |
| `npm run test:unit` | 92/92 sikeres, 0 kihagyott |
| `npm run test:contrast` | 260/260 pár ≥ 4,5:1 |
| `npx playwright test` | 92/93; az 1 hibás eset (`creator.spec.ts` „26 themes”) párhuzamos futtatásnál flaky `net::ERR_ABORTED`, izoláltan 8/8 sikeres |
| `npx astro check` | **0 hiba** — a 10 előzetes típushiba (`vitest.config.ts`, `e2e/a11y.spec.ts`, `src/content.config.test.ts`, `src/components/creator/CreatorApp.tsx`) javítva |

A nyitóoldal a csatolt `designplan.png` szerint épült újjá; a méréseket a `CHANGELOG.md` 0.3.0 szakasza rögzíti.

## Összesítés

| Ellenőrzés | Tényleges eredmény | Bizonyíték / hatókör |
|---|---|---|
| Astro/TypeScript forrásdiagnosztika | **105 fájl; 0 hiba, 0 figyelmeztetés, 0 hint** | `evidence/source-diagnostics.txt`; közvetlen checker, nem clean `astro sync` |
| Logikai és szerződéses tesztek | **92/92 sikeres; 0 kihagyott** | `evidence/unit-tests.txt`; tartalom/séma/URL, helyi tárolómodell, MDX, ZIP, médiafejléc, Git és security mockok, valódi ideiglenes Git-upstream teszt |
| DOM/React böngészős diagnosztika | **42/42 sikeres** | `evidence/diagnostic-browser.json`; asztali 1440 px és mobil 390 px, explicit storage fixture |
| Axe WCAG 2/2.1 A/AA célzott audit | **8/8 állapotban 0 kimutatott sértés** | A 42 diagnosztikai ellenőrzés része, nem további 8 független E2E |
| Alap témaszínek kontrasztja | **260/260 pár legalább 4,5:1** | 26 téma × 2 mód × 5 pár; `evidence/theme-token-contrast.json`; nem teljes vizuális megfelelőség |
| ZIP független visszaolvasása | **Sikeres** | Python zipfile: Unicode nevek, UTF-8 szöveg, bináris tartalom, CRC32 |
| Natív Playwright tesztdefiníciók | **50 eset sikeresen listázva** | `evidence/native-e2e-list-only.txt`; nem futtatási eredmény |
| Natív Astro production build | **BLOKKOLT, nem sikeres** | Windowsról csatolt függőségek, hiányzó Linux native binding és elérhetetlen npm-registry |
| Éles GitHub/OAuth/Vercel | **Nem futtatott** | Nincs felhasználói credential/repository/telepítés bevonva; logikai API-mockok nem helyettesítik |

## A böngészős próba pontos jelentése

A környezet menedzselt Chromiumának felső szintű URL-navigációját házirend tiltja. A házirendet nem módosítottuk. A külön `scripts/qa/` kompatibilitási megjelenítő a tényleges Astro forrásokból készített diagnosztikai HTML-t, közös CSS-t és az aktuális React/Tiptap forrásokból készített, nem optimalizált csomagot renderelt. A Markdown-kompatibilitást Mistune adta, nem a natív MDX compiler.

A Playwright `set_content` a tényleges HTML/CSS/React interakciókat vizsgálta. **A localStorage és az IndexedDB ebben a DOM-próbában explicit memóriabeli fixture volt.** Az API-session configured:false válasza szintén fixture. Ezért a próba nem bizonyít natív lemezre mentést, originváltást, valódi fájlletöltést, OAuth cookie-t vagy éles hálózati integrációt.

Vizsgált folyamatok: olvasási oldalak és mobil overflow; kereső ékezetkezeléssel és Escape-pel; mobilmenü; szűrés/üres állapot/rendezés; galéria/nagyító; új vázlat és cím/kivonat módosítása; módosításfüggő autosave és idle visszacsatolás hiánya; borítókép/galéria beszúrás; előnézet a szerkesztő lebontása nélkül; kézi checkpoint és visszaállítás külön másolatként; hiányzó Git-backend őszinte állapota; mind a 26 téma, tényleges szűrés/választás; mind a tíz galéria-előnézet; hibás éles konfiguráció elutasítása; mobil írás/beállítás/előnézet. A végső futásban minden rögzített eset sikeres és nincs észlelt React/DOM futási hiba.

A képernyőképek a `docs/screenshots/` alatt ennek a diagnosztikai renderelésnek a felvételei. Nem statikus designmockupok, de nem production buildről származnak.

## Miért maradt nyitva a natív build?

Az eredeti ZIP telepített Windows-függőségeket tartalmazott. A rendelkezésre álló környezet Linux, Node 22.16.0, míg a projekt/függőség minimuma 22.19.0; a kiadás Node 24-et kér. A csatolt npm bin fájl engedélyproblémája után a CLI közvetlen indítását is megpróbáltuk: hiányzó Rolldown natív binding miatt leállt. Az npm-registry ellenőrzése `EAI_AGAIN` DNS-hibát adott, így nem lehetett tiszta platformhelyes telepítést végezni. A lockfile platformfüggő csomagbejegyzései megmaradtak, de a korábbi `node_modules` nincs az átadott ZIP-ben.

Az Astro checker közvetlen forrásellenőrzése a rendelkezésre álló helyi generált `.astro` típusleírásokra támaszkodott. **Az `astro sync` nem futott sikeresen a natív pipeline-ban.** A `.astro` nincs átadva; a saját tiszta telepítésen frissen kell generálni. A nulla checkerhiba ezért nem azonos egy sikeres tiszta builddel.

## Kötelező külső kiadási kapu

```sh
# Node 24, tiszta kicsomagolás, a projekt gyökerében
npm ci
npm run verify
npx playwright install chromium
npm run test:e2e
```

A CI ugyanezt a natív irányt használja. További kötelező integrációs próba: HTTPS-tesztinstance-en login/logout, repo-jogosultság, commit, PR, stale-head konfliktus, képfájlok, tényleges merge/deployment. Natív böngészőben tényleges localStorage/IndexedDB reload/import/kvóta/többfüles helyzetek. Éles oldalon válaszfejlécek, sitemap/robots/canonical, no-JS olvasás, screen reader és production teljesítmény.

## Nem igazolt vagy nem teljes körű

Nincs production Lighthouse/Web Vitals pontszám, független pentest, teljes WCAG-tanúsítás vagy minden böngészőre adott kompatibilitási ígéret. Nem végeztünk éles deploymentet, és nem kapcsoltunk be külső szolgáltatást. A roadmap részben teljesített tételeit a `REQUIREMENTS_MATRIX.md` sorolja fel. A demo tartalom és a referenciaképek indulás előtt cserélendők.
