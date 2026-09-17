# Premium UI/UX Polish - Phase 2 (Article, Footer, Core Components)

## Goal
Folytatjuk a prémium UI/UX kialakítását a Senior UI/UX Designer és Design System Lead szerepek (és a Premium UI UX Product Design skill) elvárásainak megfelelően. A fókusz most az olvasási élményen (cikk oldal), a láblécen (SiteFooter) és az alapvető interakciós komponenseken (Button) van. 

A cél, hogy a felület minden állapota (hover, focus, active) prémium érzetet nyújtson (árnyékok, mikro-animációk, pontos tipográfia, blur hatások), és a komponensek tökéletesen illeszkedjenek a design token rendszerhez.

## User Review Required

> [!IMPORTANT]
> Kérlek nézd át a javasolt változtatásokat! A legfontosabb kérdés: a cikkek olvasási élményéhez szeretnéd, ha bekerülne egy **olvasottságot mutató progress bar** (felül végigfutó vékony vonal), illetve a cikk első betűjének iniciálé (Drop Cap) formázása, ahogy az a prémium szerkesztőségi (editorial) dizájnoknál szokás?

## Open Questions

- A `button.tsx` jelenleg `bg-forge-primary` osztályokat használ. Ezeket lecserélem a hivatalos `bg-primary` és `text-primary-contrast` tokenekre. Van olyan régi komponens, ami még a `forge-` prefixet használja és elromolhat? (A keresések alapján nem találtam mást, de érdemes tudni).
- Szeretnél-e "szmooth scroll" (finom görgetés) élményt globálisan bekapcsolni?

---

## Proposed Changes

### Core UI Components (Design System Alignment)

#### [MODIFY] [button.tsx](file:///C:/Work/project4%20blogspot/src/components/ui/button.tsx)
- Token-paritás javítása: `bg-forge-primary` -> `bg-primary text-primary-contrast`.
- Interakciós állapotok bővítése: `active:scale-95` (mikro-animáció kattintáskor).
- Átmenetek: `transition-all duration-fast`.
- Focus gyűrűk összehangolása a globális `var(--color-focus-ring)`-el, leváltva az alapértelmezett tailwind focus-t.
- Árnyékok finomítása (hover esetén az árnyék mélyül).

### Layouts & Views

#### [MODIFY] [ArticleLayout.astro](file:///C:/Work/project4%20blogspot/src/layouts/ArticleLayout.astro)
- **Olvasási Progress Bar:** Hozzáadunk egy kliens oldali scriptet, ami görgetés közben mutatja hol tart az olvasó.
- **Tipográfiai Finomítások:** 
  - Az első bekezdés kap egy opcionális iniciálé (drop cap) stílust a `prose-forge` osztályon belül (vagy külön wrapperrel).
  - A szerzői blokk (author) kiemelése profilképpel (ha elérhető) és jobb tipográfiai hierarchiával.
  - Az egész cikk animálva jelenik meg (entrance animation, ahogy a főoldalon is).
- **Idézet blokkok:** Kifinomultabb blockquote stílusok (bal oldali hangsúlyos vonal `border-primary` színnel, eltérő háttérszín vagy dőlt betű).

#### [MODIFY] [SiteFooter.astro](file:///C:/Work/project4%20blogspot/src/components/chrome/SiteFooter.astro)
- A headerhez hasonlóan kap egy prémium "blur" réteget vagy finom felső árnyékot, hogy elváljon a tartalomtól.
- Link hover effektek: finom `underline-offset-4 decoration-primary/50 hover:decoration-primary` animált aláhúzás.
- Jobb mobil reszponzivitás a link grid esetén.
- Social ikonok kapnak egy kis hover mikro-animációt (`hover:scale-110 hover:text-primary transition-all`).

#### [MODIFY] [BaseLayout.astro](file:///C:/Work/project4%20blogspot/src/layouts/BaseLayout.astro)
- Globális "smooth-scrolling" (`scroll-behavior: smooth`) hozzáadása.
- Focus-visible stílusok finomhangolása, ha szükséges.

## Verification Plan

### Automated Tests
- Ellenőrizni, hogy az Astro build (`npm run build`) továbbra is hibátlanul lefut.

### Manual Verification
- Cikk megnyitása és a progress bar, drop cap, blockquote stílusok, hover effektek vizuális ellenőrzése.
- A Footer linkjein a hover/focus állapotok akadálymentességének (kontraszt) és kinézetének tesztelése.
- Button komponensek gombnyomási tesztje (scale effekt).
