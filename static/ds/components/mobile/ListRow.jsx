import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function ListRow({ title, subtitle, meta, metaSub, leading, trailing, chevron = true, onClick, style, ...rest }) {
  const [press, setPress] = React.useState(false);
  return (
    <div role={onClick ? 'button' : undefined} onClick={onClick}
      onTouchStart={() => setPress(true)} onTouchEnd={() => setPress(false)}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)} onMouseLeave={() => setPress(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', minHeight: 'var(--mobile-row-height)',
        padding: 'var(--space-5) var(--mobile-pad-page)', background: press ? 'var(--surface-active)' : 'var(--surface-card)',
        borderBottom: '1px solid var(--border-hairline)', cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color var(--duration-instant) var(--ease-standard)', ...style }} {...rest}>
      {leading}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: 'var(--weight-medium) var(--text-md)/1.3 var(--font-sans)', color: 'var(--text-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        {subtitle && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</span>}
      </div>
      {(meta || metaSub) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flex: 'none' }}>
          {meta && <span style={{ font: 'var(--weight-medium) var(--text-md)/1.3 var(--font-mono)', color: 'var(--text-title)' }}>{meta}</span>}
          {metaSub}
        </div>
      )}
      {trailing}
      {chevron && onClick && <Icon name="chevron-right" size={16} color="var(--text-subtle)" />}
    </div>
  );
}
