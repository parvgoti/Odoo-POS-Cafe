---
name: uiux-mastery
description: >
  Comprehensive UI/UX design skill covering design principles, color theory, typography,
  layout systems, component patterns, interaction design, accessibility (WCAG 2.2),
  micro-animations, responsive design, user psychology, and design system creation.
  Use when designing interfaces, reviewing UX flows, creating design systems,
  improving usability, or building premium web/mobile experiences. Covers 2026 design
  trends including spatial UI, glassmorphism, bento grids, AI-native interfaces, and dark mode.
---

# UI/UX Mastery Skill

A complete, opinionated UI/UX design guide for crafting premium, human-centered digital
experiences. This skill encodes the latest design patterns, psychological principles,
and interaction paradigms as of 2026.

---

## When to Use This Skill

- Designing a **new user interface** from scratch (web app, mobile, dashboard, landing page)
- Creating or refining a **design system** with tokens, components, and patterns
- Reviewing **UX flows** for usability issues and cognitive friction
- Implementing **micro-animations** and delightful interaction patterns
- Ensuring **accessibility (WCAG 2.2 AA/AAA)** compliance
- Applying **color theory** and building harmonious palettes
- Setting up **typography scales** and readable text hierarchies
- Creating **responsive layouts** using modern CSS (container queries, subgrid)
- Applying **user psychology** principles (Hick's Law, Fitts's Law, Gestalt)
- Building **dark mode** and multi-theme systems
- Designing for **2026 trends**: spatial UI, bento grids, AI-native interfaces, neubrutalism

---

## Design Philosophy — The 7 Pillars

### 1. Clarity Over Cleverness
Every element must have a purpose. If a user has to think about how to use your interface, you've failed. Remove ambiguity ruthlessly.

### 2. Visual Hierarchy is King
The eye should travel in a deliberate path: **primary action → supporting content → secondary actions**. Use size, weight, color, and spacing to create unmistakable hierarchy.

### 3. Consistency Breeds Trust
Reuse the same patterns everywhere. A button that looks different on every page destroys user confidence. Build a design system and enforce it.

### 4. Motion is Communication
Animations aren't decoration — they're language. Use motion to show relationships, indicate state changes, and guide attention. Every animation should answer: "What just happened?"

### 5. Accessibility is Design Quality
An interface that excludes users is a broken interface. WCAG compliance isn't a checklist — it's a design philosophy. Color contrast, keyboard navigation, screen reader support, and focus management are first-class concerns.

### 6. Emotional Design Matters
Interfaces evoke feelings. Premium spacing, polished shadows, smooth gradients, and thoughtful micro-interactions create trust and delight. Cheap-looking UI = cheap-feeling product.

### 7. Less Friction, More Flow
Every click, every field, every step is friction. Reduce form fields. Auto-fill where possible. Provide smart defaults. Make the happy path effortless.

---

## Color Theory & Palette Design

### HSL-First Approach (Never Use Raw Hex)

Always use HSL for color definitions. It's human-readable and mathematically manipulable:

```css
/* HSL = Hue (0-360°), Saturation (0-100%), Lightness (0-100%) */
/* Advantage: Adjust any axis independently */

:root {
  /* Primary — use a single hue, vary S and L for the scale */
  --hue-primary: 245;
  --color-primary-50:  hsl(var(--hue-primary), 100%, 97%);
  --color-primary-100: hsl(var(--hue-primary), 95%, 92%);
  --color-primary-200: hsl(var(--hue-primary), 90%, 84%);
  --color-primary-300: hsl(var(--hue-primary), 85%, 73%);
  --color-primary-400: hsl(var(--hue-primary), 82%, 63%);
  --color-primary-500: hsl(var(--hue-primary), 78%, 52%);  /* Base */
  --color-primary-600: hsl(var(--hue-primary), 82%, 45%);
  --color-primary-700: hsl(var(--hue-primary), 78%, 38%);
  --color-primary-800: hsl(var(--hue-primary), 72%, 30%);
  --color-primary-900: hsl(var(--hue-primary), 68%, 22%);
  --color-primary-950: hsl(var(--hue-primary), 75%, 13%);
}
```

