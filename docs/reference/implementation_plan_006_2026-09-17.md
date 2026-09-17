# Implementation Plan: Media Library UX & UI Csiszolás

## Goal
A `21_UX_FLOWS.system.md` irányelveinek és a "prémium, milliméter-pontos editorial" vizuális iránymutatásoknak megfelelően újraépítjük és kibővítjük a `MediaLibrary.tsx` és `ImageUploader.tsx` komponenseket. A fő cél a felületek teljes **állapot-mátrixának** (loading, empty, success, error) lefedése, valamint a mikro-animációk és vizuális minőség drasztikus javítása.

## User Review Required
> [!IMPORTANT]
> A `MediaLibrary` jelenleg statikus mock adatokat használ. A UX flow teljes lefedéséhez be fogok vezetni mesterséges állapotokat (pl. `isLoading`, `hasError`, `isEmpty`), hogy lásd és tesztelhesd a loading skeletonokat, az üres állapot (Empty State) designját, és a hibaüzeneteket. Később ezeket az állapotokat kötjük majd be a valós API hívásokhoz. Megfelel ez a megközelítés?

## Proposed Changes

### 1. Állapot-mátrix (State Matrix) Implementálása a Médiatárban
#### [MODIFY] [src/components/creator/media/MediaLibrary.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/media/MediaLibrary.tsx)
- **Loading State:** Prémium skeleton betöltő képernyő (pulzáló, szürke-áttetsző blokkok), amíg a képek "töltődnek".
- **Empty State:** Ha nincs kép, egy gyönyörű, üres állapotot jelző vizuális elem jelenik meg (pl. ikon + "Még nincsenek feltöltött képeid" mikro-copy) egy egyértelmű "Feltöltés" CTA-val.
- **Error State:** Ha hiba történik a képek betöltésekor, elegáns, de határozott hibaüzenet jelenik meg újrapróbálkozási (Retry) lehetőséggel.
- **Premium Success State:** A jelenlegi képgaléria finomítása. Blur-hatások (`backdrop-blur-md`) a kártyák információs sávján, finomabb beúszás (staggered fade-in) a képek megjelenésekor.

### 2. Képfeltöltő (Image Uploader) Prémium UX
#### [MODIFY] [src/components/creator/media/ImageUploader.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/media/ImageUploader.tsx)
- **Edge Cases & Error State:** Fájltípus és fájlméret validáció (pl. ha valaki 50MB-os PDF-et húz be, azt visszautasítja egy elegáns hibaüzenettel).
- **Drag & Drop Animációk:** Amikor a fájlt fölé húzzák (`isDragging`), a zóna dinamikusan reagál, finom árnyékokkal (glow effect) és felskálázással (spring animation).
- **Progress Flow:** A feltöltési folyamat (Progress bar) vizuális átalakítása: sima átmenetek, százalékos értékek letisztult tipográfiával.

### 3. Gallery Builder Sidebar (Jobb oldali panel) finomítás
- **Micro-interactions:** A kiválasztott képek átrendezésének (ha van) és törlésének hover-effektjeit lágyabbra (ease-in-out) állítjuk. 
- A gombok és inputok stílusát hozzáigazítjuk a korábban már kialakított gomb (Button) design rendszerhez.

## Verification Plan

### Manual Verification
- A komponenseket manuálisan végigkattintgatom.
- Tesztelem a Drag & Drop funkcionalitást és az ahhoz tartozó vizuális visszajelzéseket.
- Ellenőrzöm, hogy a különböző állapotok (loading, empty, success) prémium érzetet keltenek-e.
