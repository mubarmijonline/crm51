Primary data table. Put it in a `<Card padded={false}>` with a TableToolbar above and Pagination in `footer`.

```jsx
<DataTable selectable selectedIds={sel} onSelectionChange={setSel} sort={sort} onSortChange={setSort}
  columns={[{ key: 'name', header: 'Customer', sortable: true }, { key: 'mrr', header: 'MRR', numeric: true, sortable: true },
            { key: 'status', header: 'Status', render: r => <Badge tone={r.tone}>{r.status}</Badge> }]}
  rows={rows} footer={<Pagination page={1} pageCount={4} pageSize={25} total={98} />} />
```

Numeric columns are right-aligned and set in the mono face with tabular figures. Density follows `data-density` on any ancestor.
