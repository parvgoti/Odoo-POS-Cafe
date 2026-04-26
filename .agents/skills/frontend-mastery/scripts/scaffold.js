#!/usr/bin/env node
/**
 * Frontend Mastery - Project Scaffolder
 * ======================================
 * Quick setup script for new frontend projects.
 *
 * Usage (from workspace root):
 *   node .agents/skills/frontend-mastery/scripts/scaffold.js [type]
 *
 * Types:
 *   vanilla   — HTML + CSS + JS (default)
 *   vite      — Vite 6 + React 19
 *   next      — Next.js 15
 */

const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'vanilla';
const cwd = process.cwd();

console.log(`\n🚀 Frontend Mastery Scaffolder`);
console.log(`   Type: ${type}`);
console.log(`   Path: ${cwd}\n`);

if (type === 'vanilla') {
  const dirs = [
    'css',
    'js',
    'assets/images',
    'assets/icons',
    'assets/fonts',
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(cwd, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}/`);
    }
  });

  // Copy CSS resources from skill
  const skillCssDir = path.join(__dirname, '..', 'resources', 'css');
  const cssFiles = ['reset.css', 'tokens.css', 'components.css', 'animations.css'];

  cssFiles.forEach(file => {
    const src = path.join(skillCssDir, file);
    const dest = path.join(cwd, 'css', file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Copied css/${file}`);
    }
  });

  // Create main style.css
  const mainCss = `/* Main Stylesheet */
@import './reset.css';
@import './tokens.css';
@import './components.css';
@import './animations.css';

/* === Page-specific styles below === */
`;
  const stylePath = path.join(cwd, 'css', 'style.css');
  if (!fs.existsSync(stylePath)) {
    fs.writeFileSync(stylePath, mainCss);
    console.log('  ✓ Created css/style.css');
  }

  // Copy JS utilities
  const jsSrc = path.join(__dirname, '..', 'resources', 'js', 'utilities.js');
  const jsDest = path.join(cwd, 'js', 'utilities.js');
  if (fs.existsSync(jsSrc) && !fs.existsSync(jsDest)) {
    fs.copyFileSync(jsSrc, jsDest);
    console.log('  ✓ Copied js/utilities.js');
  }

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <meta name="description" content="Built with Frontend Mastery">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

  <main id="main">
    <h1>Hello, World! 🚀</h1>
  </main>

  <script type="module" src="js/utilities.js"></script>
  <script type="module" src="js/app.js"></script>
</body>
</html>
`;
  const indexPath = path.join(cwd, 'index.html');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, indexHtml);
    console.log('  ✓ Created index.html');
  }

  // Create app.js
  const appJs = `// Main Application Logic
import { initAll } from './utilities.js';

// All utilities auto-initialize, but you can also call manually:
// initAll();

console.log('🚀 App initialized!');
`;
  const appPath = path.join(cwd, 'js', 'app.js');
  if (!fs.existsSync(appPath)) {
    fs.writeFileSync(appPath, appJs);
    console.log('  ✓ Created js/app.js');
  }

  console.log('\n✅ Vanilla project scaffolded!');
  console.log('   Open index.html in your browser to get started.\n');

} else if (type === 'vite') {
  console.log('Run this command to create a Vite project:\n');
  console.log('  npx -y create-vite@latest ./ --template react\n');
  console.log('Then copy CSS resources with:\n');
  console.log('  node .agents/skills/frontend-mastery/scripts/scaffold.js vanilla\n');

} else if (type === 'next') {
  console.log('Run this command to create a Next.js project:\n');
  console.log('  npx -y create-next-app@latest ./ --js --no-tailwind --eslint --app --src-dir --no-turbopack --import-alias "@/*"\n');

} else {
  console.log(`Unknown type: ${type}`);
  console.log('Available: vanilla, vite, next');
}
