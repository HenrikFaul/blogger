# Multi-Domain Deployment and White-Label Operations

Ez a dokumentum a ForgeBlog engine üzemeltetési architektúráját írja le, különös tekintettel a multi-domain és white-label környezetekre, ahol egyetlen kódbázis (engine) hajt meg több független, egyedi domaint (pl. `faulhenrik.hu`, `travelwithanna.com`).

---

## 1. Telepítési Modellek (Deployment Models)

A ForgeBlog három fő telepítési modellt támogat a projekt méretétől és a csapat/kliensek felépítésétől függően.

### Model A — Single-site Starter
**Ideális:** Egyetlen tartalomkészítő, egyetlen dedikált oldal.
- **Leírás:** Egy GitHub repository, amely tartalmazza az engine-t és az oldal saját tartalmát is. Egy Vercel projekt, egy domain.
- **Előnyök:** A legegyszerűbb mentális modell, leggyorsabb elindulás. Nincs multi-tenant bonyodalom.
- **Hátrányok:** A motor frissítése (engine updates) manuális merge-t igényel. Nincs központi "flotta" menedzsment.
- **Architektúra:**
  ```text
  forgeblog-starter/
  ├── src/ (engine + instance config)
  ├── public/ (assets)
  └── package.json
  ```

### Model B — Monorepo Fleet
**Ideális:** Egy üzemeltető csapat kezeli több különböző kliens/márka oldalát egy közös repóból.
- **Leírás:** Egyetlen GitHub repository, több Vercel projekt. A Vercel projektek környezeti változókkal (`PUBLIC_INSTANCE_ID`) határozzák meg, melyik instance-ot (oldalt) építik fel a build során.
- **Előnyök:** Központosított engine frissítés. Egyetlen igazságforrás (single source of truth). Könnyű kódmegosztás.
- **Hátrányok:** A repó mérete megnőhet. Egyetlen hibás commit az összes oldalt (flottát) érintheti.
- **Architektúra:**
  ```text
  forgeblog-monorepo/
  ├── src/
  │   ├── engine/ (core components, themes)
  │   └── instances/
  │       ├── faulhenrik-hu/ (site.config.ts, posts/)
  │       └── travelwithanna/ (site.config.ts, posts/)
  └── package.json
  ```

### Model C — Template Repository Fleet
**Ideális:** Független tartalomkészítők saját repository-val, de azonos, központilag frissíthető motorral.
- **Leírás:** Egy "Canonical" engine repó, amelyből a kliensek saját (forkolt/template alapján létrehozott) instance repository-val rendelkeznek.
- **Előnyök:** Erős izoláció. Az instance-ek függetlenül tudnak fejlődni.
- **Hátrányok:** Bonyolultabb frissítési mechanizmus (Git-based sync script). Eltérések (divergences) alakulhatnak ki.
- **Architektúra:**
  A szinkronizációt a `scripts/update-sync.mjs` végzi, amely a `upstream/main` ágat ráolvassza a lokális repóra, de védi az instance-specifikus (`src/content/`, `site.config.ts`) fájlokat.

---

## 2. Vercel Projekt Konfiguráció és Domain Beállítások

Bármelyik modellt választjuk, az alábbi lépések szükségesek egy új instance beállításához Vercel alatt.

### Vercel Projekt beállítása
1. **Importálás:** Importáld a GitHub repository-t a Vercel-be.
2. **Framework Preset:** Válaszd ki az `Astro` presetet.
3. **Környezeti Változók:** Állítsd be a kötelező változókat (lásd 3. pont).

### Custom Domain és HTTPS
Minden site-nak teljesen önálló domainje lehet.
1. A Vercel projekt "Settings -> Domains" menüjében vedd fel az "apex" domaint (pl. `faulhenrik.hu`) és a `www` subdomaint.
2. A Domain Regisztrátornál:
   - **A Record:** `faulhenrik.hu` -> Vercel IP (`76.76.21.21`)
   - **CNAME:** `www` -> `cname.vercel-dns.com`
