import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Timeline({ items = [], style, ...rest }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'flex', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: `var(--status-${it.tone || 'neutral'}-bg)`, color: `var(--status-${it.tone || 'neutral'}-fg)`,
              border: `1px solid var(--status-${it.tone || 'neutral'}-border)` }}>
              <Icon name={it.icon || 'circle'} size={13} />
            </span>
            {i < items.length - 1 && <span style={{ width: 1, flex: 1, background: 'var(--border-hairline)', minHeight: 16 }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: i < items.length - 1 ? 'var(--space-7)' : 0, minWidth: 0 }}>
            <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-body)' }}>{it.text}</span>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{it.meta}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
