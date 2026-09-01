import React from 'react';
import { Icon } from './Icon.jsx';
export function Tag({ children, onRemove, interactive, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', padding: '3px 8px',
        borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-hairline)',
        background: interactive && hover ? 'var(--surface-active)' : 'var(--surface-sunken)',
        color: 'var(--text-body)', font: 'var(--type-caption)', cursor: interactive ? 'pointer' : 'default', ...style,
      }} {...rest}>
      {children}
      {onRemove && (
        <button type="button" aria-label="Remove" onClick={onRemove}
          style={{ display: 'inline-flex', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Icon name="x" size={12} strokeWidth={2} />
        </button>
      )}
    </span>
  );
}
