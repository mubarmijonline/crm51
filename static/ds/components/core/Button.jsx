import React from 'react';
import { Icon } from './Icon.jsx';
const TONE = {
  primary: { background: 'var(--action-primary)', color: 'var(--action-primary-fg)', border: '1px solid var(--action-primary)' },
  secondary: { background: 'var(--action-secondary)', color: 'var(--text-body)', border: '1px solid var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--text-body)', border: '1px solid transparent' },
  danger: { background: 'var(--action-danger)', color: 'var(--action-primary-fg)', border: '1px solid var(--action-danger)' },
  link: { background: 'transparent', color: 'var(--text-link)', border: '1px solid transparent', padding: 0, height: 'auto' },
};
const HOVER = {
  primary: 'var(--action-primary-hover)', secondary: 'var(--action-secondary-hover)',
  ghost: 'var(--action-ghost-hover)', danger: 'var(--action-danger-hover)', link: 'transparent',
};
const SIZE = {
  sm: { height: 'var(--control-height-sm)', padding: '0 10px', font: 'var(--weight-medium) var(--text-sm)/1 var(--font-sans)' },
  md: { height: 'var(--control-height-md)', padding: '0 var(--control-pad-x)', font: 'var(--weight-medium) var(--text-md)/1 var(--font-sans)' },
  lg: { height: 'var(--control-height-lg)', padding: '0 18px', font: 'var(--weight-medium) var(--text-md)/1 var(--font-sans)' },
};
export function Button({ variant = 'secondary', size = 'md', iconStart, iconEnd, disabled, loading, fullWidth, children, style, onClick, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const tone = TONE[variant] || TONE.secondary;
  return (
    <button
      type="button" disabled={disabled || loading} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)} onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
        borderRadius: 'var(--radius-control)', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control)', whiteSpace: 'nowrap', width: fullWidth ? '100%' : undefined,
        ...SIZE[size], ...tone,
        background: hover && !disabled ? HOVER[variant] : tone.background,
        textDecoration: variant === 'link' && hover ? 'underline' : 'none',
        transform: active && !disabled ? 'translateY(0.5px)' : 'none',
        opacity: disabled ? 0.45 : 1, ...style,
      }} {...rest}>
      {loading ? <Icon name="loader-circle" size={size === 'sm' ? 13 : 15} style={{ animation: 'ds-spin 900ms linear infinite' }} /> : iconStart ? <Icon name={iconStart} size={size === 'sm' ? 13 : 15} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={size === 'sm' ? 13 : 15} /> : null}
    </button>
  );
}
