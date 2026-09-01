repo: mubarmijonline/crm51
branch: main

## Last sync

date: 2026-09-01T17:25:41Z

### Updated in this project
- Read the Flask/Jinja base layout, sign-in, dashboard and leads-table templates to ground the migration.
- Wrote `crm51/ds-bridge.css` — a Bootstrap 4 bridge that restyles the CRM's existing classes with design system tokens.
- Rebuilt `templates/main.html` and `templates/login.html` on the design system (drafts in `crm51/`).
- Copied the brand logo into `static/images/51_Logo.png`.

## Screen map

| Project file | Built from |
| --- | --- |
| `crm51/main.html` | `templates/main.html` |
| `crm51/login.html` | `templates/login.html` |
| `crm51/ds-bridge.css` | `templates/main.html`, `templates/home.html`, `templates/american_active_leads.html`, `static/css/sb-admin-2.min.css` |
| `crm51/INTEGRATION.md` | `templates/` (all 30), `static/css/`, `static/js/` |
| `static/images/51_Logo.png` | `static/images/51_Logo.png` |
