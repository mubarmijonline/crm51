import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function TabBar({ items = [], activeId, onSelect, style, ...rest }) {
  return (
    <nav style={{ flex: 'none', display: 'flex', background: 'var(--surface-card)', borderTop: '1px solid var(--border-hairline)',
      paddingBottom: 'var(--safe-bottom)', ...style }} {...rest}>
      {items.map(it => {
        const on = it.id === activeId;
        return (
          <button key={it.id} type="button" onClick={() => onSelect && onSelect(it.id)}
            style={{ flex: 1, height: 'var(--mobile-tabbar-height)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, border: 0, background: 'transparent', cursor: 'pointer', position: 'relative',
              color: on ? 'var(--text-brand)' : 'var(--text-muted)', transition: 'color var(--duration-fast) var(--ease-standard)' }}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon name={it.icon} size={20} strokeWidth={on ? 2 : 1.75} />
              {it.badge ? <span style={{ position: 'absolute', top: -3, right: -6, minWidth: 15, height: 15, padding: '0 4px', borderRadius: 'var(--radius-pill)',
                background: 'var(--red-500)', color: 'var(--gray-0)', font: 'var(--weight-semibold) 9px/15px var(--font-mono)', textAlign: 'center' }}>{it.badge}</span> : null}
            </span>
            <span style={{ font: `var(--weight-${on ? 'semibold' : 'medium'}) var(--text-2xs)/1 var(--font-sans)` }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
