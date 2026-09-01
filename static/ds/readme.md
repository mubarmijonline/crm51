# Admin Design System

A general-purpose design system for admin products: dashboards, cards, data tables, settings and billing surfaces. It is built to be the default starting point across several projects rather than the identity of one product.

## Where this came from

No codebase, Figma file or brand assets were supplied. The brief was a shortlist of public reference systems to synthesise from:

- Material Design — m3.material.io · github.com/mui/material-ui
- Fluent UI — fluent2.microsoft.design · github.com/microsoft/fluentui
- Carbon — carbondesignsystem.com · github.com/carbon-design-system/carbon
- Polaris — polaris.shopify.com · github.com/Shopify/polaris
- Apple Human Interface Guidelines — developer.apple.com/design/human-interface-guidelines
- Base Web — baseweb.design · github.com/uber/baseweb
- Stripe — stripe.com/design

Those systems were used as a source of *conventions* — density modes, semantic token layers, table and status patterns, motion ranges — not as a source of visual identity. Nothing here reproduces another company's brand, mark, palette or proprietary component design. All values below are original to this system.

**This system has no logo.** No brand mark was provided, so anywhere a logo would sit the product name is set in plain type (see the sign-in screen and the side rail in the UI kit). Do not invent a mark; supply a real one and it will be wired in.

**Font substitution.** No font files were supplied. UI type is IBM Plex Sans and numerics are Geist Mono, both loaded from Google Fonts in `tokens/fonts.css`. Send the real typefaces and the `@font-face` rules can point at local binaries instead.

---

## Index

| Path | What it holds |
| --- | --- |
| `styles.css` | Entry point — nothing but `@import` lines |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `breakpoints.css`, `radius.css`, `elevation.css`, `motion.css`, `base.css` |
| `components/core/` | Button, IconButton, Icon, Card, Badge, Tag, Avatar, Spinner, Divider, Kbd |
| `components/forms/` | FormField, Input, Textarea, Select, Checkbox, Radio, Switch, SearchField, SegmentedControl, Combobox, DateRangeField, Slider, FileUpload |
| `components/feedback/` | Alert, Toast, Dialog, Tooltip, ProgressBar, Skeleton, EmptyState |
| `components/overlays/` | Drawer, Popover, CommandPalette |
| `components/navigation/` | SideNav, TopBar, Tabs, Breadcrumbs, Pagination, Menu, Stepper, Accordion |
| `components/layout/` | AppShell, PageHeader, Section, Grid, SplitPanel, Toolbar |
| `components/data/` | DataTable, TableToolbar, StatCard, Sparkline, BarChart, Timeline, KeyValueList |
| `components/mobile/` | MobileHeader, TabBar, ListRow, BottomSheet, MobileStat, PhoneFrame |
| `guidelines/` | Foundation specimen cards (colour, type, spacing, responsive, brand) |
| `ui_kits/admin_console/` | Click-through admin product: sign-in, overview, customers, customer detail, invoices, settings |
| `ui_kits/admin_mobile/` | The same product at 390×844: overview, customer list, record, more |
| `templates/admin-dashboard/` | Starting template: shell + KPI tiles + customer table |
| `SKILL.md` | Agent-skill wrapper for use outside this project |

Every component ships `<Name>.jsx`, `<Name>.d.ts` (props contract) and `<Name>.prompt.md` (one-line "what & when" plus a usage example). Import them from the compiled bundle: `const { DataTable } = window.AdminDesignSystem_b1fc08`.

### Intentional additions

No source library defined the inventory, so the standard primitive set was authored and extended with the four pieces an admin product cannot function without: **DataTable**, **TableToolbar**, **StatCard** and **Sparkline**, plus **KeyValueList** for record detail panels.

---

## Layout system

**The shell.** `AppShell` is the frame for every screen. Desktop: a 240px `SideNav` rail (56px collapsed) and a 56px `TopBar`, both fixed; only `<main>` scrolls, with 24px page padding and a 1280px max content width. Mobile: `MobileHeader` on top, `TabBar` pinned to the bottom, the same scrolling main region between them.

**Inside a page.** `PageHeader` (breadcrumbs → title + status badge → description → actions → tabs) opens the page. Content is a stack of `Section` blocks separated by 32px. Card grids use `Grid` (auto-fit, `minItemWidth` 220 for KPI tiles, 320 for content cards) so they reflow without media queries. Two-column pages use `SplitPanel` with a 320px aside. `Toolbar` holds page-level filters and view switches; `TableToolbar` is its in-card equivalent.