3. A Vercel automatikusan kiállítja az SSL/TLS tanúsítványt (Let's Encrypt), ezáltal kikényszeríti a HTTPS-t.
4. Állíts be egy "Canonical Host" átirányítást (redirect) a `www`-ről az apex-re, vagy fordítva, a SEO duplikáció elkerülése végett.

---

## 3. Környezeti Változók (Environment Variables)

Minden instance számára biztosítani kell egy `.env` fájlt, amely alapján a build lefut. A `.env.example` fájl tartalmazza a mintát.

- `PUBLIC_INSTANCE_ID`: Az instance egyedi azonosítója (Model B esetén fontos).
- `PUBLIC_SITE_URL`: **KÖTELEZŐ.** A canonical URL, amit a sitemap, OG tagek és a JSON-LD használ. *Soha ne hardkódolj domaint sablonokban!*
- `ANALYTICS_ID`: *Opcionális.* Plausible, Fathom vagy Google Analytics ID.

*Megjegyzés: A Preview / Staging URL-eket (amiket a Vercel automatikusan generál) PR-ok ellenőrzésére használjuk, ne indexeljük be őket a keresőkbe.*

---

## 4. Engine és Instance (Tartalom) Szétválasztása

Ahhoz, hogy az engine (motor) probléma nélkül frissíthető maradjon, szigorú elválasztást kell fenntartani.

### Engine kód (Közös, frissíthető)
- `src/components/`, `src/layouts/`
- `src/themes/` (Theme Registry és alap CSS tokensek)
- `src/pages/` (Astro page sablonok)
- `scripts/` (build és sync scriptek)

### Instance tartalom (Egyedi, védett)
Ezeket a fájlokat az upstream frissítés sosem írhatja felül!
- `src/config/site.config.ts` (Beállítások, Navigáció, SEO, Engedélyezett funkciók)
- `src/content/posts/`, `src/content/pages/` (MDX fájlok)
- `public/images/`, `public/admin/config.yml`

*Figyelmeztetés:* Ha az instance szinten egyedi komponensekre vagy jelentős CSS felülbírálásra van szükség, az növeli a jövőbeli motor-frissítések kockázatát (upgrade friction). Ezeket csak nagyon indokolt esetben, elkülönítve (`src/custom/`) szabad implementálni.

---

## 5. SEO Multi-Domain Checklist

Több kliens / domain üzemeltetésekor a SEO kritikus:
- [ ] A `PUBLIC_SITE_URL` helyesen van beállítva Vercelben.
- [ ] Az automatikus `sitemap.xml` az aktuális domaint tartalmazza, és be van küldve a Google Search Console-ba.
- [ ] Nem duplikálunk (szó szerint) cikkeket két különböző domain között. Ha mégis, `rel="canonical"` taggel mutassunk az "eredeti" cikkre.
- [ ] A `robots.txt` megfelelően generálódik.
- [ ] A Vercel preview domainek (`*.vercel.app`) `X-Robots-Tag: noindex` fejléccel vannak ellátva (ez alapértelmezett a Vercelnél).

---

## 6. Operatív Runbook (Gyakori forgatókönyvek)

### 6.1 Új Instance Létrehozása (Model C)
1. Használd a "Use this template" gombot a ForgeBlog Core repón, vagy másold a meglévő boilerplate-et egy új repóba.
2. Módosítsd a `src/config/site.config.ts` fájlt (név, logó, színek, navigáció).
3. Hozz létre új Vercel projektet, kösd össze a repóval.
4. Állítsd be a `PUBLIC_SITE_URL` környezeti változót Vercel-ben.
5. Rendeld hozzá a Custom Domaint.

### 6.2 Engine Frissítése (Sync Workflow)
1. Futtasd a helyi mappában: `node scripts/update-sync.mjs`
2. A script lekéri a `faulhenrik/forgeblog-core` (vagy a beállított upstream) legújabb commitjait, végrehajt egy merge-et, de helyreállítja (protect) az instance-specifikus fájlokat.
3. Készíts egy commit-ot: `git commit -m "chore: sync with upstream engine"`
4. Teszteld lokálisan (`npm run dev`), majd push-olj. A Vercel Preview URL-en is validálj.

### 6.3 Rollback
Ha egy engine frissítés hibát okoz:
1. Azonnal navigálj a Vercel dashboardra az adott projekthez.
2. A "Deployments" fülön keresd ki az előző (hibamentes) deployt, majd kattints: **"Redeploy" -> "Assign Custom Domains" (Instant Rollback)**.
3. Helyi git repóban: `git revert <hibás-merge-commit>`.

---

## 7. Verziózás és Changelog (Versioning)

A fő motor (engine) verziózása **Szemantikus Verziózást (SemVer)** követ:
- **Patch (v1.0.x):** Biztonságos, apró hibajavítások, melyek automatikusan merge-elhetők, UI törést nem okoznak.
- **Minor (v1.x.0):** Új funkciók (pl. új téma, új galéria layout), melyek visszamenőleg kompatibilisek, de ajánlott átnézni a Changelogot a merge előtt.
- **Major (vX.0.0):** Kompatibilitást törő változások (pl. tartalom séma módosítás). Manuális kód-migrációt vagy config fájl átírást igényelhetnek az instance-eknél.

*A frissítések előtt mindig ellenőrizd az Upstream CHANGELOG.md fájlját a specifikus migrációs instrukciókért!*
