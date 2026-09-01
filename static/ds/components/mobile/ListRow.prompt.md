Tappable list row — use instead of DataTable below the md breakpoint.

```jsx
<ListRow leading={<Avatar name={c.name} />} title={c.name} subtitle={c.plan} meta={c.mrr} metaSub={<Badge tone={c.tone}>{c.status}</Badge>} onClick={open} />
```
