# UI/UX Mastery — Page Anatomy Guide

Reference showing the correct structure, spacing, and hierarchy
for common page types. Use as a blueprint when designing.

---

## Landing Page Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (64px, fixed, glassmorphism)                        │
│  [Logo]           [Features] [Pricing] [Blog]    [CTA btn] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    HERO SECTION                             │
│                 (100vh, centered)                            │
│                                                             │
│              [Badge: "🚀 Now in Beta"]                      │
│                     ↕ 16px                                  │
│           Build Something                                   │
│          Extraordinary ← gradient text                     │
│         (text-7xl, weight-800)                              │
│                     ↕ 24px                                  │
│      Subtitle describing value prop                         │
│        (text-xl, max-width: 600px)                         │
│                     ↕ 32px                                  │
│      [██ Get Started ██]  [Watch Demo]                      │
│       (btn-lg primary)    (btn-lg secondary)               │
│                                                             │
│  Background: mesh gradient blobs, animated float            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px (section-lg)

┌─────────────────────────────────────────────────────────────┐
│                   SOCIAL PROOF BAR                          │
│           "Trusted by 1,000+ teams worldwide"               │
│       [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]            │
│       (grayscale, 60% opacity, hover: full color)           │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px

┌─────────────────────────────────────────────────────────────┐
│                   FEATURES SECTION                          │
│                                                             │
│     Section header (centered, max-width: 600px)             │
│     "Everything You Need"  ← text-4xl, weight-700          │
│     "Description..."       ← text-lg, text-secondary       │
│                     ↕ 48px                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ Feature  │ │ Feature  │ │ Feature  │                    │
│  │   Card   │ │   Card   │ │   Card   │  ← 3-col grid     │
│  │          │ │          │ │          │    gap: 24px       │
│  └──────────┘ └──────────┘ └──────────┘                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ Feature  │ │ Feature  │ │ Feature  │  ← scroll reveal  │
│  │   Card   │ │   Card   │ │   Card   │    staggered      │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│  Feature card specs:                                        │
│    Padding: 32px                                            │
│    Radius: 16px                                             │
│    Border: 1px subtle                                       │
│    Icon: 48px, gradient bg, 16px radius                     │
│    Title: text-xl, weight-600 (↕ 8px below icon)           │
│    Desc: text-sm, text-secondary, line-clamp-3             │
│    Hover: translateY(-6px) + shadow-lg                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px

┌─────────────────────────────────────────────────────────────┐
│                   STATS / METRICS                           │
│                                                             │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│    │  10K+    │  │  99.9%   │  │  150+    │  │  4.9★    │ │
│    │  Users   │  │  Uptime  │  │  Countries│  │  Rating  │ │
│    └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                             │
│    Number: text-4xl, weight-800, animated counter            │
│    Label:  text-sm, text-secondary                          │
│    Cards: no border, centered text                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px

┌─────────────────────────────────────────────────────────────┐
│               TESTIMONIALS / SOCIAL PROOF                   │
│                                                             │
│    ┌───────────────────────────────────────────┐            │
│    │  "Quote text that shows real value..."    │            │
│    │                                           │            │
│    │  [Avatar] Sarah Chen                      │            │
│    │           VP of Product @ Company         │            │
│    └───────────────────────────────────────────┘            │
│                                                             │
│    Style: glass card or elevated card                       │
│    Quote: text-xl, italic or text-lg with ""                │
│    Name: text-sm, font-semibold                             │
│    Title: text-xs, text-secondary                           │
│    Avatar: 40px, rounded full                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px

┌─────────────────────────────────────────────────────────────┐
│                   PRICING SECTION                           │
│                                                             │
│    Monthly / Annual ← toggle switch (save 20%)              │
│                                                             │
│   ┌─────────┐  ┌═══════════════┐  ┌─────────┐             │
│   │  Basic  │  ║   ★ Pro ★     ║  │  Team   │             │
│   │  $9/mo  │  ║   $29/mo      ║  │  $79/mo │             │
│   │         │  ║  "POPULAR"    ║  │         │             │
│   │ ✓ feat  │  ║  ✓ feat       ║  │ ✓ feat  │             │
│   │ ✓ feat  │  ║  ✓ feat       ║  │ ✓ feat  │             │
│   │ ✗ feat  │  ║  ✓ feat       ║  │ ✓ feat  │             │
│   │         │  ║               ║  │         │             │
│   │[Start ] │  ║ [██ Get Pro ██]║  │[Start ] │             │
│   └─────────┘  ╚═══════════════╝  └─────────┘             │
│                                                             │
│   Popular tier: scaled up, primary border, badge            │
│   Price: text-4xl, weight-800                               │
│   Features: checkmark list, text-sm                         │
│   Cross-out: text-secondary for missing features            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px

