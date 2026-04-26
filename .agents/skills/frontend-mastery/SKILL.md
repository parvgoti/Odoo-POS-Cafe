---
name: frontend-mastery
description: >
  Comprehensive frontend development skill covering modern UI/UX design, component architecture,
  responsive layouts, animations, accessibility, performance optimization, and deployment.
  Use when building any web interface, landing page, dashboard, SaaS app, portfolio,
  or interactive web experience. Covers HTML5, CSS3 (vanilla + modern features), JavaScript (ES2024+),
  React 19, Next.js 15, Vite 6, and cutting-edge browser APIs.
---

# Frontend Mastery Skill

A complete, opinionated frontend development guide for building premium, production-grade web interfaces.
This skill encodes the latest patterns, tools, and design philosophies as of 2026.

---

## When to Use This Skill

- Building a **new web application** from scratch (landing page, SaaS dashboard, portfolio, etc.)
- Creating **reusable UI components** with modern design patterns
- Implementing **responsive layouts** that work flawlessly across all devices
- Adding **micro-animations and transitions** that feel alive and polished
- Optimizing **web performance** (Core Web Vitals, bundle size, rendering)
- Ensuring **accessibility (WCAG 2.2 AA)** compliance
- Setting up a **design system** with tokens, utilities, and component primitives
- Integrating **dark mode / theme switching** with CSS custom properties
- Deploying to **Vercel, Netlify, Cloudflare Pages**, or similar platforms

---

## Technology Stack (2026 Defaults)

| Layer            | Default Choice                  | Alternatives                        |
|------------------|---------------------------------|-------------------------------------|
| **Markup**       | HTML5 Semantic Elements         | JSX (React/Next.js)                 |
| **Styling**      | Vanilla CSS (Custom Properties) | Tailwind CSS v4 (if user requests)  |
| **Logic**        | JavaScript ES2024+              | TypeScript 5.6+                     |
| **Framework**    | Vite 6 (SPA) / Next.js 15 (SSR)| Astro 5 (content sites)             |
| **State**        | Zustand / React Context         | Jotai, Valtio                       |
| **Animations**   | CSS @keyframes + View Transitions API | Framer Motion 12, GSAP 3    |
| **Icons**        | Lucide Icons / Phosphor Icons   | Heroicons, Tabler Icons             |
| **Fonts**        | Google Fonts (Inter, Geist, Outfit) | Fontsource (self-hosted)        |
| **Build**        | Vite 6 / Turbopack              | esbuild, Rolldown                   |
| **Testing**      | Vitest + Playwright             | Cypress, Testing Library            |
| **Linting**      | ESLint 9 (flat config) + Prettier | Biome                             |
| **Package Mgr**  | pnpm 9                          | npm 11, bun 1.2                     |

---

## Design Philosophy

### Core Principles

1. **Visual Excellence Over Minimalism** — Every surface should feel premium. Avoid plain, generic designs.
2. **Motion is Meaning** — Animations should guide the user, not distract. Every transition conveys state change.
3. **Responsive by Default** — Design mobile-first, then scale up. Use CSS Container Queries for component-level responsiveness.
4. **Accessibility is Non-Negotiable** — ARIA, keyboard nav, focus management, color contrast (4.5:1 min).
5. **Performance is UX** — A slow site is a broken site. Target LCP < 2.5s, FID < 100ms, CLS < 0.1.
6. **Progressive Enhancement** — Core content works without JS. Enhance with interactivity.

### Color System

Never use raw color values. Always define a semantic color system:

