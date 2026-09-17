import { writeFileSync } from 'node:fs';
const T = [
 ['forest-walks','Forest Walks','lifestyle','Mély erdőzöld, meleg fa tónusok.','nature','light','#2f5233','#f4f1ea','#c6b498'],
 ['ocean-breeze','Ocean Breeze','lifestyle','Óceánkék, homokos krémszín.','travel','light','#1f6f8b','#f2f7fa','#7ec3dc'],
 ['terracotta-sunset','Terracotta Sunset','lifestyle','Meleg terrakotta, krémszín.','food','light','#c15f3c','#faf1e9','#e08a63'],
 ['lavender-mist','Lavender Mist','minimal','Lágy levendula, fehér.','minimal','light','#6b5b95','#f7f5fb','#b3a3d8'],
 ['midnight-navy','Midnight Navy','professional','Sötét sötétkék, arany akcentus.','professional','dark','#1b3a5c','#c7a252','#0c1219'],
 ['sage-garden','Sage Garden','lifestyle','Zsályazöld, törtfehér.','wellness','light','#7a8c6a','#f5f6f0','#b8c99e'],
 ['rose-quartz','Rose Quartz','lifestyle','Lágy rózsaszín, krémszín.','lifestyle','light','#b06c7d','#fbf4f5','#d39aa8'],
 ['charcoal-studio','Charcoal Studio','professional','Faszénszürke, narancs akcentus.','portfolio','light','#3a3a3a','#e07b39','#f2f2f1'],
 ['sky-paper','Sky Paper','minimal','Világoskék, fehér papír.','minimal','light','#3a7ca5','#f3f7fa','#85b6d4'],
 ['golden-hour','Golden Hour','lifestyle','Meleg arany, barna.','photography','light','#a87b2f','#faf4e8','#d6ad5e'],
 ['ink-and-paper','Ink and Paper','minimal','Fekete tinta, fehér papír.','writing','light','#111111','#ffffff','#555555'],
 ['moss-stone','Moss Stone','lifestyle','Mohazöld, kőszürke.','nature','light','#5b6b4f','#f4f5f1','#a5bb8f'],
 ['coral-reef','Coral Reef','creative','Korall, türkiz.','creative','light','#e0664f','#faf5f3','#7ec4bd'],
 ['mono-terminal','Mono Terminal','future','Monokróm, terminálzöld.','developer','dark','#0f7a3d','#0d0d0d','#3ddc84'],
 ['warm-library','Warm Library','professional','Meleg barna, krémszín.','editorial','light','#6b4f2a','#f7f3ec','#c9a56a'],
];
const entries = T.map(([key,name,category,summary,idealFor,defaultMode,s1,s2,s3]) => `  {
    key: "${key}",
    name: "${name}",
    category: "${category}",
    summary: "${summary}",
    idealFor: "${idealFor}",
    moods: ["reading-first"],
    supportsDarkMode: true,
    supportsUserModeToggle: true,
    defaultMode: "${defaultMode}",
    preview: {
      image: "/media/stock/stock-0.jpg",
      alt: "${name} előnézet",
      accentSwatches: ["${s1}", "${s2}", "${s3}"],
    },
    fonts: { heading: "Georgia", body: "system-ui", mono: "monospace" },
    features: {
      supportsImmersiveHero: true,
      supportsGridHomepage: true,
      supportsLargeMedia: true,
      supportsDecorativeMotion: false,
      preferredGalleryLayouts: ["editorial-grid", "masonry", "stacked"],
    },
    tokensFile: "/src/styles/themes/${key}.css",
    layoutVariant: "reading-first",
    componentVariants: { card: "reading-first", header: "reading-first" },
  },`).join('\n');
writeFileSync('C:/Work/_registry_snippet.txt', entries);
writeFileSync('C:/Work/_css_imports.txt', T.map(([key]) => `@import "./themes/${key}.css";`).join('\n'));