### Color Harmony Rules

| Harmony         | Formula                        | Use Case                          |
|-----------------|--------------------------------|-----------------------------------|
| **Monochromatic** | Same hue, vary S/L            | Minimal, elegant, corporate       |
| **Analogous**    | ±30° on color wheel            | Warm/cool palettes, natural feel  |
| **Complementary**| +180° opposite                 | High contrast, CTA highlights     |
| **Split-Comp**   | +150° and +210°                | Vibrant but balanced              |
| **Triadic**      | +120° and +240°                | Playful, energetic brands         |

### Semantic Color Architecture

```css
:root {
  /* Functional Colors — NEVER use brand colors for status */
  --color-success-50:  hsl(152, 80%, 96%);
  --color-success-500: hsl(152, 68%, 45%);
  --color-success-700: hsl(152, 72%, 30%);

  --color-warning-50:  hsl(38, 100%, 96%);
  --color-warning-500: hsl(38, 95%, 55%);
  --color-warning-700: hsl(38, 90%, 38%);

  --color-error-50:  hsl(0, 90%, 96%);
  --color-error-500: hsl(0, 84%, 60%);
  --color-error-700: hsl(0, 78%, 42%);

  --color-info-50:  hsl(205, 90%, 96%);
  --color-info-500: hsl(205, 85%, 55%);
  --color-info-700: hsl(205, 80%, 38%);

  /* Surface System */
  --surface-ground: hsl(0, 0%, 100%);       /* Page background */
  --surface-card: hsl(0, 0%, 100%);          /* Card/panel bg */
  --surface-section: hsl(220, 20%, 97%);     /* Section bg */
  --surface-hover: hsl(220, 15%, 95%);       /* Hovered row/item */
  --surface-active: hsl(220, 15%, 92%);      /* Pressed state */
  --surface-overlay: hsla(220, 25%, 10%, 0.6); /* Modal backdrop */

  /* Text Hierarchy */
  --text-heading: hsl(220, 25%, 10%);        /* h1-h6 */
  --text-body: hsl(220, 15%, 22%);           /* Paragraphs */
  --text-muted: hsl(220, 10%, 50%);          /* Secondary info */
  --text-placeholder: hsl(220, 8%, 65%);     /* Placeholder text */
  --text-disabled: hsl(220, 5%, 75%);        /* Disabled state */
  --text-link: var(--color-primary-500);      /* Links */
  --text-on-primary: hsl(0, 0%, 100%);       /* Text on primary bg */
}
```

### Dark Mode — Not Just Inverted

```css
[data-theme="dark"] {
  /* Dark surfaces use blue-tinted grays, NEVER pure black */
  --surface-ground: hsl(220, 25%, 7%);
  --surface-card: hsl(220, 20%, 11%);
  --surface-section: hsl(220, 18%, 14%);
  --surface-hover: hsl(220, 15%, 17%);
  --surface-active: hsl(220, 15%, 20%);
  --surface-overlay: hsla(220, 30%, 5%, 0.85);

  /* Text in dark mode — never pure white (#fff), use off-whites */
  --text-heading: hsl(220, 15%, 93%);
  --text-body: hsl(220, 10%, 82%);
  --text-muted: hsl(220, 8%, 55%);
  --text-placeholder: hsl(220, 5%, 42%);
  --text-disabled: hsl(220, 5%, 32%);
  --text-link: var(--color-primary-400);
  --text-on-primary: hsl(0, 0%, 100%);

  /* Reduce saturation of semantic colors in dark mode */
  --color-success-500: hsl(152, 58%, 48%);
  --color-warning-500: hsl(38, 85%, 58%);
  --color-error-500: hsl(0, 74%, 62%);
  --color-info-500: hsl(205, 75%, 58%);

  /* Shadows in dark mode use darker, more transparent values */
  --shadow-sm: 0 1px 3px hsla(0, 0%, 0%, 0.4);
  --shadow-md: 0 4px 8px hsla(0, 0%, 0%, 0.5);
  --shadow-lg: 0 10px 20px hsla(0, 0%, 0%, 0.6);
}
```

### Color Contrast Rules (WCAG 2.2)

