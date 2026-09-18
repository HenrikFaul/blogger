/**
 * fix-broken-images.js
 * Replaces ALL /media/demo/ references with real catalog images.
 */
const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync('src/config/demo-media.json', 'utf-8'));

// Build a map: theme_tag -> first catalog src for that tag
const tagMap = {};
for (const item of catalog) {
  if (!tagMap[item.theme_tag]) {
    tagMap[item.theme_tag] = item.src;
  }
}

console.log('Available theme tags:', Object.keys(tagMap).join(', '));

// Map each broken demo path to a real catalog image by semantic match
const demoToReal = {
  '/media/demo/coast.jpg':         tagMap['Coastal Seascape'] || tagMap['Coastal Scenery'] || catalog.find(c => c.alt && c.alt.includes('coast'))?.src || catalog[0].src,
  '/media/demo/architecture.jpg':  tagMap['Modern Architecture'] || catalog.find(c => c.theme_tag === 'Modern Architecture')?.src || catalog[3].src,
  '/media/demo/workspace.jpg':     tagMap['Minimalist Workspace'] || catalog[0].src,
  '/media/demo/harbor.jpg':        tagMap['Coastal Town'] || catalog.find(c => c.alt && c.alt.includes('harbor'))?.src || tagMap['Coastal Seascape'] || catalog[0].src,
  '/media/demo/sea-cave.jpg':      tagMap['Coastal Seascape'] || catalog.find(c => c.alt && c.alt.includes('sea'))?.src || catalog[0].src,
  '/media/demo/alpine.jpg':        tagMap['Mountain Peaks'] || catalog.find(c => c.theme_tag === 'Mountain Peaks')?.src || catalog[0].src,
  '/media/demo/breakfast.jpg':     tagMap['Breakfast Table'] || catalog.find(c => c.alt && (c.alt.includes('breakfast') || c.alt.includes('coffee')))?.src || catalog[0].src,
  '/media/demo/sunset-peaks.jpg':  tagMap['Mountain Peaks'] || catalog.find(c => c.alt && c.alt.includes('mountain'))?.src || catalog[0].src,
  '/media/demo/ceramics.jpg':      tagMap['Ceramic Art'] || catalog.find(c => c.alt && c.alt.includes('ceramic'))?.src || catalog[0].src,
  '/media/demo/forest.jpg':        tagMap['Misty Forest'] || catalog.find(c => c.theme_tag === 'Misty Forest')?.src || catalog[0].src,
  '/media/demo/old-town.jpg':      tagMap['European Old Town'] || catalog.find(c => c.alt && c.alt.includes('town'))?.src || catalog[0].src,
  '/media/demo/olive.jpg':         tagMap['Mediterranean Garden'] || catalog.find(c => c.alt && (c.alt.includes('olive') || c.alt.includes('garden') || c.alt.includes('plant')))?.src || catalog[0].src,
};

console.log('\nMapping:');
for (const [k, v] of Object.entries(demoToReal)) {
  console.log(`  ${k} => ${v}`);
}

// Files to fix
const filesToFix = [
  'src/themes/registry.ts',
  'src/content/projects/nyugodt-munkasarok.mdx',
  'src/content/posts/egy-estebed-a-teraszon.mdx',
  'src/content/categories/gasztronomia.json',
  'src/content/categories/technologia.json',
  'src/content/categories/utazas.json',
  'src/content/categories/eletmod.json',
  'src/content/categories/fotografia.json',
  'src/content/categories/alkotas.json',
];

let totalReplacements = 0;

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filePath} not found`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  let count = 0;
  
  for (const [oldPath, newPath] of Object.entries(demoToReal)) {
    const re = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(re);
    if (matches) {
      content = content.replace(re, newPath);
      count += matches.length;
    }
  }
  
  if (count > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`FIXED: ${filePath} (${count} replacements)`);
    totalReplacements += count;
  }
}

// Also fix PostCard fallback (digital-garden.svg is OK, it exists)

// Fix slow-living.json field name back to "image"
const seriesPath = 'src/content/series/slow-living.json';
if (fs.existsSync(seriesPath)) {
  let seriesContent = fs.readFileSync(seriesPath, 'utf-8');
  seriesContent = seriesContent.replace('"coverImage"', '"image"');
  fs.writeFileSync(seriesPath, seriesContent, 'utf-8');
  console.log(`FIXED: ${seriesPath} (coverImage -> image)`);
  totalReplacements++;
}

console.log(`\nTotal: ${totalReplacements} replacements across all files.`);
