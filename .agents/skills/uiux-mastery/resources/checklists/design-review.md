# UI/UX Mastery — Design Review Checklist

Use BEFORE handing off any design for development.
Every item must be verified.

---

## Visual Design

### Color
- [ ] All colors come from the design token system (no hardcoded hex)
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large text/UI)
- [ ] Color is NOT the sole indicator of state (icons, labels, patterns too)
- [ ] Semantic colors used correctly (red=error, green=success, amber=warning)
- [ ] Dark mode variant fully designed and checked
- [ ] Gradients include fallback solid color

### Typography
- [ ] Max 2 typefaces used (display + body)
- [ ] All text uses type scale tokens (no arbitrary font sizes)
- [ ] Headings have clear visual hierarchy (h1 > h2 > h3)
- [ ] Body text line height ≥ 1.5
- [ ] Line length: 45-75 characters for body text
- [ ] Text wrap: `balance` for headings, `pretty` for paragraphs
- [ ] Font weights limited to 3-4 per typeface

### Spacing
- [ ] All spacing aligns to 4px grid
- [ ] Consistent spacing between same-type elements
- [ ] Visual grouping uses Gestalt proximity principle
- [ ] Sufficient whitespace around key elements
- [ ] Section spacing uses progressive scale (larger gaps between major sections)

### Layout
- [ ] Responsive behavior designed for mobile, tablet, desktop
- [ ] Grid system is consistent throughout
- [ ] Content max-width prevents overly long lines on wide screens
- [ ] Cards and grids have consistent gaps
- [ ] Sidebar behavior defined for all breakpoints

---

## Component States

### Buttons
- [ ] Default state designed
- [ ] Hover state designed
- [ ] Active/Pressed state designed
- [ ] Focus state designed (visible ring)
- [ ] Disabled state designed (50% opacity, no-cursor)
- [ ] Loading state designed (spinner replaces label)
- [ ] Button hierarchy clear (only 1 primary per section)

### Form Inputs
- [ ] Default state
- [ ] Hover state (border strengthens)
- [ ] Focus state (primary border + glow ring)
- [ ] Filled state
- [ ] Error state (red border + message below)
- [ ] Disabled state
- [ ] Read-only state
- [ ] Label always visible (not placeholder-only!)
- [ ] Required indicator present

### Links
- [ ] Default state (distinguishable from body text)
- [ ] Hover state (underline or color change)
- [ ] Visited state (optional, for content sites)
- [ ] Focus state (visible ring)

### Toggle / Checkbox / Radio
- [ ] Off/unchecked state
- [ ] On/checked state
- [ ] Hover state
- [ ] Focus state
- [ ] Disabled state
- [ ] Indeterminate state (checkbox)

---

## Edge Cases

### Content
- [ ] Empty state designed (illustration + helpful message + CTA)
- [ ] Loading state designed (skeleton screens)
- [ ] Error state designed (retry option)
- [ ] Long text tested (what if name is 50+ characters?)
- [ ] Short text tested (what if name is 1 character?)
- [ ] Missing image fallback designed
- [ ] List with 0, 1, and 100+ items considered

### Viewport
- [ ] 320px viewport tested (smallest mobile)
- [ ] 375px viewport tested (iPhone)
- [ ] 768px viewport tested (tablet)
- [ ] 1024px viewport tested (laptop)
- [ ] 1440px viewport tested (desktop)
- [ ] 1920px+ viewport tested (large monitor)
- [ ] No horizontal scrollbar at any width
- [ ] Text readable at 200% zoom

---

## Interaction & Motion

- [ ] Every interactive element has hover + focus state
- [ ] Animations serve purpose (feedback, orientation, delight)
- [ ] Animation durations appropriate:
  - Micro: 100-200ms
  - Panel/modal: 200-350ms
  - Page: 250-500ms
- [ ] `prefers-reduced-motion` variant designed
- [ ] No animation blocks user from completing tasks
- [ ] Loading indicators for any action > 300ms

---

## Accessibility

- [ ] Keyboard navigation tested for all interactions
- [ ] Focus order matches visual order
- [ ] Focus indicators clearly visible
- [ ] Screen reader labels defined for icon-only elements
- [ ] Alt text written for all images
- [ ] Heading hierarchy is correct (h1 → h2 → h3)
- [ ] Error messages announced to screen readers
- [ ] Touch targets ≥ 44px on mobile

---

## Handoff Quality

- [ ] All design tokens documented (colors, fonts, spacing)
- [ ] Component variants and states clearly labeled
- [ ] Responsive behavior annotated
- [ ] Interaction notes written (triggers, animations, edge cases)
- [ ] Assets exported (icons, illustrations, images)
- [ ] Design matches brand guidelines
