# Version Manifest — ForgeBlog (folio.)

Kanónikus verziólista a `C:\Work\project4 blogspot` projekthez. A részletes munkamenet-napló: [`SESSION_LOG.md`](SESSION_LOG.md).

| Verzió | Dátum | Összefoglaló |
|---|---|---|
| **0.3.0** | 2026-09-17/18 | Szerkesztőségi „folio." főoldal a Studio v2 szerint, SEO/strukturált adatok, recipe+location séma, kódmásoló, 10 előzetes típushiba javítása, Node ESM javítások, Vercel production deploy, GitHub OAuth előkészítés, **15 új téma (41 összesen) + 24 db 4K kép** |
| 0.2.0 | 2026-09-17 | (Örökölt) eredeti magazin-alapdizájn, tartalommodell, keresés, helyi írás, opcionális Git-publikálás |

## 0.3.0 commit-térkép

| Commit | Hatókör |
|---|---|
| `99386f7` | 0.3.0 alap, unit teszt CRLF javítás, astro-check javítások |
| `2a87112` | Szerkesztőségi főoldal + tokenek + illusztrációk |
| `5d3b292` | JSON-LD (Blog/BreadcrumbList/Person), recipe+location, kódmásoló |
| `cf34422` | Node ESM `.js` kiterjesztések + test loader |
| `c84e3ec` | JSON import attribútum (TS1543) |
| `7742378` | `siteUrl` a site.json-ban |
| `aedef09` | Helyes production domain (`blogger-nine-iota.vercel.app`) |

## Aktuális production

- **URL:** `https://blogger-nine-iota.vercel.app`
- **Repo:** `https://github.com/HenrikFaul/blogger`
- **Márka:** `folio.` (white-label példa), motor: ForgeBlog
