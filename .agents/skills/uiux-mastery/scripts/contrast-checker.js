#!/usr/bin/env node
/**
 * UI/UX Mastery — Color Contrast Checker (2026)
 * ===============================================
 * Check WCAG 2.2 color contrast ratios from the CLI.
 *
 * Usage:
 *   node contrast-checker.js "#ffffff" "#333333"
 *   node contrast-checker.js "rgb(255,255,255)" "rgb(51,51,51)"
 *   node contrast-checker.js "hsl(220,10%,42%)" "hsl(0,0%,100%)"
 *   node contrast-checker.js --palette     (check all palette combos)
 *
 * Output: contrast ratio + WCAG AA/AAA pass/fail
 */

// Parse color string to RGB
function parseColor(color) {
  color = color.trim().toLowerCase();

  // Hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const full = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }

  // RGB
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
  }

  // HSL
  const hslMatch = color.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/);
  if (hslMatch) {
    return hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
  }

  // Named colors (common ones)
  const named = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
  };
  if (named[color]) return named[color];

  throw new Error(`Cannot parse color: "${color}"`);
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

// Relative luminance (WCAG 2.x formula)
function luminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Contrast ratio
function contrastRatio(color1, color2) {
  const l1 = luminance(color1);
  const l2 = luminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG evaluation
function evaluate(ratio) {
  return {
    ratio: ratio.toFixed(2),
    normalAA: ratio >= 4.5 ? '✅ PASS' : '❌ FAIL',
    normalAAA: ratio >= 7 ? '✅ PASS' : '❌ FAIL',
    largeAA: ratio >= 3 ? '✅ PASS' : '❌ FAIL',
    largeAAA: ratio >= 4.5 ? '✅ PASS' : '❌ FAIL',
    uiAA: ratio >= 3 ? '✅ PASS' : '❌ FAIL',
  };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

// ============================================
// CLI
// ============================================
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
  Color Contrast Checker — WCAG 2.2
  ===================================
  Usage:
    node contrast-checker.js <foreground> <background>

  Examples:
    node contrast-checker.js "#ffffff" "#333333"
    node contrast-checker.js "hsl(220,10%,42%)" "#ffffff"
    node contrast-checker.js --demo
  `);
  process.exit(0);
}

if (args[0] === '--demo') {
  console.log('\n  🎨 Contrast Checker Demo\n');

  const pairs = [
    ['#ffffff', '#6C3AED', 'White on Purple'],
    ['#ffffff', '#333333', 'White on Dark Gray'],
    ['#666666', '#ffffff', 'Gray on White'],
    ['#999999', '#ffffff', 'Light Gray on White'],
    ['#000000', '#ffffff', 'Black on White'],
    ['hsl(220,10%,42%)', '#ffffff', 'Muted on White'],
    ['hsl(245,78%,52%)', '#ffffff', 'Primary on White'],
    ['hsl(0,84%,60%)', '#ffffff', 'Red on White'],
    ['hsl(152,68%,45%)', '#ffffff', 'Green on White'],
  ];

  console.log('  ┌────────────────────────────┬─────────┬──────────┬──────────┐');
  console.log('  │ Pair                       │  Ratio  │ Text AA  │ UI AA    │');
  console.log('  ├────────────────────────────┼─────────┼──────────┼──────────┤');

  for (const [fg, bg, name] of pairs) {
    try {
      const fgRgb = parseColor(fg);
      const bgRgb = parseColor(bg);
      const ratio = contrastRatio(fgRgb, bgRgb);
      const result = evaluate(ratio);
      const paddedName = name.padEnd(26);
      const paddedRatio = result.ratio.padStart(5) + ':1';
      console.log(`  │ ${paddedName} │ ${paddedRatio} │ ${result.normalAA}   │ ${result.uiAA}   │`);
    } catch (e) {
      console.log(`  │ ${name.padEnd(26)} │  ERROR  │   ---    │   ---    │`);
    }
  }

  console.log('  └────────────────────────────┴─────────┴──────────┴──────────┘\n');
  process.exit(0);
}

// Two-color check
if (args.length >= 2) {
  try {
    const fg = parseColor(args[0]);
    const bg = parseColor(args[1]);
    const ratio = contrastRatio(fg, bg);
    const result = evaluate(ratio);

    console.log(`\n  🎨 Contrast Check\n`);
    console.log(`  Foreground:  ${args[0]} → ${rgbToHex(fg)}`);
    console.log(`  Background:  ${args[1]} → ${rgbToHex(bg)}`);
    console.log(`  Ratio:       ${result.ratio}:1\n`);
    console.log(`  ┌──────────────────────────────────────┐`);
    console.log(`  │ Normal Text  (AA)   ${result.normalAA}          │`);
    console.log(`  │ Normal Text  (AAA)  ${result.normalAAA}          │`);
    console.log(`  │ Large Text   (AA)   ${result.largeAA}          │`);
    console.log(`  │ Large Text   (AAA)  ${result.largeAAA}          │`);
    console.log(`  │ UI Component (AA)   ${result.uiAA}          │`);
    console.log(`  └──────────────────────────────────────┘\n`);

    if (ratio < 3) {
      console.log('  ⚠️  This combination fails all WCAG criteria. Do not use.\n');
    } else if (ratio < 4.5) {
      console.log('  ⚠️  Only suitable for large text (≥18px bold) and UI components.\n');
    } else if (ratio < 7) {
      console.log('  ✅  Passes AA for all text sizes. Consider AAA for critical text.\n');
    } else {
      console.log('  ✅  Excellent contrast! Passes AAA for all text sizes.\n');
    }

  } catch (err) {
    console.error(`\n  ❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}
