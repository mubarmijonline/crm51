import React from 'react';
export function Card({ title, subtitle, actions, footer, padded = true, elevated, children, style, ...rest }) {
  return (
    <section style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-card)', boxShadow: elevated ? 'var(--elevation-raised)' : 'var(--elevation-card)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', ...style,
    }} {...rest}>
      {(title || actions) && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-5)', padding: 'var(--space-5) var(--pad-card)', borderBottom: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            {title && <h3 style={{ font: 'var(--type-section)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h3>}
            {subtitle && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 'none' }}>{actions}</div>}
        </header>
      )}
      <div style={{ padding: padded ? 'var(--pad-card)' : 0, flex: 1, minWidth: 0 }}>{children}</div>
      {footer && <footer style={{ padding: 'var(--space-5) var(--pad-card)', borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-app)' }}>{footer}</footer>}
    </section>
  );
}
