# Implementation Plan 002 (2026-09-17): Premium UI Polish, Security & Launch Readiness

A korábbi UI tervezet (`implementation_plan.md`) kiegészítve, és ahogy kérted, új, dátumozott verzióban elmentve a követhetőség érdekében. 
Célunk: A felület valóban prémium, kifinomult és tökéletes legyen (megszüntetve a "gagyi" érzést), majd befejezzük a projektet a biztonsági (09) és publikálási (10) fázisokkal.

## Proposed Changes

---

### Phase 8.5 v2: Premium UI Polish (A UX/UI tökéletesítése)
A korábbi egyszerű megoldásokat lecseréltük valódi prémium megoldásokra:
1. **Mikro-animációk & Hover Effecktek:** Gombok, linkek, és kártyák finom, 300-500ms-es átmeneteket, felugró (lift) effekteket kaptak.
2. **Glassmorphism & Blur:** A fejléc és az oldalsávok finom, elmosódott hátteret kaptak (`backdrop-blur`).
3. **Tipográfia & Térközök finomhangolása:** A vizuális hierarchia, a sortávolságok, a nagy margók és az árnyékok (`shadow-lg` vs `shadow-sm`) tökéletesítése. Szigorúbb betűméret-arányok a luxus érzetért.

---

### Phase 9: Security, Privacy & Operations
A statikus, Git-alapú architektúrának megfelelő biztonsági réteg kialakítása.

#### [NEW] docs/operations/security-and-privacy.md
- Threat model (GitHub fiók védelme, tokenek).
- Zod sémák szigorítása a frontmatter validáláshoz.
- CSP (Content Security Policy) dokumentáció és javasolt konfiguráció.
- Privacy-first analitika (Plausible/Fathom) javaslata és cookie-kezelés.
- Backup és visszaállítási (Disaster Recovery) terv Git történet alapján.

---

### Phase 10: Launch Readiness, QA & Growth System
A projekt végső átadási csomagja, hogy a blog üzemkész és publikálható legyen.

#### [NEW] docs/operations/launch-readiness.md
- **E2E és QA stratégia:** A legfontosabb felhasználói (olvasói és creator) útvonalak tesztelési terve.
- **Performance & SEO:** Lighthouse limitek (LCP, INP, CLS) és SEO meta tagek (OpenGraph, sitemap, JSON-LD) ellenőrzése.
- **A11y (Akadálymentesítés):** Billentyűzet-navigáció, kontraszt, és képernyőolvasó (screen reader) támogatás.
- **Runbook (Launch Guide):** Lépésről-lépésre leírás a projekt Vercel-be történő importálásához, domain beállításához és a GitHub ágak védelméhez.

## Verification Plan

### Automated Tests
- `npm run build` sikeres lefutása.

### Manual Verification
- A lokális szerveren az oldal vizuális átnézése, figyelve az új prémium animációkra.
