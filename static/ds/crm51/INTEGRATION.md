# Applying the Admin Design System to crm51

Target: `mubarmijonline/crm51` — Flask + Jinja2, Bootstrap 4, jQuery, DataTables, SweetAlert2.

This is **not** a React migration. Your pages are server-rendered Jinja, so the
design system is applied as a **CSS bridge** that restyles the Bootstrap classes
already in your templates, plus rebuilt versions of the two structural files.

---

## What's in this folder

| File | Goes to | What it does |
| --- | --- | --- |
| `ds-bridge.css` | `static/css/ds-bridge.css` | Restyles every Bootstrap class your templates use with design system tokens. All 30 templates improve with no markup changes. |
| `main.html` | `templates/main.html` | Rebuilt base layout: one navbar instead of two, Lucide icons, jQuery loaded once, working mobile viewport. |
| `login.html` | `templates/login.html` | Rebuilt sign-in. Same field names and error slots, so the route is untouched. |

Plus, from the design system root: copy `styles.css` and `tokens/` into
`static/ds/` so `static/ds/styles.css` resolves.

---

## Step 1 — Drop the files in

```bash
mkdir -p static/ds
cp -r  <design-system>/styles.css <design-system>/tokens  static/ds/
cp     crm51/ds-bridge.css                                static/css/
cp     crm51/main.html crm51/login.html                   templates/
```

Download Lucide once so you are not depending on a CDN:

```bash
mkdir -p static/vendor/lucide
curl -o static/vendor/lucide/lucide.js https://unpkg.com/lucide@0.469.0/dist/umd/lucide.js
```

Restart Flask and load `/home`. Every page should already look different —
the bridge is doing the work before you touch a single page template.

---

## Step 2 — What the new base layout changes

Read `main.html` before replacing yours. The behaviour is preserved; the
structure is not.

**Removed**
- `css/sb-admin-2.min.css` — 197 KB, and you were using maybe 3% of it. **Keep `css/bootstrap.min.css`** — sb-admin-2 was bundling Bootstrap's rules, and your templates use `.row`/`.col-*`/`.collapse`/`.navbar-*` for layout. The new base links Bootstrap first, then the bridge on top.
- Font Awesome 4.7 CDN **and** both Font Awesome kit scripts (`d1a6f490f1`, `f139ce70b0`). Three icon systems for one app. Lucide replaces all three.
- Two of the three jQuery loads. You were loading googleapis jQuery, `vendor/jquery/jquery.min.js`, and `vendor/datatables/jquery-3.3.1.js` — the last one silently re-defined `$` after DataTables had bound to it.
- `js/bootstrap.min.js` (Bootstrap 4.x) loading alongside `vendor/bootstrap/js/bootstrap.bundle.min.js`. Two Bootstrap runtimes; dropdowns fired twice.
- `fonts.googleapis.css.lato.css` and the Material Icons CSS — neither font was used.
- The Google Charts loader — nothing in the templates calls it.
- `css/style.css` (223 KB) is **not** linked by the new base. Check whether anything needs it before deleting it from the repo.
- The 500 lines of inline `<style>` — all of it is now in `ds-bridge.css`.

**Fixed**
- `<meta name="viewport" content="width=device-width, initial-scale=0.7, maximum-scale=0.7, user-scalable=no">` → a normal viewport. The old one zoomed every phone to 70% and blocked pinch-zoom, which is also a WCAG failure.
- **Two complete navbars** (`#main_nav_bar` and `#main_nav_bar_admin`) rendered on every page with one hidden by JS on `document.ready`. Now one navbar with `{% if role == 'admin' %}`. Half the nav markup is gone and there is no flash of the wrong menu.
- The bell markup was duplicated with `x` / `xx` id pairs. Still one `notifications()` function, but the ids are chosen by Jinja instead of both being rendered.
- `notifications()` was ~120 lines of string concatenation with inline colours repeated six times. Rewritten to ~30 lines, same endpoints, same behaviour.

**Kept exactly**
- Every route URL, every `session[...]` reference.
- `notifications()`, `read_notification()`, `go_to_lead()`, `go_to_event_lead()`, `go_to_notification_center()` — same names, same signatures. Page templates call these.
- The global `ajaxStart` / `ajaxStop` SweetAlert loading overlay and the `isFunctionRunning` localStorage guard.
- The `parsererror` → `/logout` handler.
- `{% block body %}` — so all 28 page templates still extend it unchanged.

