# Implementation Plan: Senior Design System & UX Mesterkurzus

## Goal
A megadott Senior AI Role-ok (Product Designer, Design System Lead, Accessibility Specialist) és a Domain specifikus (CRM, Streaming, E-commerce) promptok tudásbázisát felhasználva a célunk, hogy a ForgeBlog felületét a "szép" kategóriából az **ipari standard (SaaS / Enterprise) szintű, maximálisan konvertáló és hozzáférhető** minőségbe emeljük.

## User Review Required
> [!IMPORTANT]
> A Senior Product Designer és Design System lencséken keresztül a felület nem csak "rajz", hanem döntési rendszer. Ezen terv alapján radikálisan megnöveljük a hozzáférhetőséget (WCAG 2.2) és behozunk CRM/Streaming iparági mintákat a Creator Workspace-be. Rendben van, hogy ehhez a navigációt és a Media Library-t is újraírjam ezen az extra-prémium szinten?

## Proposed Changes

### 1. Akadálymentesítés és Design System (W3C WCAG 2.2)
*Forrás: `senior_design_system_lead`, `senior_accessibility_specialist`*
#### [MODIFY] [src/components/chrome/SiteHeader.astro](file:///C:/Work/project4%20blogspot/src/components/chrome/SiteHeader.astro)
#### [MODIFY] [src/components/ThemeToggle.astro](file:///C:/Work/project4%20blogspot/src/components/ThemeToggle.astro)
#### [MODIFY] [src/styles/global.css](file:///C:/Work/project4%20blogspot/src/styles/global.css)
- **Fókusz és Navigáció:** Tökéletes, nagy kontrasztú fókuszgyűrűk (Focus Rings) implementálása minden interaktív elemen.
- **ARIA Label-ek:** A ThemeToggle és a mobil menü gomb teljes ARIA (aria-expanded, aria-controls, role="menu") támogatást kap, hogy billentyűzetről (Tab) is hibátlanul használható legyen.
- **Micro-interakciók:** A menüpontok alatti hover-effektus megerősítése és kontraszt-tesztelése.

### 2. CRM & SaaS Minták a Creator Workspace-be
*Forrás: `senior_product_designer`, `11-crm-sales.md`*
#### [MODIFY] [src/components/creator/WorkspaceApp.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/WorkspaceApp.tsx)
- A "Vezérlőpult" (Dashboard) nem csak statisztikákat mutat majd, hanem **"Next Best Action"** (Következő legjobb lépés) kártyákat kap (pl. "Folytasd a tegnap megkezdett vázlatot").
- Hozzáadok egy **Quick Action Bar**-t (Lebegő gyorsgombok), amivel bárhonnan lehet új bejegyzést vagy képet feltölteni, minimalizálva a felhasználói kattintásokat (Task Success KPI).

### 3. Media Streaming Design a Médiatárba
*Forrás: `14-media-streaming.md`*
#### [MODIFY] [src/components/creator/media/MediaLibrary.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/media/MediaLibrary.tsx)
- A képfeltöltő és galéria megkapja a Netflix/Spotify stílusú, tartalom-fókuszú kártya dizájnt.
- A képekre húzva az egeret (Hover) finoman felbukkan egy sötét "Glassmorphism" réteg, rajta a metaadatokkal (fájlméret, felbontás) és azonnali törlés/másolás gombokkal.

## Verification Plan
1. **Accessibility Audit:** A módosítások után billentyűzettel (Tab, Enter, Space) végignavigálok a fejlécen és a Workspace-en, hogy biztosítsam a teljes használhatóságot (Keyboard Trap mentesen).
2. **Design System Consistency:** Ellenőrzöm a `global.css`-ben definiált focus-ring tokeneket, hogy mindenhol egységesen jelennek-e meg.
3. **Domain Pattern Validation:** Megvizsgálom a Media Library kártyáit, hogy vizuálisan megfelelnek-e a prémium streaming szolgáltatók képmegjelenítési elvárásainak.
