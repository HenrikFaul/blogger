# Műszaki áttekintés

## Olvasás
Astro statikus útvonalak → tartalomkollekciók → közös publikálhatóság és referenciaellenőrzés → egységes nézetmodell → Astro komponensek. A React az alkotói munkatérben fut, nem a nyilvános cikk olvashatóságának feltétele. A publikus interakciókat a `public/scripts/site.js` adja; nincs kliensoldali router-életciklus, amely elveszítené a DOM-kezelőket.

A főoldal és a lista széles konténer; az olvasótörzs külön tipográfiai szélességet kap. `global.css` közös komponensek és reszponzív töréspontok. `themes.css` → 26 tokenfájl. A `data-theme`, `data-mode`, `data-layout` ugyanabból a regiszterből származik a nyilvános oldalon és a témaválasztóban. Az alkotói munkatér tudatosan állandó, olvasható felület, nem minden téma színkísérletének része.

Publikus keresés: buildelt `search.json`, csak nyilvános bejegyzések, ékezetfüggetlen helyi keresés. Nincs külső keresőszolgáltató. A szűrők és számok többkategóriás cikkeket is kezelnek.

## Írás és tárolás
`WorkspaceApp` koordinálja a dashboardot, történetlistát, egyetlen DraftEditort, médiatárat, témákat és beállításokat. A dokumentum strukturált Tiptap JSON; nem szabadon futtatható HTML/MDX. A szerkesztőmód váltása nem cseréli le a dokumentumidentitást.

`forgeblog.workspace.v3` helyi JSON: revízió, íróazonosító, vázlatok, bounded snapshotok, megjelenés. A saját képek IndexedDB-ben külön blobként tárolódnak. A nyilvános helyi témapreferencia `forgeblog.appearance`. Ezek nem felhasználói felhőfiókok, nem eszközök közötti szinkron és nem biztonsági mentés-szolgáltatás.

A `useWorkspace` 650 ms-os késleltetett, módosításfüggő mentést használ; végső CAS a tárolási határon. Több fül esetén `storage` esemény és elérhető Web Locks segíti az ütközéskezelést. Web Locks nélküli böngészőnél a CAS nem tekintendő adatbázis-tranzakciónak; egyidejű szerkesztéshez egy aktív fül ajánlott. Kvóta vagy sérült adat esetén látható hiba és nyers export, nem csendes törlés.

A dokumentumot export előtt típus- és méretkorlátok védik. A serializer az összes szöveget biztonságos Markdown/MDX formába alakítja; a kiválasztott saját komponenseket importálja, felhasználói ESM-et nem fogad be. Az exportált ZIP saját UTF-8/CRC32 implementáció, tesztelve és független ZIP-olvasóval is ellenőrizve.

## Opcionális távoli írás
`api/creator.ts` Vercel Node-függvény. HTTP adapter → session/Origin/CSRF → `saveDraftToGit` → GitHub Git API. Az API a szerveroldali repositoryt használja, nem a kliens által kijelölt tetszőleges célrepót.

A mentés a képfájlokat, MDX-et és `.forgeblog/drafts/<UUID>.json` forrást egyetlen commitba teszi a vázlat ágán. Elvárt SHA-eltérés esetén nincs force-push. A publikálási kérelem PR-t készít; merge és deployment külön üzemeltetői folyamat. A már publikált MDX itt olvasható/megnyitható, de nincs általános, veszteségmentes MDX → rich editor round-trip.

## Tudatos határok
Nincs adatbázis, közös több-bérlős admin, automatikus upstream merge, valós idejű társszerkesztés, kész analitika/newsletter backend vagy AI-szolgáltatás. A többdomaines modell külön instance-konfiguráció és külön telepítés. A konfiguráció exportálása nem írja át önmagában a repót vagy az éles oldalt.
