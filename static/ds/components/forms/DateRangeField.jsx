import React from 'react';
import { Icon } from '../core/Icon.jsx';
const PRESETS = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Year to date', 'Custom range'];
export function DateRangeField({ value = 'Last 30 days', presets = PRESETS, onChange, width = 200, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', width, ...style }} {...rest}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', height: 'var(--control-height-md)', padding: '0 var(--control-pad-x)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          background: 'var(--surface-card)', border: '1px solid ' + (open ? 'var(--border-focus)' : 'var(--border-strong)'),
          boxShadow: open ? 'var(--focus-ring)' : 'none', borderRadius: 'var(--radius-control)', cursor: 'pointer', font: 'var(--type-body)', transition: 'var(--transition-control)' }}>
        <Icon name="calendar" size={15} color="var(--text-muted)" />
        <span style={{ flex: 1, textAlign: 'left' }}>{value}</span>
        <Icon name="chevron-down" size={15} color="var(--text-muted)" />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '100%', zIndex: 55, padding: 'var(--space-3)',
          background: 'var(--surface-card)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--elevation-popover)', animation: 'ds-pop-in var(--duration-fast) var(--ease-out)' }}>
          {presets.map(p => (
            <button key={p} type="button" onClick={() => { onChange && onChange(p); setOpen(false); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--action-ghost-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = p === value ? 'var(--surface-selected)' : 'transparent'; }}
              style={{ display: 'block', width: '100%', height: 30, padding: '0 var(--space-4)', border: 0, borderRadius: 'var(--radius-xs)',
                textAlign: 'left', cursor: 'pointer', font: 'var(--type-body-sm)', whiteSpace: 'nowrap',
                background: p === value ? 'var(--surface-selected)' : 'transparent', color: p === value ? 'var(--text-brand)' : 'var(--text-body)' }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
