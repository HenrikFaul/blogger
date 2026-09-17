import { mkdirSync, writeFileSync } from 'node:fs';
const dir = 'C:/Work/project4 blogspot/src/styles/themes';
mkdirSync(dir, { recursive: true });
// [key, name, category, summary, idealFor, defaultMode, swatch1, swatch2, swatch3, light[9], dark[9]]
const themes = [
 ['forest-walks','Forest Walks','lifestyle','Mély erdőzöld, meleg fa tónusok.','nature','light','#2f5233','#f4f1ea','#c6b498',['#f4f1ea','#fffdf7','#e8e3d6','#1f2a22','#5c6657','#d8d4c4','#2f5233','#ffffff','#e3e8d8'],['#141b16','#1d261f','#27332b','#e8efe2','#a8b4a0','#33423a','#9fcaa0','#16211a','#2b3a2c']],
 ['ocean-breeze','Ocean Breeze','lifestyle','Óceánkék, homokos krémszín.','travel','light','#1f6f8b','#f2f7fa','#7ec3dc',['#f2f7fa','#ffffff','#e3edf2','#1c2b36','#5b6b78','#d3e0e8','#1f6f8b','#ffffff','#e0edf2'],['#101820','#17232d','#21323f','#e2eef4','#9fb3c0','#2c3c49','#7ec3dc','#0f1a22','#1e2f3a']],
 ['terracotta-sunset','Terracotta Sunset','lifestyle','Meleg terrakotta, krémszín.','food','light','#c15f3c','#faf1e9','#e08a63',['#faf1e9','#fffdf9','#f3e6db','#33241d','#7d6a5e','#e8d5c5','#c15f3c','#ffffff','#f5e2d5'],['#1c1410','#261b15','#352a22','#f4e7dd','#b9a291','#3d2c22','#e08a63','#241309','#3a291e']],
 ['lavender-mist','Lavender Mist','minimal','Lágy levendula, fehér.','minimal','light','#6b5b95','#f7f5fb','#b3a3d8',['#f7f5fb','#ffffff','#ece8f5','#2a2535','#6d6580','#e2ddef','#6b5b95','#ffffff','#ece8f5'],['#191627','#211d33','#2b2440','#ece8f5','#a99fc7','#342c4c','#b3a3d8','#1b1428','#2b2440']],
 ['midnight-navy','Midnight Navy','professional','Sötét sötétkék, arany akcentus.','professional','dark','#1b3a5c','#c7a252','#0c1219',['#eef1f5','#ffffff','#dfe8f0','#16202e','#5a6577','#d4dbe4','#1b3a5c','#ffffff','#dfe8f0'],['#0c1219','#131c27','#1e2c3e','#e6ecf3','#93a3b8','#28374a','#c7a252','#141210','#1e2c3e']],
 ['sage-garden','Sage Garden','lifestyle','Zsályazöld, törtfehér.','wellness','light','#7a8c6a','#f5f6f0','#b8c99e',['#f5f6f0','#ffffff','#e7ebdc','#2a2f26','#6a7060','#dcdccf','#7a8c6a','#ffffff','#e7ebdc'],['#171a14','#20251b','#2b3224','#eef0e6','#aeb4a0','#363d2f','#b8c99e','#1a2016','#2b3224']],
 ['rose-quartz','Rose Quartz','lifestyle','Lágy rózsaszín, krémszín.','lifestyle','light','#b06c7d','#fbf4f5','#d39aa8',['#fbf4f5','#fffdfd','#f3e3e6','#33262a','#7d6a6e','#e9d8da','#b06c7d','#ffffff','#f3e3e6'],['#1c1316','#251a1d','#39262b','#f6e9eb','#bd9da2','#3d2b2f','#d39aa8','#24131a','#39262b']],
 ['charcoal-studio','Charcoal Studio','professional','Faszénszürke, narancs akcentus.','portfolio','light','#3a3a3a','#e07b39','#f2f2f1',['#f2f2f1','#ffffff','#ecece9','#232323','#6b6b68','#d9d9d6','#3a3a3a','#ffffff','#ecece9'],['#141414','#1c1c1c','#262626','#ececec','#a0a0a0','#303030','#e07b39','#1a1209','#262626']],
 ['sky-paper','Sky Paper','minimal','Világoskék, fehér papír.','minimal','light','#3a7ca5','#f3f7fa','#85b6d4',['#f3f7fa','#ffffff','#e2edf4','#22303c','#62727f','#d7e2ea','#3a7ca5','#ffffff','#e2edf4'],['#0f171d','#16212a','#1e2e3a','#e6eef4','#9db1be','#2a3a47','#85b6d4','#0e1820','#1e2e3a']],
 ['golden-hour','Golden Hour','lifestyle','Meleg arany, barna.','photography','light','#a87b2f','#faf4e8','#d6ad5e',['#faf4e8','#fffdf7','#f3e6c8','#33281c','#7d6f58','#e5d7ba','#a87b2f','#ffffff','#f3e6c8'],['#1b150d','#251d12','#372a19','#f6ecd7','#bcaa87','#3c2f1d','#d6ad5e','#211707','#372a19']],
 ['ink-and-paper','Ink and Paper','minimal','Fekete tinta, fehér papír.','writing','light','#111111','#ffffff','#555555',['#ffffff','#ffffff','#f0f0f0','#111111','#555555','#dddddd','#111111','#ffffff','#f0f0f0'],['#111111','#161616','#222222','#f5f5f5','#a0a0a0','#2c2c2c','#f5f5f5','#111111','#222222']],
 ['moss-stone','Moss Stone','lifestyle','Mohazöld, kőszürke.','nature','light','#5b6b4f','#f4f5f1','#a5bb8f',['#f4f5f1','#ffffff','#e5e9df','#262b24','#666d60','#d8dcd2','#5b6b4f','#ffffff','#e5e9df'],['#161a14','#1f241b','#29301f','#edf0e6','#a8b09d','#343c2e','#a5bb8f','#191f14','#29301f']],
 ['coral-reef','Coral Reef','creative','Korall, türkiz.','creative','light','#e0664f','#faf5f3','#7ec4bd',['#faf5f3','#ffffff','#f4e0da','#2b2624','#756a65','#e5d8d2','#e0664f','#ffffff','#f4e0da'],['#1a1412','#221a18','#362723','#f4ebe7','#bcaba4','#3b2e28','#7ec4bd','#0f1c1a','#362723']],
 ['mono-terminal','Mono Terminal','future','Monokróm, terminálzöld.','developer','dark','#0f7a3d','#0d0d0d','#3ddc84',['#f0f0f0','#ffffff','#e3e3e3','#1a1a1a','#666666','#cccccc','#0f7a3d','#ffffff','#e3e3e3'],['#0d0d0d','#141414','#1e1e1e','#e6e6e6','#8a8a8a','#2a2a2a','#3ddc84','#0a140c','#1e1e1e']],
 ['warm-library','Warm Library','professional','Meleg barna, krémszín.','editorial','light','#6b4f2a','#f7f3ec','#c9a56a',['#f7f3ec','#fffdf8','#eee4d3','#2e2720','#6f6456','#e0d6c6','#6b4f2a','#ffffff','#eee4d3'],['#1a150f','#231d15','#352b1a','#f3ebdd','#b5a68c','#3a3020','#c9a56a','#1e160b','#352b1a']],
];
for (const t of themes) {
 const [key,name,,,idealFor,defaultMode,,,sw,light,dark] = t;
 const [lp,ls,lss,li,lm,ll,lpr,lon,las] = light;
 const [dp,ds,dss,di,dm,dl,dpr,don,das] = dark;
 const css = `/* ${name} — generated theme. No remote font requests. */
[data-theme="${key}"] { --heading-font: "EB Garamond", Georgia, "Times New Roman", serif; --corner: 12px; }
[data-theme="${key}"][data-mode="light"] { --page: ${lp}; --surface: ${ls}; --surface-soft: ${lss}; --ink: ${li}; --muted: ${lm}; --line: ${ll}; --primary: ${lpr}; --on-primary: ${lon}; --accent-soft: ${las}; --danger: #a53535; --shadow: 0 12px 36px rgb(32 39 32 / 0.07); }
[data-theme="${key}"][data-mode="dark"] { --page: ${dp}; --surface: ${ds}; --surface-soft: ${dss}; --ink: ${di}; --muted: ${dm}; --line: ${dl}; --primary: ${dpr}; --on-primary: ${don}; --accent-soft: ${das}; --danger: #ffb4ac; --shadow: 0 12px 36px #00000020; }
`;
 writeFileSync(`${dir}/${key}.css`, css);
}
writeFileSync('C:/Work/_themes_done.txt', 'Generated ' + themes.length + ' CSS files');
