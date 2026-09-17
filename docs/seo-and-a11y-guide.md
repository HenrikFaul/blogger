# SEO és hozzáférhetőség: a tényleges garanciák határa

A publikus listák, kereső és RSS ugyanazt a státusz/dátum szűrést használják. Érvényes éles HTTPS-origin nélkül a megjelenés noindex. A creator és admin kizárt a sitemapből; a sitemap csak valódi build után ellenőrizhető. Metaadatokat és sorosított JSON-LD-t a SeoHead készít; a megosztókép nem generálódik külső szolgáltatással.

Használj tömör címet és kivonatot, helyes szerző/kategória referenciát, egyedi slugot, valódi dátumot és a saját domainhez tartozó canonicalt. A címke-slug ékezetmentes normalizálással készül. A demo képeket eredeti méretű saját képekre cseréld; a width/height, ALT és képaláírás legyen valós.

A lapok alapolvasása nem igényel React-hidratálást. Vannak skip linkek, fókuszjelzések, szemantikus landmarkok, reduced-motion és nyomtatási stílusok. Kereső, mobilmenü és nagyító billentyűzetes bezárása diagnosztikailag ellenőrzött. A 26 világos/sötét téma öt alap szöveg/háttér párjára végzett kontrasztellenőrzés 260 összevetés; ez nem vizsgál minden lehetséges képfeletti feliratot, hover/focus állapotot és böngészős renderingkülönbséget.

A diagnosztikai axe audit nyolc állapotra futott: főoldal, cikk és creator dashboard asztali/mobil méretben, továbbá szerkesztő és médiatár asztali méretben. Nulla kimutatott WCAG A/AA sértés ezekben a mért állapotokban nem teljes kézi akadálymentességi audit és nem tanúsítvány. Élesítéskor képernyőolvasó, billentyűzet, nagyítás, valós mobileszköz és az összes ténylegesen használt téma további ellenőrzése szükséges.

Lighthouse, LCP/INP/CLS és valódi letöltött JS/CSS-méret a production builddel mérendő. A diagnosztikai bundler méretét és sebességét ne írd marketingadatként a termék mellé. Az audit és a screenshotok a QA-jelentésben pontosan megjelölt futási környezetből származnak.