┌─────────────────────────────────────────────────────────────┐
│                      FAQ SECTION                            │
│                                                             │
│    "Frequently Asked Questions"                             │
│                                                             │
│    ┌─────────────────────────────────────────┐              │
│    │  How does pricing work?            [+]  │              │
│    ├─────────────────────────────────────────┤              │
│    │  Answer text appears here when          │              │
│    │  expanded. Uses accordion pattern.      │              │
│    └─────────────────────────────────────────┘              │
│    ┌─────────────────────────────────────────┐              │
│    │  Can I cancel anytime?             [+]  │              │
│    └─────────────────────────────────────────┘              │
│                                                             │
│    Max-width: 768px, centered                               │
│    Items: divide border between                             │
│    Chevron rotates on expand                                │
│    A11y: <details>/<summary> or ARIA accordion              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 96px

┌─────────────────────────────────────────────────────────────┐
│                    CTA SECTION                              │
│             (gradient or brand bg)                           │
│                                                             │
│         "Ready to get started?"                             │
│         (text-4xl, weight-700, white)                       │
│                    ↕ 16px                                   │
│         "Join 10K+ teams already..."                        │
│         (text-lg, white/80%)                                │
│                    ↕ 32px                                   │
│         [██ Start Free Trial ██]                             │
│         (btn-xl, white bg, dark text)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↕ 0 (footer connects)

┌─────────────────────────────────────────────────────────────┐
│                      FOOTER                                 │
│                                                             │
│  [Logo]    Product    Resources   Company    Legal          │
│            Features   Blog        About      Privacy       │
│            Pricing    Docs        Careers    Terms          │
│            Changelog  Help        Contact    Cookies        │
│                                                             │
│  ──────────────────────────────────────────────             │
│  © 2026 Brand. All rights reserved.                         │
│                  [Twitter] [GitHub] [LinkedIn]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Dashboard Page Anatomy

```
┌──────┬──────────────────────────────────────────────────────┐
│      │  Page Title          [Search 🔍]  [🔔]  [Avatar ▼] │
│ Side │──────────────────────────────────────────────────────│
│ bar  │                                                      │
│      │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │
│ 260px│  │ KPI  │  │ KPI  │  │ KPI  │  │ KPI  │            │
│      │  │ Card │  │ Card │  │ Card │  │ Card │  ← 4 col   │
│ Nav  │  └──────┘  └──────┘  └──────┘  └──────┘            │
│ items│                                                      │
│      │  ┌──────────────────────┐  ┌──────────┐            │
│      │  │                      │  │          │            │
│  ⚙️  │  │   Chart / Graph     │  │ Activity │            │
│      │  │   (2/3 width)       │  │ Feed     │            │
│  👤  │  │                      │  │ (1/3)   │            │
│      │  └──────────────────────┘  └──────────┘            │
│      │                                                      │
│      │  ┌────────────────────────────────────────┐         │
│      │  │  Data Table (full width)                │         │
│      │  │  Header (sticky)                        │         │
│      │  │  Row 1                                  │         │
│      │  │  Row 2                                  │         │
│      │  │  Row 3                                  │         │
│      │  │  ─── Pagination ───                     │         │
│      │  └────────────────────────────────────────┘         │
│      │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

**Dashboard spacing:**
- Sidebar padding: 16px
- Content padding: 24-32px
- Gap between KPI cards: 16px
- Gap between major sections: 24px
- Header height: 64px

---

## Settings Page Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard    Settings                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─── Tabs ───────────────────────────────────────┐         │
│  │ General │ Profile │ Security │ Notifications │ Billing │ │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌─ Section ──────────────────────────────────────┐         │
│  │  Profile Information                            │         │
│  │                                                 │         │
│  │  [Avatar upload]                                │         │
│  │                                                 │         │
│  │  Name:    [__________________]                  │         │
│  │  Email:   [__________________]                  │         │
│  │  Bio:     [__________________]                  │         │
│  │           [__________________]                  │         │
│  │                                                 │         │
│  │                        [Cancel] [██ Save ██]    │         │
│  └─────────────────────────────────────────────────┘         │
│                                                              │
│  ┌─ Section ──────────────────────────────────────┐         │
│  │  Danger Zone                                    │         │
│  │  ┌────────────────────────────────────────┐    │         │
│  │  │ Delete Account    [🗑️ Delete]          │    │         │
│  │  │ This permanently deletes everything.   │    │         │
│  │  └────────────────────────────────────────┘    │         │
│  └─────────────────────────────────────────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Settings form rules:**
- Max width: 640px for form content
- One column layout
- Sections separated by divider or card boundaries
- Save button sticky at bottom (for long forms)
- Danger zone: red border, at very bottom