**Added**: `{% block title %}`, `{% block head_css %}`, `{% block head_js %}`, `{% block scripts %}`. Use these instead of the `<head>` tags currently sitting inside `{% block body %}` (that markup is invalid — it lands in the middle of `<body>`).

---

## Step 3 — Page templates, in priority order

The bridge handles the look. These are the structural fixes worth making per page.

### 3.1 Lead tables — `american_active_leads`, `event_active_leads`, `american_db`, `event_db`, `recall_date_table`, `recall_date_table_event`, `studentsDB`, `table`, `table_by_date`

Current shape:

```html
<div style="margin-left: 2%;margin-right: 2%;">
<div class="card_customized">
  <table id="students_table" class="display" style="width:100%">
    <br>
    <h1 style="...color:tomato"><u>Education Active Leads</u></h1>
    <div><div style="float:right"><a href="https://crm.mubarmijonline.com/create_lead_american">…</a></div></div>
    <br><br><br><hr>
    <thead>…
```

Two real bugs there: the `<h1>`, `<br>` and `<div>` are **inside `<table>`** before
`<thead>` (browsers hoist them out, which is why spacing is unpredictable), and the
"Add Lead" link is an absolute `https://crm.mubarmijonline.com` URL, so it jumps to
production from your dev box.

Replace with:

```html
<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-6);margin-bottom:var(--space-7)">
  <div style="display:flex;flex-direction:column;gap:var(--space-3)">
    <h1 style="font:var(--type-title-lg);color:var(--text-title);letter-spacing:var(--tracking-tight)">Education active leads</h1>
    <p style="font:var(--type-body-sm);color:var(--text-muted)">Leads assigned to you that are still open.</p>
  </div>
  <a href="{{ url_for('create_lead_american') }}" class="btn btn-primary">
    <i data-lucide="plus"></i>Add lead
  </a>
</div>

<div class="card_customized" style="padding:0">
  <table id="students_table" class="display" style="width:100%">
    <thead>…</thead>
    <tfoot>…</tfoot>
  </table>
</div>
```

Then in the DataTables config:

- `paging: false` with `scrollX: true` renders **every** lead row on load. Once the table passes a few thousand rows the page will hang. Switch to `paging: true, pageLength: 25`, and when the table gets big, `serverSide: true` against a paginated Flask endpoint.
- The action column builds buttons with string concatenation and an absolute URL. Keep the buttons but use `btn-secondary` for Profile and `btn-danger btn-sm` for Delete, and build the href with `url_for`.
- Status columns should render as badges instead of bare text:

```js
{ data: 'status', render: function (d) {
    var tone = d === 'Interested' ? 'success' : d === 'Not Interested' ? 'danger' : d === 'Follow Up' ? 'warning' : 'secondary';
    return '<span class="badge badge-' + tone + '">' + d + '</span>';
  } }
```

- Add `className: 'mono'` to the ID, mobile, date and deposit columns so figures line up (the bridge defines `.mono`).

### 3.2 Home — `home.html`

A grid of nine launcher cards, each shown or hidden by `document.getElementById(...).hidden = false` in a role check where **both branches set almost the same things**. Replace the whole script with Jinja:

```html
{% set tiles = [
  ('/create_lead_american', 'user-plus', 'Create education lead', 'Manually add an education lead', false),
  ('/create_lead_event',    'calendar-plus', 'Create event lead', 'Manually add an event lead', false),
  ('/update_american_lead', 'search', 'Search education leads', 'Find and update an education lead', false),
  ('/update_event_lead',    'search', 'Search event leads', 'Find and update an event lead', false),
  ('/recall_date_table',    'phone-call', 'Education recall dates', 'Recall dates for education leads', false),
  ('/recall_date_table_event','phone-call','Event recall dates', 'Recall dates for event leads', false),
  ('/american_active_leads','users', 'Course active leads', 'View course lead data', false),
  ('/users',                'user-cog', 'Users', 'View and edit system users', true)
] %}

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--space-6)">
  {% for href, icon, title, desc, admin_only in tiles %}
    {% if not admin_only or session['role'] == 'admin' %}
    <a href="{{ href }}" class="card" style="padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--space-4);text-decoration:none">
      <span style="width:36px;height:36px;border-radius:var(--radius-card);background:var(--surface-selected);color:var(--text-brand);display:inline-flex;align-items:center;justify-content:center">
        <i data-lucide="{{ icon }}"></i>
      </span>
      <span style="font:var(--type-section);color:var(--text-title)">{{ title }}</span>
      <span style="font:var(--type-body-sm);color:var(--text-muted)">{{ desc }}</span>
    </a>
    {% endif %}
  {% endfor %}
</div>
```

