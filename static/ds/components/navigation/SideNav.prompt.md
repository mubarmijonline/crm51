Left navigation rail for the app shell.

```jsx
<SideNav activeId="customers" onSelect={setView} sections={[{ items: [{ id: 'home', label: 'Overview', icon: 'layout-dashboard' }] }, { label: 'Manage', items: [...] }]} />
```

Groups get an uppercase overline label; the active item takes the tinted selected surface, not a bar.
