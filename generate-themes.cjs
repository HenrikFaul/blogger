const fs = require('fs');
const path = require('path');

const themes = {
  // Category 1: Minimal & Clean
  'minimal-white': {
    name: 'Minimal White', category: 'Clean',
    css: `:root {
  --theme-bg: #ffffff; --theme-text: #000000; --theme-primary: #000000; --theme-muted: #f5f5f5; --theme-border: #e0e0e0;
  --font-sans: 'Inter', sans-serif; --font-serif: 'Merriweather', serif;
}`
  },
  'minimal-dark': {
    name: 'Minimal Dark', category: 'Clean',
    css: `:root {
  --theme-bg: #111111; --theme-text: #f0f0f0; --theme-primary: #f0f0f0; --theme-muted: #222222; --theme-border: #333333;
  --font-sans: 'Inter', sans-serif; --font-serif: 'Merriweather', serif;
}`
  },
  'typography-first': {
    name: 'Typography First', category: 'Clean',
    css: `:root {
  --theme-bg: #fdfbf7; --theme-text: #2c2c2c; --theme-primary: #8b0000; --theme-muted: #f2efe9; --theme-border: #dcd3c6;
  --font-sans: 'Inter', sans-serif; --font-serif: 'Merriweather', serif;
}`
  },
  'swiss-style': {
    name: 'Swiss Style', category: 'Clean',
    css: `:root {
  --theme-bg: #e6e6e6; --theme-text: #1a1a1a; --theme-primary: #ff0000; --theme-muted: #cccccc; --theme-border: #999999;
  --font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}`
  },
  'brutalist': {
    name: 'Brutalist', category: 'Clean',
    css: `:root {
  --theme-bg: #ffffff; --theme-text: #0000ff; --theme-primary: #ff0000; --theme-muted: #ffff00; --theme-border: #000000;
  --font-sans: 'Courier New', Courier, monospace;
}`
  },
  
  // Category 2: Futuristic & Tech
  'cyberpunk': {
    name: 'Cyberpunk', category: 'Tech',
    css: `:root {
  --theme-bg: #0d0221; --theme-text: #0ff0fc; --theme-primary: #ff007f; --theme-muted: #261447; --theme-border: #f82d98;
  --font-sans: 'Orbitron', sans-serif;
}`
  },
  'glassmorphism': {
    name: 'Glassmorphism', category: 'Tech',
    css: `:root {
  --theme-bg: #f0f4f8; --theme-text: #102a43; --theme-primary: #1992d4; --theme-muted: rgba(255,255,255,0.7); --theme-border: rgba(255,255,255,0.5);
  --font-sans: 'Inter', sans-serif;
}`
  },
  'neumorphism': {
    name: 'Neumorphism', category: 'Tech',
    css: `:root {
  --theme-bg: #e0e5ec; --theme-text: #4d5c75; --theme-primary: #7289da; --theme-muted: #d1d9e6; --theme-border: #ffffff;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'terminal': {
    name: 'Terminal/CLI', category: 'Tech',
    css: `:root {
  --theme-bg: #000000; --theme-text: #00ff00; --theme-primary: #00ff00; --theme-muted: #111111; --theme-border: #004400;
  --font-sans: 'Fira Code', monospace;
}`
  },
  'holographic': {
    name: 'Holographic', category: 'Tech',
    css: `:root {
  --theme-bg: #1c1c28; --theme-text: #e2e2e8; --theme-primary: #00f0ff; --theme-muted: #28293d; --theme-border: #555770;
  --font-sans: 'Inter', sans-serif;
}`
  },

  // Category 3: Lifestyle & Hobbies
  'travel': {
    name: 'Travel Atlas', category: 'Lifestyle',
    css: `:root {
  --theme-bg: #faf9f6; --theme-text: #2f4f4f; --theme-primary: #d2691e; --theme-muted: #f0eee9; --theme-border: #e0dcd3;
  --font-sans: 'Inter', sans-serif; --font-serif: 'Merriweather', serif;
}`
  },
  'cooking': {
    name: 'Cooking', category: 'Lifestyle',
    css: `:root {
  --theme-bg: #fffcf5; --theme-text: #5c4033; --theme-primary: #e34234; --theme-muted: #f5eedc; --theme-border: #e8dcc4;
  --font-sans: 'Inter', sans-serif; --font-serif: 'Merriweather', serif;
}`
  },
  'photography': {
    name: 'Photography', category: 'Lifestyle',
    css: `:root {
  --theme-bg: #0a0a0a; --theme-text: #f5f5f5; --theme-primary: #ffffff; --theme-muted: #1a1a1a; --theme-border: #333333;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'fitness': {
    name: 'Fitness/Health', category: 'Lifestyle',
    css: `:root {
  --theme-bg: #181818; --theme-text: #ffffff; --theme-primary: #ff4500; --theme-muted: #242424; --theme-border: #3d3d3d;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'creative': {
    name: 'Art/Creative', category: 'Lifestyle',
    css: `:root {
  --theme-bg: #fdf5e6; --theme-text: #483d8b; --theme-primary: #ff1493; --theme-muted: #ffdab9; --theme-border: #dda0dd;
  --font-sans: 'Inter', sans-serif; --font-serif: 'Merriweather', serif;
}`
  },

  // Category 4: Professional & Industry
  'corporate': {
    name: 'Corporate', category: 'Professional',
    css: `:root {
  --theme-bg: #f4f6f8; --theme-text: #333333; --theme-primary: #0056b3; --theme-muted: #e9ecef; --theme-border: #dee2e6;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'developer': {
    name: 'Developer/IT', category: 'Professional',
    css: `:root {
  --theme-bg: #0d1117; --theme-text: #c9d1d9; --theme-primary: #58a6ff; --theme-muted: #161b22; --theme-border: #30363d;
  --font-sans: 'Inter', sans-serif; --font-mono: 'Fira Code', monospace;
}`
  },
  'academic': {
    name: 'Academic/Research', category: 'Professional',
    css: `:root {
  --theme-bg: #ffffff; --theme-text: #333333; --theme-primary: #800000; --theme-muted: #f8f9fa; --theme-border: #e9ecef;
  --font-serif: 'Merriweather', serif; --font-sans: 'Inter', sans-serif;
}`
  },
  'fashion': {
    name: 'Fashion/Beauty', category: 'Professional',
    css: `:root {
  --theme-bg: #ffffff; --theme-text: #1a1a1a; --theme-primary: #d4af37; --theme-muted: #f9f9f9; --theme-border: #eaeaea;
  --font-serif: 'Merriweather', serif; --font-sans: 'Inter', sans-serif;
}`
  },
  'news': {
    name: 'News/Magazine', category: 'Professional',
    css: `:root {
  --theme-bg: #f4f4f4; --theme-text: #111111; --theme-primary: #c00000; --theme-muted: #e0e0e0; --theme-border: #cccccc;
  --font-serif: 'Merriweather', serif; --font-sans: 'Inter', sans-serif;
}`
  },

  // Category 5: Bonus Themes
  'retro': {
    name: 'Retro 80s', category: 'Bonus',
    css: `:root {
  --theme-bg: #2b00ff; --theme-text: #ff00ea; --theme-primary: #00e5ff; --theme-muted: #160080; --theme-border: #ff00ea;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'nature': {
    name: 'Nature/Organic', category: 'Bonus',
    css: `:root {
  --theme-bg: #f1f8f1; --theme-text: #2f4f2f; --theme-primary: #4caf50; --theme-muted: #e1efe1; --theme-border: #c5e1c5;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'gaming': {
    name: 'Gaming', category: 'Bonus',
    css: `:root {
  --theme-bg: #121212; --theme-text: #e0e0e0; --theme-primary: #9146ff; --theme-muted: #1f1f23; --theme-border: #3a3a3d;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'music': {
    name: 'Music/Audio', category: 'Bonus',
    css: `:root {
  --theme-bg: #000000; --theme-text: #ffffff; --theme-primary: #1db954; --theme-muted: #121212; --theme-border: #282828;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'kids': {
    name: 'Kids/Family', category: 'Bonus',
    css: `:root {
  --theme-bg: #fff0f5; --theme-text: #4b0082; --theme-primary: #ff69b4; --theme-muted: #ffe4e1; --theme-border: #ffb6c1;
  --font-sans: 'Inter', sans-serif;
}`
  },
  'autumn': {
    name: 'Autumn/Fall', category: 'Bonus',
    css: `:root {
  --theme-bg: #fff8eb; --theme-text: #593e26; --theme-primary: #d35400; --theme-muted: #f2e3d5; --theme-border: #e6ccb8;
  --font-sans: 'Inter', sans-serif;
}`
  }
};

const themesDir = path.join(__dirname, 'src', 'themes');

Object.entries(themes).forEach(([id, config]) => {
  const dir = path.join(themesDir, id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'tokens.css'), config.css);
});

// Generate updated registry
const registryContent = `export type ThemeId = keyof typeof themeRegistry;

export interface ThemeConfig {
  id: string;
  name: string;
  category: string;
}

export const themeRegistry = {
${Object.entries(themes).map(([id, config]) => 
  `  '${id}': {
    id: '${id}',
    name: '${config.name}',
    category: '${config.category}'
  }`).join(',\n')}
};

export const applyThemeToDOM = async (themeId: ThemeId, isDark: boolean) => {
  const theme = themeRegistry[themeId];
  if (!theme) return;
  
  // Clean up old theme styles
  document.querySelectorAll('style[data-theme]').forEach(el => el.remove());
  
  try {
    // Dynamic import for vite
    const themeCss = await import(\`../themes/\${themeId}/tokens.css?inline\`);
    const style = document.createElement('style');
    style.setAttribute('data-theme', themeId);
    style.textContent = themeCss.default || themeCss;
    document.head.appendChild(style);
  } catch(e) {
    console.error('Failed to load theme', e);
  }
  
  const root = document.documentElement;
  
  // Maintain dark mode class for tailwind
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
`;

fs.writeFileSync(path.join(themesDir, 'registry.ts'), registryContent);

// Generate Site Config
const configDir = path.join(__dirname, 'src', 'config');
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

fs.writeFileSync(path.join(configDir, 'site.json'), JSON.stringify({
  instanceName: "faulhenrik",
  customDomain: "faulhenrik.hu",
  theme: "cyberpunk"
}, null, 2));

console.log('Successfully generated 26 themes and updated registry!');
