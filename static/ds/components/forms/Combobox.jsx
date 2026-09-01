import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Combobox({ options = [], value, placeholder = 'Select…', onChange, width = '100%', disabled, invalid, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => {
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);
  const norm = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  const shown = norm.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
  const current = norm.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative', width, ...style }} {...rest}>
      <button type="button" disabled={disabled} onClick={() => { setOpen(o => !o); setQ(''); }}
        style={{ width: '100%', height: 'var(--control-height-md)', padding: '0 var(--control-pad-x)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          background: disabled ? 'var(--surface-disabled)' : 'var(--surface-card)', cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid ' + (invalid ? 'var(--border-danger)' : open ? 'var(--border-focus)' : 'var(--border-strong)'),
          boxShadow: open ? 'var(--focus-ring)' : 'none', borderRadius: 'var(--radius-control)', font: 'var(--type-body)',
          color: current ? 'var(--text-body)' : 'var(--text-subtle)', transition: 'var(--transition-control)' }}>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current ? current.label : placeholder}</span>
        <Icon name="chevron-down" size={15} color="var(--text-muted)" />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 55, background: 'var(--surface-card)',
          border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-popover)', overflow: 'hidden',
          animation: 'ds-pop-in var(--duration-fast) var(--ease-out)' }}>
          <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Icon name="search" size={14} color="var(--text-subtle)" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Filter…"
              style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: 'var(--type-body-sm)' }} />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: 'var(--space-3)' }}>
            {shown.length === 0 && <div style={{ padding: 'var(--space-5)', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>No matches</div>}
            {shown.map(o => (
              <button key={o.value} type="button" onClick={() => { onChange && onChange(o.value); setOpen(false); }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--action-ghost-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = o.value === value ? 'var(--surface-selected)' : 'transparent'; }}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width: '100%', height: 32, padding: '0 var(--space-4)', border: 0,
                  borderRadius: 'var(--radius-xs)', cursor: 'pointer', textAlign: 'left', font: 'var(--type-body-sm)',
                  background: o.value === value ? 'var(--surface-selected)' : 'transparent', color: o.value === value ? 'var(--text-brand)' : 'var(--text-body)' }}>
                <span style={{ flex: 1 }}>{o.label}</span>
                {o.value === value && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
