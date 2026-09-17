import fs from 'fs';
import path from 'path';

// Define the missing themes with their base colors and styles
// The goal is to provide a working, distinct CSS file for each so the user can see them working.

const themeTokens = {
  'soft-journal': {
    canvas: '#Faf9f6', text: '#3c3836', primary: '#b57614',
    fontHeading: "'Lora', serif", fontBody: "'Inter', sans-serif"
  },
  'brutalist': {
    canvas: '#ffffff', text: '#000000', primary: '#ff0000',
    fontHeading: "'Fira Code', monospace", fontBody: "'Inter', sans-serif"
  },
  'cyber-neon': {
    canvas: '#0b0c10', text: '#c5c6c7', primary: '#66fcf1',
    fontHeading: "'Orbitron', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'holographic': {
    canvas: '#0f0c29', text: '#ffffff', primary: '#ff00cc',
    fontHeading: "'Outfit', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'ai-lab': {
    canvas: '#000000', text: '#e0e0e0', primary: '#00ffcc',
    fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'outdoor-expedition': {
    canvas: '#f4f1ea', text: '#2f3e46', primary: '#52796f',
    fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif"
  },
  'food-journal': {
    canvas: '#fffdf7', text: '#4a4036', primary: '#e07a5f',
    fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif"
  },
  'recipe-studio': {
    canvas: '#ffffff', text: '#333333', primary: '#f2cc8f',
    fontHeading: "'Outfit', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'photo-portfolio': {
    canvas: '#121212', text: '#f5f5f5', primary: '#ffffff',
    fontHeading: "'Outfit', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'art-gallery': {
    canvas: '#ffffff', text: '#111111', primary: '#000000',
    fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif"
  },
  'music-night': {
    canvas: '#0d0d0d', text: '#e6e6e6', primary: '#1db954',
    fontHeading: "'Outfit', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'gaming-arena': {
    canvas: '#1a1a2e', text: '#e94560', primary: '#0f3460',
    fontHeading: "'Orbitron', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'corporate-authority': {
    canvas: '#f8f9fa', text: '#212529', primary: '#0056b3',
    fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'industrial-workshop': {
    canvas: '#e9ecef', text: '#343a40', primary: '#fd7e14',
    fontHeading: "'Fira Code', monospace", fontBody: "'Inter', sans-serif"
  },
  'academic-paper': {
    canvas: '#ffffff', text: '#000000', primary: '#800000',
    fontHeading: "'Lora', serif", fontBody: "'Lora', serif"
  },
  'magazine-newsroom': {
    canvas: '#f4f4f4', text: '#111111', primary: '#cc0000',
    fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif"
  },
  'luxury-fashion': {
    canvas: '#ffffff', text: '#1a1a1a', primary: '#d4af37',
    fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif"
  },
  'nature-organic': {
    canvas: '#f1f8f1', text: '#2f4f2f', primary: '#4caf50',
    fontHeading: "'Lora', serif", fontBody: "'Inter', sans-serif"
  },
  'family-storybook': {
    canvas: '#fff0f5', text: '#4b0082', primary: '#ff69b4',
    fontHeading: "'Outfit', sans-serif", fontBody: "'Inter', sans-serif"
  },
  'retro-eighties': {
    canvas: '#2b00ff', text: '#00e5ff', primary: '#ff00ea',
    fontHeading: "'Fira Code', monospace", fontBody: "'Fira Code', monospace"
  },
  'minimal-dark': {
    canvas: '#0f172a', text: '#f8fafc', primary: '#3b82f6',
    fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif"
  }
};

const themesDir = path.join(process.cwd(), 'src', 'styles', 'themes');
const globalCssPath = path.join(process.cwd(), 'src', 'styles', 'global.css');

let globalCssContent = fs.readFileSync(globalCssPath, 'utf8');

for (const [key, config] of Object.entries(themeTokens)) {
  const cssContent = `/* ${key} Theme Tokens */
:root[data-theme="${key}"] {
  --color-canvas: ${config.canvas};
  --color-canvas-alt: color-mix(in srgb, ${config.canvas} 95%, ${config.text});
  --color-surface: ${config.canvas};
  --color-surface-raised: color-mix(in srgb, ${config.canvas} 98%, ${config.text});
  --color-surface-inverse: ${config.text};
  
  --color-text: ${config.text};
  --color-text-muted: color-mix(in srgb, ${config.text} 60%, ${config.canvas});
  --color-text-inverse: ${config.canvas};
  
  --color-border: color-mix(in srgb, ${config.text} 15%, ${config.canvas});
  --color-border-strong: color-mix(in srgb, ${config.text} 30%, ${config.canvas});
  
  --color-primary: ${config.primary};
  --color-primary-contrast: ${config.canvas};
  --color-secondary: color-mix(in srgb, ${config.canvas} 90%, ${config.text});
  --color-accent: ${config.primary};
  
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  --color-focus-ring: ${config.primary};
  --color-selection-bg: ${config.primary};
  --color-selection-text: ${config.canvas};

  --font-heading: ${config.fontHeading};
  --font-body: ${config.fontBody};
  --font-mono: 'Fira Code', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.75rem;
  --text-hero: 4rem;

  --leading-tight: 1.15;
  --leading-normal: 1.6;
  --leading-relaxed: 1.8;

  --measure-reading: 65ch;
  --measure-wide: 80ch;
  --measure-full: 100%;

  --tracking-display: -0.02em;
  --tracking-body: -0.01em;
  --tracking-label: 0.05em;

  --container-max: 1200px;
  --container-wide: 1440px;
  --gutter: 2rem;
  --article-gutter: max(2rem, calc((100vw - var(--measure-reading)) / 2));
  --section-space: 6rem;
  --stack-space: 2rem;
  --grid-gap: 2rem;
  --header-height: 5rem;

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --border-width: 1px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  
  --blur-surface: blur(12px);
  --gradient-primary: linear-gradient(135deg, ${config.primary} 0%, color-mix(in srgb, ${config.primary} 70%, #000) 100%);
  
  --motion-fast: 150ms;
  --motion-base: 300ms;
  --motion-slow: 500ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
}
`;
  
  const filePath = path.join(themesDir, `${key}.css`);
  fs.writeFileSync(filePath, cssContent);
  console.log(`Generated ${key}.css`);

  // Ensure it's imported in global.css
  const importStatement = `@import "./themes/${key}.css";`;
  if (!globalCssContent.includes(importStatement)) {
    // Insert right after the last theme import
    const themeImportBlockEnd = globalCssContent.lastIndexOf('@import "./themes/');
    if (themeImportBlockEnd !== -1) {
      const endOfLine = globalCssContent.indexOf(';', themeImportBlockEnd) + 1;
      globalCssContent = globalCssContent.slice(0, endOfLine) + '\\n' + importStatement + globalCssContent.slice(endOfLine);
    }
  }
}

fs.writeFileSync(globalCssPath, globalCssContent);
console.log('Updated global.css imports.');
