# Implementation Plan: Főoldal Design Fix és 404 Útvonalak Javítása

## Goal
A kapott képernyőképek (és a nagyon jogos kritika) alapján a főoldal (`/index.astro`) vizuális felépítése szétesett (egymásra csúszó szövegek, elcsúszott oszlopok). Emellett a `/admin` és `/about` útvonalak 404-es hibát adnak, ami rontja az élményt és nem felel meg a dokumentációnak. A cél ezen hibák azonnali és prémium minőségű javítása.

## User Review Required
> [!IMPORTANT]
> A főoldali `1,248 articles` rész azért csúszott szét, mert a Tailwind osztályok (flex, grid) rosszul lettek strukturálva a Sidebar (All articles) és a Header között. Ezt a részt teljesen újraépítem egy stabil CSS Grid / Flexbox alapokon nyugvó, elegáns elrendezéssel. Jóváhagyod, hogy átírjam a `index.astro` layoutját?

## Proposed Changes

### 1. Főoldal (Home) Prémium Layout Újraépítése
#### [MODIFY] [src/pages/index.astro](file:///C:/Work/project4%20blogspot/src/pages/index.astro)
- **Szöveg-összecsúszás javítása:** A Sidebar (All articles list) és a Cikkek Grid-je közötti szélesség-arányokat fixálom. A cím (`1,248 articles`) tipográfiáját (betűméret, sortáv) és margóját úgy állítom be, hogy soha ne csússzon rá a kategóriákra.
- **Hero szekció finomítása:** A címsor ("Thoughts, stories and ideas.") és a keresőmező elrendezésének reszponzív (mobil/tablet/asztali) töréspontjait pontosítom, megakadályozva az egymásra lógást.
- **Prémium részletek (Ördög a részletekben):** Milliméter-pontos paddingok, finomított árnyékok (hover state-ek a cikk-kártyákon és gombokon), valamint a betűtípusok vizuális hierarchiájának szigorú betartása (az `All articles` kategórialistában a hover effektek és számlálók letisztultabbá vételével).

### 2. Útvonalak (Routing) 404 Hibák Javítása
#### [NEW] [src/pages/admin.astro](file:///C:/Work/project4%20blogspot/src/pages/admin.astro)
- A `/admin` végpont jelenleg 404-re fut, mert a szerkesztő a `/creator` alatt él.
- Létrehozok egy gyors és egyszerű átirányítást (Astro redirect), ami a `/admin`-t azonnal a `/creator`-ra irányítja át (így a megszokott admin linkek is működnek).

#### [NEW] [src/pages/[slug].astro](file:///C:/Work/project4%20blogspot/src/pages/[slug].astro)
- A statikus aloldalak (pl. `/about`, `/privacy`, `/terms`) 404-et dobnak, mert hiányzik a Markdown fájlok (`src/content/pages/*.mdx`) megjelenítéséért felelős dinamikus route.
- Létrehozok egy gyökérszintű `[slug].astro` fájlt, amely lekéri a `pages` kollekció adatait és betölti azokat egy elegáns, keskenyebb olvasó-nézetbe (Prose/Typography layout).

## Verification Plan

### Manual Verification
- Cél: Megnyitom a főoldalt (`localhost:4321`), és tesztelem a reszponzivitást, biztosítva, hogy a szövegek ne csússzanak össze.
- Cél: Navigálás a `localhost:4321/admin` URL-re -> Biztosítom, hogy betölt a Creator Workspace.
- Cél: Navigálás a `localhost:4321/about` URL-re -> Biztosítom, hogy az MDX tartalom szépen, formázottan megjelenik a 404 helyett.