Also delete from `home.html`: the `.sidenav` CSS block (there is no side nav on this page), the `openNav`/`closeNav` functions (nothing calls them), the `.blue`/`.yellow`/`.grid-item` antiquewhite styles, and the `.counter` styles. None are used.

The svgrepo.com `<img>` icons go too — they are third-party hotlinks that break offline.

### 3.3 Lead forms — `create_lead_american` (36 KB), `update_american_lead` (43 KB), `update_event_lead` (41 KB), `create_lead_event`, `register`, `course_form`, `create_course`

These are the biggest files and the biggest win. Pattern for every field:

```html
<div class="form-group">
  <label for="student_name">Student name <span style="color:var(--text-danger)">*</span></label>
  <input type="text" class="form-control" id="student_name" name="student_name" required>
  <small class="form-text">As written on the school record.</small>
</div>
```

Group them in a two-column grid rather than stacked `.row`/`.col`:

```html
<div class="card_customized">
  <h2 style="font:var(--type-section);color:var(--text-title);margin-bottom:var(--space-7)">Student details</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-6) var(--space-8)">
    …form-groups…
  </div>
</div>
```

Strip the inline `style="color:blue;font-size:14px;font-weight:bold"` from every label — the bridge styles `label` already. Same for the `&nbsp;&nbsp;&nbsp;` indentation before label text.

### 3.4 Users and settings — `admin_users`, `admin_settings`, `account_settings`

`admin_settings` is 16 KB of mixed concerns. Split it into tabbed sections using the Bootstrap nav-tabs the bridge already styles, one card per group, with a `.card-footer` holding Save / Cancel.

### 3.5 Notification centre — `historical_notification`

Use the timeline pattern: one row per notification, icon on the left, title + message + "Added by", timestamp right-aligned in the mono face.

---

## Step 4 — Cleanup

Once every page is converted:

```bash
# NOTE: do not remove css/bootstrap.min.css — the templates need its grid.
git rm static/css/sb-admin-2.css static/css/sb-admin-2.min.css
git rm static/css/fonts.googleapis.css.lato.css static/css/fonts.googleapis.icon.material.css
git rm -r static/vendor/fontawesome-free
git rm static/bootstrap1.min.css            # 141 KB, not linked anywhere
git rm static/js/bootstrap.min.js           # duplicate of vendor/bootstrap bundle
```

Then check these before deleting — they may still be referenced by a page:
- `static/css/style.css` (223 KB)
- `static/bootstrap-datetimepicker-master/`, `static/Datetime-Picker/`, `static/DateTimePicker-2/`, `static/datetimepicker-master/`, `static/datepicker/` — **five** date picker libraries are vendored. Pick one (`datepicker/` is the one `main.html` loads) and delete the other four.
- `static/select2/` — the templates load select2 from cdnjs, not from here.

That is roughly 2,000 files and several MB of vendor code.

---

## Step 5 — Optional: HTMX

If the jQuery AJAX in the lead tables and the notification bell becomes painful,
add HTMX rather than a front-end framework:

```html
<script src="https://unpkg.com/htmx.org@2.0.4"></script>
```

Your Flask route returns an HTML fragment; HTMX swaps it in. No API layer, no
build step, no second deployment. The bridge styles the swapped-in HTML the same
as everything else.

---

## Things to flag to the team

- **Passwords are plaintext** (`american_crm.py`, login handler — noted in your own README). This is unrelated to the design work but it is the most serious issue in the repo. Fix it before anything cosmetic.
- **The absolute `https://crm.mubarmijonline.com` links** in the templates make dev jump to production. Replace with `url_for`.
- **`paging: false`** on the lead tables will not scale.
- The design system's own rules apply from here: no raw hex colours, no hardcoded pixel sizes, no new fonts. Everything has a token.
