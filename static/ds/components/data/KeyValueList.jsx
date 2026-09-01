import React from 'react';
export function KeyValueList({ items = [], columns = 1, style, ...rest }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 'var(--space-6) var(--space-9)', margin: 0, ...style }} {...rest}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0 }}>
          <dt style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{it.label}</dt>
          <dd style={{ margin: 0, font: it.mono ? 'var(--type-mono)' : 'var(--type-body)', color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