| Element            | Min Ratio (AA) | Min Ratio (AAA) |
|--------------------|----------------|-----------------|
| Normal text        | 4.5:1          | 7:1             |
| Large text (18px+) | 3:1            | 4.5:1           |
| UI components      | 3:1            | N/A             |
| Focus indicators   | 3:1            | N/A             |
| Non-text graphics  | 3:1            | N/A             |

---

## Typography System

### The Type Scale (Fluid, Responsive)

```css
:root {
  /* Font Stacks — always include system fallbacks */
  --font-display: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Modular Scale: 1.250 (Major Third) */
  --text-xs:   clamp(0.694rem, 0.65rem + 0.22vw, 0.75rem);    /* 11-12px */
  --text-sm:   clamp(0.799rem, 0.75rem + 0.25vw, 0.875rem);   /* 13-14px */
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);         /* 14-16px */
  --text-lg:   clamp(1.05rem, 0.95rem + 0.5vw, 1.25rem);      /* 17-20px */
  --text-xl:   clamp(1.25rem, 1.1rem + 0.75vw, 1.563rem);     /* 20-25px */
  --text-2xl:  clamp(1.5rem, 1.25rem + 1.25vw, 1.953rem);     /* 24-31px */
  --text-3xl:  clamp(1.8rem, 1.45rem + 1.75vw, 2.441rem);     /* 29-39px */
  --text-4xl:  clamp(2.1rem, 1.6rem + 2.5vw, 3.052rem);       /* 34-49px */
  --text-5xl:  clamp(2.5rem, 1.8rem + 3.5vw, 3.815rem);       /* 40-61px */
  --text-hero: clamp(3rem, 2rem + 5vw, 5rem);                  /* 48-80px */
}
```

### Typography Hierarchy Rules

1. **Max 2 font families** per project (display + body). Three is absolute max.
2. **Line height**: Headings = 1.1–1.3, Body = 1.5–1.7, Small text = 1.4–1.5
3. **Line length**: 45–75 characters per line (ideal: 65). Use `max-width: 65ch`.
4. **Letter spacing**: Negative for large headings (`-0.02em`), wider for small caps (`0.05em`)
5. **Font weight contrast**: Min 2 weight steps between hierarchy levels
6. **Paragraph spacing**: Use `margin-bottom` equal to `line-height × font-size × 0.75`

### Heading Patterns

```css
.heading-hero {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
  background: linear-gradient(135deg, var(--text-heading), var(--color-primary-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.heading-section {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-heading);
}

.heading-card {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-heading);
}

.body-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-body);
  max-width: 65ch;
}

.caption {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
```

---

## Layout Systems (2026)

### Bento Grid Layout

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: var(--space-4);
  padding: var(--space-6);
}

.bento-item { border-radius: var(--radius-2xl); overflow: hidden; }
.bento-item--wide { grid-column: span 2; }
.bento-item--tall { grid-row: span 2; }
.bento-item--hero { grid-column: span 2; grid-row: span 2; }

@media (max-width: 768px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-item--hero { grid-column: span 2; grid-row: span 1; }
}

@media (max-width: 480px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-item--wide, .bento-item--hero { grid-column: span 1; }
}
```

### Container Queries (Component-Level Responsive)

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Card adapts to its container, not the viewport */
@container card (min-width: 500px) {
  .card-inner {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-4);
  }
}

@container card (max-width: 499px) {
  .card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .card-image { aspect-ratio: 16/9; }
}
```

### The Spacing System

```
4px base unit — everything is a multiple of 4
4   8   12  16  20  24  32  40  48  64  80  96  128
xs  sm  md  base lg  xl  2xl 3xl 4xl 5xl 6xl 7xl 8xl

Rules:
- Related elements: 4-8px gap
- Group members: 12-16px gap
- Between groups: 24-32px gap
- Between sections: 48-96px gap
- Page margins: 16px (mobile) → 32px (tablet) → 64px (desktop)
```

---

## Component Design Patterns

### Card Anatomy

