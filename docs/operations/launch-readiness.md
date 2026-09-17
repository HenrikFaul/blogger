# Launch Readiness, Quality Assurance, and Growth System

Ez a dokumentum a ForgeBlog 1.0 élesítéséhez (Launch) szükséges minőségbiztosítási (QA), publikálási és üzemeltetési lépéseket tartalmazza a 10-es követelményrendszer alapján. Célja, hogy a blog stabilan, skálázhatóan és biztonságosan üzemeljen a GitHub + Vercel környezetben.

## 1. Release Definition (Kiadási szintek)

- **Alpha:** Belső tesztverzió. Alapvető funkciók (cikk írása, mentés, Vercel preview) működnek.
- **Beta:** Zártkörű kiadás. Minden fő téma (minimal, editorial) támogatott, a tesztek integrálva, a biztonsági mentési folyamatok (runbookok) tesztelve.
- **Version 1.0 (Éles):** Közönség számára elérhető. Minden E2E teszt lefut (Playwright), 100%-os SEO és Accessibility (a11y) megfelelés, egyedi domain összekötve (HTTPS). Hiba nélkül megy a White-label frissítési folyamat.

## 2. QA Strategy and Test Pyramid

A projektben az alábbi tesztpiramis érvényesül (automatizálva a GitHub Actions és Vercel CI folyamatokban):

| Réteg | Eszköz | Cél | Futás |
|---|---|---|---|
| **Static Analysis** | TypeScript, Zod, ESLint | Típusbiztonság, formázási és séma hibák (Frontmatter) kiszűrése. | Minden lokális mentésnél és CI |
| **Unit Tests** | Vitest | Determinista üzleti logika (pl. slug generálás, metadata fallback) ellenőrzése. | `npm run test:unit` |
| **E2E Tests** | Playwright | Kritikus felhasználói utak (E2E-PUB-001: Cikk olvasása, E2E-PUB-002: Mobil navigáció) validálása valódi böngészőben. | PR CI / Release |
| **A11y / SEO** | Lighthouse, Axe-core | Akadálymentesítési hibák és SEO (JSON-LD, meta tagek) tesztelése. | E2E részeként / CI |

## 3. End-to-End Journeys (Elfogadási kritériumok)

A rendszernek teljesítenie kell az előre definiált forgatókönyveket, amikre Playwright teszteket (vagy manuális lépéseket) készítettünk:

- **E2E-PUB-001 (Olvasási élmény):** A látogató egyenesen egy cikkre érkezik. A tartalom HTML-ként azonnal látható (hydration előtt), a képek, kódblokkok és idézetek reszponzívak, a progress bar végigfut az olvasás során.
- **E2E-PUB-002 (Mobil navigáció):** 320px - 430px közötti kijelzőkön tesztelve. A mobil menü jól működik, fókuszálható, nincsenek vízszintes görgetési problémák.
- **E2E-CRE-001/002 (Creator Workflow):** A tartalom készítő authentikál (GitHub), megírja a posztot, `draft`-ként elmenti. Utána Vercel Preview-n ellenőrzi a designt, majd a publikáló gombbal a `main`-re mergeli, amit a Vercel automatikusan deployol.
- **E2E-OPS-001 (White-label Launch):** Az üzemeltető létrehoz egy új repository-t, beállítja a `site.config.ts`-t, csatol egy új egyedi domaint a Vercelhez, majd sikeresen aktiválódik a DNS és HTTPS.

## 4. Accessibility & Performance Certification

- **WCAG 2.2 AA célkitűzés:** A rendszernek teljesítenie kell az alapvető akadálymentesítési követelményeket. (Pl. billentyűzet fókuszálhatóság a Lightbox képgalériában, magas kontrasztú témák, screen reader támogatás a navigációban).
- **Teljesítmény (Performance Budget):**
  - Text-heavy article LCP ≤ 2.0s
  - Visual/Gallery article LCP ≤ 2.5s
  - CLS (Cumulative Layout Shift) ≤ 0.05
  - Publikus JavaScript payload ≤ 50KB (gzip) alap cikkeknél.

## 5. Deployment and Domain-Launch Runbook

Új ForgeBlog instancia (ügyfél vagy saját blog) elindításának lépései:

1. **Repository Setup:** ForgeBlog sablon klónozása egy új privát repository-ba.
2. **Konfiguráció:** `site.config.ts` módosítása (Szerző, Blog neve, Social linkek, Alapértelmezett téma). `privacy.mdx` és `terms.mdx` testreszabása.
3. **Vercel Import:** A repository bekötése Vercelbe (Astro preset). A környezeti változók (pl. GITHUB OAuth tokenek, Analytics ID) megadása, ha vannak ilyenek.
4. **Domain Csatlakoztatás:** A `faulhenrik.hu` (vagy más) domain hozzáadása a Vercel projekthez. A Vercel által adott CNAME/A rekordok felvitele a DNS szolgáltatónál (pl. Cloudflare).
5. **Ellenőrzés:** Megvárni, amíg az SSL (HTTPS) certifikát legenerálódik. Ezután `npm run verify` vagy a Vercel CI lefutásának ellenőrzése.
6. **SEO Audit:** A sitemap (`/sitemap-index.xml`), a robots.txt és a canonical URL-ek ellenőrzése, majd beküldés a Google Search Console-ba.

## 6. Monitoring & Rollback

- Mivel nincs adatbázis, az egyetlen hibaforrás a rosszul formázott tartalom (markdown parse hiba) vagy egy hibás theme CSS override.
- Hibás deploy esetén a Vercel "Instant Rollback" funkciójával azonnal visszaállítható az előző verzió.
- A végleges megoldás a Git history-ban egy `git revert` commit készítése, így a forráskód és az éles környezet szinkronban marad.
