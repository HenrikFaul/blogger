# Átvétel és migráció

## Biztonságos átvétel
A régi projektet őrizd meg külön mappában. Az új ZIP-et új könyvtárba bontsd ki, majd `npm ci`; ne másold rá vakon a régi teljes munkakönyvtárra. Hasonlítsd össze a saját tartalmat és beállításokat a `FILE_CHANGES.json` alapján. Az eredeti csatolt archívumok hash-e a kiadási manifestben szerepel.

## Konfiguráció és témák
Egyetlen szerkesztendő instance-fájl: `src/config/site.json`. A régi `src/site.config.ts` kompatibilitási re-export, nem második konfiguráció. Témanevekhez a `src/themes/registry.ts` a kanonikus felsorolás. Az elavult `src/themes/<név>/tokens.css` könyvtárak megszűntek; a tényleges CSS most `src/styles/themes/`.

Gyakori régi → új kulcsok: `minimal-white` → `minimal-editorial`; `swiss-style` → `swiss-grid`; `terminal` → `developer-console`; `travel` → `travel-atlas`; `cooking` → `food-journal`; `news` → `magazine-newsroom`; `fashion` → `luxury-fashion`. Nem minden régi kísérletnek van szemantikailag pontos párja: válassz a valódi katalógusból és ellenőrizd az oldalt. Ismeretlen kanonikus téma nem válik csendben egy másikká.

## Tartalom és régi komponensek
Az eredeti bemutató hello-world bejegyzés megmaradt vázlatként; a hozzáadott cikkek demonstrációs tartalmak. Az eredeti szerző/kategória erőforrások megőrzése mellett a demó saját, működő taxonómiát kapott.

A kanonikus publikus galéria: `src/components/media/Gallery.astro`. Az elavult, nem használt React `media/Gallery.tsx`, `media/Lightbox.tsx`, `islands/Lightbox.tsx` és régi `ArticleHeader.astro` megszűnt. A csatolt tartalom nem importálta ezeket. Külső, a ZIP-ben nem szereplő saját MDX esetén az importot át kell vezetni a kanonikus Astro-komponensre; ez dokumentált komponens-API változás, nem automatikus kompatibilitási ígéret.

A régi `components/galleries/GalleryMasonry.astro`, `GalleryStacked.astro`, `GalleryFilmstrip.astro`, `GalleryComparison.astro` utak vékony adapterként megmaradtak. A galéria most saját hozzáférhető dialógust kezel, ezért a régi singleton Lightbox adapter üres. Az `EmbedBlock.tsx`/`VideoPlayer.tsx` kompatibilitási primitívek nem auto-playelnek, nem engednek tetszőleges iframe-et és nem tüntetik el a natív videóvezérlést. Új publikus MDX-hez `VideoEmbed.astro` használandó.

Az `/admin/` a `/creator/` felé irányít. A sorozatok kanonikus útja `/series/`; régi collections útvonalak kompatibilitási átirányítások.

## Helyi vázlatok
A régi `forge-local-drafts` adatot a munkatér kísérli meg beolvasni a saját sémájába; az eredeti kulcsot nem törli. Előtte készíts nyers mentést. Arbitráris HTML, ismeretlen blokk, régi külső blob-hivatkozás vagy egy másik gépen létrehozott média nem helyreállítható automatikusan veszteségmentesen.

A böngészőtároló originhez kötött: más port, más domain vagy másik böngésző külön helyi adatot jelent. Átvitelhez Beállítások → teljes helyi JSON/mediamentés; az import összevon, nem nullázza a meglévő munkateret. A ZIP-en belüli `editor-source/<UUID>.json` a megfelelő importformátum; az MDX nem általános rich editor import.

## Export és már publikált cikk
Egy cikk exportja: `src/content/posts/<slug>.mdx`, `editor-source/<UUID>.json`, a saját hivatkozott képek a `public/media/uploads/` alatt. A projektben már létező demo képeket nem duplikálja. Az MDX alapból `draft`; nyilvánossá tenni ellenőrzés után lehet. Már publikált, kézzel szerkesztett MDX-et egyelőre a repóban módosíts, ne importáld úgy, mintha garantált round-trip létezne.
