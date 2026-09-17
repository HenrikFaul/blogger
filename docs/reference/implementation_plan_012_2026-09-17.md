# Implementation Plan: Témák Bekötése és Generálása

## Cél
A felhasználó jogosan jelezte, hogy a `ThemeToggle`-ben látható témák többsége (26 darab) mögött nincs valódi CSS fájl, így bár kiválaszthatók, de nem csinálnak semmit (csak 5 db van bekötve a `global.css`-be). Célunk az összes hiányzó téma (21 darab) prémium CSS token-fájljának automatizált legenerálása, és ezek bekötése a globális stíluslapba, hogy minden téma működjön.

## Megoldási Javaslatok

1. **Hiányzó CSS fájlok generálása (Scripting):**
   Készítek egy Node.js scriptet (`scripts/generate-missing-themes.mjs`), amely végigmegy a `registry.ts`-ben definiált, de még CSS-sel nem rendelkező témákon (pl. `cyber-neon`, `retro-eighties`, `music-night`). 
   Ez a script legenerálja számukra az alapvető CSS fájlokat a megfelelő színpalettákkal, tipográfiával és effektekkel (pl. a `brutalist` témánál nyers színek és monospaced fontok, a `cyber-neon`-nál sötét háttér neon élekkel).

2. **Bekötés a `global.css`-be:**
   A legenerált CSS fájlokat dinamikusan vagy statikusan `@import` formájában hozzáadom a `src/styles/global.css` fájlhoz, így a `data-theme` attribútum váltásakor a Tailwind CSS azonnal felismeri és alkalmazza őket.

3. **Árva fájlok takarítása (Opcionális):**
   A régi `generate-themes.cjs` és a benne lévő régi struktúrák (pl. `src/themes/cyberpunk` mappák, amik nincsenek szinkronban a jelenlegi registryvel) takarítása, hogy tiszta legyen a kódbázis.

## User Review Required
> [!IMPORTANT]
> A script futtatása után hirtelen 26 teljesen különböző dizájn-téma fog működni a rendszerben. Mivel a palettákat (színeket) generatív módon állítom be a nevük/hangulatuk alapján, lehet hogy lesznek amik finomhangolást igényelnek majd. Rendben van, hogy így legenerálom az első verziót az összes mögé, hogy végre működjenek?

## Verification Plan
1. Script futtatása.
2. `npm run build` ellenőrzés (hogy a Tailwind v4 gond nélkül beolvassa-e mind a 26 css filet).
3. Vizuális teszt: A menüből a `Retro Eighties` és `Cyber Neon` témák kiválasztásakor az oldal sötét módba vált és megkapja a neon/retro színeket.
