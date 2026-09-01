# 51 CRM — UI audit

Phase 0 inventory. No component code written. Figures are counts taken from the
repo and the live `crm51_db` database on the date of the audit.

---

## Before you start — the four blanks, answered

| Item | Finding |
|---|---|
| Brand red | Not defined anywhere in the repo. Proceeding with `#E0121B` as instructed. |
| Frontend framework | **None.** Flask 2.3.3 + Jinja2 3.1.2, server-rendered. 30 templates, 0 build configs, 0 `node_modules`, 0 references to React/Vue/Angular/Svelte. |
| Table / grid library | **DataTables 1.13.6** + SearchPanes 2.2.0, SearchBuilder 1.5.0, Select 1.7.0, DateTime 1.5.1, Buttons. Used in 20 templates. |
| Arabic / RTL | **Unanswered — needs your call.** No `dir=`, no RTL CSS, no Arabic strings in templates. Data is Latin-script today. |

This materially changes the brief. See "Conflicts to resolve" at the end.

---

## 1. Route map

25 page routes render templates. 30 templates exist.

| Route | Template | Purpose |
|---|---|---|
| `/` | login.html | Sign in |
| `/home` | home.html | Launcher tiles |
| `/american_active_leads` | american_active_leads.html | Education leads still open |
| `/event_active_leads` | event_active_leads.html | Event leads still open |
| `/american_db` | american_db.html | Every education lead (2,786 rows) |
| `/event_db` | event_db.html | Every event lead (122 rows) |
| `/recall_date_table` | recall_date_table.html | Education call-backs for a date |
| `/recall_date_table_event` | recall_date_table_event.html | Event call-backs for a date |
| `/create_lead_american` | create_lead_american.html | Create education lead |
| `/create_lead_event` | create_lead_event.html | Create event lead |
| `/update_american_lead` | update_american_lead.html | Education lead record + edit |
| `/update_event_lead` | update_event_lead.html | Event lead record + edit |
| `/profile` | profile.html | Counsellor performance, 6 charts |
| `/event_profile` | event_profile.html | Event counsellor performance, 4 charts |
| `/users` | admin_users.html | User administration |
| `/admin_settings` | admin_settings.html | System settings |
| `/account_settings` | account_settings.html | Own password |
| `/register` | register.html | Create user |
| `/course_form` | course_form.html | External course intake (standalone, no base) |
| `/create_course_lead` | create_course.html | Create course |
| `/american_detailed_course_report` | american_detailed_course_report.html | Course report |
| `/crm_excel_sheet` | crm_excel_sheet.html | Excel upload + history |
| `/historical_notification` | historical_notification.html | Notification centre |
| `/user_add_task` | user_add_task.html | Notify a user |
| `/studentsDB` | studentsDB.html | **Dead** — see below |

**Dead templates (5).** No route renders `table.html`, `table_by_date.html`,
`form.html`, `update_lead.html`. `studentsDB.html` has a route but its data
endpoint returns HTTP 500 — it queries a `students` table that does not exist in
this schema — both its action buttons point at `/create_lead` and `/update_lead`
which are not routes, and nothing links to it. ~2,600 lines of unreachable
markup. Recommend deletion, not revamp.

**Not in the nav.** `crm_excel_sheet`, `american_detailed_course_report`,
`create_course_lead`, `register` and `course_form` are reachable only by typing
the URL or from a button inside another page.

---

## 2. Form inventory

18 `<form>` elements across 11 templates, plus **8 templates that collect input
with no `<form>` at all** and post hand-assembled payloads from JavaScript.

| Template | Forms | Fields | `required` | Submit |
|---|---|---|---|---|
| create_lead_american | 5 | 26 | 17 | ajax + FormData |
| update_american_lead | 3 | 30 | 13 | ajax + FormData |
| update_event_lead | 2 | 24 | 11 | ajax + FormData |
| update_lead *(dead)* | 1 | 23 | 16 | ajax + FormData |
| create_course | 1 | 20 | 10 | ajax + FormData |
| form.html *(dead)* | 1 | 17 | 16 | ajax + FormData |
| create_lead_event | 1 | 12 | 7 | ajax + FormData |
| course_form | 1 | 10 | 9 | ajax + FormData |
| table.html *(dead)* | 1 | 9 | 6 | ajax + FormData |
| login | 1 | 3 | 2 | native POST |
| crm_excel_sheet | 1 | 3 | 2 | native POST |

