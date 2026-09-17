# Indítási és üzemeltetési útmutató

## Helyi ellenőrzés
Node 24, tiszta munkamappa, `npm ci`, `npm run verify`, `npx playwright install chromium`, `npm run test:e2e`. A projekt lockfile-ja megmaradt; operációs rendszer-specifikus telepített függőségeket nem adunk át. A kompatibilitási QA szerver használatát ne keverd össze a production builddel.

## Első éles instance
Készíts saját repositoryt az új forrásból. Állítsd be az instance-konfigurációt, szerzőket, témákat és jogtiszta saját médiát. A Git-integráció teljesen opcionális. Az éles Vercel-környezetben add meg a valós HTTPS-origint; `VERCEL_ENV=production` mellett hiányzó origin buildhibát okoz. Preview noindex marad.

Vercel-projekt: Astro framework, Node 24, `npm run build`, output `dist`. A `vercel.json` tartalmazza a statikus konfigurációt, az opcionális Node API-függvényt és a válaszfejléceket. Ezek tényleges érvényesülését telepítés után vizsgáld meg. A CI GitHub Actions-konfigurációja szerepel a csomagban, de itt nem futott távoli workflow.

Az új instance-en ellenőrizd a kezdőlapot, keresést, cikket, képeket, mobilmenüt, RSS-t, sitemapet és 404-et. Ellenőrizd a böngészőkonzolt és a szolgáltatói buildlogot. A creator és az API nem kerülhet indexelhető/cache-elt tartalommá. A production-readiness kaput csak sikeres natív build és natív teszt után zárd le.

## Publikálás
A vázlat ZIP-exportja nem publikálás. A `.mdx` export alapértelmezetten `draft`. Kézi úton a `src/` és `public/` fájlokat ellenőrzött ágra másold, a tartalmat ellenőrizd, állíts érvényes szerző/kategória/dátum/slug/metaadatot és `published` státuszt, futtasd a kaput, majd jóváhagyás után merge/deploy.

Git UI esetén a mentés külön ág, a publikálás kérése külön PR. Az éles oldal csak sikeres merge és build után változik. A rendszer nem monitorozza automatikusan a deployment végét, ezért nem mutat kitalált „most éles” állapotot.

Jövőbeli publikálási idő a buildkor szűrődik. Az `examples/scheduled-rebuild.yml.example` csak opt-in minta: külön secret deploy hook és engedélyező változó után másolható workflow helyre. A példa nincs automatikusan aktiválva. A cron nem pontos idejű szolgáltatási vállalás.

## Mentés és incidens
Helyi munkát rendszeresen ments teljes JSON/mediacsomagba. A Git távoli commit a commitolt forrást őrzi, a még csak a böngészőben lévő munkát nem. Más böngésző vagy domain más helyi tárhely.

Sérült helyi tároló: ne töröld a böngészőadataidat. Használd a nyers exportot; őrizd meg az eredetit. A JSON-visszaállítás összevonással történik. Kvótahiba esetén először exportálj, és csak utána törölj szükségtelen, már mentett vázlatot/képet. A még használt képek törlését a munkatér blokkolja.

Git-ütközés: helyi export → távoli branch megnyitása → eltérés ellenőrzése → kézi egyesítés/új vázlat. Ne alkalmazz force-push automatizmust. Részleges API-hiba esetén ellenőrizd, készült-e commit/PR, mielőtt megismétled a műveletet.

Hibás éles kiadás: szolgáltatói rollback az ismert jó deploymentre, és külön Git-revert a hibás commitra. A két művelet nem helyettesíti egymást. Titokkitettség: érintett provider credential visszavonás/forgatás, SESSION_SECRET forgatás, hozzáférések és logok ellenőrzése; puszta commit-törlés nem visszavonás.

## Motorfrissítés
Az upstreamet magad ellenőrizd és fetch-eld. `npm run update:review -- <ellenőrzött-upstream-ref>` kizárólag diffet és JSON-manifestet készít a `.upstream-review` alá. Nem fetch-el, merge-el, commitol vagy pushol. Az instance-konfiguráció, tartalom és public média védett. A patch-et külön ágon, emberi ellenőrzéssel alkalmazd; utána minden teszt újra kötelező.
