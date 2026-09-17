# Implementation Plan: UI Hibajavítások és Stabilitás

## Cél
A felhasználó által jelzett három kritikus hiba kijavítása:
1. **Téma gomb nem működik:** A navigáció után a gomb elveszíti a funkcionalitását.
2. **"All Articles" elrendezés szétesése:** A főoldalon a bejegyzések hiánya vagy a flexbox wrapping miatt a tipográfia egymásra csúszik és a gombok összezsúfolódnak.
3. **Collections 404 hiba:** A "View collection" gomb a `collections/slow-living` oldalra visz, ami jelenleg nem létezik (404 Not Found).

## Megoldási Javaslatok

### 1. Téma Gomb (ThemeToggle.astro) Javítása
*Hiba oka:* Az Astro ViewTransitions (`ClientRouter`) használata miatt a `DOMContentLoaded` esemény csak az első oldalbetöltéskor fut le. Amikor a felhasználó navigál, a DOM újraépül, de az event listenerek nem kerülnek újra felcsatolásra.
*Megoldás:* A `DOMContentLoaded` eseményt kicserélem `astro:page-load`-ra, így minden oldalváltáskor újra aktiválódik a gomb.

### 2. "All Articles" Elrendezés (index.astro) Javítása
*Hiba oka:* Ha nincsenek publikált bejegyzések, a rács (grid) eltűnik, és a "Load more articles" gomb felcsúszik a cím mellé/alá, ami furcsa összezsúfolódást okoz. Ezen felül a flexbox nem engedélyezi a sortörést (wrap), így kisebb képernyőkön a szöveg egymásra torlódhat.
*Megoldás:* 
- Hozzáadok egy üres állapotot (Empty State), ha nincsenek cikkek, így a layout nem omlik össze.
- A címsort (`h2`) és a jelvényt tartalmazó flex konténerhez hozzáadom a `flex-wrap` osztályt.
- Törlöm a felesleges hardcoded "Load more articles" gombot, ha nincsenek is cikkek.

### 3. Collections Oldal (404) Megoldása
*Hiba oka:* Nincs létrehozva a `/collections/[slug]` útvonal.
*Megoldás:* Létrehozok egy új Astro oldalt a `src/pages/collections/[slug].astro` útvonalon, ami elegánsan listázza az adott gyűjteményhez tartozó cikkeket (vagy egyelőre egy szép "Hamarosan" oldalt mutat, ha a CMS még nincs bekötve).

## User Review Required
> [!IMPORTANT]
> Ezek a javítások azonnal megoldják a gombok szétesését és a 404-es hibát. Rendben van, ha végrehajtom őket?
