Auto-fitting card grid.

```jsx
<Grid minItemWidth={220}>{kpis.map(k => <StatCard key={k.label} {...k} />)}</Grid>
```
