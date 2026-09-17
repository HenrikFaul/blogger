# ForgeBlog: fejlesztői szerződés

## Kanonikus források
`src/config/site.json` az instance-beállítás; `src/config/schema.ts` a sémája. `src/themes/registry.ts` a témakatalógus; `src/styles/themes/*.css` a tényleges tokenek. Ne készíts párhuzamos konfigurációt vagy második témagenerátort.
A tartalom `src/content/`, a tényleges közös cikkmodell `src/lib/content-schemas.ts`, a nyilvánossági szabály `src/lib/public-content.ts`.
Az egyetlen alkotói belépő `src/components/creator/WorkspaceApp.tsx`; dokumentummodell, tárolás, média, MDX és ZIP: `src/lib/creator/`.

## Nem sérthető invariánsok
A vázlat UUID-je nem a cím vagy slug. Helyi mentés nem Git-mentés, PR nem éles publikálás. Sérült/kvótás tárolót ne nullázz le; importot és írást még felülírás előtt validálj. Helyreállítás új másolatot készít. A saját képfájlok legyenek benne a mentésben, ne csak a blob URL-jeik.
Ne bontsd le a Tiptap-példányt médiaválasztáskor vagy előnézetkor: kurzor és undo-history megőrzendő. Egy kép/galéria beszúrása editortranzakció.
Minden tartalomnézet ugyanazt a publikálhatósági szabályt használja. A kategóriák többértékűek. Ne vezesd vissza a kitalált számokat, nem működő gombokat, lorem ipsumot vagy hamis sikerüzenetet.
Ne küldj Git-tokent a kliensnek. A szerver pontos origint és jogosultságot ellenőriz; ne használj `force:true` ref-frissítést. Ne végezz automatikus merge-et vagy felhasználói GitHub/Vercel-módosítást pusztán egy refaktor részeként.

## Munkamenet
Olvasd el a README-t, a `docs/REQUIREMENTS_MATRIX.md`, `docs/MIGRATION.md` és `docs/QA_REPORT.md` fájlokat. Az eredeti tervek a `docs/reference/` alatt történeti bemenetek; korábbi „kész” megjelölésük nem tesztbizonyíték.
Kis, ellenőrizhető változtatások; mindkét viewport és releváns állapot; unit/regressziós teszt minden adatvesztési vagy biztonsági hibához. Futás: `npm run verify`, majd `npm run test:e2e`. CI/production csak tényleges sikeres futás után jelölhető késznek.
A `scripts/qa/` diagnosztikai megjelenítő NEM Astro/Vite/MDX build és nem production szerver. Ne használd deployra és ne kapcsold a natív tesztkapu helyére. A tárolófixture nem bizonyít IndexedDB-persistenciát.
Frissítsd a CHANGELOG, REQUIREMENTS_MATRIX és QA_REPORT megfelelő részeit; ne tarts fenn párhuzamos igazságforrásokat. A felhasználói tartalmat, konfigurációt és saját médiát migrációs mentés nélkül ne töröld.
