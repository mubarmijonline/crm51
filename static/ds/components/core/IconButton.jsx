import React from 'react';
import { Icon } from './Icon.jsx';
const SIZE = { sm: 28, md: 34, lg: 40 };
export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled, active, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const bg = variant === 'secondary' ? 'var(--action-secondary)' : 'transparent';
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        width: SIZE[size], height: SIZE[size], borderRadius: 'var(--radius-control)',
        border: variant === 'secondary' ? '1px solid var(--border-strong)' : '1px solid transparent',
        background: active ? 'var(--surface-selected)' : hover && !disabled ? 'var(--action-ghost-hover)' : bg,
        color: active ? 'var(--text-brand)' : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'var(--transition-control)', ...style,
      }} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 14 : 16} />
    </button>
  );
}
