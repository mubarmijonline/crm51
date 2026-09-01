const { Card, StatCard, Sparkline, Badge, Button, Icon, Tabs, DataTable, Alert, ProgressBar } = window.AdminDesignSystem_b1fc08;
function DashboardScreen({ onOpenCustomer, onNavigate }) {
  const [range, setRange] = React.useState('30');
  const k = window.KIT;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)' }}>
      <Alert tone="warning" title="2 customers have failing payments" actions={<Button size="sm" onClick={() => onNavigate('invoices')}>Review invoices</Button>} onDismiss={() => {}}>
        Northwind Traders and Wayne Logistics were declined in the last 24 hours.
      </Alert>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tabs variant="pill" activeId={range} onSelect={setRange} tabs={[{ id: '7', label: '7 days' }, { id: '30', label: '30 days' }, { id: '90', label: '90 days' }]} />
        <Button size="sm" iconStart="download">Export report</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 'var(--space-6)' }}>
        {k.kpis.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} deltaTone={s.deltaTone || 'auto'} icon={s.icon} caption={s.caption}
            chart={<Sparkline data={s.series} color={s.deltaTone === 'danger' ? 'var(--viz-5)' : 'var(--viz-1)'} height={36} />} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        <Card title="Top accounts by MRR" subtitle="Ranked over the selected range" padded={false}
          actions={<Button size="sm" variant="ghost" iconEnd="arrow-right" onClick={() => onNavigate('customers')}>All customers</Button>}>
          <DataTable rows={k.customers.slice(0, 5)} onRowClick={onOpenCustomer}
            columns={[
              { key: 'name', header: 'Customer', sortable: true },
              { key: 'plan', header: 'Plan' },
              { key: 'seats', header: 'Seats', numeric: true },
              { key: 'mrr', header: 'MRR', numeric: true, sortable: true },
              { key: 'status', header: 'Status', render: r => <Badge tone={r.tone} dot>{r.status}</Badge> },
            ]} />
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card title="Plan capacity">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <ProgressBar value={68} label="Seats used" valueLabel="782 / 1150" />
              <ProgressBar value={41} label="API quota" valueLabel="4.1M / 10M" tone="success" />
              <ProgressBar value={92} label="Storage" valueLabel="920 / 1000 GB" tone="warning" />
            </div>
          </Card>
          <Card title="Recent activity">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {k.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-5)' }}>
                  <span style={{ color: 'var(--text-subtle)', marginTop: 2 }}><Icon name={a.icon} size={15} /></span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ font: 'var(--type-body-sm)' }}>{a.text}</span>
                    <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
window.DashboardScreen = DashboardScreen;
