import React from 'react';
export function Popover({ trigger, title, align = 'start', width = 260, children, style, ...rest }) {
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
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', [align === 'end' ? 'right' : 'left']: 0, zIndex: 55, width,
          background: 'var(--surface-card)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--elevation-popover)', animation: 'ds-pop-in var(--duration-fast) var(--ease-out)' }}>
          {title && <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-hairline)', font: 'var(--type-label)', color: 'var(--text-title)' }}>{title}</div>}
          <div style={{ padding: 'var(--space-6)', font: 'var(--type-body-sm)' }}>{children}</div>
        </div>
      )}
    </span>
  );
}
