import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function SegmentedControl({ options = [], value, onChange, size = 'md', fullWidth, style, ...rest }) {
  return (
    <div role="radiogroup" style={{ display: 'inline-flex', padding: 3, gap: 2, background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-control)', width: fullWidth ? '100%' : 'fit-content', ...style }} {...rest}>
      {options.map(o => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const on = opt.value === value;
        return (
          <button key={opt.value} type="button" role="radio" aria-checked={on} onClick={() => onChange && onChange(opt.value)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', flex: fullWidth ? 1 : 'none',
              height: size === 'sm' ? 24 : 28, padding: '0 10px', border: 0, borderRadius: 'var(--radius-xs)', cursor: 'pointer',
              background: on ? 'var(--surface-card)' : 'transparent', boxShadow: on ? 'var(--shadow-xs)' : 'none',
              color: on ? 'var(--text-title)' : 'var(--text-muted)',
              font: `var(--weight-medium) ${size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)'}/1 var(--font-sans)`,
              transition: 'var(--transition-control)' }}>
            {opt.icon && <Icon name={opt.icon} size={14} />}{opt.label}
          </button>
        );
      })}
    </div>
  );
}
