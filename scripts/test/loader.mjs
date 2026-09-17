// Native-free TypeScript test loader. Type checking remains a separate mandatory check.
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
export async function resolve(specifier, context, next) {
 try { return await next(specifier, context); }
 catch (error) {
  if(specifier.startsWith('.')&&context.parentURL){
   const base=fileURLToPath(new URL(specifier,context.parentURL));
   /* Node ESM (and the serverless function) uses explicit ".js" specifiers that map
      back to ".ts" sources here, so the same import works under both bundler and
      node16/nodenext resolution. */
   const candidates=[base];
   if(base.endsWith('.js')) candidates.push(base.slice(0,-3));
   for(const candidate of candidates){
    for(const suffix of ['.ts','.tsx','.mjs','.js','/index.ts'])if(fs.existsSync(candidate+suffix))return {url:pathToFileURL(candidate+suffix).href,shortCircuit:true};
   }
  }
  throw error;
 }
}
export async function load(url,context,next){
 if(url.startsWith('file:')&&/\.(ts|tsx)$/.test(url)&&!url.endsWith('.d.ts'))return {format:'module',source:ts.transpileModule(fs.readFileSync(fileURLToPath(url),'utf8'),{fileName:fileURLToPath(url),compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,verbatimModuleSyntax:false,esModuleInterop:true}}).outputText,shortCircuit:true};
 if(url.startsWith('file:')&&url.endsWith('.json'))return {format:'module',source:`export default ${fs.readFileSync(fileURLToPath(url),'utf8')};`,shortCircuit:true};
 return next(url,context);
}
