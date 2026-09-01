import React from 'react';
export function ProgressBar({ value = 0, max = 100, tone = 'primary', label, valueLabel, size = 'md', style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = tone === 'danger' ? 'var(--red-500)' : tone === 'warning' ? 'var(--amber-500)' : tone === 'success' ? 'var(--green-500)' : 'var(--action-primary)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%', ...style }} {...rest}>
      {(label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          <span>{label}</span><span style={{ fontFamily: 'var(--font-mono)' }}>{valueLabel}</span>
        </div>
      )}
      <div role="progressbar" aria-valuenow={value} aria-valuemax={max} style={{ height: size === 'sm' ? 4 : 8, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: fill, borderRadius: 'var(--radius-pill)', transition: 'width var(--duration-slow) var(--ease-standard)' }} />
      </div>
    </div>
  );
}
