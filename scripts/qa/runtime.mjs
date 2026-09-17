import {AsyncLocalStorage} from 'node:async_hooks';
export const environment=new AsyncLocalStorage();export const Fragment=Symbol.for('qa.fragment');
export function h(type,props,...children){return {type,props:{...(props||{}),children:children.flat(6)}};}
export function contextFor(props){const ctx=environment.getStore()||{};return {...ctx,props,site:new URL('http://localhost:4321'),slots:{default:()=>props.children},redirect:(location,status=302)=>({redirect:location,status})};}
export const raw=html=>({html});
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const booleanAttrs=new Set(['allowfullscreen','async','autofocus','autoplay','checked','controls','default','defer','disabled','hidden','inert','ismap','loop','multiple','muted','nomodule','novalidate','open','readonly','required','reversed','selected']);
function classes(value){if(Array.isArray(value))return value.map(classes).filter(Boolean).join(' ');if(value&&typeof value==='object')return Object.entries(value).filter(([,v])=>v).map(([k])=>k).join(' ');return value?String(value):'';}
export async function serialize(node){
 node=await node;if(node==null||typeof node==='boolean')return '';if(Array.isArray(node))return (await Promise.all(node.map(serialize))).join('');if(typeof node==='string'||typeof node==='number')return escape(node);if(node.html!==undefined)return node.html;if(node.redirect)return `<meta http-equiv="refresh" content="0;url=${escape(node.redirect)}"><a href="${escape(node.redirect)}">Tovább</a>`;
 const {type,props={}}=node;if(type===Fragment)return serialize(props.children);
 if(typeof type==='function'){
  if(props['client:only']){const p={...props};delete p.children;delete p['client:only'];return `<div id="workspace-root"><p style="padding:40px">Az alkotói munkatér betöltése…</p></div><script id="workspace-props" type="application/json">${JSON.stringify(p).replace(/</g,'\\u003c')}</script><script src="/__qa/workspace.js" defer></script>`;}
  return serialize(await type(props));
 }
 if(!type)throw new Error('Undefined template component');
 let attrs='';for(let [key,value]of Object.entries(props)){if(['children','set:html','set:text','is:inline'].includes(key)||key.startsWith('client:')||value===undefined||value===null||value===false&&!key.startsWith('aria-')&&!key.startsWith('data-'))continue;if(key==='class:list'){key='class';value=classes(value);}if(key==='className')key='class';if(key==='htmlFor')key='for';if(typeof value==='function')continue;if(booleanAttrs.has(key.toLowerCase())){if(value)attrs+=' '+key;continue;}if(key==='style'&&typeof value==='object')value=Object.entries(value).map(([k,v])=>`${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}:${v}`).join(';');attrs+=` ${key}="${escape(value)}"`;}
 if(voidTags.has(type))return `<${type}${attrs}>`;
 let inner=props['set:html']!==undefined?String(props['set:html']):props['set:text']!==undefined?escape(props['set:text']):await serialize(props.children);
 if(type==='head')inner+='<link rel="stylesheet" href="/__qa/styles.css">';
 return `<${type}${attrs}>${inner}</${type}>`;
}