**Breakpoints.** 360 / 480 / 768 / 1024 / 1280 / 1536 (`--bp-*`). 768px is the real switch: below it the rail becomes a tab bar, tables become `ListRow` lists, menus and dialogs become `BottomSheet`, page padding drops to 16px, control heights grow to 40/48px, and rows grow to 60px. All of that is token-driven — a `@media (max-width:767px)` block in `tokens/breakpoints.css` re-points the semantic tokens, so components do not branch on width.

**Density.** Independent of breakpoint: `data-density="compact"` on any ancestor takes rows from 48px to 36px and the table face to 13px; `spacious` takes rows to 60px. Use compact for operators who live in the table all day.

## Mobile rules

- **Navigation:** bottom tab bar, 3–5 destinations, never actions. Detail screens push in with a back chevron in a 52px compact header; tab roots use the large-title header.
- **Tables do not go to phones.** A `DataTable` row becomes a `ListRow`: identity on the left, the mono value on the right with the status badge beneath it, chevron for drill-in.
- **Sheets replace overlays.** `BottomSheet` stands in for Menu, Popover and Dialog; it carries a grab handle, respects `env(safe-area-inset-bottom)`, and stacks its actions full width.
- **Touch targets are 44px minimum.** Controls step up to 40px (md) and 48px (lg) below 768px; icon buttons keep a 44px box even when the glyph is 16px.
- **One primary action per screen**, full width, at the bottom of the sheet or directly under the header.
- Same tokens, same type scale, same colours as desktop — mobile is a layout change, not a second theme.

---

## Content fundamentals

The voice is that of a competent operations tool: plain, specific, and never chatty.

- **Sentence case everywhere.** Buttons, headers, nav items, column headers are the one exception — table column headers are set in uppercase 11px as a typographic device, not as writing style. Write "Add customer", not "Add Customer".
- **Second person for the user, no first person for the product.** "Your workspace", "You have 3 failing payments". Never "We couldn't process…" — write "Payment was declined".
- **Buttons name the action and its object.** "Add customer", "Create invoice", "Rotate key". Never "Submit", "OK", "Click here".
- **Destructive confirmations state the consequence, then the count.** Title: "Delete 4 customers?" Body: "Their invoices and API keys are removed immediately. This cannot be undone." Confirm button repeats the verb: "Delete customers".
- **Errors say what happened and what to do.** "Card ending 4242 was declined on 02 Aug 2026." + a "Retry charge" action. No apologies, no exclamation marks.
- **Numbers are exact and units are explicit.** "34 / 50 seats", "620k / 1M requests", "$4,200.00". Percentages carry a sign when they are a delta: "+6.2%", "-0.4%".
- **Empty states describe the state, then offer the next step.** "No invoices yet" / "Invoices appear here once the first billing cycle closes."
- **Timestamps are relative under 24 hours** ("12 min ago", "3 hrs ago"), absolute after ("04 Aug 2026").
- **No emoji. No exclamation marks. No jokes in system copy.** Tone is neutral under pressure — this is a product where people cancel subscriptions and delete data.
- **Hints are one sentence, no period-less fragments piled up.** "Shown to everyone in your organisation."

---

## Visual foundations

**Colour.** One action colour (blue, `--blue-600`) on a cool neutral grey ramp. Colour is functional: blue means "you can act on this", the status family (green / amber / red / blue / purple) means "this is the state of a thing". Large surfaces are never coloured — the app background is `--gray-50`, cards are white. Status is always a tint + text pair (`--status-*-bg` / `-fg` / `-border`), never a saturated fill, and never colour alone: a badge always carries its word. Charts use the ordered `--viz-1…6` ramp.

**Type.** IBM Plex Sans for everything, Geist Mono for anything numeric or machine-generated — money, IDs, timestamps, keys, quotas — so figures align in columns (`tabular-nums`). Scale: 11 / 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36. Body is 14px, dense tables 13px. Titles are semibold with `-0.01em` tracking; the display size takes `-0.02em`. Column headers and nav group labels are 11px semibold uppercase with `0.06em` tracking. No light weights, no italics outside quoted content.

