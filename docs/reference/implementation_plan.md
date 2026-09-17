# UI/UX Teljes Körű Redesign Terv

A megadott dizájn tervek (képek) alapján egyértelmű, hogy a jelenlegi megjelenés túlságosan "alapértelmezett", és nem tükrözi azt a prémium, elegáns és letisztult hatást, amit a tervek (pl. `designplan.png`, `layout_plan.png`) mutatnak. 

A tervek egy rendkívül magas színvonalú, modern editorial stílust képviselnek, "Kinder Internet" koncepcióval: organikus, lekerekített formák, mély erdőzöld/pala (forest green/slate) elsődleges színek, elegáns serif betűtípus a címsorokhoz (Playfair Display) és tiszta sans-serif (Inter) az UI elemekhez.

Ez az implementációs terv végigvezeti a kért dizájn teljes integrálását a korábban kidolgozott fázisok kódjába (Public UI, Post Cards, Creator Workspace, Media Library).

## User Review Required

> [!WARNING]
> Ez egy átfogó, globális stílus- és komponens-szintű újraírás lesz. A funkcionalitás (React/Astro logika) megmarad, de a Tailwind osztályok és a HTML struktúrák jelentősen módosulnak, hogy **pixelpontosan** kövessék a terveket. Kérlek, olvasd át és hagyd jóvá, mielőtt módosítom a fájlokat!

## Proposed Changes

A változtatásokat rétegekre bontva hajtjuk végre:

### 1. Global CSS & Theme System
Frissítjük a globális stílusokat és a `minimal-editorial` témát, hogy megfeleljen a terveknek.

#### [MODIFY] `src/styles/global.css` és `src/styles/themes/minimal-editorial.css`
- **Színek:** A `primary` szín egy mélyebb, organikus sötétzöld/sötétpala árnyalat lesz (pl. `#132c2a` vagy `#0f172a`), a háttér (`canvas`) pedig egy melegebb, szinte észrevehetetlen törtfehér (`#faf9f5`). A felületek (`surface`) tiszta fehérek (`#ffffff`).
- **Lekerekítések (Border Radius):** A kártyák és konténerek nagyobb lekerekítést kapnak (`rounded-2xl` vagy `rounded-xl`).
- **Árnyékok:** Nagyon finom, elmosott árnyékok (soft drop shadows).

---

### 2. Public Experience & Navigation (designplan.png, layout_plan.png)
A publikus oldalak fejléce és kártyái.

#### [MODIFY] `src/components/chrome/SiteHeader.astro`
- **Bal oldal:** Új ForgeBlog logó (levél ikonnal) és szebb tipográfia.
- **Közép:** A navigációs linkek pill-alakú hover effekttel, középre igazítva.
- **Jobb oldal:** "Sign in" (szöveges) és "Get started" (sötét kitöltött, lekerekített) gombok, valamint a Search ikon elhelyezése a `designplan.png` alapján.

#### [MODIFY] `src/components/content/PostCard.astro`
- A `layout_plan.png` alapján újraépítjük a kártyákat.
- **Tag-ek:** Pill-formátumú kategóriajelölők a kép alatt balra (pl. `TECHNOLOGY` kék szöveggel és világoskék háttérrel).
- **Szerző & Dátum:** A szerző avatarja kicsiben, mellette a név és a dátum, elválasztó ponttal (bullet).
- A kártyák körvonala (border) nagyon finom, vagy egyáltalán nincs (csak a hover állapotban jelenik meg egy lágy árnyék).

#### [MODIFY] `src/pages/index.astro`
- A Hero szekció implementálása a "A kinder internet is a brighter place" design alapján.
- Széles, lekerekített hős-kép (Hero image), felette a szöveg, alatta a szerző blokkja.

---

### 3. Creator Workspace (content.png)
A szerkesztői felület radikális letisztítása.

#### [MODIFY] `src/components/creator/WorkspaceApp.tsx`
- **Sidebar (Bal oldali menü):** Szürke ikonok és szöveg, a kiválasztott elem halványszürke hátteret kap és feketévé válik. Teljesen eltüntetjük a túlzott dobozokat (border). A logó és a blog címe ("My Blog - Creator Workspace") elegánsan jelenik meg fent.
- **Felső sáv (Top bar):** Szellősebb, státusz kijelzéssel ("Auto-saved 12s ago", "main" branch választó) és a "Publish" gombbal.

#### [MODIFY] `src/components/creator/CreatorApp.tsx` (és az Editor komponensek)
- **Editor Area:** Középre zárt, nagyon tiszta, széles fehér tér. A Cím (H1) óriási Playfair Display betűtípussal.
- **Right Sidebar (Metadata):** A kártyás stílusú, pill alakú tag beviteli mezők, kategória választó, és Cover Image lecserélő blokk pontos lemásolása.

