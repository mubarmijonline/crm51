# Claude Code prompt

Copy everything between the lines into Claude Code, from the root of the `crm51` repo.

Before you paste it: unzip the design system into `static/ds/` so that `static/ds/styles.css`, `static/ds/tokens/`, `static/ds/readme.md` and `static/ds/crm51/` all exist.

---

```
We are replacing SB Admin with our own design system across this Flask CRM.
The design system lives in `static/ds/`. Read these first, in order:

  static/ds/readme.md              — the design rules (tokens, layout, mobile, content, iconography)
  static/ds/crm51/INTEGRATION.md   — the migration plan written specifically for this repo
  static/ds/crm51/ds-bridge.css    — the Bootstrap bridge; read it so you know what is already styled
  static/ds/crm51/main.html        — the rebuilt base layout
  static/ds/crm51/login.html       — the rebuilt sign-in page

## Stack decision — do not change it

Stay with Flask + Jinja2 server-rendered templates. Do NOT introduce React, Vue,
Angular, Svelte, a build step, npm, or a JSON API layer. The routes in
`american_crm.py` return rendered HTML and will keep doing so.

Where jQuery AJAX is painful, use HTMX (`hx-get`/`hx-post`/`hx-target`) with the
Flask route returning an HTML fragment. Use Alpine.js for small local UI state
(dropdown open, tab selected). Both load as plain script tags. Nothing else.

## Step 1 — Wire it up

1. Copy `static/ds/crm51/ds-bridge.css` to `static/css/ds-bridge.css`.
2. Download Lucide once, locally, no CDN:
   mkdir -p static/vendor/lucide
   curl -o static/vendor/lucide/lucide.js https://unpkg.com/lucide@0.469.0/dist/umd/lucide.js
3. Replace `templates/main.html` and `templates/login.html` with the versions in
   `static/ds/crm51/`. Read them before replacing — they preserve every route URL,
   every `session[...]` reference, and the JS function names the page templates
   call (`notifications`, `read_notification`, `go_to_lead`, `go_to_event_lead`,
   `go_to_notification_center`).
4. Confirm the stylesheet order in both files is exactly:
       css/bootstrap.min.css   →   ds/styles.css   →   css/ds-bridge.css
   Bootstrap first (the templates use its grid), tokens second, bridge last so it wins.
5. Restart Flask, load /home and /american_active_leads, confirm nothing 404s.

## Step 2 — Convert the page templates

Work in this order, one commit per template, and run the app after each:

  1. home.html
  2. american_active_leads.html, event_active_leads.html
  3. recall_date_table.html, recall_date_table_event.html
  4. american_db.html, event_db.html, studentsDB.html, table.html, table_by_date.html
  5. create_lead_american.html, create_lead_event.html
  6. update_american_lead.html, update_event_lead.html
  7. profile.html, event_profile.html
  8. admin_users.html, admin_settings.html, account_settings.html
  9. historical_notification.html, user_add_task.html
 10. course_form.html, create_course.html, register.html, form.html
 11. american_detailed_course_report.html, crm_excel_sheet.html

`INTEGRATION.md` has the exact before/after for home, the lead tables and the
lead forms. Follow those patterns for the rest.

## Hard rules — apply to every file you touch

- No raw colour values. No `#4e73df`, no `tomato`, no `color:blue`, no
  `darkgreen`, no `antiquewhite`. Every colour is a token: `var(--text-title)`,
  `var(--text-muted)`, `var(--action-primary)`, `var(--status-danger-fg)`, etc.
- No raw sizes. Spacing is `var(--space-*)`, radius `var(--radius-*)`, type
  `var(--type-*)`. If you need a value that has no token, tell me — do not invent one.
- No font declarations. Never `Trebuchet MS`, `Helvetica Neue`, `Courier New`,
  `Nunito`, `Lato`. The system is IBM Plex Sans, with Geist Mono
  (`var(--font-mono)`) for IDs, mobile numbers, money, dates and counts.
- Icons are Lucide only: `<i data-lucide="name"></i>`. Never Font Awesome
  (`fa-*`), never emoji, never a hotlinked svgrepo.com `<img>`, never a
  hand-drawn inline SVG. If a glyph is missing, pick the nearest Lucide name.
- Never add a shadow to a card. Cards are a 1px hairline border, 8px radius, flat.
  Shadow belongs to dropdowns, modals and toasts only.
- Never use the coloured-left-border KPI card (`border-left-primary` and friends).
- Delete inline `style="..."` attributes that only set font, colour or bold —
  the bridge already styles those elements. Keep inline styles only for layout
  (grid, flex, width) and write them with tokens.
- Never delete a `name=` attribute on a form field, a form `action`, or a route
  URL. The Flask handlers read those by name.
- Sentence case for all labels, buttons and headings: "Add lead", not "Add Lead".
  Buttons name the action and its object: "Save lead", "Create invoice",
  "Delete customer" — never "Submit" or "OK".

## Bugs to fix as you go

- `templates/american_active_leads.html` and its siblings put `<h1>`, `<br>` and
  a `<div>` INSIDE `<table>` before `<thead>`. Move them out, above the table.
- Several templates link `https://crm.mubarmijonline.com/...` absolutely, so dev
  jumps to production. Replace every one with `url_for(...)`.
- Page templates open a second `<head>` inside `{% block body %}`. Move those
  tags into the new `{% block head_css %}` / `{% block head_js %}` blocks.
- The lead DataTables run `paging: false` with `scrollX: true`, rendering every
  row. Switch to `paging: true, pageLength: 25`. Where a table can exceed a few
  thousand rows, move to `serverSide: true` with a paginated Flask endpoint.
- `home.html` carries dead CSS (`.sidenav`, `.blue`, `.yellow`, `.counter`,
  `.grid-item`) and dead JS (`openNav`, `closeNav`). Delete it.
- Role visibility is done by rendering everything then hiding it with
  `document.getElementById(...).hidden = false`. Replace with
  `{% if session['role'] == 'admin' %}`.

## Step 3 — Cleanup, only after every template is converted

Remove: `static/css/sb-admin-2.css`, `static/css/sb-admin-2.min.css`,
`static/vendor/fontawesome-free/`, `static/css/fonts.googleapis.*`,
`static/bootstrap1.min.css`, `static/js/bootstrap.min.js`, and four of the five
vendored date pickers (keep `static/datepicker/`).

Do NOT remove `static/css/bootstrap.min.css` — the templates need its grid.
Check `static/css/style.css` (223 KB) for live references before touching it.

## How to work

- One template per commit, with a message saying what changed.
- After each one, run the app and load that page. Do not batch ten templates
  and hand me a diff.
- If a template does something you do not understand, ask instead of guessing.
- When you finish a group from the list above, stop and show me the result.

Start with Step 1, then `home.html`, then stop and show me.
```

---

## Optional second prompt — HTMX

Once the templates are converted and you want to remove the jQuery AJAX:

```
Convert the jQuery AJAX in this app to HTMX, one endpoint at a time.

Add `<script src="{{ url_for('static', filename='vendor/htmx/htmx.min.js') }}"></script>`
to main.html (download it locally, no CDN).

Start with the notification bell: instead of `$.get("/get_read_notifications")`
building HTML strings in JavaScript, add a Flask route that renders a
`_notifications.html` partial, and have the bell use
`hx-get="/notifications/partial" hx-trigger="load, every 60s" hx-target="#notification_dropdown"`.

Rules: the partial renders with the same design system tokens as everything else;
no HTML string concatenation in JavaScript anywhere; keep the existing route
paths working until the swap is proven.

Do the bell first, then show me before moving on.
```
