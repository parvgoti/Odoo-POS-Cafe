# UI/UX Mastery — Component Pattern Library

Reference guide for common UI component patterns with specifications,
behavior rules, and accessibility requirements.

---

## Navigation Patterns

### Top Navigation Bar
```
Height:     56-72px
Position:   fixed top
Background: surface-primary with backdrop-filter: blur(12px)
Border:     1px bottom, subtle
Z-index:    sticky (200)
Content:    Logo (left) + Links (center/right) + Actions (right)
```

**Behavior:**
- Shrinks slightly on scroll (optional)
- Mobile: collapses to hamburger at < 768px
- Active link has visual indicator (underline, bg, or color)
- Hover: subtle color shift on links

### Sidebar Navigation
```
Width:      240-280px expanded, 64-72px collapsed
Position:   fixed left, full height
Background: slightly darker than content area
```

**Behavior:**
- Collapse toggle button (hamburger or chevron)
- Active item: highlight bg + accent text + left border indicator
- Groups: section labels (uppercase, muted, xs font)
- Tooltips on collapsed state for icon-only items
- Scrollable if content exceeds viewport

### Breadcrumbs
```
Font:      text-sm, text-secondary
Separator: / or › (between items)
Current:   text-primary, font-medium (not a link)
```

### Tab Navigation
```
Height:      44px per tab
Active:      2px bottom border in primary color
Inactive:    text-secondary
Hover:       text-primary (without indicator)
Transition:  indicator slides to active tab (150ms)
Keyboard:    Arrow keys to switch, Enter to activate
ARIA:        role="tablist" + role="tab" + role="tabpanel"
```

---

## Form Patterns

### Text Input
```
Height:      40-48px
Padding:     10px 14px
Border:      1px solid border-default
Radius:      8px
Font:        text-sm or text-base

States:
  Default:   border-default bg
  Hover:     border-strong
  Focus:     primary border + 3px glow ring
  Error:     error border + error glow + error text below
  Disabled:  50% opacity, no-cursor
  Read-only: no border, subtle bg
```

**Label rules:**
- Always use `<label>` (never placeholder-only)
- Label above input (6-8px gap)
- Required: red asterisk or "(required)" text
- Optional: "(optional)" text

**Error message:**
- Color: error (red)
- Size: text-xs
- Position: directly below input (4px gap)
- Content: "What went wrong" + "How to fix it"
- Example: "Email is invalid. Enter a valid email like name@example.com"

### Select / Dropdown
```
Same dimensions as text input
Custom chevron icon (right side)
Dropdown panel:
  Max height:  280px (scrollable)
  Shadow:      shadow-lg
  Radius:      same as input
  Item height: 36-40px
  Active:      primary bg, white text
  Hover:       surface-tertiary bg
```

### Checkbox
```
Size:        18-20px square
Radius:      4px (slightly rounded)
Checked:     primary bg, white checkmark
Indeterminate: primary bg, white dash
Focus:       3px ring
Label:       right of checkbox, 8px gap
```

### Radio Button
```
Size:        18-20px circle
Selected:    primary border + primary inner dot
Focus:       3px ring
Group:       vertical list, 8-12px between items
```

### Toggle / Switch
```
Width:       44px
Height:      24px
Thumb:       20px circle, white
Track off:   neutral-300
Track on:    primary-500
Transition:  200ms ease
Label:       right of toggle
```

### Search Input
```
Left icon:   🔍 (magnifying glass, text-tertiary)
Right icon:  ✕ (clear button, appears when has value)
Keyboard:    Escape to clear, Enter to submit
Debounce:    300ms before triggering search
```

---

## Feedback Patterns

### Toast Notifications
```
Position:    top-right (desktop), top-center (mobile)
Width:       320-420px
Padding:     16px 20px
Radius:      12px
Shadow:      shadow-xl

Types:
  Success: ✓ green icon + message
  Error:   ✕ red icon + message
  Warning: ⚠ amber icon + message
  Info:    ℹ blue icon + message

Behavior:
  Enter:   slide in from right (300ms spring)
  Auto-dismiss: 4-6s (not for errors)
  Close:   ✕ button or swipe
  Stack:   max 3 visible, new pushes oldest
```