---

### 4. Media Library (media library.png)
A galéria és média kezelő felület pontos lekövetése.

#### [MODIFY] `src/components/media/Gallery.tsx` és (ha van) MediaManager
- **Grid Layout:** Tökéletes kártyás megjelenés a képeknek, lekerekített sarkokkal, hover állapotban kijelölő checkbox-szal a bal felső sarokban és a "More" (3 pont) gombbal a jobb felsőben.
- **Kép kártya:** A kép alatt a fájlnév (`italy-coast.jpg`), a felbontás (`2400 x 1600`), és apró pill alakú tag-ek (pl. `Travel`, `Italy`).
- **Jobb oldali panel (Gallery Builder):** Amikor ki van jelölve egy vagy több kép, a jobb oldali panel megjeleníti a kiválasztott képek apró ikonjait ("Selected images (6)"), a Layout választót (Editorial Grid, Masonry, Justified stb.), és a Caption / Alt text beviteli mezőket.

---

### Phase 8.5 v2: Premium UI Polish (A UX/UI tökéletesítése)
A korábbi egyszerű megoldásokat lecseréljük valódi prémium megoldásokra:
1. **Mikro-animációk & Hover Effecktek:** Gombok, linkek, és kártyák kapnak finom, 300-500ms-es átmeneteket, felugró (lift) effekteket.
2. **Glassmorphism & Blur:** A fejléc és az oldalsávok finom, elmosódott hátteret kapnak (`backdrop-blur`), ahogy a modern dizájnokban szokás.
3. **Tipográfia finomhangolása:** A `Playfair Display` és `Inter` betűtípusok vizuális hierarchiájának, sortávolságainak (`leading`), és margóinak tökéletesítése. Szigorúbb betűméret-arányok.
4. **Creator Workspace & Media Library Polish:** A UI elemek precízebb igazítása, a gombok, inputok és szegélyek (borders) lágyítása, a "száraz" Tailwind érzés megszüntetése.

#### [MODIFY] `src/styles/themes/minimal-editorial.css`
- Árnyékok finomítása (sokkal lágyabb, elegánsabb umbra).
- Térközök és paddingok növelése a "levegősebb" (white-space heavy) prémium kinézetért.

#### [MODIFY] `src/components/chrome/SiteHeader.astro`
- Áttetsző, scrollra reagáló "glass" hatás beállítása.

#### [MODIFY] `src/pages/index.astro` & `src/components/content/PostCard.astro`
- Hover animációk, képnagyítás (scale) és finom fade-in effektek.

---

### Phase 9: Security, Privacy & Operations
A statikus, Git-alapú architektúrának megfelelő biztonsági réteg kialakítása.

#### [NEW] `docs/operations/security-and-privacy.md`
- Threat model (GitHub fiók védelme, tokenek).
- Zod sémák szigorítása a frontmatter validáláshoz.
- CSP (Content Security Policy) dokumentáció és javasolt konfiguráció.
- Privacy-first analitika (Plausible/Fathom) javaslata és cookie-kezelés.
- Backup és visszaállítási (Disaster Recovery) terv Git történet alapján.

---

### Phase 10: Launch Readiness, QA & Growth System
A projekt végső átadási csomagja, hogy a blog üzemkész és publikálható legyen.

#### [NEW] `docs/operations/launch-readiness.md`
- **E2E és QA stratégia:** A legfontosabb felhasználói (olvasói és creator) útvonalak tesztelési terve.
- **Performance & SEO:** Lighthouse limitek (LCP, INP, CLS) és SEO meta tagek (OpenGraph, sitemap, JSON-LD) ellenőrzése.
- **A11y (Akadálymentesítés):** Billentyűzet-navigáció, kontraszt, és képernyőolvasó (screen reader) támogatás.
- **Runbook (Launch Guide):** Lépésről-lépésre leírás a projekt Vercel-be történő importálásához, domain beállításához és a GitHub ágak védelméhez.

## Verification Plan

### Automated Tests
- `npm run build` sikeres lefutása, TypeScript és Astro ellenőrzések.
- (Tervben) Zod schema validációs tesztek a content mappingnél.

### Manual Verification
- A lokális szerveren az oldal vizuális átnézése, figyelve a reszponzivitásra (mobilnézet) és az új prémium animációkra.
- Képernyőolvasó (VoiceOver/NVDA) és billentyűzet-navigáció tesztelése.
- Light/Dark mód közötti tökéletes átmenet ellenőrzése.
