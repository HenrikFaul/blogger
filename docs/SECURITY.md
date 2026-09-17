# Biztonsági áttekintés és nyitott feladatok

A vázlatimport típust, méretet, URL-t és blokklistát ellenőriz. A tárolóírás előtt a teljes új állapot validálódik. Az MDX-sorosító a felhasználói szöveget nem kódként értelmezi. A saját képek byte-fejlécet és böngészős dekódolhatóságot ellenőriznek; a Git-út még hash/path és tartalomséma ellenőrzést végez. A ZIP nem fogad be tetszőleges abszolút vagy `..` útvonalat.

Az OAuth state/PKCE és a session titkosítása, lejárata, domain/repository kötése, pontos Origin és CSRF, valamint a tényleges repository push-jog ellenőrzése kódban és logikai tesztekben szerepel. Ez nem éles OAuth E2E vagy független biztonsági audit. Szerverlogban tokent és dokumentumtörzset ne naplózz.

A Vercel CSP tiltja az object és idegen frame-ancestor használatát; a frame források YouTube privacy embedre és Vimeóra korlátozottak. **A `script-src` jelenleg tartalmaz `unsafe-inline` engedményt az Astro/React bootstrap miatt. Nem strict nonce/hash CSP.** További szigorítás csak tényleges production HTML-sel és regressziós teszttel végezhető. A fejlécértékek deploy után ellenőrizendők; az Astro helyi preview nem Vercel-fejlécpróba.

A creator URL nem autentikációs titok: helyi szerkesztésre nyitott, kizárólag nyilvános publikációmetaadatokat és az adott böngésző saját vázlatait kezeli. Távoli írás külön sessiont és szerverellenőrzést igényel. Privát dokumentumot ne ágyazz buildkor az oldal propsaiba.

Nincs beépített teljes WAF/rate limit/abuse-monitoring szolgáltatás, auditlog backend vagy független dependency-pentest. Ezek üzemeltetési feladatok. Newsletter, analitika és kommentrendszer nem aktív. A jogi mintaszöveg és a kattintásos videóindítás önmagában nem igazol jogszabályi megfelelést.
