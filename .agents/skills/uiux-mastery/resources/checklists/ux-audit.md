# UI/UX Mastery — UX Audit Checklist

Use this checklist to evaluate ANY existing interface for usability issues.
Score each item: ✅ Pass | ⚠️ Needs improvement | ❌ Fail

---

## 1. First Impression (0-5 seconds)

- [ ] **Value proposition** is immediately clear
- [ ] **Visual hierarchy** guides eye to most important element
- [ ] **Brand identity** is recognizable and consistent
- [ ] **Loading time** — content appears within 2.5 seconds
- [ ] **No jarring elements** (auto-play, popups, flashing)

## 2. Navigation & Information Architecture

- [ ] User can identify **where they are** in the app
- [ ] User can figure out **how to get anywhere** from any page
- [ ] **Navigation labels** are clear (no jargon)
- [ ] **Breadcrumbs** provided for deep hierarchies
- [ ] **Search** is available and produces useful results
- [ ] **Back button** works as expected
- [ ] No **dead ends** (pages with no next action)
- [ ] **404 page** is helpful (suggests alternatives)

## 3. Content & Copy

- [ ] **Headings** clearly describe section content
- [ ] **Text is scannable** (bullets, short paragraphs, bold key terms)
- [ ] **Actions use verbs** ("Create project" not "New")
- [ ] **Error messages** explain what + how to fix
- [ ] **Success messages** confirm what happened
- [ ] **No jargon** — language matches user's vocabulary
- [ ] **Consistent terminology** — same thing always called the same name
- [ ] **No Lorem Ipsum** or placeholder content in production

## 4. Forms & Input

- [ ] **Labels** are always visible (not placeholder-only)
- [ ] **Required fields** are clearly marked
- [ ] **Inline validation** fires on blur (not keystroke)
- [ ] **Error messages** appear near the problem field
- [ ] **Tab order** is logical
- [ ] **Autofill** works (autocomplete attributes set)
- [ ] **Password** has show/hide toggle
- [ ] **Long forms** are broken into steps with progress indicator
- [ ] **Submit button** has loading state
- [ ] **Form preserves data** on error (no data loss)

## 5. Visual Design

- [ ] **Consistent spacing** — aligns to 4px/8px grid
- [ ] **Color contrast** meets WCAG AA (4.5:1)
- [ ] **Typography** uses max 2 typefaces
- [ ] **Icons** are consistent style (don't mix outline/filled)
- [ ] **Images** are high quality (not pixelated, properly sized)
- [ ] **Dark mode** works correctly (if supported)
- [ ] **Empty states** have illustrations + helpful CTA
- [ ] **Loading states** use skeletons (not blank screens)

## 6. Interaction & Feedback

- [ ] **Every click** produces visible feedback (< 100ms)
- [ ] **Hover states** exist on all interactive elements
- [ ] **Focus states** are visible and accessible
- [ ] **Animations** serve a purpose (not gratuitous)
- [ ] **Destructive actions** require confirmation
- [ ] **Undo** available for common destructive operations
- [ ] **Progress indicators** for multi-step processes
- [ ] **Optimistic UI** for likely-to-succeed actions

## 7. Mobile & Responsive

- [ ] **Touch targets** ≥ 44×44px
- [ ] **No horizontal scroll** at any viewport
- [ ] **Text readable** without pinching to zoom
- [ ] **Navigation** adapts appropriately (hamburger, bottom tab, etc.)
- [ ] **Forms** are easy to use with virtual keyboard
- [ ] **Key content visible** above fold on mobile
- [ ] **Tested on real devices** — not just simulator

## 8. Performance & Loading

- [ ] **First Contentful Paint** < 1.8 seconds
- [ ] **Largest Contentful Paint** < 2.5 seconds
- [ ] **Cumulative Layout Shift** < 0.1 (no jank)
- [ ] **Images** are lazy loaded below the fold
- [ ] **Fonts** use `display: swap` (no invisible text)
- [ ] **Skeleton loaders** for async content
- [ ] **Offline state** handled gracefully (if applicable)

## 9. Accessibility

- [ ] **Keyboard navigation** works for all features
- [ ] **Screen reader** can navigate all content
- [ ] **Focus order** matches visual order
- [ ] **Alt text** on all meaningful images
- [ ] **ARIA labels** on icon-only buttons
- [ ] **Color** not the only way to convey information
- [ ] **Reduced motion** respected
- [ ] **Zoom to 200%** doesn't break layout

## 10. Trust & Security Signals

- [ ] **HTTPS** (lock icon in URL bar)
- [ ] **Privacy policy** linked from sign-up/checkout
- [ ] **Clear pricing** (no hidden fees)
- [ ] **Social proof** present (testimonials, logos, counters)
- [ ] **Contact information** easily findable
- [ ] **Data handling** explained for sensitive inputs
- [ ] **Third-party trust badges** present where appropriate

---

## Scoring Guide

| Score | Rating | Action |
|-------|--------|--------|
| 90-100% ✅ | Excellent | Minor polish only |
| 75-89% | Good | Fix ⚠️ items in next sprint |
| 50-74% | Needs Work | Prioritize ❌ items immediately |
| < 50% | Critical | Major redesign recommended |

---

## Priority Matrix

| Impact ↑ | Low Effort | High Effort |
|----------|------------|-------------|
| **High** | 🔴 Do NOW | 📋 Plan next sprint |
| **Low**  | ✅ Quick wins | 🗑️ Deprioritize |
