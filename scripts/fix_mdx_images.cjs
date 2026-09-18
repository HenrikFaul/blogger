const fs = require('fs');
const path = require('path');

const mdxDir = path.join(__dirname, '../src/content/posts');
const catalogPath = path.join(__dirname, '../src/config/demo-media.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const files = fs.readdirSync(mdxDir).filter(f => f.endsWith('.mdx'));

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const filePath = path.join(mdxDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Pick an image from catalog
  const image = catalog[i % catalog.length];
  
  const regex = /heroImage:\s*\{[^}]+\}/;
  
  if (regex.test(content)) {
    const newImageMeta = `heroImage: { "src": "${image.src}", "alt": "${(image.alt||'').replace(/"/g, '\\"')}", "width": 1920, "height": 1080 }`;
    content = content.replace(regex, newImageMeta);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file} with ${image.src}`);
  }
}
console.log('Done fixing images.');
