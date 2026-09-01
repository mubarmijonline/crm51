import React from 'react';
const TONES = ['neutral', 'success', 'danger', 'warning', 'info', 'accent'];
export function Badge({ tone = 'neutral', dot, subtle = true, children, style, ...rest }) {
  const t = TONES.includes(tone) ? tone : 'neutral';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: '2px 8px', borderRadius: 'var(--radius-badge)',
      font: 'var(--weight-medium) var(--text-xs)/18px var(--font-sans)',
      background: subtle ? `var(--status-${t}-bg)` : `var(--status-${t}-fg)`,
      color: subtle ? `var(--status-${t}-fg)` : 'var(--gray-0)',
      border: `1px solid var(--status-${t}-border)`, whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flex: 'none' }} />}
      {children}
    </span>
  );
}