Every card follows this structure:
```
┌──────────────────────────────────┐
│  [Media / Thumbnail]             │ ← Optional visual
├──────────────────────────────────┤
│  Eyebrow Label                   │ ← Category / tag
│  Card Title                      │ ← Primary info
│  Supporting text / description   │ ← Secondary info
│                                  │
│  [Icon] Metadata  ·  Metadata    │ ← Tertiary info
├──────────────────────────────────┤
│  [Action]           [Action]     │ ← CTA buttons / links
└──────────────────────────────────┘
```

### Button Hierarchy

```
Primary   → Filled, bold color, strong shadow   → 1 per view
Secondary → Outlined or subtle fill              → Supporting actions
Tertiary  → Ghost / text-only                    → Less important
Danger    → Red-tinted, requires confirmation     → Destructive

Rules:
- Max 1 primary button visible at a time
- Minimum touch target: 44×44px (mobile), 36×36px (desktop)
- Always include hover, focus, active, disabled, loading states
- Icon + label buttons: icon left for actions, icon right for navigation
```

### Form UX Patterns

```
1. Labels ABOVE inputs (never float labels on complex forms)
2. Error messages BELOW the field, in red, with icon
3. Helper text BELOW the field, in muted color
4. Required indicator: red asterisk (*) in the label
5. Inline validation on blur (not on every keystroke)
6. Group related fields with fieldsets and clear section headers
7. Submit button at bottom-left (LTR) — primary color, full-width on mobile
8. Show password strength meter for password fields
9. Auto-focus first field on page load
10. Tab order must match visual order
```

---

## Micro-Animations & Interaction Design

### Animation Timing Guidelines

| Action              | Duration    | Easing                            |
|---------------------|-------------|-----------------------------------|
| Button click        | 100-150ms   | ease-out                          |
| Tooltip appear      | 150-200ms   | ease-out                          |
| Modal open          | 250-350ms   | ease-out or spring                |
| Modal close         | 200-250ms   | ease-in                           |
| Page transition     | 300-500ms   | ease-in-out                       |
| Skeleton → Content  | 300-400ms   | ease-out (crossfade)              |
| Slide-in panel      | 300-400ms   | cubic-bezier(0.32, 0.72, 0, 1)   |
| Notification toast  | 400ms in    | spring / bounce                   |
| Hover state         | 150-200ms   | ease-default                      |
| Color change        | 200-300ms   | ease-in-out                       |

### Rule: The 3 Purposes of Animation

Every animation must serve exactly ONE purpose:
1. **Orient** — Show where something came from or went to (slide in/out)
2. **Focus** — Draw attention to something important (pulse, shake, glow)
3. **Feedback** — Confirm an action was registered (click ripple, checkmark)

If an animation serves none of these → **remove it**.

### Signature Animations

```css
/* Smooth reveal on scroll */
.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0, 0, 0.2, 1);
}
.scroll-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered list items */
.stagger > * {
  opacity: 0;
  animation: stagger-in 0.5s cubic-bezier(0, 0, 0.2, 1) forwards;
}
.stagger > *:nth-child(1) { animation-delay: 50ms; }
.stagger > *:nth-child(2) { animation-delay: 100ms; }
.stagger > *:nth-child(3) { animation-delay: 150ms; }
.stagger > *:nth-child(4) { animation-delay: 200ms; }
.stagger > *:nth-child(5) { animation-delay: 250ms; }

@keyframes stagger-in {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Magnetic button hover */
.btn-magnetic {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-magnetic:hover { transform: scale(1.04) translateY(-1px); }
.btn-magnetic:active { transform: scale(0.97); }

/* Glassmorphism shimmer */
@keyframes glass-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.glass-shine {
  background: linear-gradient(
    120deg,
    transparent 30%,
    hsla(0, 0%, 100%, 0.1) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  animation: glass-shimmer 3s ease-in-out infinite;
}
```

---

## Accessibility (WCAG 2.2 AA)

### Non-Negotiable Checklist