### Modal / Dialog
```
Overlay:     surface-overlay (60-80% opacity)
Container:   surface-elevated, shadow-2xl
Width:       480px (form), 640px (content), 800px (complex)
Max height:  85vh (scroll body, not entire modal)
Radius:      16-24px
Padding:     24px

Structure:
  Header:    title + close button (sticky)
  Body:      scrollable content
  Footer:    cancel (left) + confirm (right) (sticky)

Behavior:
  Enter:     fade overlay + scale-up modal (250ms spring)
  Exit:      fade out (200ms)
  Close on:  ✕ button, Escape key, overlay click
  Focus:     trapped inside, returns on close
  A11y:      role="dialog", aria-modal="true", aria-labelledby
```

### Inline Alerts
```
Full width within container
Padding:     12-16px
Radius:      8-12px
Border-left: 3-4px accent color

Types:
  Info:     blue bg-light, blue border, ℹ icon
  Success:  green bg-light, green border, ✓ icon
  Warning:  amber bg-light, amber border, ⚠ icon
  Error:    red bg-light, red border, ✕ icon

Dismissable: ✕ button (optional)
```

### Tooltip
```
Background:  neutral-900 (dark always)
Color:       neutral-50 (light always)
Padding:     6px 10px
Radius:      6px
Font:        text-xs
Max width:   200px
Delay:       300ms hover before show
Position:    above element (preferred), auto-flip

A11y:        role="tooltip", aria-describedby
Trigger:     hover + focus (not click)
```

### Confirmation Dialog (Destructive Actions)
```
Title:       "Delete [item name]?"
Description: "This action cannot be undone. This will permanently
              delete [item] and all associated data."
Actions:     [Cancel (secondary)]  [Delete (danger/red)]

Rules:
  - Never auto-confirm
  - Describe exact consequences
  - Danger button is red, right-aligned
  - Type item name to confirm (for critical actions)
```

---

## Data Display Patterns

### Data Table
```
Header:      sticky, font-medium, text-secondary, uppercase text-xs
Rows:        hover highlight, optional alternating bg
Cell padding: 12px horizontal, 8-12px vertical
Sorting:     clickable headers with ▲▼ indicator
Selection:   checkbox column (leftmost)
Actions:     ••• menu or icon buttons (rightmost)
Pagination:  footer with page numbers + "Showing X-Y of Z"
Empty:       illustration + message + action
Loading:     skeleton rows

Responsive (< 768px):
  Option A:  horizontal scroll with sticky first column
  Option B:  transform to card layout
```

### Card Grid
```
Layout:      auto-fit grid, minmax(280px, 1fr)
Gap:         16-24px
Card:        consistent height (use flexbox)
Hover:       translateY(-4px) + shadow-lg
Loading:     skeleton cards with shimmer
Empty:       centered message with CTA
```

### Stat / KPI Card
```
┌─────────────────────────┐
│  Label (text-xs, muted) │
│  $48,290 (text-3xl, bold)│
│  ↑ 12.5% (text-sm, green)│
└─────────────────────────┘
Padding: 20-24px
Icon: optional, top-right or left of label
Trend: ↑ green (positive), ↓ red (negative)
```

### Avatar
```
Sizes:  24px (xs), 32px (sm), 40px (md), 48px (lg), 64px (xl)
Shape:  circle (default) or rounded square
Fallback: initials (2 chars) on colored bg
Border: 2px white (in groups)
Group:  overlapping, -8px margin, max 5 visible + "+N" badge
```

### Badge / Status Indicator
```
Padding:    2px 8px
Radius:     full (pill shape)
Font:       text-xs, font-medium

Variants:
  Filled:   colored bg + white/dark text
  Subtle:   light colored bg + darker text of same hue
  Outline:  transparent bg + colored border + colored text
  Dot:      6px circle indicator before text
```

---

## Layout Patterns

### Page Shell
```
┌────────────────────────────────────┐
│  Nav (fixed top, 64px)             │
├──────┬─────────────────────────────┤
│ Side │  Page Header                │
│ bar  │  ────────────────           │
│      │  Content Area               │
│ 260px│  (max-width: 1280px)        │
│      │  (padding: 24-32px)         │
│      │                             │
│      │  ────────────────           │
│      │  Page Footer                │
└──────┴─────────────────────────────┘
```

### Content Width
```
Narrow:    640px  (articles, settings forms)
Default:   960px  (general content)
Wide:      1280px (tables, grids, dashboards)
Full:      100%   (media, hero sections)
```

### Section Spacing
```
Between major sections:   64-96px
Between subsections:      32-48px
Between content blocks:   24-32px
Between related items:    12-16px
Between tightly coupled:  4-8px
```
