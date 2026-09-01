# Migrating from SB Admin to Admin Design System

A drop-and-replace plan for a project currently built on SB Admin / SB Admin 2 (Bootstrap 4 + jQuery + Font Awesome). Work through it in phases — the app stays runnable at the end of each one.

---

## Phase 0 — Install this system

1. Copy `styles.css` and `tokens/` into the project (e.g. `static/ds/` or `src/design-system/`).
2. Link `styles.css` **once**, at the root, as the first stylesheet.
3. Add the icon script: `<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.js"></script>`
4. Copy `components/` (React) or use the class mapping below (server-rendered HTML).
5. Copy `readme.md`, `SKILL.md` and the `.prompt.md` files into the repo so Claude Code can read the rules.

---

## Phase 1 — Remove SB Admin

Delete these from every template and from the build:

| Remove | Why |
| --- | --- |
| `sb-admin-2.css` / `sb-admin.css` (+ `.min`) | Replaced entirely by `styles.css` |
| `bootstrap.min.css`, `bootstrap.bundle.min.js` | The grid, cards, buttons, modals and dropdowns all have equivalents here |
| `jquery.min.js`, `jquery.easing.min.js` | Only SB Admin's sidebar toggle and scroll-to-top used them |
| `all.min.css` (Font Awesome) | Icons are Lucide now |
| Google Fonts **Nunito** link | Type is IBM Plex Sans + Geist Mono, loaded by `tokens/fonts.css` |
| `datatables/*` | `DataTable` covers sort, selection, sticky header; `Pagination` covers the footer |
| `chart.js` + `demo/chart-*.js` | `Sparkline` and `BarChart` cover dashboard charts. Keep Chart.js only if you need axes, tooltips and legends — then style it with `--viz-1…6`, `--viz-grid`, `--viz-axis` |
| `sb-admin-2.js` (`#sidebarToggle`, `.scroll-to-top`) | `SideNav collapsed` handles the rail; drop scroll-to-top |

Do a repo-wide search for `sb-admin`, `fa-`, `col-md-`, `bg-gradient-`, `text-gray-`, `border-left-` — those five prefixes find almost everything.

---

## Phase 2 — Class and markup mapping

### Shell

| SB Admin | This system |
| --- | --- |
| `#wrapper` | `AppShell` |
| `ul.navbar-nav.sidebar.sidebar-dark.accordion` | `SideNav` (light surface, tinted active item — no dark gradient) |
| `.sidebar-brand` + `.sidebar-brand-icon` + `.sidebar-brand-text` | `SideNav brand={…}` — `Avatar square` + the product name in type |
| `.nav-item` / `.nav-link` / `.collapse-item` | `sections[].items[]` on `SideNav` |
| `#sidebarToggle` | `SideNav collapsed` |
| `nav.navbar.topbar` | `TopBar` |
| `.navbar-search` | `SearchField` in `TopBar`'s centre slot |
| `.nav-item.dropdown.no-arrow` (alerts, messages, user) | `Menu` |
| `#content-wrapper` / `#content` | `AppShell` main region — it owns the scroll and the 24px padding |
| `.container-fluid` | Nothing. Delete it; `AppShell` handles page padding |
| `footer.sticky-footer` | `AppShell footer` (or drop it — admin products rarely need one) |

### Page structure

| SB Admin | This system |
| --- | --- |
| `<div class="d-sm-flex ... mb-4"><h1 class="h3 mb-0 text-gray-800">` | `PageHeader` |
| `.row` + `.col-xl-3.col-md-6.mb-4` | `Grid minItemWidth={220}` — auto-fits, no column classes |
| `.row` + `.col-lg-8` / `.col-lg-4` | `SplitPanel asideWidth={320}` |
| `.card.shadow.mb-4` | `Card` — **flat**: hairline border, no shadow. Shadow is for things that float only |
| `.card-header.py-3` + `.m-0.font-weight-bold.text-primary` | `Card title` / `subtitle` / `actions` |
| `.card-body` | `Card` children |
| `.card.border-left-primary` (the KPI card) | `StatCard` — **the coloured left border goes away.** Meaning comes from the label, the mono value and the trend delta |

### Controls

| SB Admin | This system |
| --- | --- |
| `.btn.btn-primary` | `<Button variant="primary">` |
| `.btn.btn-secondary` / `.btn-light` | `<Button>` (secondary is the default) |
| `.btn.btn-link` | `<Button variant="link">` |
| `.btn.btn-danger` | `<Button variant="danger">` |
| `.btn.btn-sm` / `.btn-lg` | `size="sm"` / `"lg"` |
| `.btn-icon-split` | `<Button iconStart="…">` |
| `.btn-circle` | `IconButton` (square, 5px radius — not a circle) |
| `.form-control` | `Input` / `Textarea` |
| `.form-control` on a `<select>` | `Select`, or `Combobox` for long lists |
| `.custom-control.custom-checkbox` / `-radio` | `Checkbox` / `Radio` |
| `.custom-switch` | `Switch` |
| `.form-group` + `<label>` + `.form-text` | `FormField label hint error` |
| `.btn-group` with active state | `SegmentedControl` |
| `.input-group` with a calendar addon | `DateRangeField` |
| `.custom-file` | `FileUpload` |

### Data

