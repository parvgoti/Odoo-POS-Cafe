/**
 * UI/UX Mastery — Design System Scaffold Script
 * Generates a complete design system starter with tokens, components, and layouts.
 *
 * Usage: node scaffold-design-system.js [project-name] [--theme=dark|light|both]
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const args = process.argv.slice(2);
const projectName = args[0] || 'my-project';
const theme = args.find(a => a.startsWith('--theme='))?.split('=')[1] || 'both';

const BASE_DIR = resolve(process.cwd(), projectName);

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writeFile(path, content) {
  writeFileSync(path, content, 'utf-8');
  console.log(`  ✓ Created ${path.replace(BASE_DIR, '.')}`);
}

// === INDEX.HTML ===
const indexHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${projectName} — Built with UI/UX Mastery design system">
  <title>${projectName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/layouts.css">
  <link rel="stylesheet" href="css/animations.css">
  <link rel="stylesheet" href="css/app.css">
</head>
<body>
  <div id="app">
    <header class="header">
      <div class="page-container flex items-center justify-between" style="height:64px;">
        <h1 style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:700;color:var(--text-heading);">${projectName}</h1>
        <button id="theme-toggle" class="btn btn-ghost btn-icon" aria-label="Toggle theme">🌙</button>
      </div>
    </header>
    <main class="page-container" style="padding-top:var(--space-8);padding-bottom:var(--space-16);">
      <h2 class="heading-section" style="margin-bottom:var(--space-6);">Welcome</h2>
      <p class="body-text">Your design system is ready. Start building something amazing.</p>
    </main>
  </div>
  <script src="js/interactions.js"><\/script>
  <script>initAllInteractions();<\/script>
</body>
</html>`;

// === BASE CSS ===
const baseCss = `/* === CSS Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; interpolate-size: allow-keywords; }
body {
  min-height: 100dvh;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-body);
  background: var(--surface-ground);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
img, picture, video, canvas, svg { display: block; max-width: 100%; height: auto; }
input, button, textarea, select { font: inherit; color: inherit; }
h1, h2, h3, h4, h5, h6 { text-wrap: balance; overflow-wrap: break-word; }
p { text-wrap: pretty; overflow-wrap: break-word; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
button { cursor: pointer; background: none; border: none; }
:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 3px; border-radius: 4px; }
:focus:not(:focus-visible) { outline: none; }
::selection { background: var(--color-primary-200); color: var(--color-primary-900); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

console.log(`\\n🎨 UI/UX Mastery — Scaffolding "${projectName}"...\\n`);

ensureDir(join(BASE_DIR, 'css'));
ensureDir(join(BASE_DIR, 'js'));
ensureDir(join(BASE_DIR, 'assets', 'images'));
ensureDir(join(BASE_DIR, 'assets', 'icons'));

writeFile(join(BASE_DIR, 'index.html'), indexHtml);
writeFile(join(BASE_DIR, 'css', 'base.css'), baseCss);
writeFile(join(BASE_DIR, 'css', 'tokens.css'), '/* Copy design-tokens.css from uiux-mastery/resources/tokens/ */\\n');
writeFile(join(BASE_DIR, 'css', 'components.css'), '/* Copy components.css from uiux-mastery/resources/css/ */\\n');
writeFile(join(BASE_DIR, 'css', 'layouts.css'), '/* Copy layouts.css from uiux-mastery/resources/css/ */\\n');
writeFile(join(BASE_DIR, 'css', 'animations.css'), '/* Copy animations.css from uiux-mastery/resources/css/ */\\n');
writeFile(join(BASE_DIR, 'css', 'app.css'), '/* Your custom application styles */\\n');
writeFile(join(BASE_DIR, 'js', 'interactions.js'), '/* Copy interactions.js from uiux-mastery/resources/js/ */\\n');

console.log(\`\\n✅ Done! Project scaffolded at ./${projectName}/\`);
console.log('   Next steps:');
console.log('   1. Copy token & component CSS from uiux-mastery/resources/');
console.log('   2. Open index.html in your browser');
console.log('   3. Start building your UI!\\n');
