import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function StatCard({ label, value, delta, deltaTone = 'auto', caption, icon, chart, style, ...rest }) {
  const up = typeof delta === 'string' ? delta.trim().startsWith('+') : delta > 0;
  const tone = deltaTone === 'auto' ? (up ? 'success' : 'danger') : deltaTone;
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)',
      padding: 'var(--pad-card)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0, ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {icon && <span style={{ color: 'var(--text-subtle)' }}><Icon name={icon} size={15} /></span>}
        <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
        <span style={{ font: 'var(--type-metric)', color: 'var(--text-title)', fontVariantNumeric: 'tabular-nums', letterSpacing: 'var(--tracking-tight)' }}>{value}</span>
        {delta != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, font: 'var(--weight-medium) var(--text-sm)/1 var(--font-sans)', color: `var(--status-${tone}-fg)` }}>
            <Icon name={up ? 'trending-up' : 'trending-down'} size={14} />{delta}
          </span>
        )}
      </div>
      {chart}
      {caption && <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{caption}</span>}
    </div>
  );
}
