import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Accordion({ items = [], defaultOpen = [], style, ...rest }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggle = id => setOpen(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  return (
    <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--surface-card)', ...style }} {...rest}>
      {items.map((it, i) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id} style={{ borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
            <button type="button" onClick={() => toggle(it.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%', padding: 'var(--space-5) var(--space-6)',
                border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', font: 'var(--type-label)', color: 'var(--text-title)' }}>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.meta && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{it.meta}</span>}
              <span style={{ color: 'var(--text-muted)', transform: on ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration-fast) var(--ease-standard)', display: 'inline-flex' }}>
                <Icon name="chevron-down" size={16} />
              </span>
            </button>
            {on && <div style={{ padding: '0 var(--space-6) var(--space-6)', font: 'var(--type-body-sm)', color: 'var(--text-body)' }}>{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
