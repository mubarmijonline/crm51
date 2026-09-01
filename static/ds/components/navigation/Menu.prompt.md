Dropdown menu; closes on outside click.

```jsx
<Menu trigger={<IconButton icon="ellipsis" label="Actions" />} items={[{ id: 'edit', label: 'Edit', icon: 'pencil' }, { divider: true }, { id: 'del', label: 'Delete', icon: 'trash-2', tone: 'danger' }]} onSelect={run} />
```
