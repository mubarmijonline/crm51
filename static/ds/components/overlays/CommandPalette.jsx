import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Kbd } from '../core/Kbd.jsx';
export function CommandPalette({ open = true, groups = [], placeholder = 'Search or jump to…', onSelect, onClose, style, ...rest }) {
  const [q, setQ] = React.useState('');
  if (!open) return null;
  const filtered = groups.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) })).filter(g => g.items.length);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)', zIndex: 70, display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh', animation: 'ds-fade-in var(--duration-base) var(--ease-out)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '90%', background: 'var(--surface-card)', borderRadius: 'var(--radius-overlay)',
        boxShadow: 'var(--elevation-dialog)', overflow: 'hidden', animation: 'ds-pop-in var(--duration-base) var(--ease-out)', ...style }} {...rest}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: '0 var(--space-6)', height: 48, borderBottom: '1px solid var(--border-hairline)' }}>
          <Icon name="search" size={16} color="var(--text-muted)" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}
            style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: 'var(--type-body)' }} />
          <Kbd>esc</Kbd>
        </div>
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: 'var(--space-4)' }}>
          {filtered.length === 0 && <div style={{ padding: 'var(--space-8)', textAlign: 'center', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>No results for “{q}”</div>}
          {filtered.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 'var(--space-5)' }}>
              {g.label && <div style={{ font: 'var(--type-overline)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-subtle)', padding: 'var(--space-3) var(--space-4)' }}>{g.label}</div>}
              {g.items.map(it => (
                <button key={it.id} type="button" onClick={() => onSelect && onSelect(it.id)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--action-ghost-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%', height: 38, padding: '0 var(--space-4)',
                    border: 0, background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', font: 'var(--type-body)' }}>
                  {it.icon && <Icon name={it.icon} size={16} color="var(--text-muted)" />}
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.shortcut && <Kbd>{it.shortcut}</Kbd>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
