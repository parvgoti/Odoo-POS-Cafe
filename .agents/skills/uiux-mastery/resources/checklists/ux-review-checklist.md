# UX Review Checklist — UI/UX Mastery Skill

Use this checklist when reviewing any interface design or implementation.

---

## Visual Hierarchy
- [ ] Most important element is the most visually prominent
- [ ] Users can identify the primary action within 3 seconds
- [ ] Clear visual grouping of related content (Gestalt proximity)
- [ ] Consistent heading hierarchy (h1 → h6, no skipped levels)
- [ ] Max 2 font families used across the project
- [ ] Color palette limited to max 5 core colors + neutrals

## Color & Contrast
- [ ] Normal text: 4.5:1 contrast ratio minimum (WCAG AA)
- [ ] Large text (18px+): 3:1 contrast ratio minimum
- [ ] UI components: 3:1 contrast against adjacent colors
- [ ] No information conveyed by color alone
- [ ] Dark mode uses blue-tinted grays (never pure black #000)
- [ ] Dark mode text uses off-whites (never pure white #fff)
- [ ] Semantic colors consistent (green=success, red=error, amber=warning)

## Typography
- [ ] Body text: 14-16px minimum, line-height 1.5-1.7
- [ ] Line length: 45-75 characters per line (65 ideal)
- [ ] Headings use display font, body uses readable sans-serif
- [ ] Font weight contrast: min 2 steps between hierarchy levels
- [ ] Text uses fluid sizing (clamp) for responsive typography

## Layout & Spacing
- [ ] 4px base spacing unit used consistently
- [ ] Related items: 4-8px gap
- [ ] Group members: 12-16px gap
- [ ] Between sections: 48-96px gap
- [ ] Page margins scale: 16px → 32px → 64px
- [ ] Responsive: mobile-first media queries
- [ ] Container queries for component-level responsiveness

## Navigation
- [ ] Users always know where they are (active state visible)
- [ ] Always a way to go back / navigate to home
- [ ] Navigation consistent across all pages
- [ ] Breadcrumbs for deep hierarchies (3+ levels)
- [ ] Mobile: hamburger menu or bottom tab navigation

## Forms & Input
- [ ] Labels positioned ABOVE inputs (not floating on complex forms)
- [ ] All inputs have visible `<label>` with `for` attribute
- [ ] Required fields marked with red asterisk (*)
- [ ] Error messages below field, explain what's wrong AND how to fix
- [ ] Inline validation on blur (not on every keystroke)
- [ ] Logical tab order matching visual order
- [ ] Submit button: primary color, bottom-left, full-width on mobile
- [ ] Auto-focus first field on page load

## Buttons & Actions
- [ ] Max 1 primary button visible per view
- [ ] Touch targets: min 44×44px (mobile), 36×36px (desktop)
- [ ] All states: hover, focus, active, disabled, loading
- [ ] Destructive actions require confirmation
- [ ] Loading state shown for actions > 300ms

## Feedback & States
- [ ] Every user action has visible feedback
- [ ] Loading: skeleton screens or spinners (never blank page)
- [ ] Empty states: helpful message + action (not "No data found")
- [ ] Error states: clear message + recovery action
- [ ] Success states: confirmation + next step guidance
- [ ] Toast notifications for async operations

## Accessibility (WCAG 2.2 AA)
- [ ] Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Focus indicators visible (2px solid, 3:1 contrast)
- [ ] "Skip to main content" link as first focusable element
- [ ] All images have alt text (decorative = empty alt="")
- [ ] ARIA labels on all icon-only buttons and interactive elements
- [ ] `<html lang="en">` attribute set
- [ ] Motion respects `prefers-reduced-motion`
- [ ] No content flash or layout shift (CLS < 0.1)

## Animation & Motion
- [ ] Every animation serves a purpose (orient, focus, or feedback)
- [ ] Button clicks: 100-150ms
- [ ] Hover transitions: 150-200ms
- [ ] Modal open: 250-350ms, close: 200-250ms
- [ ] Page transitions: 300-500ms
- [ ] No animation exceeds 1 second (unless loading)
- [ ] Stagger delay between children: 50-80ms

## Performance Perception
- [ ] Skeleton screens before content loads
- [ ] Optimistic UI for instant-feeling actions
- [ ] Progressive image loading (blur-up or low-res placeholder)
- [ ] Above-the-fold content loads in < 1 second
- [ ] No layout shifts during loading (reserve space)

## Responsive Design
- [ ] Tested at: 320px, 375px, 768px, 1024px, 1280px, 1536px
- [ ] Touch-friendly spacing on mobile (increased padding/gaps)
- [ ] No horizontal scrolling on any viewport
- [ ] Images use responsive sizing (srcset or max-width: 100%)
- [ ] Navigation collapses gracefully on smaller screens