**Spacing and layout.** A 4px base with a 2px half-step: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64. The shell is fixed: 240px left rail (56px collapsed), 56px top bar, 24px page padding, 1280px max content width. Both are fixed elements; only the main region scrolls. Density is a token scope, not a rewrite — `data-density="compact"` on any ancestor drops rows from 48px to 36px and the table face to 13px; `spacious` takes rows to 60px.

**Backgrounds.** Flat colour only. No gradients, no photography, no illustration, no pattern or texture. Depth comes from a 1px hairline border and, rarely, a shadow. The one full-bleed moment in the system is the sign-in screen's split layout, and even that is two flat panels.

**Borders.** 1px, always. `--border-hairline` (grey-200) separates cards, rows and sections; `--border-strong` (grey-300) outlines interactive controls so they read as pressable. Focus and invalid states change the border colour rather than adding one.

**Corners.** 3px inside controls (checkbox, badge, menu item), 5px on controls (buttons, inputs, tabs), 8px on cards, 12px on dialogs, pill only for switches and progress tracks. Nothing is fully round except avatars and status dots.

**Elevation.** Flat by default. Cards sit on the page with a border and no shadow. Shadow is reserved for things that genuinely float above the page: menus and popovers (`--shadow-md`), dialogs and toasts (`--shadow-lg`). Elevation is never used to imply importance, only distance.

**Transparency and blur.** Used in exactly one place: the modal scrim (`rgba(19,25,32,.48)`). No frosted glass, no translucent panels, no protection gradients — text always sits on a solid surface, so it never needs one.

**Hover, press, focus, disabled.**
- Hover on filled controls darkens by one step (`--action-primary` → `-hover`); on ghost controls and table rows it adds a grey tint (`--action-ghost-hover` / `--surface-hover`).
- Press darkens one further step and nudges the control 0.5px down. No scale transforms.
- Focus is a 3px translucent ring in the action colour (`--focus-ring`), outside the border, never a colour swap alone.
- Disabled is 45% opacity plus `not-allowed`; the control keeps its shape so layouts do not shift.
- Selected rows take `--surface-selected` (blue-50) and keep it on hover.

**Motion.** Short and unshowy: 80ms for tints, 120ms for buttons, menus and tooltips, 180ms for dialogs, toasts and rail collapse, 240ms for progress and chart transitions. One curve, `cubic-bezier(.2,0,0,1)`. Entrances fade and travel 4px at most; nothing bounces, springs, or slides across the screen. `prefers-reduced-motion` zeroes every duration.

**Imagery.** There is none, by design. Avatars are tinted initials derived from the name so a person keeps the same colour everywhere. If photography is ever added it should be cool, low-contrast and used at small sizes only.

**Cards.** White surface, 1px hairline border, 8px radius, no shadow. Optional header (title + optional subtitle on the left, actions on the right) separated by a hairline; optional footer on the app-grey surface for form actions. `padded={false}` when the body is a table so rows meet the border.

---

## Iconography

- **Lucide** at 1.75 stroke weight, loaded from CDN: `https://unpkg.com/lucide@0.469.0/dist/umd/lucide.js`. **This is a substitution** — no icon set was supplied with the brief. Every card and UI-kit page loads that script, and the `Icon` component resolves glyphs by name.
- Sizes: **16px** inside controls and nav, **14px** for small/dense buttons, **12px** for sort chevrons and inline affordances, **20–24px** in empty states. Never scale a glyph beyond 24px.
- Icons inherit `currentColor`. On their own they take `--text-muted`; inside a primary button they take the button's foreground; active nav items take `--text-brand`.
- Icons never appear without a label except in `IconButton`, which always carries `label` (used for both `aria-label` and the tooltip).
- **No emoji anywhere.** No unicode symbols standing in for icons (no ✓, ×, →). Arrows, checks and chevrons all come from Lucide.
- No custom-drawn SVG in this system apart from `Sparkline`, which is a data path, not an illustration.
- If a glyph is missing from Lucide, pick the nearest Lucide match rather than importing a second icon set.

---

## Using it

```jsx
const { Card, DataTable, TableToolbar, SearchField, Button, Badge, Pagination } = window.AdminDesignSystem_b1fc08;
```

Link `styles.css` once, load the Lucide UMD script, then compose. Read a component's `.prompt.md` for the intended usage before reaching for a variant.
