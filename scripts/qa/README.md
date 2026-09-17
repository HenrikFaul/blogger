# Kizárólag diagnosztikai kompatibilitási megjelenítő

Ez nem a production Astro compiler. Az Astro források AST/TSX konverziója, egy saját JSX/slot runtime, a tényleges React/Tiptap források egyszerű bundlere és Mistune Markdown-renderelés. Nem futtatja a natív Astro/Vite/MDX buildet.

Kizárólag localhoston indul, production módban vagy szervertitkok jelenlétében megtagadja az indulást. A megkülönböztető QA response header és opaque-origin CORS a diagnosztikához tartozik, nem production beállítás. Ne telepítsd Vercelre a build alternatívájaként.

Feltételek: npm-függőségek, Python + mistune + playwright, a mellékelt Python diagnosztikához Chromium a /usr/bin/chromium útvonalon (más gépen módosítsd az executable_path értéket).

```sh
npm run qa:prepare
npm run qa:preview
# Másik terminálból:
python scripts/qa/diagnostic_suite.py
```

A teszt `set_content`-tel, a valódi HTML/CSS/React mellett **explicit memóriabeli localStorage/IndexedDB fixture-t** használ. Az API-session válasz ebben a DOM tesztben szándékosan configured:false. Ez nem natív tároló-, OAuth-, hálózati vagy security-header próba. A környezet menedzselt navigációtiltását nem módosítja.

Az átadási eredmények: docs/QA_REPORT.md és docs/evidence. Éles kapuhoz mindig `npm run verify` és a natív `npm run test:e2e` kell.
