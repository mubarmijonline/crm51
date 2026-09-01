Toolbar above a table; swaps to a tinted bulk-action bar when rows are selected.

```jsx
<TableToolbar search={<SearchField … />} filters={<Select options={…} size="sm" />} selectionCount={sel.length}
  bulkActions={<Button size="sm" variant="danger" iconStart="trash-2">Delete</Button>} actions={<Button size="sm" variant="primary" iconStart="plus">Add</Button>} />
```
