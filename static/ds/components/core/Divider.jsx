import React from 'react';
export function Divider({ orientation = 'horizontal', label, spacing = 'var(--space-6)', style, ...rest }) {
  if (orientation === 'vertical') return <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-hairline)', margin: `0 ${spacing}`, flex: 'none', ...style }} {...rest} />;
  if (label) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', margin: `${spacing} 0`, ...style }} {...rest}>
      <span style={{ height: 1, flex: 1, background: 'var(--border-hairline)' }} />
      <span style={{ font: 'var(--type-overline)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>{label}</span>
      <span style={{ height: 1, flex: 1, background: 'var(--border-hairline)' }} />
    </div>
  );
  return <hr style={{ border: 0, height: 1, background: 'var(--border-hairline)', margin: `${spacing} 0`, ...style }} {...rest} />;
}
