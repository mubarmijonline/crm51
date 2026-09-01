const { Card, Tabs, Badge, Button, IconButton, Menu, KeyValueList, DataTable, Avatar, Alert, ProgressBar, Sparkline, Breadcrumbs, EmptyState } = window.AdminDesignSystem_b1fc08;
function CustomerDetailScreen({ customer, onBack, onToast }) {
  const [tab, setTab] = React.useState('overview');
  const c = customer || window.KIT.customers[0];
  const invoices = window.KIT.invoices.filter(i => i.customer === c.name);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
        <Avatar name={c.name} square size="lg" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Breadcrumbs items={[{ id: 'customers', label: 'Customers' }, { label: c.name }]} onNavigate={onBack} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <h2 style={{ font: 'var(--type-title-lg)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{c.name}</h2>
            <Badge tone={c.tone} dot>{c.status}</Badge>
            <span style={{ font: 'var(--type-mono)', color: 'var(--text-subtle)' }}>{c.id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button iconStart="mail" onClick={() => onToast('Email drafted to ' + c.contact)}>Email</Button>
          <Button variant="primary" iconStart="file-plus" onClick={() => onToast('Invoice draft created')}>New invoice</Button>
          <Menu trigger={<IconButton icon="ellipsis" label="More actions" variant="secondary" />}
            items={[{ id: 'plan', label: 'Change plan', icon: 'arrow-left-right' }, { id: 'pause', label: 'Pause billing', icon: 'pause' },
              { divider: true }, { id: 'del', label: 'Delete customer', icon: 'trash-2', tone: 'danger' }]}
            onSelect={() => onToast('Mock action')} />
        </div>
      </div>
      {c.status === 'Past due' && <Alert tone="danger" title="Last payment was declined" actions={<Button size="sm">Retry charge</Button>}>Card ending 4242 was declined on 02 Aug 2026.</Alert>}
      <Tabs activeId={tab} onSelect={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'invoices', label: 'Invoices', count: invoices.length }, { id: 'usage', label: 'Usage' }, { id: 'notes', label: 'Notes' }]} />
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          <Card title="Account">
            <KeyValueList columns={2} items={[
              { label: 'Customer ID', value: c.id, mono: true },
              { label: 'Billing contact', value: c.contact },
              { label: 'Plan', value: c.plan },
              { label: 'Seats', value: String(c.seats), mono: true },
              { label: 'MRR', value: c.mrr, mono: true },
              { label: 'Customer since', value: c.created },
              { label: 'Account owner', value: c.owner },
              { label: 'Region', value: 'EU (Frankfurt)' },
            ]} />
          </Card>
          <Card title="Revenue trend" subtitle="Last 12 months">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <Sparkline data={[18,20,19,22,26,25,29,31,30,34,36,38]} height={64} />
              <ProgressBar value={Math.min(100, c.seats / 3)} label="Seat utilisation" valueLabel={c.seats + ' seats'} />
            </div>
          </Card>
        </div>
      )}
      {tab === 'invoices' && (
        <Card padded={false}>
          {invoices.length ? (
            <DataTable rows={invoices} rowKey="id" columns={[
              { key: 'id', header: 'Invoice', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.id}</span> },
              { key: 'amount', header: 'Amount', numeric: true },
              { key: 'due', header: 'Due' },
              { key: 'status', header: 'Status', render: r => <Badge tone={r.tone}>{r.status}</Badge> },
              { key: 'a', header: '', width: 56, align: 'right', render: () => <IconButton icon="download" label="Download PDF" size="sm" /> },
            ]} />
          ) : <EmptyState icon="file-text" title="No invoices yet" description="Invoices appear here once the first billing cycle closes." compact />}
        </Card>
      )}
      {tab === 'usage' && (
        <Card title="API usage" subtitle="Rolling 30 days">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <ProgressBar value={62} label="Requests" valueLabel="620k / 1M" />
            <ProgressBar value={12} label="Webhook retries" valueLabel="1.2k / 10k" tone="success" />
            <Sparkline data={[4,6,5,9,12,11,14,18,16,21,19,24]} color="var(--viz-2)" height={56} />
          </div>
        </Card>
      )}
      {tab === 'notes' && (
        <Card><EmptyState icon="sticky-note" title="No notes on this account" description="Notes are visible to everyone on the support team." compact action={<Button variant="primary" iconStart="plus">Add note</Button>} /></Card>
      )}
    </div>
  );
}
window.CustomerDetailScreen = CustomerDetailScreen;