No-`<form>` pages: `admin_users` (9 inputs), `register` (6), `user_add_task` (6),
`profile` (5), `event_profile` (5), `historical_notification` (5),
`admin_settings` (4), `account_settings` (3).

### How validation works today

- **Validation library: none.** Zero. The only mechanism is the HTML5 `required`
  attribute, present in 19 templates.
- **Field-level error messages: zero.** No template uses `invalid-feedback` or
  `is-invalid`. A failed save surfaces as a SweetAlert modal (23 templates) that
  names no field.
- **Unsaved-changes guard: zero.** No `beforeunload` anywhere.
- **Autosave / drafts: zero.**
- Server errors arrive as `{state: "error", reason: "..."}` and are shown whole
  in a modal, never mapped back to a field.

### Same problem solved differently

- **Three submit conventions**: ajax+FormData (9 templates), native POST (2),
  hand-assembled JS payload (8).
- **Two dependent-field conventions**: `create_lead_american` toggled a wrapper
  named `..._section`; `create_lead_event` used `..._div`. Same feature, two
  naming schemes, two copies of `check_status()`.
- **Quick-add modals** were four near-identical 60-line handlers in one file
  before being collapsed to a factory; `create_course` and `course_form` still
  carry their own copies.
- **`required` + `readonly` together** on `recall_date`, `not_interested_notes`
  and `course1`. Readonly bars a control from constraint validation, so these
  read as required but never block submit. It works, by accident.

---

## 3. Table inventory — and why search is the loudest complaint

20 templates instantiate DataTables. The relevant configuration, measured:

| Property | Count |
|---|---|
| `serverSide: true` | **0 templates** |
| Debounced search input | **0 templates** |
| Per-column footer search firing on `'keyup change'` | 6 templates |
| Templates with per-column footer inputs | 6 |

### What actually happens on `/american_db`

1. The page calls `/get_all_american_lead_data`.
2. Flask runs `SELECT * FROM american_leads` — no `LIMIT`, no `WHERE`.
3. **All 2,786 rows, all 21 columns, serialise to JSON and cross the wire.**
4. DataTables filters, sorts and paginates that array in the browser.
5. Every keystroke in any of the 21 footer boxes calls `.search().draw()`
   synchronously against the full array, with no debounce.

So search is slow for three compounding reasons: the whole table is transferred
before you can type, filtering is single-threaded in the browser over every row,
and it re-runs on every character. Paging was `false` until recently, so all
2,786 rows were also in the DOM.

`assignation` holds 28,254 rows and `course_status` 3,478 — any future view over
those cannot use this pattern at all.

### Other table gaps

- No column resize, reorder, or visibility menu. No persistence of anything.
- No row selection, no bulk actions.
- No URL state — a filtered view cannot be shared or survive a refresh.
- No saved views, no density control.
- No loading skeleton, no empty state, no error state. A failed fetch leaves the
  table blank with no message.
- Row actions are naked buttons in the first column, not a menu.
- `searchBuilder` is configured on `event_active_leads`, `american_db` and
  `event_db` but never renders — all three omit `Q` from the `dom` string. Dead
  configuration.

---

## 4. Chart inventory

| Page | Charts | Library | Targets |
|---|---|---|---|
| profile.html | 6 | Google Charts `ColumnChart` | `course_analysis`, `course_analysis1..3`, `educational_chart` |
| event_profile.html | 4 | Google Charts `ColumnChart` | same family |

10 charts, one type, one library, loaded from `gstatic.com`.

