const { Card, DataTable, TableToolbar, SearchField, Select, Button, IconButton, Badge, Pagination, StatCard } = window.AdminDesignSystem_b1fc08;
function InvoicesScreen({ onToast }) {
  const [q, setQ] = React.useState('');
  const rows = window.KIT.invoices.filter(r => (r.id + r.customer).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 'var(--space-6)' }}>
        <StatCard label="Outstanding" value="$1,840" delta="+$980" deltaTone="danger" icon="clock" caption="2 invoices past due" />
        <StatCard label="Collected this month" value="$14,000" delta="+8.1%" icon="banknote" />
        <StatCard label="Average days to pay" value="6.4" delta="-1.2" deltaTone="success" icon="calendar-check" />
      </div>
      <Card padded={false}>
        <TableToolbar
          search={<SearchField value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search invoices" />}
          filters={<Select size="sm" options={['All statuses', 'Paid', 'Open', 'Past due']} style={{ width: 150 }} />}
          actions={<Button size="sm" variant="primary" iconStart="plus" onClick={() => onToast('Invoice draft created')}>New invoice</Button>} />
        <DataTable rows={rows} rowKey="id" zebra
          columns={[
            { key: 'id', header: 'Invoice', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.id}</span> },
            { key: 'customer', header: 'Customer', sortable: true },
            { key: 'amount', header: 'Amount', numeric: true, sortable: true },
            { key: 'due', header: 'Due date' },
            { key: 'status', header: 'Status', render: r => <Badge tone={r.tone} dot>{r.status}</Badge> },
            { key: 'a', header: '', width: 92, align: 'right', render: () => (
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <IconButton icon="download" label="Download PDF" size="sm" />
                <IconButton icon="send" label="Send reminder" size="sm" />
              </span>) },
          ]}
          footer={<Pagination page={1} pageCount={1} pageSize={25} total={rows.length} />} />
      </Card>
    </div>
  );
}
window.InvoicesScreen = InvoicesScreen;
