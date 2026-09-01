import React from 'react';
import { Icon } from '../core/Icon.jsx';
const fieldBase = (invalid, disabled) => ({
  width: '100%', height: 'var(--control-height-md)', padding: '0 var(--control-pad-x)',
  background: disabled ? 'var(--surface-disabled)' : 'var(--surface-card)',
  color: disabled ? 'var(--text-disabled)' : 'var(--text-body)',
  border: '1px solid ' + (invalid ? 'var(--border-danger)' : 'var(--border-strong)'),
  borderRadius: 'var(--radius-control)', font: 'var(--type-body)',
  transition: 'var(--transition-control)', outline: 'none',
});
export function Input({ iconStart, iconEnd, invalid, disabled, size = 'md', style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-height-sm)' : size === 'lg' ? 'var(--control-height-lg)' : 'var(--control-height-md)';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      {iconStart && <span style={{ position: 'absolute', left: 10, color: 'var(--text-subtle)', pointerEvents: 'none' }}><Icon name={iconStart} size={15} /></span>}
      <input disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ ...fieldBase(invalid, disabled), height: h,
          paddingLeft: iconStart ? 32 : 'var(--control-pad-x)', paddingRight: iconEnd ? 32 : 'var(--control-pad-x)',
          borderColor: invalid ? 'var(--border-danger)' : focus ? 'var(--border-focus)' : 'var(--border-strong)',
          boxShadow: focus ? (invalid ? 'var(--focus-ring-danger)' : 'var(--focus-ring)') : 'none', ...style }} {...rest} />
      {iconEnd && <span style={{ position: 'absolute', right: 10, color: 'var(--text-subtle)' }}><Icon name={iconEnd} size={15} /></span>}
    </div>
  );
}