**All 10 are currently broken.** The rebuilt base layout dropped the
`gstatic.com/charts/loader.js` script the old base carried, and neither profile
page loads it itself. `google.charts` is undefined at call time. This is a
regression from the design-system swap and is mine — the same class of mistake as
the dropped select2 and pdfmake, both already fixed. Fixing it is the first item
of whatever comes next.

Data shape is `google.visualization.arrayToDataTable(arrSales)` — a header row
followed by `[label, number]` pairs assembled in JavaScript from an ajax payload.

---

## 5. Component duplication

| Primitive | Distinct implementations in templates |
|---|---|
| Button (`class="btn ..."` combinations) | 22 |
| Modal shell | 11 |
| Card | 6 |
| Badge | 2 |

Raw values still in template markup:

| | Count |
|---|---|
| `style="..."` attributes | **522** across all 30 templates |
| Raw hex colours | **240** |
| Named CSS colours (`tomato`, `cadetblue`, `antiquewhite`, `darkcyan`) | **140** |

Accessibility baseline: `outline: none` appears in 10 files; only 2 templates use
`th scope`; 0 templates have skeletons or empty states.

---

## 6. Ranked problem list

1. **Search transfers the entire table before it can filter** — `/american_db`,
   `/american_active_leads`, `/event_db`, and every other list. Undebounced,
   client-side, over 2,786 rows. This is the top complaint and it cannot be fixed
   in the presentation layer alone.
2. **10 charts are dead** — `profile`, `event_profile`. Regression, mine, fixable
   in minutes.
3. **No validation feedback anywhere** — 18 forms, zero field-level errors. A
   failed save is a modal that does not say which field.
4. **Three different submit conventions** across 19 input-bearing pages,
   including 8 pages with no `<form>` element.
5. **522 inline styles and 380 raw colour values** — no single source of truth,
   so the brand palette cannot be applied by changing one file until this is gone.
6. **No loading, empty, or error states** on any list or record page.
7. **22 button variants, 11 modal shells, 6 card treatments** for what should be
   one of each.
8. **No URL state on tables** — filtered views are unshareable and lost on refresh.
9. **Dead weight**: 5 unreachable templates, ~2,600 lines, one of which 500s.
10. **Accessibility**: `outline:none` in 10 files, 2 templates with `th scope`,
    icon-only buttons without labels.

---

## 7. Token proposal

The app already runs on the Admin Design System token layer installed earlier
(`static/ds/tokens/`), and the four converted pages consume those names. The
cheapest correct route to the 51 identity is therefore **to keep the token names
and redefine their values**, adding a 51 brand layer that overrides them. Every
already-converted page recolours with no markup change.

Proposed `static/css/tokens-51.css`, loaded after `ds/styles.css`:

```css
:root {
  /* --- 51 Campus core ------------------------------------------------ */
  --paper:      #FFFFFF;
  --surface:    #F6F5F4;
  --ink:        #121212;
  --ink-muted:  #5C5A57;
  --line:       #E3E1DE;
  --red:        #E0121B;
  --red-deep:   #A50D14;
  --red-tint:   #FDECEC;

  --success: #1B7F4B;  --success-tint: #E8F5EE;
  --warning: #B4690E;  --warning-tint: #FDF3E4;
  --danger:  #C0161E;  --danger-tint:  #FDECEC;
  --info:    #1F6FB2;  --info-tint:    #E9F2FA;

  /* --- remap the design-system names onto the above ------------------ */
  --surface-app:      var(--surface);
  --surface-card:     var(--paper);
  --surface-selected: var(--red-tint);
  --border-hairline:  var(--line);
  --text-title:       var(--ink);
  --text-body:        var(--ink);
  --text-muted:       var(--ink-muted);
  --action-primary:   var(--red);
  --action-primary-hover: var(--red-deep);
  --text-brand:       var(--red);
  --focus-ring:       0 0 0 3px var(--red-tint);

  --status-success-fg: var(--success); --status-success-bg: var(--success-tint);
  --status-warning-fg: var(--warning); --status-warning-bg: var(--warning-tint);
  --status-danger-fg:  var(--danger);  --status-danger-bg:  var(--danger-tint);
  --status-info-fg:    var(--info);    --status-info-bg:    var(--info-tint);

  /* --- shape: three radii, not seven -------------------------------- */
  --radius-control: 6px;
  --radius-card:    10px;
  --radius-pill:    999px;
}
```