```css
/* === Color Palette (HSL for easy manipulation) === */
:root {
  /* Brand Colors */
  --color-primary-50: hsl(245, 100%, 97%);
  --color-primary-100: hsl(245, 95%, 92%);
  --color-primary-200: hsl(245, 90%, 84%);
  --color-primary-300: hsl(245, 85%, 73%);
  --color-primary-400: hsl(245, 82%, 63%);
  --color-primary-500: hsl(245, 78%, 52%);   /* Primary */
  --color-primary-600: hsl(245, 82%, 45%);
  --color-primary-700: hsl(245, 78%, 38%);
  --color-primary-800: hsl(245, 72%, 30%);
  --color-primary-900: hsl(245, 68%, 22%);
  --color-primary-950: hsl(245, 75%, 13%);

  /* Neutral / Gray Scale */
  --color-neutral-0: hsl(0, 0%, 100%);
  --color-neutral-50: hsl(220, 20%, 97%);
  --color-neutral-100: hsl(220, 18%, 94%);
  --color-neutral-200: hsl(220, 15%, 87%);
  --color-neutral-300: hsl(220, 12%, 77%);
  --color-neutral-400: hsl(220, 10%, 57%);
  --color-neutral-500: hsl(220, 10%, 42%);
  --color-neutral-600: hsl(220, 12%, 33%);
  --color-neutral-700: hsl(220, 15%, 24%);
  --color-neutral-800: hsl(220, 20%, 16%);
  --color-neutral-900: hsl(220, 25%, 10%);
  --color-neutral-950: hsl(220, 30%, 6%);

  /* Semantic Colors */
  --color-success: hsl(152, 68%, 45%);
  --color-warning: hsl(38, 95%, 55%);
  --color-error: hsl(0, 84%, 60%);
  --color-info: hsl(205, 85%, 55%);

  /* Surfaces (Light Mode) */
  --surface-primary: var(--color-neutral-0);
  --surface-secondary: var(--color-neutral-50);
  --surface-tertiary: var(--color-neutral-100);
  --surface-elevated: var(--color-neutral-0);
  --surface-overlay: hsla(220, 25%, 10%, 0.6);

  /* Text */
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-500);
  --text-tertiary: var(--color-neutral-400);
  --text-inverse: var(--color-neutral-0);
  --text-accent: var(--color-primary-500);

  /* Borders */
  --border-default: var(--color-neutral-200);
  --border-subtle: var(--color-neutral-100);
  --border-strong: var(--color-neutral-300);
  --border-focus: var(--color-primary-500);
}

/* === Dark Mode === */
[data-theme="dark"], .dark {
  --surface-primary: var(--color-neutral-950);
  --surface-secondary: var(--color-neutral-900);
  --surface-tertiary: var(--color-neutral-800);
  --surface-elevated: var(--color-neutral-800);
  --surface-overlay: hsla(220, 30%, 6%, 0.8);

  --text-primary: var(--color-neutral-50);
  --text-secondary: var(--color-neutral-400);
  --text-tertiary: var(--color-neutral-500);
  --text-inverse: var(--color-neutral-950);
  --text-accent: var(--color-primary-400);

  --border-default: var(--color-neutral-700);
  --border-subtle: var(--color-neutral-800);
  --border-strong: var(--color-neutral-600);
}
```

### Typography System

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 'Outfit', 'Inter', system-ui, sans-serif;

  /* Font Sizes (fluid using clamp) */
  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
  --text-lg: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
  --text-xl: clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem);
  --text-2xl: clamp(1.35rem, 1.15rem + 1vw, 1.5rem);
  --text-3xl: clamp(1.65rem, 1.35rem + 1.5vw, 1.875rem);
  --text-4xl: clamp(2rem, 1.5rem + 2.5vw, 2.25rem);
  --text-5xl: clamp(2.5rem, 1.75rem + 3.75vw, 3rem);
  --text-6xl: clamp(3rem, 2rem + 5vw, 3.75rem);
  --text-7xl: clamp(3.5rem, 2.25rem + 6.25vw, 4.5rem);

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --weight-light: 300;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}
```

### Spacing & Layout System

```css
:root {
  /* Spacing Scale (4px base) */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1-5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2-5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-8: 2rem;         /* 32px */
  --space-10: 2.5rem;      /* 40px */
  --space-12: 3rem;        /* 48px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-32: 8rem;        /* 128px */

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-3xl: 2rem;
  --radius-full: 9999px;

  /* Shadows (layered for depth) */
  --shadow-xs: 0 1px 2px hsla(220, 25%, 10%, 0.05);
  --shadow-sm: 0 1px 3px hsla(220, 25%, 10%, 0.1), 0 1px 2px hsla(220, 25%, 10%, 0.06);
  --shadow-md: 0 4px 6px hsla(220, 25%, 10%, 0.07), 0 2px 4px hsla(220, 25%, 10%, 0.06);
  --shadow-lg: 0 10px 15px hsla(220, 25%, 10%, 0.1), 0 4px 6px hsla(220, 25%, 10%, 0.05);
  --shadow-xl: 0 20px 25px hsla(220, 25%, 10%, 0.1), 0 8px 10px hsla(220, 25%, 10%, 0.04);
  --shadow-2xl: 0 25px 50px hsla(220, 25%, 10%, 0.25);
  --shadow-glow: 0 0 20px hsla(245, 78%, 52%, 0.3);
  --shadow-inner: inset 0 2px 4px hsla(220, 25%, 10%, 0.06);

  /* Z-Index Scale */
  --z-behind: -1;
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-toast: 600;
  --z-tooltip: 700;
  --z-max: 9999;

  /* Container Widths */
  --container-xs: 20rem;    /* 320px */
  --container-sm: 24rem;    /* 384px */
  --container-md: 28rem;    /* 448px */
  --container-lg: 32rem;    /* 512px */
  --container-xl: 36rem;    /* 576px */
  --container-2xl: 42rem;   /* 672px */
  --container-3xl: 48rem;   /* 768px */
  --container-4xl: 56rem;   /* 896px */
  --container-5xl: 64rem;   /* 1024px */
  --container-6xl: 72rem;   /* 1152px */
  --container-7xl: 80rem;   /* 1280px */
  --container-max: 90rem;   /* 1440px */

  /* Transition Presets */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  --duration-instant: 75ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
}
```

---

## CSS Reset & Base Styles

Always start every project with this modern CSS reset:

```css
/* === Modern CSS Reset (2026) === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  text-size-adjust: 100%;
  tab-size: 4;
  scroll-behavior: smooth;
  interpolate-size: allow-keywords; /* CSS Anchor Positioning */
}

