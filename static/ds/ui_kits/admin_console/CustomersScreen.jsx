const { Card, DataTable, TableToolbar, SearchField, Select, Button, IconButton, Badge, Pagination, Menu, EmptyState, Dialog } = window.AdminDesignSystem_b1fc08;
function CustomersScreen({ onOpenCustomer, onToast }) {
  const all = window.KIT.customers;
  const [q, setQ] = React.useState('');
  const [plan, setPlan] = React.useState('All plans');
  const [sel, setSel] = React.useState([]);
  const [sort, setSort] = React.useState({ key: 'mrr', dir: 'desc' });
  const [confirm, setConfirm] = React.useState(false);
  const money = v => Number(String(v).replace(/[^0-9.]/g, ''));
  const rows = all
    .filter(r => (plan === 'All plans' || r.plan === plan) && (r.name + r.contact).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'mrr' || sort.key === 'seats') return (money(a[sort.key]) - money(b[sort.key])) * dir;
      return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir;
    });
  return (
    <Card padded={false}>
      <TableToolbar
        selectionCount={sel.length}
        search={<SearchField value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search customers" />}
        filters={<><Select size="sm" value={plan} onChange={e => setPlan(e.target.value)} options={['All plans', 'Free', 'Growth', 'Enterprise']} style={{ width: 140 }} />
          <Button size="sm" iconStart="filter">More filters</Button></>}
        actions={<><Button size="sm" iconStart="download">Export</Button><Button size="sm" variant="primary" iconStart="plus" onClick={() => onToast('Customer draft created')}>Add customer</Button></>}
        bulkActions={<><Button size="sm" onClick={() => { onToast(sel.length + ' customers exported'); setSel([]); }}>Export selection</Button>
          <Button size="sm" variant="danger" iconStart="trash-2" onClick={() => setConfirm(true)}>Delete</Button></>} />
      {rows.length === 0 ? (
        <EmptyState icon="users" title="No customers match those filters" description="Try a different plan or clear the search."
          action={<Button onClick={() => { setQ(''); setPlan('All plans'); }}>Clear filters</Button>} />
      ) : (
        <DataTable selectable selectedIds={sel} onSelectionChange={setSel} sort={sort} onSortChange={setSort} rows={rows} onRowClick={onOpenCustomer}
          columns={[
            { key: 'name', header: 'Customer', sortable: true, render: r => (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: 'var(--type-label)', color: 'var(--text-title)' }}>{r.name}</span>
                <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{r.contact}</span>
              </div>) },
            { key: 'plan', header: 'Plan', sortable: true },
            { key: 'seats', header: 'Seats', numeric: true, sortable: true },
            { key: 'mrr', header: 'MRR', numeric: true, sortable: true },
            { key: 'status', header: 'Status', render: r => <Badge tone={r.tone} dot>{r.status}</Badge> },
            { key: 'created', header: 'Created', sortable: true },
            { key: 'actions', header: '', width: 56, align: 'right', render: r => (
              <span onClick={e => e.stopPropagation()}>
                <Menu trigger={<IconButton icon="ellipsis" label="Row actions" size="sm" />}
                  items={[{ id: 'view', label: 'View customer', icon: 'arrow-up-right' }, { id: 'invoice', label: 'Create invoice', icon: 'file-plus' },
                    { divider: true }, { id: 'del', label: 'Delete', icon: 'trash-2', tone: 'danger' }]}
                  onSelect={id => id === 'view' ? onOpenCustomer(r) : onToast('Action "' + id + '" is a mock')} />
              </span>) },
          ]}
          footer={<Pagination page={1} pageCount={Math.max(1, Math.ceil(rows.length / 25))} pageSize={25} total={rows.length} onPageChange={() => {}} onPageSizeChange={() => {}} />} />
      )}
      {confirm && (
        <Dialog title={'Delete ' + sel.length + ' customers?'} description="Their invoices and API keys are removed immediately. This cannot be undone." size="sm"
          onClose={() => setConfirm(false)}
          footer={<><Button onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { onToast(sel.length + ' customers deleted'); setSel([]); setConfirm(false); }}>Delete customers</Button></>} />
      )}
    </Card>
  );
}
window.CustomersScreen = CustomersScreen;