- [ ] **Color contrast**: 4.5:1 for text, 3:1 for large text & UI components
- [ ] **Keyboard navigation**: All interactive elements reachable via Tab
- [ ] **Focus indicators**: Visible, 3:1 contrast against adjacent colors
- [ ] **ARIA labels**: All icons, images, and non-text elements labeled
- [ ] **Skip navigation**: "Skip to main content" link as first focusable element
- [ ] **Form labels**: Every input has a visible `<label>` with `for` attribute
- [ ] **Error identification**: Errors described in text, not just color
- [ ] **Motion preference**: Respect `prefers-reduced-motion`
- [ ] **Touch targets**: Minimum 44×44px on mobile
- [ ] **Heading hierarchy**: Semantic h1→h6, never skip levels
- [ ] **Language attribute**: `<html lang="en">`
- [ ] **Alt text**: Descriptive for content images, empty `alt=""` for decorative

### Focus Management Pattern

```css
/* Custom focus ring — visible, beautiful, accessible */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) { outline: none; }

/* Enhanced focus for dark mode */
[data-theme="dark"] :focus-visible {
  outline-color: var(--color-primary-400);
  box-shadow: 0 0 0 4px hsla(245, 78%, 52%, 0.25);
}
```

---

## User Psychology Principles

### Hick's Law
**More choices = longer decisions.** Limit options to 5-7 per group. Use progressive disclosure.

### Fitts's Law
**Larger + closer targets = faster clicks.** Make primary CTAs large. Put important actions in corners/edges (infinite edges on desktop).

### Miller's Law
**Working memory holds 7±2 items.** Chunk information. Use visual grouping.

### Von Restorff Effect
**The different item gets remembered.** Make CTAs visually distinct from everything else. Use color contrast and size.

### Gestalt Principles
- **Proximity**: Group related items close together
- **Similarity**: Same style = same function
- **Closure**: Users complete incomplete shapes mentally (use for progressive loading)
- **Continuity**: Align elements to guide the eye in a flow

### The Peak-End Rule
**Users judge experiences by the peak moment and the end.** Make onboarding delightful and final confirmations satisfying.

---

## 2026 Design Trends

### Spatial UI & Depth
Layers with blur, parallax micro-movements, elevation through shadows and scale.

### AI-Native Interfaces
Chat-first layouts, streaming text animations, confidence indicators, suggested actions.

### Bento Grid Layouts
Apple-style grid with mixed-size tiles. Hero tile spans 2×2, info tiles are 1×1.

### Glassmorphism 2.0
Frosted glass with subtle noise texture, animated gradient borders, backdrop blur.

### Neubrutalism
Thick borders, raw shadows (no blur), bold clashing colors, exposed structure. Use sparingly.

### Variable Fonts & Kinetic Typography
Font-weight animations, responsive optical sizing, text that moves and transforms.

### Micro-Interaction Density
Every element responds to interaction — hovers, clicks, scrolls. Nothing feels static.

---

## Design System Creation Workflow

### Step 1: Define Tokens
Colors, typography, spacing, shadows, borders, radii, z-indices, motion curves.

### Step 2: Build Primitives
Buttons, inputs, badges, avatars, icons, dividers, tooltips.

### Step 3: Compose Patterns
Cards, modals, navigation, sidebars, tables, forms, empty states, error states.

### Step 4: Create Templates
Dashboard layout, settings page, onboarding flow, profile page, list/detail views.

### Step 5: Document Everything
Token values, usage rules, do/don't examples, component API reference.

---

## Quick Reference: The UX Review Checklist

```
VISUAL HIERARCHY
  □ Is the most important element the most prominent?
  □ Can users identify the primary action in < 3 seconds?
  □ Is there clear visual grouping of related content?

NAVIGATION
  □ Can users always tell where they are?
  □ Is there always a way to go back?
  □ Is the navigation consistent across all pages?

FORMS & INPUT
  □ Are labels clear and positioned above inputs?
  □ Do errors explain what went wrong AND how to fix it?
  □ Is the tab order logical?

FEEDBACK & STATES
  □ Does every action have visible feedback?
  □ Are loading states shown for any action > 300ms?
  □ Are empty states helpful (not just "No data")?

PERFORMANCE PERCEPTION
  □ Do skeleton screens appear before content loads?
  □ Are animations under 400ms for most interactions?
  □ Does the interface feel responsive and alive?

ACCESSIBILITY
  □ Can the entire interface be used with keyboard only?
  □ Do all images have alt text?
  □ Are color contrast ratios sufficient?
```