body {
  min-height: 100dvh;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--surface-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

input, button, textarea, select {
  font: inherit;
  color: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}

p {
  text-wrap: pretty;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}

button {
  cursor: pointer;
  background: none;
  border: none;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Focus Visible (accessibility) */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Selection */
::selection {
  background: var(--color-primary-200);
  color: var(--color-primary-900);
}
```

---

## Component Patterns

### Glassmorphism Card

```css
.glass-card {
  background: hsla(0, 0%, 100%, 0.05);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  transition: transform var(--duration-normal) var(--ease-spring),
              box-shadow var(--duration-normal) var(--ease-default);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}
```

### Modern Button System

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2-5) var(--space-5);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-default);
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
}

/* Ripple effect */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, hsla(0, 0%, 100%, 0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10);
  opacity: 0;
  transition: transform 0.5s, opacity 0.8s;
}

.btn:active::after {
  transform: scale(0);
  opacity: 1;
  transition: 0s;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: white;
  box-shadow: 0 2px 8px hsla(245, 78%, 52%, 0.35);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500));
  box-shadow: 0 4px 16px hsla(245, 78%, 52%, 0.45);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--surface-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
.btn-secondary:hover {
  background: var(--surface-secondary);
  border-color: var(--border-strong);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover {
  background: var(--surface-tertiary);
  color: var(--text-primary);
}

/* Sizes */
.btn-sm { padding: var(--space-1-5) var(--space-3); font-size: var(--text-xs); }
.btn-lg { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }
.btn-xl { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }

/* States */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-loading {
  color: transparent;
  pointer-events: none;
}
.btn-loading::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid hsla(0, 0%, 100%, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

### Input / Form Field

```css
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.input-field {
  width: 100%;
  padding: var(--space-2-5) var(--space-3);
  background: var(--surface-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--ease-default);
}

.input-field::placeholder {
  color: var(--text-tertiary);
}

.input-field:hover {
  border-color: var(--border-strong);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px hsla(245, 78%, 52%, 0.15);
  background: var(--surface-primary);
}

.input-error {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 3px hsla(0, 84%, 60%, 0.15) !important;
}

.input-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.input-error-text {
  font-size: var(--text-xs);
  color: var(--color-error);
}
```

---

## Animation Library

### Entrance Animations

```css
/* Fade In Up */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fade In Down */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fade In Scale */
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Slide In Left */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Slide In Right */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Staggered children */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp 0.5s var(--ease-out) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.25s; }
.stagger-children > *:nth-child(6) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(7) { animation-delay: 0.35s; }
.stagger-children > *:nth-child(8) { animation-delay: 0.4s; }

/* Scroll-triggered animation with Intersection Observer */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Micro-Interactions

```css
/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Skeleton loader shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--surface-tertiary) 25%,
    var(--surface-secondary) 37%,
    var(--surface-tertiary) 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

/* Floating / Levitate */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Gradient border animation */
@keyframes gradientBorder {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.gradient-border {
  position: relative;
  border-radius: var(--radius-xl);
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(
    45deg,
    var(--color-primary-500),
    var(--color-info),
    var(--color-primary-500),
    var(--color-success)
  );
  background-size: 300% 300%;
  animation: gradientBorder 4s ease infinite;
  z-index: -1;
}

/* Smooth counter animation (CSS Houdini) */
@property --num {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}
.counter {
  animation: count 2s var(--ease-out) forwards;
  counter-reset: num var(--num);
}
.counter::after {
  content: counter(num);
}
@keyframes count {
  to { --num: var(--target-num, 100); }
}
```

---

## Responsive Layout Patterns

### Modern Grid System

```css
/* Auto-fit responsive grid */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: var(--space-6);
}

/* Named grid areas for complex layouts */
.layout-dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100dvh;
}

@media (max-width: 768px) {
  .layout-dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: 64px 1fr;
    grid-template-areas:
      "header"
      "main";
  }
}

/* Container queries (component-level responsiveness) */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-content {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }
}

@container card (max-width: 399px) {
  .card-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
}
```

### Breakpoint System

```css
/* Breakpoints (mobile-first) */
/* xs: 0px    — phones portrait */
/* sm: 640px  — phones landscape */
/* md: 768px  — tablets */
/* lg: 1024px — laptops */
/* xl: 1280px — desktops */
/* 2xl: 1536px — large screens */

/* Example usage */
.hero-title {
  font-size: var(--text-4xl);
}

@media (min-width: 768px) {
  .hero-title {
    font-size: var(--text-5xl);
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: var(--text-7xl);
  }
}
```

---

## JavaScript Utilities

### Scroll-Triggered Reveal

```javascript
// Intersection Observer for scroll animations
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
```

### Theme Toggle

```javascript
// Theme management with system preference detection + localStorage
function initTheme() {
  const stored = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);

  // View Transition API for smooth theme change
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', next);
    });
  }
}
```

### Smooth Counter

```javascript
// Animate counting numbers
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}
```

---

## Performance Optimization Checklist

### Images
- [ ] Use `<img loading="lazy">` for below-the-fold images
- [ ] Use `<img fetchpriority="high">` for LCP images
- [ ] Provide `width` and `height` attributes to prevent CLS
- [ ] Use WebP/AVIF format with `<picture>` fallbacks
- [ ] Use responsive `srcset` for different screen sizes

### CSS
- [ ] Use CSS custom properties for theming (no runtime JS for styles)
- [ ] Use `content-visibility: auto` for long lists
- [ ] Minimize CSS specificity (prefer classes over IDs)
- [ ] Use CSS `@layer` for cascade management
- [ ] Use `will-change` sparingly and only for known animation targets

### JavaScript
- [ ] Defer non-critical scripts with `defer` or `type="module"`
- [ ] Use `requestIdleCallback` for non-urgent tasks
- [ ] Implement virtual scrolling for large lists (>100 items)
- [ ] Use `AbortController` for fetch cleanup
- [ ] Debounce scroll/resize handlers (150ms)
- [ ] Use dynamic `import()` for code splitting

### Fonts
- [ ] Self-host fonts or use Google Fonts with `display=swap`
- [ ] Preconnect to font origins: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- [ ] Subset fonts to needed character sets
- [ ] Use `font-display: swap` to prevent FOIT

---

## Accessibility Checklist (WCAG 2.2 AA)

- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space, Escape)
- [ ] Focus indicators are visible and meet contrast requirements
- [ ] ARIA landmarks: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
- [ ] Images have descriptive `alt` text (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages are programmatically associated with inputs
- [ ] Skip navigation link as first focusable element
- [ ] `prefers-reduced-motion` media query respected
- [ ] `prefers-color-scheme` supported
- [ ] Touch targets ≥ 44×44px on mobile

---

## SEO Essentials

```html
<!-- Every page must include these -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Brand Name</title>
  <meta name="description" content="Compelling 150-160 character description">
  <meta name="theme-color" content="#6C3AED">

  <!-- Open Graph -->
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description">
  <meta property="og:image" content="/og-image.jpg">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/page">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Description">
  <meta name="twitter:image" content="/og-image.jpg">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Favicon -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
</head>
```

---

## Project Initialization Templates

### Option A: Vanilla HTML + CSS + JS (Simple Sites)

```
project/
├── index.html
├── css/
│   ├── reset.css              # CSS reset
│   ├── tokens.css             # Design tokens (colors, spacing, etc.)
│   ├── components.css         # Component styles (buttons, cards, inputs)
│   ├── animations.css         # All animation keyframes & utility classes
│   └── style.css              # Main stylesheet (imports all above)
├── js/
│   ├── app.js                 # Main application logic
│   ├── theme.js               # Dark mode toggle
│   └── animations.js          # Scroll reveal & micro-interactions
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── favicon.svg
```

### Option B: Vite 6 + React 19 (Web Apps)

```bash
npx -y create-vite@latest ./ --template react
```

```
project/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                # Static assets
│   ├── components/
│   │   ├── ui/                # Primitive components (Button, Input, Card, etc.)
│   │   ├── layout/            # Layout components (Navbar, Sidebar, Footer)
│   │   └── sections/          # Page sections (Hero, Features, Pricing)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── pages/                 # Page components
│   ├── styles/
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   ├── components.css
│   │   └── animations.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Global styles (imports from styles/)
├── index.html
├── vite.config.js
├── package.json
└── .eslintrc.cjs
```

### Option C: Next.js 15 (Full-Stack / SSR Apps)

```bash
npx -y create-next-app@latest ./ --js --no-tailwind --eslint --app --src-dir --no-turbopack --import-alias "@/*"
```

---

## Quick Reference: Modern CSS Features to Use

| Feature                  | Use Case                                                |
|--------------------------|---------------------------------------------------------|
| `container queries`      | Component-level responsive design                       |
| `@layer`                 | Manage CSS cascade and specificity                      |
| `@scope`                 | Scoped styling without CSS-in-JS                        |
| `@property`              | Typed CSS custom properties for animations              |
| `:has()`                 | Parent selector for contextual styling                  |
| `color-mix()`            | Dynamic color manipulation in CSS                       |
| `oklch()` / `oklab()`    | Perceptually uniform color spaces                       |
| `subgrid`                | Align nested grid items with parent grid                |
| `scroll-timeline`        | CSS-only scroll-linked animations                       |
| `view-transition-name`   | Smooth page transitions with View Transitions API       |
| `text-wrap: balance`     | Better headline wrapping                                |
| `text-wrap: pretty`      | Better paragraph wrapping                               |
| `field-sizing: content`  | Auto-sizing textareas                                   |
| `anchor()`               | CSS Anchor Positioning for tooltips/popovers            |
| `popover` attribute      | Native popovers without JS                              |
| `dialog` element         | Native modals with `::backdrop`                         |

---

## Workflow: Building a New Page

1. **Define semantic HTML structure** with proper heading hierarchy
2. **Add design tokens** to `:root` (from tokens.css reference)
3. **Style major layout** sections using CSS Grid/Flexbox
4. **Build components** bottom-up (atoms → molecules → organisms)
5. **Add responsive behavior** with container queries + media queries
6. **Implement interactions** (hover, focus, active states)
7. **Add animations** (entrance + micro-interactions)
8. **Wire up JavaScript** (theme toggle, scroll reveal, data fetching)
9. **Test accessibility** (keyboard nav, screen reader, contrast)
10. **Optimize performance** (lazy loading, code splitting, font strategy)

---

## Anti-Patterns to Avoid

❌ **Never use plain colors** like `red`, `blue`, `green` — always use your palette  
❌ **Never skip hover/focus states** — every interactive element needs them  
❌ **Never use `px` for font sizes** — use `rem` or `clamp()` for fluid typography  
❌ **Never hardcode breakpoints** — use design tokens or CSS container queries  
❌ **Never forget `alt` on images** — accessibility is mandatory  
❌ **Never use `!important`** — fix specificity issues at the cascade level  
❌ **Never animate `width`/`height`** — use `transform` and `opacity` for 60fps  
❌ **Never ship without a loading state** — skeleton loaders or spinners always  
❌ **Never use `div` soup** — use semantic HTML elements  
❌ **Never ignore dark mode** — always implement `data-theme` or `prefers-color-scheme`  