| SB Admin | This system |
| --- | --- |
| `.table.table-bordered` + DataTables | `DataTable` inside `<Card padded={false}>` |
| `.table-responsive` | Nothing — `DataTable` scrolls horizontally itself |
| `.dataTables_filter` / `_length` / `_paginate` | `TableToolbar` (search + filters) and `Pagination` in `DataTable footer` |
| `.progress` + `.progress-bar` | `ProgressBar` |
| `.badge.badge-success` etc. | `Badge tone="success"` — subtle tint, not a solid fill, and always with the word |
| `<canvas>` area/bar charts | `Sparkline` / `BarChart` |
| `.list-group` activity feeds | `Timeline` |
| `<dl>` / definition rows in detail views | `KeyValueList` |

### Overlays and feedback

| SB Admin | This system |
| --- | --- |
| `.modal` (`data-toggle="modal"`) | `Dialog` |
| `.dropdown-menu` | `Menu` (actions) or `Popover` (controls) |
| `.alert.alert-warning` | `Alert tone="warning"` |
| `.toast` | `Toast` |
| `data-toggle="tooltip"` | `Tooltip` |
| `.spinner-border` | `Spinner` (actions) or `Skeleton` (content) |
| An empty `.card-body` with placeholder text | `EmptyState` |
| `.collapse` / `#accordionExample` | `Accordion` |
| — (SB Admin has none) | `Drawer`, `CommandPalette`, `Stepper` |

### Colour

Replace the Bootstrap variable names wherever they appear in custom CSS:

| SB Admin | This system |
| --- | --- |
| `$primary #4e73df` / `.bg-gradient-primary` | `var(--action-primary)` — **flat, no gradient** |
| `$success #1cc88a` | `var(--green-500)` / `var(--status-success-*)` |
| `$info #36b9cc` | `var(--blue-500)` / `var(--status-info-*)` |
| `$warning #f6c23e` | `var(--amber-500)` / `var(--status-warning-*)` |
| `$danger #e74a3b` | `var(--red-500)` / `var(--status-danger-*)` |
| `.text-gray-100…900` | `--gray-100…900`, or better the semantic aliases `--text-title` / `--text-body` / `--text-muted` |
| `.bg-light` / `.bg-white` | `--surface-app` / `--surface-card` |

### Icons

Font Awesome → Lucide, one-for-one on the common set:

`fa-tachometer-alt` → `layout-dashboard` · `fa-users` → `users` · `fa-user` → `user` · `fa-file-invoice` → `file-text` · `fa-cog`/`fa-cogs` → `settings` · `fa-search` → `search` · `fa-bell` → `bell` · `fa-envelope` → `mail` · `fa-download` → `download` · `fa-plus` → `plus` · `fa-trash` → `trash-2` · `fa-edit`/`fa-pen` → `pencil` · `fa-ellipsis-v` → `ellipsis` · `fa-chevron-down` → `chevron-down` · `fa-angle-right` → `chevron-right` · `fa-exclamation-triangle` → `triangle-alert` · `fa-check-circle` → `circle-check` · `fa-times` → `x` · `fa-sign-out-alt` → `log-out` · `fa-credit-card` → `credit-card` · `fa-chart-area`/`fa-chart-bar` → `trending-up`

Sizes: 16px in controls and nav, 14px in dense buttons, 12px for chevrons, 20–24px in empty states. Never above 24px.

---

## Phase 3 — Order of work

1. **Shell first.** Replace `#wrapper` / sidebar / topbar with `AppShell` + `SideNav` + `TopBar`. Every page inherits it, so this is the single biggest visual jump.
2. **Dashboard.** `border-left-*` KPI cards → `Grid` of `StatCard`; Chart.js canvases → `Sparkline` / `BarChart`.
3. **Tables.** The list pages: `Card padded={false}` + `TableToolbar` + `DataTable` + `Pagination`. Delete DataTables.js when the last one is converted.
4. **Forms and settings.** `FormField` + the form controls; `Card footer` for Save/Cancel.
5. **Overlays.** Bootstrap modals → `Dialog`; dropdowns → `Menu`.
6. **Mobile.** Set `isMobile` on `AppShell` from a `(max-width: 767px)` query, add `TabBar`, swap the list tables for `ListRow`, and turn the modals into `BottomSheet`. SB Admin only collapsed the sidebar; this is a genuine mobile layout.
7. **Delete** `sb-admin-2.css`, Bootstrap, jQuery and Font Awesome. Grep for the five prefixes above to confirm nothing is left.

---

## What will look different, on purpose

Flag these to whoever reviews the migration — they are deliberate, not regressions:

- **No dark gradient sidebar.** The rail is a light surface with a tinted active item.
- **No coloured left border on KPI cards.** Every card is a plain hairline-bordered white surface.
- **No shadow on cards.** Shadow is reserved for menus, dialogs and toasts.
- **Nunito is gone.** Type is IBM Plex Sans, with Geist Mono for money, IDs and metrics.
- **Rounder is flatter.** 5px on controls, 8px on cards — Bootstrap's `.rounded` (6px) and pill buttons are not used.
- **Badges are tinted, not solid**, and always carry their word.

---

## Tell Claude Code

Put this in the project's `CLAUDE.md`:

> This project uses the Admin Design System (`design-system/readme.md`). Never write raw colours, font sizes, or spacing values — use the CSS custom properties. Never add Bootstrap, jQuery or Font Awesome. Build screens by composing the published components (`AppShell`, `PageHeader`, `Section`, `Grid`, `Card`, `DataTable`, …); read the matching `.prompt.md` before using one. Icons are Lucide only.
