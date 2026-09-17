# Implementation Plan: Média Komponensek UX/UI Csiszolása (Prémium Szint)

## Cél
A felhasználói kérésnek megfelelően folytatjuk a felület precíz, *regressziómentes* csiszolását. A célpont most a posztokba beágyazott média (Képgaléria, Videólejátszó, Lightbox) élményének prémium kategóriába emelése. A korábban elkészített "Streaming-stílusú" dizájnnyelvet (Netflix/Spotify jellegű hover effektek, glassmorphism, sima tranzíciók) kiterjesztjük ezekre a tartalommegjelenítőkre is.

## User Review Required
> [!IMPORTANT]
> Ez a frissítés a `src/components/media/` mappát érinti. Nem változtat a meglévő adatszerkezeten (props), így a korábban megírt cikkek (MDX) nem fognak eltörni, a javítások 100%-ban visszamenőleg kompatibilisek (regressziómentesek).

## Open Questions
> [!NOTE]
> Jelenleg a Videólejátszónál a böngésző natív kontrolljait (play, pause, timeline) használjuk miután elindult a videó. Megfelel ez, vagy cseréljük le a jövőben egy teljesen egyedi (custom) vezérlősávra? (Most csak a kezdő "Play" gombot dizájnoljuk újra prémiumra).

## Proposed Changes

---

### Média Komponensek (React)

#### [MODIFY] `src/components/media/VideoPlayer.tsx`
- **Dizájn összehangolás:** A kezdő Play gombot lecserélem az `EmbedBlock`-nál már bevált, pulzáló (ping), üveghatású (glassmorphism) prémium gombra.
- **Láthatóság:** Hozzáadok egy finom átmenetes sötétítő réteget (gradient overlay) a borítóképhez, hogy a Play gomb világos videóknál is jól kivehető legyen.
- **Kibővített Hover:** Animált lépték-nagyítás (scale) a borítóképen, amíg a videó el nem indul.

#### [MODIFY] `src/components/media/Gallery.tsx`
- **Interakciós jelzések (Affordance):** Amikor a galéria képei megnyithatók (Lightbox), hover állapotban megjelenítünk egy elegáns "Nagyítás" (Zoom/Expand) ikont a sarokban, hogy a felhasználó azonnal tudja, a kép kattintható.
- **Feliratok (Captions) finomítása:** A képfeliratok alatti sötétedő réteg (gradient) finomítása és háttérelmosás (backdrop-blur) hozzáadása a profibb megjelenésért.
- **Sima tranzíciók:** A képek hover alatti méretnövekedésének (scale) lassítása és lágyítása (`ease-out` -> `cubic-bezier` premium timing).

#### [MODIFY] `src/components/media/Lightbox.tsx`
- **Fókusz csapda (Focus Trap):** A kommentelt kód helyett implementálom a valódi fókusz csapdát, így billentyűzettel (Tab) nem lehet kimenekülni a Lightbox mögötti oldalra. Ez kritikus kisegítő lehetőség (A11y) és UX elvárás.
- **Mozgás:** A felbukkanó (fade-in) animáció és a képváltások (következő/előző) simábbá tétele a Tailwind `duration-500` és egyedi easing használatával.
- **ARIA jelölések:** A gombok hozzáférhetőségének tökéletesítése (képernyőolvasók számára).

## Verification Plan

### Automatikus Tesztelés
- `npm run build` futtatása, hogy megbizonyosodjunk arról, a TSX fájlok szintaxisa tökéletes és a statikus generálás sikeres.
- Nincsenek megszakadt hivatkozások vagy hiányzó importok.

### Manuális Ellenőrzés
- Képek és videók renderelésének vizuális tesztje különböző képernyőméreteken (responsiveness).
- Lightbox billentyűzetes navigációjának (Escape, Jobb/Bal nyíl, Tab) tesztelése.
