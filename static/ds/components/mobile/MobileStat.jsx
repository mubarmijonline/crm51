import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function MobileStat({ label, value, delta, deltaTone = 'auto', icon, style, ...rest }) {
  const up = typeof delta === 'string' ? delta.trim().startsWith('+') : delta > 0;
  const tone = deltaTone === 'auto' ? (up ? 'success' : 'danger') : deltaTone;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-6)',
      background: 'var(--surface-card)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)', minWidth: 0, ...style }} {...rest}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        {icon && <Icon name={icon} size={13} />}{label}
      </span>
      <span style={{ font: 'var(--weight-semibold) var(--text-2xl)/1.1 var(--font-mono)', color: 'var(--text-title)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {delta != null && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, font: 'var(--weight-medium) var(--text-xs)/1 var(--font-sans)', color: `var(--status-${tone}-fg)` }}>
          <Icon name={up ? 'trending-up' : 'trending-down'} size={12} />{delta}
        </span>
      )}
    </div>
  );
}
