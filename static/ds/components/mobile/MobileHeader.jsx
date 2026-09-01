import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function MobileHeader({ title, subtitle, onBack, leading, actions, large, style, ...rest }) {
  return (
    <header style={{ flex: 'none', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-hairline)',
      padding: large ? 'var(--space-5) var(--mobile-pad-page) var(--space-6)' : 0, ...style }} {...rest}>
      <div style={{ height: 'var(--mobile-header-height)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: large ? 0 : '0 var(--space-4) 0 var(--space-5)' }}>
        {onBack && (
          <button type="button" aria-label="Back" onClick={onBack}
            style={{ width: 'var(--touch-target)', height: 'var(--touch-target)', marginLeft: -10, border: 0, background: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-brand)', cursor: 'pointer' }}>
            <Icon name="chevron-left" size={22} />
          </button>
        )}
        {leading}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {!large && <span style={{ font: 'var(--weight-semibold) var(--text-lg)/1.2 var(--font-sans)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>}
          {!large && subtitle && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{actions}</div>}
      </div>
      {large && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h1 style={{ font: 'var(--weight-semibold) var(--text-3xl)/1.15 var(--font-sans)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-title)' }}>{title}</h1>
          {subtitle && <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}
    </header>
  );
}
