const { MobileHeader, ListRow, MobileStat, BottomSheet, Badge, Avatar, Button, IconButton, Card, SearchField, SegmentedControl, KeyValueList, Timeline, Sparkline, ProgressBar, EmptyState, Alert, Divider, Switch, Tabs, Icon, Skeleton } = window.AdminDesignSystem_b1fc08;

function OverviewScreen({ onOpenCustomer }) {
  const k = window.KIT;
  return (
    <div>
      <MobileHeader large title="Overview" subtitle="Acme Inc · August 2026" leading={<Avatar name="Acme Inc" square size="sm" />} actions={<IconButton icon="bell" label="Notifications" />} />
      <div style={{ padding: 'var(--mobile-pad-page)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Alert tone="warning" title="2 payments failing" actions={<Button size="sm">Review</Button>} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <MobileStat label="MRR" value="$48.2k" delta="+6.2%" icon="dollar-sign" />
          <MobileStat label="Customers" value="248" delta="+12" icon="users" />
          <MobileStat label="Failed" value="9" delta="+3" icon="credit-card" />
          <MobileStat label="Churn" value="1.8%" delta="-0.4%" deltaTone="success" icon="user-minus" />
        </div>
        <Card title="Revenue trend" subtitle="Last 12 months"><Sparkline data={[22,25,24,28,27,31,30,34,36,35,39,42]} height={72} /></Card>
        <Card title="Plan capacity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <ProgressBar value={68} label="Seats used" valueLabel="782 / 1150" />
            <ProgressBar value={92} label="Storage" valueLabel="920 GB" tone="warning" />
          </div>
        </Card>
        <Card title="Recent activity"><Timeline items={k.activity.slice(0, 4).map(a => ({ icon: a.icon, tone: a.icon === 'triangle-alert' ? 'danger' : 'neutral', text: a.text, meta: a.time }))} /></Card>
      </div>
    </div>
  );
}

function CustomersListScreen({ onOpenCustomer, onFilter, filter }) {
  const [q, setQ] = React.useState('');
  const rows = window.KIT.customers.filter(c => (filter === 'All' || c.status === filter) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <MobileHeader large title="Customers" subtitle={rows.length + ' of 248 accounts'} actions={<IconButton icon="plus" label="Add customer" />} />
      <div style={{ padding: 'var(--mobile-pad-page)', display: 'flex', gap: 'var(--space-4)', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-hairline)' }}>
        <SearchField value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search customers" width="100%" />
        <Button iconStart="sliders-horizontal" onClick={onFilter} style={{ flex: 'none' }}>Filter</Button>
      </div>
      {rows.length === 0 ? <EmptyState icon="users" title="No customers match" description="Clear the search or change the status filter." compact />
        : rows.map(c => (
          <ListRow key={c.id} leading={<Avatar name={c.name} square />} title={c.name} subtitle={c.plan + ' · ' + c.seats + ' seats'}
            meta={c.mrr} metaSub={<Badge tone={c.tone} dot>{c.status}</Badge>} onClick={() => onOpenCustomer(c)} />
        ))}
    </div>
  );
}

function CustomerMobileScreen({ customer, onBack, onAction }) {
  const [tab, setTab] = React.useState('detail');
  const c = customer;
  return (
    <div>
      <MobileHeader title={c.name} subtitle={c.plan} onBack={onBack} actions={<IconButton icon="ellipsis" label="Actions" onClick={onAction} />} />
      <div style={{ padding: 'var(--mobile-pad-page)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <Avatar name={c.name} square size="lg" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span style={{ font: 'var(--weight-semibold) var(--text-xl)/1.2 var(--font-sans)', color: 'var(--text-title)' }}>{c.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <Badge tone={c.tone} dot>{c.status}</Badge>
              <span style={{ font: 'var(--type-mono)', color: 'var(--text-subtle)' }}>{c.id}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button size="lg" iconStart="mail" style={{ flex: 1 }}>Email</Button>
          <Button size="lg" variant="primary" iconStart="file-plus" style={{ flex: 1 }}>Invoice</Button>
        </div>
        <Tabs activeId={tab} onSelect={setTab} tabs={[{ id: 'detail', label: 'Detail' }, { id: 'invoices', label: 'Invoices' }, { id: 'usage', label: 'Usage' }]} />
        {tab === 'detail' && <Card><KeyValueList columns={2} items={[
          { label: 'MRR', value: c.mrr, mono: true }, { label: 'Seats', value: String(c.seats), mono: true },
          { label: 'Plan', value: c.plan }, { label: 'Since', value: c.created },
          { label: 'Owner', value: c.owner }, { label: 'Contact', value: c.contact }]} /></Card>}
        {tab === 'invoices' && (
          <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--surface-card)' }}>
            {window.KIT.invoices.slice(0, 3).map(i => (
              <ListRow key={i.id} title={i.id} subtitle={'Due ' + i.due} meta={i.amount} metaSub={<Badge tone={i.tone}>{i.status}</Badge>} chevron={false} />
            ))}
          </div>
        )}
        {tab === 'usage' && <Card title="API usage" subtitle="Rolling 30 days">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <ProgressBar value={62} label="Requests" valueLabel="620k / 1M" />
            <Sparkline data={[4,6,5,9,12,11,14,18,16,21,19,24]} color="var(--viz-2)" height={56} />
          </div></Card>}
      </div>
    </div>
  );
}

function MoreScreen({ onToast }) {
  const [push, setPush] = React.useState(true);
  return (
    <div>
      <MobileHeader large title="More" subtitle={window.KIT.user.email} />
      <div style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border-hairline)' }}>
        <ListRow leading={<Avatar name={window.KIT.user.name} />} title={window.KIT.user.name} subtitle={window.KIT.user.role} onClick={() => onToast('Profile is a mock')} />
        <ListRow leading={<Icon name="users" size={18} color="var(--text-muted)" />} title="Team" subtitle="4 members" onClick={() => onToast('Team is a mock')} />
        <ListRow leading={<Icon name="key-round" size={18} color="var(--text-muted)" />} title="API keys" subtitle="2 active" onClick={() => onToast('Keys are a mock')} />
        <ListRow leading={<Icon name="credit-card" size={18} color="var(--text-muted)" />} title="Billing" subtitle="Visa ending 4242" onClick={() => onToast('Billing is a mock')} />
      </div>
      <div style={{ padding: 'var(--mobile-pad-page)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Switch checked={push} onChange={() => setPush(!push)} label="Push notifications" description="Failed payments and new trials" />
        <Divider />
        <Button size="lg" fullWidth iconStart="log-out">Sign out</Button>
      </div>
    </div>
  );
}
Object.assign(window, { OverviewScreen, CustomersListScreen, CustomerMobileScreen, MoreScreen });
