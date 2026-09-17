# Implementation Plan: Átfogó Kódszintű UI/UX Generálgenerál

## Goal
A kapott kritika alapján a jelenlegi UI még mindig nem éri el a megkövetelt "prémium, milliméter-pontos" szintet. Ennek főbb okai a kódszintű, strukturális hiányosságok: globálisan felülírt, kiszámíthatatlan CSS margók, kidolgozatlan mikro-animációk, és alapvető (szürke/fehér) komponens designok.
A cél, hogy a megnyitott komponenseket (`WorkspaceApp.tsx`, `PostCard.astro`, `EmbedBlock.tsx`, `[slug].astro`) és a `global.css`-t drasztikusan újraírjam, hogy az eredmény lenyűgöző legyen.

## User Review Required
> [!WARNING]
> A `global.css`-ben található direkt HTML tag formázások (`h1`, `h2`, `p` margin-bottom beállításai) folyamatosan felülírják a Tailwind osztályokat, és ez okozza az indokolatlanul hatalmas, szétesett térközöket mindenhol. Ezeket **törölni fogom**, és a Tailwind `prose` (Typography plugin) osztályaira bízom a cikkek formázását. Rendben van ez az architekturális változtatás?

## Proposed Changes

### 1. Globális Stílusok Tisztítása
#### [MODIFY] [src/styles/global.css](file:///C:/Work/project4%20blogspot/src/styles/global.css)
- Eltávolítom a `h1`, `h2`, `h3`, `p` tagekre vonatkozó keménykódolt margókat (`margin-top`, `margin-bottom`).
- Hagyom, hogy a Tailwind utility osztályok (`mb-4`, `gap-6` stb.) és a `@tailwindcss/typography` plugin vegyék át az irányítást a térközök (spacing) felett. Ez azonnal rendbe teszi a szétesett layoutekat.

### 2. A Cikk Kártya (PostCard) Prémiumosítása
#### [MODIFY] [src/components/content/PostCard.astro](file:///C:/Work/project4%20blogspot/src/components/content/PostCard.astro)
- A "Dicebear" placeholder avatarokat lecserélem elegánsabb tipográfiai monogramokra vagy finomabb ikonokra, ha nincs szerző kép.
- A kártyák kapnak egy nagyon finom beúszó "glow" (fény) effektust hover állapotban (glassmorphism overlay).
- A tipográfiai hierarchiát szigorítom: a címek kövérebbek lesznek, a kategória "badge"-ek (címkék) áttetsző, blur effekttel (`backdrop-blur`) simulnak a képekre.

### 3. A Creator Workspace Felületének (WorkspaceApp) Kiszépítése
#### [MODIFY] [src/components/creator/WorkspaceApp.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/WorkspaceApp.tsx)
- A jelenlegi "szögletes doboz" elrendezést felváltja egy lekerekített, árnyékokkal operáló, lebegő (floating) "Dashboard" érzet.
- Az oldalsó menü (Sidebar) és a tartalmi rész közötti átmeneteket (Transitions) lágyítom.
- Az Üres Állapotokat (Empty states - pl. ha nincs vázlat) gyönyörű, ikonikus grafikákkal és barátságos szövegekkel teszem esztétikussá.

### 4. Beágyazott Tartalmak (EmbedBlock) Interaktívvá Tétele
#### [MODIFY] [src/components/media/EmbedBlock.tsx](file:///C:/Work/project4%20blogspot/src/components/media/EmbedBlock.tsx)
- A videó placeholder nem csak egy szürke doboz lesz: kap egy szimulált, elmosódott (blur) borítóképet vagy gradientet.
- A "Lejátszás" (Play) gomb kap egy animált "ping" vagy "pulse" effektust (mintha lélegezne), felhívva magára a figyelmet.
- Az adatvédelmi figyelmeztetés kisebb, elegánsabb formát ölt.

### 5. Az Egyedi Bejegyzések ([slug].astro) Csiszolása
#### [MODIFY] [src/pages/posts/[slug].astro](file:///C:/Work/project4%20blogspot/src/pages/posts/[slug].astro)
- A cikkek törzse (`prose`) megkapja a szükséges Tailwind módosítókat (`prose-img:rounded-2xl`, `prose-headings:font-extrabold`, `prose-a:underline-offset-4`).
- Bevezetek egy finom beúszó (fade-in) animációt a cikk betöltésekor.

## Verification Plan
1. A lokális szerveren (`npm run dev`) végigkattintom az összes érintett komponenst.
2. Ellenőrzöm, hogy a `global.css` módosítása nem tört-e el más felületeket (főoldal).
3. Manuálisan tesztelem a `WorkspaceApp` menüit, hover effektjeit, és az `EmbedBlock` play gombját.
