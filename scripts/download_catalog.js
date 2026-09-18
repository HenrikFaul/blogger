import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themes = [
  "Minimalist Workspace", "Modern Architecture", "Cyberpunk City", "Misty Forest",
  "Abstract Fluid", "Coffee Shop", "Vintage Camera", "Ocean Waves", "Desert Dunes",
  "Mountain Peaks", "Neon Lights", "Botanical Garden", "Rustic Cabin", "Sunset Beach",
  "Urban Street", "Classical Art", "Space Galaxy", "Tech Gadgets", "Healthy Food",
  "Cozy Reading", "Snowy Landscape", "Autumn Leaves", "Spring Flowers", "Rainy Window",
  "Dark Moody", "Bright Pastel", "Coding Setup", "Minimalist Interior", "Macro Photography",
  "Aerial City", "Wildlife Nature", "Skateboard Culture", "Vinyl Records", "Minimalist Typography",
  "Golden Hour", "Bokeh Lights", "Geometric Shapes", "Vintage Car", "Abandoned Places",
  "Starry Night", "Surfing Ocean", "Yoga Meditation", "Fitness Gym", "Fresh Fruit",
  "Baking Bread", "Sushi Art", "Craft Beer", "Cocktail Drinks", "Concert Stage",
  "Minimalist Fashion", "Sneaker Culture", "Watches Luxury", "Board Games", "Chess Board",
  "Pottery Making", "Watercolor Paint", "Oil Painting", "Tattoo Art", "Architecture Details",
  "Bridges Engineering", "Train Journey", "Airplane Window", "Sailboat Ocean", "Camping Tent",
  "Bonfire Night", "Minimalist Portrait", "Street Photography", "Abstract Pattern",
  "Marble Texture", "Wood Grain", "Paper Texture", "Glass Reflections", "Neon Signs",
  "Retro Arcade", "Analog Synth", "Electric Guitar", "Classic Piano", "Record Player",
  "Minimalist Plant", "Zen Garden"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const outputDir = path.join(__dirname, '../public/media/catalog');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadImage(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

async function run() {
  const catalog = [];
  const usedIds = new Set();
  
  console.log(`Starting download for ${themes.length} themes...`);
  
  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    console.log(`[${i+1}/${themes.length}] Fetching metadata for theme: ${theme}`);
    
    try {
      const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(theme)}&per_page=10`;
      const res = await fetch(url);
      
      if (res.status === 403 || res.status === 429) {
        console.log("Rate limited! Sleeping for 10 seconds...");
        await sleep(10000);
        i--; // retry
        continue;
      }
      
      const data = await res.json();
      const photos = data.results || [];
      
      let downloadedForTheme = 0;
      
      for (const photo of photos) {
        if (downloadedForTheme >= 3) break;
        if (usedIds.has(photo.id)) continue;
        
        usedIds.add(photo.id);
        const imgUrl = `${photo.urls.raw}&w=1920&q=75&fm=webp&fit=crop`;
        const fileName = `${photo.id}.webp`;
        const destPath = path.join(outputDir, fileName);
        
        try {
          const size = await downloadImage(imgUrl, destPath);
          console.log(`  -> Downloaded ${fileName} (${(size / 1024).toFixed(1)} KB)`);
          
          catalog.push({
            id: `demo-${photo.id}`,
            name: fileName,
            src: `/media/catalog/${fileName}`,
            type: "image/webp",
            demo: true,
            alt: photo.alt_description || theme,
            caption: "",
            credit: `Fotó: ${photo.user.name} (Unsplash)`,
            decorative: false,
            theme_tag: theme
          });
          
          downloadedForTheme++;
          await sleep(200); // polite delay
        } catch (err) {
          console.error(`  -> Failed to download ${photo.id}: ${err.message}`);
        }
      }
      
      // Delay between themes to avoid hitting rate limits too quickly
      await sleep(1000);
    } catch (err) {
      console.error(`Failed to fetch metadata for ${theme}:`, err.message);
    }
  }
  
  // Write catalog JSON
  const catalogPath = path.join(__dirname, '../src/config/demo-media.json');
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`\nSuccess! Downloaded ${catalog.length} images.`);
  console.log(`Catalog saved to: ${catalogPath}`);
}

run().catch(console.error);
