# Admin Console — mobile UI kit

The same product at 390×844. Nothing is a shrunken desktop screen: tables become list rows, dropdown menus become bottom sheets, the rail becomes a bottom tab bar.

## Screens (`MobileScreens.jsx`)

| Screen | What it demonstrates |
| --- | --- |
| `OverviewScreen` | Large-title header, 2×2 compact KPI grid, trend card, capacity meters, activity timeline |
| `CustomersListScreen` | Sticky search + filter row, tappable list rows with value and status on the right, empty state |
| `CustomerMobileScreen` | Compact header with back affordance, record identity block, two full-width primary actions, tabs |
| `MoreScreen` | Settings list rows, instant-apply switch, sign-out |

`index.html` wires them into `AppShell isMobile` inside a `PhoneFrame`, with a `TabBar` and two `BottomSheet` flows (filter, record actions).

## Mobile rules this kit follows

- Bottom tab bar for destinations, never for actions. 3–5 tabs.
- Every hit target is at least 44px; controls grow to 40/48px under 768px (`tokens/breakpoints.css`).
- Primary actions are full width at the bottom of a sheet or under the header; secondary actions sit beside them, never stacked three deep.
- Bottom sheets replace Menu, Popover and Dialog. They carry a grab handle and respect the safe-area inset.
- One value per row: the mono figure on the right, status badge under it.
