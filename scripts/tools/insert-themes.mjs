import { readFileSync, writeFileSync } from 'node:fs';

// 1. Insert registry entries before the closing "];" of themeRegistry.
const regPath = 'C:/Work/project4 blogspot/src/themes/registry.ts';
let reg = readFileSync(regPath, 'utf8');
const entries = readFileSync('C:/Work/_registry_snippet.txt', 'utf8');
const anchor = 'export function getTheme(key: string): ThemeDefinition {';
const anchorIdx = reg.indexOf(anchor);
if (anchorIdx === -1) throw new Error('getTheme anchor not found');
const closeIdx = reg.lastIndexOf('];', anchorIdx);
if (closeIdx === -1) throw new Error('array close not found');
reg = reg.slice(0, closeIdx) + entries + '\n' + reg.slice(closeIdx);
writeFileSync(regPath, reg);

// 2. Append CSS imports to themes.css.
const cssPath = 'C:/Work/project4 blogspot/src/styles/themes.css';
let css = readFileSync(cssPath, 'utf8');
const imports = readFileSync('C:/Work/_css_imports.txt', 'utf8');
if (!css.includes('forest-walks')) {
  css = css.replace(/\s*$/, '\n' + imports + '\n');
  writeFileSync(cssPath, css);
}

writeFileSync('C:/Work/_insert_done.txt', 'registry entries: ' + entries.split('\n').filter(l => l.includes('key:')).length + '\nimports appended: ' + !css.includes('forest-walks'));
