const { Button, Input, FormField, Checkbox, Avatar, Alert } = window.AdminDesignSystem_b1fc08;
function SignInScreen({ onSignIn }) {
  const [err, setErr] = React.useState(false);
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-11)' }}>
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Avatar name="Acme Inc" square />
            <strong style={{ font: 'var(--type-title)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>Acme Admin</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h1 style={{ font: 'var(--type-title-lg)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>Sign in</h1>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>Use your work account to manage customers, billing and team access.</p>
          </div>
          {err && <Alert tone="danger" title="Incorrect email or password" onDismiss={() => setErr(false)} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <FormField label="Work email"><Input iconStart="mail" defaultValue="ahmed@acme.com" /></FormField>
            <FormField label="Password"><Input type="password" iconStart="lock" defaultValue="password" /></FormField>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Checkbox checked label="Keep me signed in" onChange={() => {}} />
              <a href="#" onClick={e => { e.preventDefault(); setErr(true); }} style={{ font: 'var(--type-caption)' }}>Forgot password?</a>
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={onSignIn}>Continue</Button>
            <Button size="lg" fullWidth iconStart="shield-check">Use SSO</Button>
          </div>
          <p style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>Protected by SSO enforcement. Contact your workspace owner for access.</p>
        </div>
      </div>
      <div style={{ background: 'var(--surface-app)', borderLeft: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-11)' }}>
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <span style={{ font: 'var(--type-overline)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>This month</span>
          <div style={{ font: 'var(--type-display)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-display)', fontFamily: 'var(--font-mono)' }}>$48,210</div>
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)' }}>Recurring revenue across 248 active customers, updated every hour.</p>
        </div>
      </div>
    </div>
  );
}
window.SignInScreen = SignInScreen;
