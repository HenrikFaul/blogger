"""Visual/DOM diagnostics only. Managed Chromium prohibits top-level URL navigation.
Actual page HTML/scripts are rendered with set_content; memory storage fixtures are explicitly NOT proof of native browser persistence."""
import urllib.request,json,time,os
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:4321'
FIXTURE='''(() => {
const values=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear(),key:i=>Array.from(values.keys())[i]??null,get length(){return values.size}}});
const items=new Map();const db={close(){},createObjectStore(){},transaction(){const tx={objectStore(){return {getAll:()=>req([...items.values()]),get:k=>req(items.get(k)),put:v=>{items.set(v.id,v);return req(v.id)},delete:k=>{items.delete(k);return req(undefined)}}}};function req(result){const r={result};setTimeout(()=>{r.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0)},0);return r}return tx}};
Object.defineProperty(window,'indexedDB',{value:{open(){const request={result:db};setTimeout(()=>request.onsuccess?.(),0);return request}}});
if(!crypto.randomUUID)crypto.randomUUID=()=>{const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=a[6]&15|64;a[8]=a[8]&63|128;const h=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)};
window.__originalFetch=window.fetch;window.fetch=(input,options)=>{const url=new URL(typeof input==='string'?input:input.url,document.baseURI);if(url.pathname==='/api/creator')return Promise.resolve(new Response(JSON.stringify({configured:false,authenticated:false}),{headers:{'Content-Type':'application/json'}}));return window.__originalFetch(url.href,options);};
})()'''
def html(route):
 return urllib.request.urlopen(BASE+route).read().decode().replace('<head>','<head><base href="'+BASE+'/">')

def open_page(browser,route='/',width=1440,height=1080):
 page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate(FIXTURE)
 page.set_content(html(route),wait_until='networkidle')
 page.wait_for_timeout(1200)
 return page,errors
