import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Menu({ trigger, items = [], align = 'end', onSelect, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);
  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', ...style }} {...rest}>
      <span onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex' }}>{trigger}</span>
      {open && (
        <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', [align === 'end' ? 'right' : 'left']: 0, zIndex: 50,
          minWidth: 184, padding: 'var(--space-3)', background: 'var(--surface-card)', border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-popover)', animation: 'ds-pop-in var(--duration-fast) var(--ease-out)' }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: 'var(--border-hairline)', margin: 'var(--space-3) 0' }} />
          ) : (
            <button key={it.id || i} type="button" role="menuitem" disabled={it.disabled}
              onClick={() => { setOpen(false); onSelect ? onSelect(it.id) : it.onSelect && it.onSelect(); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--action-ghost-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%', height: 32, padding: '0 var(--space-4)',
                border: 0, background: 'transparent', borderRadius: 'var(--radius-xs)', cursor: it.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left', font: 'var(--type-body-sm)', opacity: it.disabled ? 0.45 : 1,
                color: it.tone === 'danger' ? 'var(--text-danger)' : 'var(--text-body)' }}>
              {it.icon && <Icon name={it.icon} size={15} />}
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.shortcut && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-subtle)' }}>{it.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
