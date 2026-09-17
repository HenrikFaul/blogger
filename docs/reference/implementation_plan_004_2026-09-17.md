# Implementation Plan: Biztonság, Adatvédelem és Launch Readiness (09 & 10)

## Goal
A "09-security-privacy-and-operations.md" és "10-launch-readiness-quality-assurance-and-growth-system.md" dokumentumokban foglalt követelmények kód szintű lefejlesztése, valamint a hozzájuk tartozó részletes dokumentációk (runbookok, QA leírások) teljes körű kidolgozása. Célunk, hogy a ForgeBlog egy valóban élesítésre kész, biztonságos, és tesztelhető platform legyen.

## User Review Required
> [!IMPORTANT]
> Szeretném megerősíteni, hogy a 10-es feladathoz (QA) a **Playwright** (E2E tesztek) és a **Vitest** (Unit tesztek) a megfelelő választás? Be fogom állítani ezek alapinfrastruktúráját.
> Továbbá: A biztonsági fejléceket (Content Security Policy) egy `vercel.json` fájlban fogom definiálni. Ez megfelel az elvárásaidnak?

## Proposed Changes

### Biztonság és Adatvédelem (09)
*Kód szintű fejlesztések:*
#### [NEW] [vercel.json](file:///C:/Work/project4%20blogspot/vercel.json)
- Szigorú biztonsági fejlécek implementálása (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security).

#### [MODIFY] [package.json](file:///C:/Work/project4%20blogspot/package.json)
- Analitikai csomag (pl. `@vercel/analytics`) integrációjának előkészítése, adatvédelem fókusszal.

#### [NEW] [src/content/pages/privacy.mdx](file:///C:/Work/project4%20blogspot/src/content/pages/privacy.mdx)
#### [NEW] [src/content/pages/terms.mdx](file:///C:/Work/project4%20blogspot/src/content/pages/terms.mdx)
- Jogi alapsablonok (Privacy Policy, Terms of Service) létrehozása, hogy a rendszer rögtön megfeleljen a GDPR/CCPA alapelveknek.

*Dokumentáció bővítés:*
#### [MODIFY] [docs/operations/security-and-privacy.md](file:///C:/Work/project4%20blogspot/docs/operations/security-and-privacy.md)
- Teljes, 09-es prompt alapján kidolgozott Security & Privacy Runbook és Threat Model leírása (korábbi vázlat kibővítése).

---

### Launch Readiness és QA (10)
*Kód szintű fejlesztések:*
#### [MODIFY] [package.json](file:///C:/Work/project4%20blogspot/package.json)
- Tesztelési parancsok hozzáadása (`test:e2e`, `test:unit`, `verify`, `lint:a11y`).
- Szükséges teszt-függőségek telepítése (Vitest, Playwright, axe-core ha szükséges).

#### [NEW] [playwright.config.ts](file:///C:/Work/project4%20blogspot/playwright.config.ts)
- Alapvető End-to-End tesztelési konfiguráció (desktop + mobil nézetekhez).

#### [NEW] [vitest.config.ts](file:///C:/Work/project4%20blogspot/vitest.config.ts)
- Egységtesztelési keretrendszer beállítása.

#### [NEW] [e2e/public-journeys.spec.ts](file:///C:/Work/project4%20blogspot/e2e/public-journeys.spec.ts)
- E2E-PUB-001 (Cikk olvasása) és E2E-PUB-002 (Mobil navigáció) alap tesztek implementálása, hogy a rendszer tesztelhető legyen.

*Dokumentáció bővítés:*
#### [MODIFY] [docs/operations/launch-readiness.md](file:///C:/Work/project4%20blogspot/docs/operations/launch-readiness.md)
- Teljes, 10-es prompt alapján kidolgozott Launch Runbook, Test Pyramid, Accessibility & Performance Certification dokumentálása (korábbi vázlat kibővítése).

## Verification Plan

### Automated Tests
- Le fogom futtatni az `npm run build` parancsot a módosítások után.
- Le fogom futtatni az újonnan beállított teszteket (`npm run test:unit`) a konfiguráció ellenőrzésére.

### Manual Verification
- Ellenőrizni kell a `vercel.json` fejlécek helyességét és hogy nem blokkolják-e a betűtípusokat/stílusokat (CSP).
- Ellenőrizni kell az újonnan hozzáadott Markdown oldalakat a böngészőben.
