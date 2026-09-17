/** Diagnostic-only loader: renders the actual Astro2TSX template AST without the native Astro compiler.
 * NOT a production build, not a replacement for Astro/Vite/MDX integration testing. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
const runtime=new URL('./runtime.mjs',import.meta.url).href;
const content=new URL('./content.mjs',import.meta.url).href;
export async function resolve(specifier,context,next){
 if(specifier==='astro:content')return {url:content,shortCircuit:true};
 try{return await next(specifier,context);}catch(error){
  if(specifier.startsWith('.')&&context.parentURL){let url=new URL(specifier,context.parentURL);for(const suffix of ['.ts','.tsx','.astro','.js','.mjs','.json','/index.ts']){const candidate=fileURLToPath(url)+suffix;if(fs.existsSync(candidate))return {url:pathToFileURL(candidate).href,shortCircuit:true};}}
  throw error;
 }
}
function transpile(source,file,astro=false){return ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:astro?ts.JsxEmit.React:ts.JsxEmit.ReactJSX,jsxFactory:astro?'__h':undefined,jsxFragmentFactory:astro?'Fragment':undefined,esModuleInterop:true,resolveJsonModule:true,verbatimModuleSyntax:false}}).outputText.replace(/import\.meta\.env/g,JSON.stringify({PUBLIC_SITE_URL:process.env.PUBLIC_SITE_URL||'',VERCEL_ENV:process.env.VERCEL_ENV||''}));}
export async function load(url,context,next){
 if(!url.startsWith('file:'))return next(url,context);const file=fileURLToPath(url);
 if(file.endsWith('.css'))return {format:'module',source:'export default "";',shortCircuit:true};
 if(file.endsWith('.json'))return {format:'module',source:`export default ${fs.readFileSync(file,'utf8')};`,shortCircuit:true};
 if(file.endsWith('.astro')){
  console.error('QA template',file);const original=fs.readFileSync(file,'utf8');const converted=JSON.parse(fs.readFileSync(new URL('../../.qa/templates.json',import.meta.url),'utf8'))[file];
  if(converted.hasParseErrors)throw new Error(`${file}: ${JSON.stringify(converted.diagnostics)}`);
  const front=original.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]||'';
  const ast=ts.createSourceFile(file+'.ts',front,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);const imports=[],globals=[],locals=[];
  ast.statements.forEach(statement=>{const text=statement.getFullText(ast);if(ts.isImportDeclaration(statement)||ts.isImportEqualsDeclaration(statement))imports.push(text);else if(statement.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))globals.push(text);else locals.push(text);});
  let body=converted.code.slice(converted.code.indexOf('<Fragment>'),converted.code.lastIndexOf('</Fragment>')+'</Fragment>'.length);
  if(!body)body='<Fragment/>';
  body=body.replace(/<slot\s*\/>/g,'{Astro.slots.default?.()}').replace(/<slot><\/slot>/g,'{Astro.slots.default?.()}');
  const source=`import {h as __h,Fragment,contextFor} from ${JSON.stringify(runtime)};\n${imports.join('\n')}\n${globals.join('\n')}\nexport default async function QA_${path.basename(file).replace(/\W/g,'_')}(props={}){const Astro=contextFor(props);\n${locals.join('\n')}\nreturn (${body});}`;
  return {format:'module',source:transpile(source,file+'.tsx',true),shortCircuit:true};
 }
 if(/\.(ts|tsx)$/.test(file)&&!file.endsWith('.d.ts'))return {format:'module',source:transpile(fs.readFileSync(file,'utf8'),file),shortCircuit:true};
 return next(url,context);
}
