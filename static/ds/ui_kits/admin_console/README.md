# Admin Console — UI kit

A click-through recreation of the reference admin product this system is tuned for: a left rail, a fixed top bar, and content built from cards, KPI tiles and data tables.

## Screens

| File | Screen | What it demonstrates |
| --- | --- | --- |
| `SignInScreen.jsx` | Sign in | Split auth layout, form fields, error alert, SSO secondary action |
| `DashboardScreen.jsx` | Overview | KPI grid with sparklines, alert banner, top-accounts table, usage meters, activity feed |
| `CustomersScreen.jsx` | Customers | Table toolbar (search + filters), sortable/selectable DataTable, bulk-action mode, row menu, delete dialog, empty state |
| `CustomerDetailScreen.jsx` | Customer detail | Record header, breadcrumbs, tabs, key-value list, per-tab tables and empty states |
| `InvoicesScreen.jsx` | Invoices | Zebra table, status badges, per-row icon actions, summary tiles |
| `SettingsScreen.jsx` | Settings | Tabbed settings, two-column form card with footer actions, member table, switches, API keys |

`index.html` wires them together: sign in → shell → navigate → open a record → act. Row density can be toggled from the top bar or the account menu (`data-density="compact"` on the shell).

## Notes

- All screens compose the published components from `window.AdminDesignSystem_b1fc08`; nothing is re-implemented locally.
- Data is mock and lives in `data.js`.
- Icons are Lucide, loaded from CDN by `index.html`.