Type: the design system currently loads IBM Plex Sans and Geist Mono from Google
Fonts. The brief asks for Inter. Both are available from the same source, so this
is a one-line swap in `tokens/fonts.css`; `tabular-nums` is already applied by the
`.mono` class used on every ID, mobile, date and money column.

**Contrast, measured.** Every pairing computed against WCAG 2.1, not estimated:

| Pair | Ratio | Verdict |
|---|---|---|
| white on `--red` | 4.92:1 | passes AA normal |
| white on `--red-deep` | 7.87:1 | passes AA normal |
| `--ink` on `--paper` | 18.73:1 | passes |
| `--ink-muted` on `--paper` | 6.87:1 | passes |
| `--ink-muted` on `--surface` | 6.31:1 | passes |
| `--red` on `--paper` | 4.92:1 | passes AA normal |
| `--danger` on `--danger-tint` | 5.45:1 | passes |
| `--info` on `--info-tint` | 4.67:1 | passes |
| **`--success` on `--success-tint`** | **4.48:1** | **fails AA normal** |
| **`--warning` on `--warning-tint`** | **3.85:1** | **fails AA normal** |

White on `--red` clears AA for normal text at 4.92:1, so solid red buttons are
fine as specified — better than I expected. But **two of the four status pill
combinations from the brief fail AA**, and status pills are 13px, which is normal
text. Since the brief makes AA non-negotiable, I propose two adjustments:

```
--success: #1A7D4A   /* was #1B7F4B — 4.48:1, now 4.59:1 */
--warning: #A35F0C   /* was #B4690E — 3.85:1, now 4.55:1 */
```

Both are a shade darker than the brief's values and visually indistinguishable at
pill size. Flagging rather than silently changing your palette — say the word if
you would rather keep the originals and accept the AA failure on those two.

**Destructive actions.** As the brief requires: no solid red fill. Outline red on
white, and the type-the-name confirm for anything irreversible. Solid red is
reserved for the one primary action per page.

---

## 8. Conflicts to resolve before building

These change the work materially, so I have not started.

1. **The brief assumes React; this repo has none.** It specifies
   react-hook-form + zod, `components/form/`, `components/data-table/`. Your
   earlier standing instruction for this repo is explicit: stay on Flask +
   Jinja2, no React, no build step, no npm, HTMX and Alpine only where needed.
   I intend to honour the *intent* — one form pattern, one table pattern,
   validation defined once — implemented as Jinja macros plus a small vanilla JS
   layer. Confirm.

2. **Server-side search is a backend change.** The brief demands server-side
   pagination, sorting and filtering as the default, and separately forbids
   backend changes without asking. Delivering real search means new paginated,
   filtered endpoints in `american_crm.py`. This is the single highest-value item
   in the audit and cannot be done in the presentation layer. Asking, as
   instructed.

3. **Per-user persistence** for density, column visibility and saved views needs
   somewhere to live. `localStorage` needs no backend and is my recommendation.
   A real per-user store is a schema change, which the brief forbids without
   asking.

4. **The shell changes shape.** The app is a top navbar today; the brief
   specifies a 248px collapsible sidebar on `--ink` with grouped nav. That is a
   rewrite of the base layout affecting all 25 pages. Worth doing, but confirm.

5. **Content width.** The brief caps content at 1600px and centres. You asked two
   days ago for full width and I removed the 1280px cap. 1600px is a cap again,
   just a larger one. Confirm which you want.

6. **Global search (Ctrl/Cmd+K)** across students, applications, universities and
   leads. This schema has leads, courses, subjects, users — there are no
   universities or applications tables. I will scope the palette to what exists.
