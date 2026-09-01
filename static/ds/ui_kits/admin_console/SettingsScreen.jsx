const { Card, Tabs, FormField, Input, Select, Textarea, Switch, Button, DataTable, Badge, Avatar, IconButton, Menu, Alert, KeyValueList } = window.AdminDesignSystem_b1fc08;
function SettingsScreen({ onToast }) {
  const [tab, setTab] = React.useState('general');
  const [twofa, setTwofa] = React.useState(true);
  const [digest, setDigest] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)', maxWidth: 'var(--content-max)' }}>
      <Tabs activeId={tab} onSelect={setTab} tabs={[{ id: 'general', label: 'General' }, { id: 'team', label: 'Team', count: 4 }, { id: 'security', label: 'Security' }, { id: 'api', label: 'API keys' }]} />
      {tab === 'general' && (
        <Card title="Workspace" subtitle="Visible to everyone in your organisation"
          footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}><Button>Cancel</Button><Button variant="primary" onClick={() => onToast('Workspace settings saved')}>Save changes</Button></div>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7) var(--space-9)' }}>
            <FormField label="Workspace name" required><Input defaultValue="Acme Inc" /></FormField>
            <FormField label="Billing email" hint="Receipts and dunning notices go here"><Input defaultValue="billing@acme.com" iconStart="mail" /></FormField>
            <FormField label="Default currency"><Select options={['USD — US Dollar', 'EUR — Euro', 'EGP — Egyptian Pound']} /></FormField>
            <FormField label="Data region" hint="Cannot be changed after provisioning"><Select options={['EU (Frankfurt)', 'US (Virginia)']} disabled /></FormField>
            <FormField label="Support note" style={{ gridColumn: '1 / -1' }}><Textarea rows={3} placeholder="Shown to agents when they open an account in this workspace" /></FormField>
          </div>
        </Card>
      )}
      {tab === 'team' && (
        <Card title="Members" subtitle="4 of 10 seats used" padded={false}
          actions={<Button size="sm" variant="primary" iconStart="user-plus" onClick={() => onToast('Invitation sent')}>Invite member</Button>}>
          <DataTable rows={window.KIT.team} rowKey="email"
            columns={[
              { key: 'name', header: 'Member', render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                  <Avatar name={r.name} size="sm" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ font: 'var(--type-label)', color: 'var(--text-title)' }}>{r.name}</span>
                    <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{r.email}</span>
                  </div>
                </div>) },
              { key: 'role', header: 'Role' },
              { key: 'status', header: 'Status', render: r => <Badge tone={r.status === 'Active' ? 'success' : 'info'}>{r.status}</Badge> },
              { key: 'a', header: '', width: 56, align: 'right', render: () => (
                <Menu trigger={<IconButton icon="ellipsis" label="Member actions" size="sm" />}
                  items={[{ id: 'role', label: 'Change role', icon: 'user-cog' }, { divider: true }, { id: 'rm', label: 'Remove from workspace', icon: 'user-minus', tone: 'danger' }]}
                  onSelect={() => onToast('Mock action')} />) },
            ]} />
        </Card>
      )}
      {tab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card title="Authentication">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              <Switch checked={twofa} onChange={() => setTwofa(!twofa)} label="Require two-factor authentication" description="Every member must enrol before their next sign-in" />
              <Switch checked={digest} onChange={() => setDigest(!digest)} label="Weekly security digest" description="Summary of sign-ins, key rotations and failed attempts" />
            </div>
          </Card>
          <Card title="Session policy"><KeyValueList columns={3} items={[{ label: 'Session length', value: '12 hours' }, { label: 'SSO', value: 'Okta (enforced)' }, { label: 'Last audit export', value: '04 Aug 2026' }]} /></Card>
        </div>
      )}
      {tab === 'api' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Alert tone="info" title="Secret keys are shown once" >Rotate a key if you believe it has been exposed. Rotation takes effect immediately.</Alert>
          <Card title="Keys" padded={false} actions={<Button size="sm" iconStart="plus" onClick={() => onToast('Key created')}>Create key</Button>}>
            <DataTable rowKey="id" rows={[
                { id: 'live', name: 'Production', key: 'sk_live_9f2a…c41', created: '12 Mar 2024', tone: 'success', status: 'Active' },
                { id: 'test', name: 'Sandbox', key: 'sk_test_1b7e…88d', created: '12 Mar 2024', tone: 'neutral', status: 'Active' },
              ]}
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'key', header: 'Key', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{r.key}</span> },
                { key: 'created', header: 'Created' },
                { key: 'status', header: 'Status', render: r => <Badge tone={r.tone} dot>{r.status}</Badge> },
                { key: 'a', header: '', width: 56, align: 'right', render: () => <IconButton icon="rotate-cw" label="Rotate key" size="sm" /> },
              ]} />
          </Card>
        </div>
      )}
    </div>
  );
}
window.SettingsScreen = SettingsScreen;
