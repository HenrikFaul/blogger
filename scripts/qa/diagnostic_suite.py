"""Real DOM/React diagnostics, not a production build or native storage certification.
Managed Chromium navigation is blocked; set_content + a base URL and explicit storage fixtures are used.
"""
from diagnostic_browser import open_page,BASE,html,FIXTURE
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback,time
R=Path(__file__).resolve().parents[2];OUT=R/'.qa/screenshots';OUT.mkdir(parents=True,exist_ok=True);REPORT=[]
def record(name,fn):
 try:
  detail=fn();REPORT.append({'name':name,'status':'PASS','detail':detail});print('PASS',name,flush=True)
 except Exception as e:
  REPORT.append({'name':name,'status':'FAIL','error':str(e)});print('FAIL',name,str(e)[:350],flush=True)
def check(value,msg='Assertion failed'):
 if not value:raise AssertionError(msg)
def capture(p,name):
 p.screenshot(path=str(OUT/(name+'.png')),full_page=True)
def nooverflow(p):
 return p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
def axe(p):
 p.add_script_tag(path=str(R/'node_modules/axe-core/axe.min.js'))
 result=p.evaluate("async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {passes:r.passes.length,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))}}")
 check(not result['violations'],json.dumps(result,ensure_ascii=False));return result
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for route,label in [('/','home'),('/posts/','stories'),('/categories/','categories'),('/posts/a-part-ahol-nem-kell-sietni/','article'),('/posts/a-feny-apro-tortenetei/','gallery-article'),('/archive/','archive'),('/series/','series'),('/creator/','creator')]:
  for w in [1440,390]:
   p,errors=open_page(browser,route,w,1000 if w==1440 else 844);p.set_default_timeout(6000)
   def smoke():
    check(p.locator('main').count()==1,'main landmarks');check(nooverflow(p),'Horizontal overflow');check(not errors,'JS errors: '+str(errors));check(not p.locator('img').evaluate_all('(imgs)=>imgs.filter(i=>i.complete&&i.naturalWidth===0).length'),'Broken images')
   record(f'{label}/{w}: DOM, media and overflow',smoke)
   if label in ['home','article','creator']:record(f'{label}/{w}: axe WCAG A/AA',lambda:axe(p))
   if label in ['home','article','creator'] or (label=='stories' and w==1440):capture(p,label+('-desktop' if w==1440 else '-mobile'))
   if label=='home':
    def search():
     p.get_by_role('button',name='Keresés a történetek között').click();p.locator('#global-search-input').fill('feny');p.wait_for_selector('.search-result');check(p.locator('.search-result').count()>0);p.keyboard.press('Escape');check(not p.locator('#site-search').is_visible())
    record(f'home/{w}: live search, accent handling, Escape',search)
    if w==390:
     def menu():
      p.get_by_role('button',name='Menü megnyitása').click();check(p.locator('#mobile-navigation').is_visible());p.locator('#mobile-navigation a').first.focus();p.keyboard.press('Escape');check(not p.locator('#mobile-navigation').is_visible())
     record('home/390: mobile menu keyboard dismissal',menu)
   if label=='stories':
    def filtering():
     p.locator('[data-archive-query]').fill('zzzznincsilyentortenet');check(p.locator('[data-archive-empty]').is_visible());p.get_by_role('button',name='Szűrők törlése').click();check(not p.locator('[data-archive-empty]').is_visible());p.locator('[data-archive-sort]').select_option('title');check(p.locator('[data-post-card]:visible').count()==12);check(not errors,str(errors))
    record(f'stories/{w}: filtering/no-results/reset/sorting',filtering)
   if label=='gallery-article':
    def lightbox():
     p.locator('[data-gallery-open]').first.click();check(p.locator('dialog[open]').count()==1);p.keyboard.press('ArrowRight');p.keyboard.press('Escape');check(p.locator('dialog[open]').count()==0)
    record(f'gallery/{w}: keyboard lightbox',lightbox)
   p.close()
 # One actual React editing journey, with explicit in-memory storage fixtures.
 p,errors=open_page(browser,'/creator/',1440,1050);p.set_default_timeout(6000)
 def create():
  p.get_by_role('button',name='Új történet',exact=True).first.click();p.get_by_role('button',name='Személyes történet',exact=False).click();p.wait_for_selector('.tiptap[contenteditable=true]');p.locator('#draft-title').fill('Egy nyugodtabb alkotói munkatér');p.locator('#meta-excerpt').fill('Több figyelem az írásnak, kevesebb idő az eszköznek. Így kapnak helyet a jó történetek.');p.wait_for_timeout(1000)
  d=p.evaluate("JSON.parse(localStorage.getItem('forgeblog.workspace.v3')).drafts");check(len(d)==1);check(d[0]['title']=='Egy nyugodtabb alkotói munkatér');check(p.locator('.save-state').inner_text()=='Böngészőben mentve')
 record('Creator: create, title/metadata edit, autosave to fixture',create)
 def idle():
  rev=p.evaluate("JSON.parse(localStorage.getItem('forgeblog.workspace.v3')).revision");p.wait_for_timeout(1400);check(p.evaluate("JSON.parse(localStorage.getItem('forgeblog.workspace.v3')).revision")==rev,'Idle revision keeps incrementing')
 record('Creator: no autosave feedback loop',idle)
 def media():
  p.get_by_role('button',name='Média beszúrása',exact=True).click();p.get_by_role('button',name='coast.jpg kijelölése',exact=True).click();p.get_by_role('button',name='Beállítás borítóképnek').click();check(p.locator('.cover-preview img').count()==1);p.get_by_role('button',name='Média beszúrása',exact=True).click();p.get_by_role('button',name='coast.jpg kijelölése',exact=True).click();p.get_by_role('button',name='alpine.jpg kijelölése',exact=True).click();p.get_by_role('button',name='Filmszalag',exact=True).click();capture(p,'media-builder-desktop');p.get_by_role('button',name='Galéria beszúrása',exact=True).click();p.wait_for_timeout(800);d=p.evaluate("JSON.parse(localStorage.getItem('forgeblog.workspace.v3')).drafts[0]");check(any(n['type']=='galleryBlock' for n in d['document']['content']));check(d['heroImage']['id']=='demo-coast');check(not errors,str(errors))
 record('Creator: hero + gallery insertion at caret with editor mounted',media)
 def preview():
  p.get_by_role('button',name='Osztott',exact=True).click();check(p.locator('.preview-panel').count()==1);capture(p,'editor-split-desktop');p.get_by_role('button',name='Előnézet',exact=True).first.click();check(p.locator('.tiptap').count()==1,'Editor unmounted');check(not p.locator('.tiptap').is_visible());p.get_by_role('button',name='Előnézet',exact=True).first.click();check(p.locator('.tiptap').is_visible());capture(p,'editor-desktop')
 record('Creator: split/device preview without losing editor instance',preview)
 record('Creator/editor: axe WCAG A/AA',lambda:axe(p))
 def checkpoint():
  p.get_by_role('button',name='Mentés',exact=True).click();p.wait_for_timeout(800);d=p.evaluate("JSON.parse(localStorage.getItem('forgeblog.workspace.v3')).drafts[0]");check(len(d['history'])==1);p.get_by_role('tab',name='Verziók',exact=True).click();p.get_by_role('button',name='Visszaállítás másolatként').click();p.wait_for_timeout(900);d=p.evaluate("JSON.parse(localStorage.getItem('forgeblog.workspace.v3')).drafts");check(len(d)==2);check(d[0]['id']!=d[1]['id'])
 record('Creator: checkpoint restored as new draft; original remains',checkpoint)
 def git():
  p.get_by_role('button',name='Git / publikálás',exact=True).click();p.get_by_text('Előbb kösd össze a repositoryval.').wait_for(state='visible');check(p.get_by_role('button',name='Publikálási PR létrehozása').count()==0);p.keyboard.press('Escape')
 record('Creator: missing backend never claims successful publication',git)
 def themes():
  p.get_by_role('navigation',name='Alkotói navigáció').get_by_role('button',name='Megjelenés').click();check(p.locator('.theme-card').count()==26);capture(p,'themes-desktop');p.get_by_label('Témák keresése').fill('Swiss');check(p.locator('.theme-card').count()==1);p.get_by_role('button',name='Kipróbálom').click();check(p.evaluate("JSON.parse(localStorage.getItem('forgeblog.appearance')).theme")=='swiss-grid');p.get_by_label('Témák keresése').fill('');p.get_by_role('button',name='Sötét témaelőnézet').click();check(p.locator('.theme-preview[data-mode=dark]').count()==26)
 record('Creator: all 26 themes, real filter/apply/dark preview',themes)
 def media_library():
  p.get_by_role('navigation',name='Alkotói navigáció').get_by_role('button',name='Médiatár').click();check(p.locator('.media-card').count()==12);p.get_by_role('button',name='coast.jpg kijelölése').click();p.get_by_role('button',name='alpine.jpg kijelölése').click();
  for name in ['Rács','Mozaik','Sorok','Lapozható','Egymás alatt','Filmszalag','Előtte / utána','Teljes széles','Kontaktlap','Vegyes média']:
   p.get_by_role('button',name=name,exact=True).click();check(p.locator('.builder-preview .gallery').count()==1,name)
  p.get_by_role('button',name='Rács',exact=True).click();capture(p,'media-library-desktop');check(not errors,str(errors))
 record('Creator: all ten real gallery preview variants',media_library)
 record('Creator/media: axe WCAG A/AA',lambda:axe(p))
 def settings():
  p.get_by_role('navigation',name='Alkotói navigáció').get_by_role('button',name='Beállítások').click();p.get_by_label('Éles HTTPS-domain').fill('https://example.com');p.get_by_role('button',name='site.json exportálása').click();check(p.get_by_role('alert').count()>0);capture(p,'settings-desktop')
 record('Creator: invalid production config blocked',settings)
 record('Creator: no React/DOM runtime errors',lambda:check(not errors,str(errors)))
 p.close()
 # Mobile editor is a different information layout, not scaled desktop columns.
 p,errors=open_page(browser,'/creator/',390,844)
 def mobile_edit():
  p.get_by_role('button',name='Új történet',exact=True).first.click();p.get_by_role('button',name='Személyes történet',exact=False).click();p.wait_for_selector('.tiptap');p.locator('#draft-title').fill('A figyelemnek is kell egy otthon');p.wait_for_timeout(700);check(nooverflow(p));capture(p,'editor-mobile');p.get_by_role('tab',name='Beállítások',exact=True).click();check(p.locator('#meta-author').is_visible());check(not p.locator('.tiptap').is_visible());p.get_by_role('tab',name='Előnézet',exact=True).click();check(p.locator('.preview-panel').is_visible());check(nooverflow(p));capture(p,'editor-preview-mobile');check(not errors,str(errors))
 record('Creator/390: writing/settings/preview tabs and no overflow',mobile_edit)
 p.close();browser.close()
(R/'.qa/diagnostic-results.json').write_text(json.dumps({'scope':'Compatibility DOM renderer + actual React source; in-memory storage fixtures; NOT Astro/Vite/MDX production build; NOT native IndexedDB persistence or OAuth integration.','results':REPORT},ensure_ascii=False,indent=2))
print('TOTAL',len(REPORT),'PASS',sum(r['status']=='PASS' for r in REPORT),'FAIL',sum(r['status']=='FAIL' for r in REPORT))
