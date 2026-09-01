import React from 'react';
export function Tooltip({ label, placement = 'top', children, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const pos = placement === 'bottom'
    ? { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' }
    : placement === 'left' ? { right: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' }
    : placement === 'right' ? { left: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' }
    : { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' };
  return (
    <span style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} {...rest}>
      {children}
      {open && (
        <span role="tooltip" style={{ position: 'absolute', ...pos, zIndex: 70, padding: '4px 8px', borderRadius: 'var(--radius-xs)',
          background: 'var(--surface-inverse)', color: 'var(--text-inverse)', font: 'var(--type-caption)', whiteSpace: 'nowrap',
          boxShadow: 'var(--elevation-popover)', animation: 'ds-fade-in var(--duration-fast) var(--ease-out)' }}>{label}</span>
      )}
    </span>
  );
}
