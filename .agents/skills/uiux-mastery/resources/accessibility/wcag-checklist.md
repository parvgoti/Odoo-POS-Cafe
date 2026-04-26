# UI/UX Mastery — WCAG 2.2 Accessibility Checklist

Complete checklist for ensuring WCAG 2.2 Level AA compliance.
Check every item before shipping any interface.

---

## 1. Perceivable

### 1.1 Text Alternatives
- [ ] All `<img>` elements have `alt` attribute
- [ ] Decorative images have `alt=""` or `role="presentation"`
- [ ] Complex images (charts, diagrams) have detailed descriptions
- [ ] Icon-only buttons have `aria-label` text
- [ ] SVG icons have `<title>` or `aria-label`

### 1.2 Time-Based Media
- [ ] Video has captions (not auto-generated only)
- [ ] Audio content has transcripts
- [ ] Auto-playing media has pause/stop control
- [ ] No content flashes more than 3 times per second

### 1.3 Adaptable
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Only ONE `<h1>` per page
- [ ] HTML5 semantic elements used (`<nav>`, `<main>`, `<aside>`, `<footer>`)
- [ ] Reading order in DOM matches visual order
- [ ] Tables use `<th>`, `<caption>`, and `scope` attributes
- [ ] Lists use proper `<ul>`, `<ol>`, `<dl>` markup
- [ ] Form inputs are associated with `<label>` elements

### 1.4 Distinguishable
- [ ] **Text contrast** ≥ 4.5:1 (normal text)
- [ ] **Large text contrast** ≥ 3:1 (≥18px bold or ≥24px regular)
- [ ] **UI component contrast** ≥ 3:1 (buttons, inputs, icons)
- [ ] **Focus indicator contrast** ≥ 3:1 against adjacent colors
- [ ] Color is NOT the only means of conveying information
- [ ] Text can be resized to 200% without loss of content
- [ ] Content reflows at 320px width (no horizontal scrollbar)
- [ ] Line height ≥ 1.5 for body text
- [ ] Paragraph spacing ≥ 2× font size
- [ ] Word spacing can be adjusted to ≥ 0.16× font size
- [ ] No content blocked by user style overrides

---

## 2. Operable

### 2.1 Keyboard Accessible
- [ ] ALL interactive elements reachable via Tab key
- [ ] Tab order is logical (matches visual layout)
- [ ] No keyboard traps (user can always Tab away)
- [ ] Modals trap focus within (Tab cycles inside modal only)
- [ ] Modal closes on Escape key
- [ ] Focus returns to trigger element when modal closes
- [ ] Custom components support expected key patterns:
  - Buttons: Enter / Space
  - Links: Enter
  - Checkboxes: Space
  - Radio buttons: Arrow keys
  - Tabs: Arrow keys + Tab
  - Menus: Arrow keys + Enter + Escape
  - Combobox: Arrow keys + Enter + Escape + typing

### 2.2 Enough Time
- [ ] Auto-updating content can be paused or stopped
- [ ] Session timeouts warn before expiring (≥ 20 seconds notice)
- [ ] Timeout can be extended by user
- [ ] No time limits on reading content

### 2.3 Seizures & Physical Reactions
- [ ] No content flashes > 3 times per second
- [ ] Animations can be disabled (prefers-reduced-motion)
- [ ] Auto-playing motion has pause control

### 2.4 Navigable
- [ ] Skip navigation link as first focusable element
- [ ] Page `<title>` is descriptive and unique
- [ ] Focus visible on ALL interactive elements
- [ ] Focus indicator meets 3:1 contrast minimum
- [ ] Link text describes destination (no "click here")
- [ ] Multiple ways to find pages (nav + search + sitemap)
- [ ] Current page indicated in navigation
- [ ] Headings and labels describe content/purpose

### 2.5 Input Modalities
- [ ] Touch targets ≥ 24×24px minimum (44×44px recommended)
- [ ] Spacing between touch targets ≥ 8px
- [ ] Pointer gestures have single-pointer alternatives
- [ ] Down-event doesn't trigger action (use click/up-event)
- [ ] Draggable items have keyboard alternative

---

## 3. Understandable

### 3.1 Readable
- [ ] Page language declared: `<html lang="en">`
- [ ] Language changes marked: `<span lang="fr">`
- [ ] Reading level appropriate for audience
- [ ] Abbreviations defined on first use

### 3.2 Predictable
- [ ] Navigation consistent across pages
- [ ] Components behave consistently everywhere
- [ ] Focus never causes unexpected changes
- [ ] Form values don't cause unexpected changes (no auto-submit on select)

### 3.3 Input Assistance
- [ ] Required fields marked with `required` attribute and visual indicator
- [ ] Error messages are specific ("Email is invalid" not "Error")
- [ ] Error messages appear near the problem field
- [ ] Errors are announced to screen readers (`role="alert"`)
- [ ] Suggestions for correction are provided
- [ ] Important submissions are reversible or confirmed
- [ ] Input purpose identified (`autocomplete` attribute) for personal data

---

## 4. Robust

### 4.1 Compatible
- [ ] HTML validates (no duplicate IDs, proper nesting)
- [ ] All interactive elements have accessible name
- [ ] ARIA attributes used correctly (valid roles, states, properties)
- [ ] Status messages announced without focus change (aria-live)
- [ ] Custom widgets follow WAI-ARIA Authoring Practices

---

## Quick Test Procedure

1. **Tab through entire page** — Can you reach everything? Is order logical?
2. **Use with screen reader** (NVDA on Windows, VoiceOver on Mac)
3. **Zoom to 200%** — Does content reflow without horizontal scroll?
4. **Resize browser to 320px** — Is all content accessible?
5. **Disable CSS** — Does content order still make sense?
6. **Check color contrast** — Chrome DevTools → Accessibility tab
7. **Use keyboard only** — Complete all tasks without mouse
8. **Test with reduced motion** — Set prefers-reduced-motion: reduce
9. **Test with high contrast** — Windows High Contrast Mode
10. **Validate HTML** — https://validator.w3.org/

---

## Tools

| Tool | Purpose |
|------|---------|
| [axe DevTools](https://www.deque.com/axe/) | Browser extension for accessibility audit |
| [WAVE](https://wave.webaim.org/) | Web accessibility evaluation tool |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse/) | Built into Chrome DevTools |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | Color contrast tester |
| [NVDA](https://www.nvaccess.org/) | Free screen reader for Windows |
| [VoiceOver](https://support.apple.com/guide/voiceover/) | Built-in screen reader for macOS |
| [Stark](https://www.getstark.co/) | Design tool accessibility plugin |
