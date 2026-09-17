#!/usr/bin/env node
/** Review-only engine update. No fetch, checkout, merge, stage, commit, push or content mutation. */
import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
const ref=process.argv[2];
if(!ref||! /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref)||ref.includes('..')){console.error('Használat: npm run update:review -- upstream/main\nElőbb külön, tudatosan add hozzá és töltsd le a kívánt upstream remote-ot.');process.exit(1);}
const root=process.cwd();const git=(args,options={})=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024,...options});
try{
 const target=git(['rev-parse','--verify',`${ref}^{commit}`]).trim();
 const current=git(['rev-parse','HEAD']).trim();
 const isProtected=p=>p==='src/config/site.json'||p.startsWith('src/content/')||p.startsWith('public/')||p.startsWith('.env')||p.startsWith('.forgeblog/')||p.startsWith('docs/')||p.startsWith('.github/');
 const isEngine=p=>['src/components/','src/layouts/','src/lib/','src/styles/','src/themes/','src/server/','src/pages/','src/config/','api/','scripts/','tests/','e2e/'].some(prefix=>p.startsWith(prefix))||['package.json','package-lock.json','astro.config.mjs','tsconfig.json','playwright.config.ts','vercel.json','src/content.config.ts','src/env.d.ts','src/site.config.ts'].includes(p);
 const changed=git(['diff','--name-only','-z',current,target]).split('\0').filter(Boolean);
 const engine=changed.filter(p=>isEngine(p)&&!isProtected(p));
 const out=path.join(root,'.upstream-review');fs.mkdirSync(out,{recursive:true});
 // Literal pathspecs stop a repository filename from changing git's path matching semantics.
 const patch=engine.length?git(['diff','--binary',current,target,'--',...engine.map(p=>':(literal)'+p)]):'';
 fs.writeFileSync(path.join(out,'engine.patch'),patch);
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({mode:'REVIEW_ONLY',current,target,requestedRef:ref,included:engine,excluded:changed.filter(p=>!engine.includes(p)),instructions:'Inspect engine.patch. It has NOT been applied. On a separate branch, use git apply --check, review each change, run checks/tests/build and review deployment before merging.'},null,2));
 console.log(`Ellenőrzési csomag: .upstream-review/ (${engine.length} motorfájl).\nA munkafájlok, a Git index és a commitok nem változtak. A patch NINCS alkalmazva.`);
}catch(error){console.error('Az ellenőrzési csomag nem készíthető el:',error.message);process.exit(1);}
