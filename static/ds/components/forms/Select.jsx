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
export function Select({ options = [], invalid, disabled, size = 'md', style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-height-sm)' : size === 'lg' ? 'var(--control-height-lg)' : 'var(--control-height-md)';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      <select disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ ...fieldBase(invalid, disabled), height: h, appearance: 'none', paddingRight: 30, cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: invalid ? 'var(--border-danger)' : focus ? 'var(--border-focus)' : 'var(--border-strong)',
          boxShadow: focus ? 'var(--focus-ring)' : 'none', ...style }} {...rest}>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}><Icon name="chevron-down" size={15} /></span>
    </div>
  );
}
