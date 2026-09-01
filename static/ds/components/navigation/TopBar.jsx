import React from 'react';
export function TopBar({ title, breadcrumbs, actions, children, style, ...rest }) {
  return (
    <header style={{ height: 'var(--topbar-height)', flex: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
      padding: '0 var(--pad-page)', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-hairline)', ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        {breadcrumbs}
        {title && <h1 style={{ font: 'var(--weight-semibold) var(--text-lg)/1.2 var(--font-sans)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h1>}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{children}</div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 'none' }}>{actions}</div>}
    </header>
  );
}
