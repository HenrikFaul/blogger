# ForgeBlog — javított blog és alkotói munkatér

**0.3.0 · 2026. szeptember 17.** A nyitóoldal a csatolt `designplan.png` szerinti ForgeBlog termékoldal lett, a korábbi natív-build-problémák ebben a környezetben `npm ci`-vel megoldódtak. A 0.2.0 alapdizájn, tartalommodell, keresés, biztonságos helyi írási folyamat és opcionális Git-publikálás változatlan.

> **Átadási státusz:** a forrásellenőrzés és 92 logikai teszt sikeres. A külön kompatibilitási megjelenítőn 42/42 DOM/React diagnosztikai ellenőrzés sikeres. **A natív Astro production build, a natív tárolós Playwright-folyamat és az éles GitHub/Vercel-integráció ebben a környezetben nem volt igazolható.** Ezek nem helyettesíthetők a kompatibilitási előnézettel. Részletek: [QA-jelentés](docs/QA_REPORT.md).

## Indítás

A projekt gyökerében, **Node.js 24** mellett:

```sh
npm ci
npm run dev
```

Nyilvános oldal: `http://localhost:4321/` · Munkatér: `http://localhost:4321/creator/`.
A teljes forrás ZIP-jéből szándékosan kimaradt a másik operációs rendszeren telepített `node_modules`, a generált `.astro`, a régi `dist`, valamint a korábbi tesztriportok. A függőségeket a megőrzött lockfile-ból, a saját gépen kell telepíteni; ne másold vissza a régi `node_modules` mappát. Minimum engine: Node 22.19; a `.nvmrc` és a CI Node 24-re állított.

Az olvasáshoz, a helyi szerkesztéshez és a ZIP-exporthoz **nem kell GitHub-fiók, adatbázis vagy szervertitok**. A `.env.example` mezői addig üresen maradhatnak. A `npm run dev` Astro-kiszolgáló nem futtatja a Vercel `api/creator.ts` függvényt; a munkatér ezt nem sikeres Git-kapcsolatként jelzi.

## Első kipróbálás

A munkatérben válassz új történetet és kezdősablont; írd át a címet, szerkeszd a szöveget, adj hozzá képet és kivonatot. A **Mentés** helyi ellenőrzőpontot készít. Az **Export** MDX-et, szerkesztői forrást és a hivatkozott saját képeket tartalmazó ZIP-et ad. A **Beállítások → Teljes helyi mentés** az összes vázlat és feltöltött kép másolata. Az exportot őrizd meg: a böngészőadatok törlése a helyi munkát is törli.

**Négy külön állapot:** helyi vázlat → távoli Git-commit → publikálási pull request → ellenőrzött összevonás és sikeres deployment. Egyik lépés sem állítja magáról, hogy automatikusan teljesítette a következőt.

## Mi változott?

A nyilvános oldal szélessége már nem a cikk olvasószélességéhez igazodik. Új főoldal, cikkoldal, kategóriák, archívum, sorozatok, keresés, mobilmenü és galériakezelés készült. A kitalált statisztikák helyett tényleges tartalomadatok jelennek meg.

Az alkotói munkatér egyetlen Tiptap-szerkesztőt használ. Van szövegformázás, blokkmenü, táblázat, ellenőrzött hivatkozás, médiaválasztás, galéria, videóblokk, osztott és mobil előnézet, metadata/SEO-beállítás, visszaállítható helyi előzmény és valódi fájlexport. A vázlat azonosítója nem változik a cím átírásakor.

A 26 téma tényleges CSS-tokenekből, világos/sötét megjelenésből és hat elrendezéscsaládból áll. A kipróbálás helyi preferencia; az éles webhelyet a kanonikus `src/config/site.json` vezérli.

## Ellenőrző parancsok

```sh
npm run check
npm run test:unit
npm run test:contrast
npm run build
npx playwright install chromium
npm run test:e2e
```

A `npm run verify` a forrásellenőrzést, logikai teszteket, kontrasztellenőrzést és buildet kéri számon. A Playwright konfiguráció asztali és mobil Chromium-projektet tartalmaz. Az 50 E2E teszteset listázása sikeres; futásuk itt nem volt igazolható.

## Élesítés előtt

Állíts be saját HTTPS-domaint a `src/config/site.json` vagy a `PUBLIC_SITE_URL` értékében. Cseréld le a bemutatószövegeket, szerzőket, képeket, logót és a jogi helykitöltő oldalakat. A fotók a felhasználó által csatolt designreferenciákból kivágott, alacsony felbontású **bemutatóképek**, nem mellékelt kereskedelmi stocklicencek. A `demoContent` kapcsolót csak a tartalom tényleges cseréje után kapcsold ki.

A Git-kapcsolat beállítása: [GITHUB_SETUP](docs/GITHUB_SETUP.md). Telepítés, időzítés, visszaállás: [runbook](docs/runbook.md). Meglévő adatok és komponensek: [migráció](docs/MIGRATION.md). Teljes követelményállapot: [mátrix](docs/REQUIREMENTS_MATRIX.md). A részben megvalósított követelmények nincsenek késznek minősítve.
