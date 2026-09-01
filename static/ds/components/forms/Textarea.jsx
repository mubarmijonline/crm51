import React from 'react';
const fieldBase = (invalid, disabled) => ({
  width: '100%', height: 'var(--control-height-md)', padding: '0 var(--control-pad-x)',
  background: disabled ? 'var(--surface-disabled)' : 'var(--surface-card)',
  color: disabled ? 'var(--text-disabled)' : 'var(--text-body)',
  border: '1px solid ' + (invalid ? 'var(--border-danger)' : 'var(--border-strong)'),
  borderRadius: 'var(--radius-control)', font: 'var(--type-body)',
  transition: 'var(--transition-control)', outline: 'none',
});
export function Textarea({ invalid, disabled, rows = 4, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea rows={rows} disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ ...fieldBase(invalid, disabled), height: 'auto', padding: '8px var(--control-pad-x)', resize: 'vertical',
        lineHeight: 'var(--leading-normal)',
        borderColor: invalid ? 'var(--border-danger)' : focus ? 'var(--border-focus)' : 'var(--border-strong)',
        boxShadow: focus ? 'var(--focus-ring)' : 'none', ...style }} {...rest} />
  );
}
