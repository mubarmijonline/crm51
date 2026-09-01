import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
const W = { sm: 360, md: 480, lg: 640 };
export function Drawer({ open = true, title, description, side = 'right', size = 'md', footer, onClose, children, style, ...rest }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)', zIndex: 60,
      display: 'flex', justifyContent: side === 'right' ? 'flex-end' : 'flex-start', animation: 'ds-fade-in var(--duration-base) var(--ease-out)' }}>
      <aside onClick={e => e.stopPropagation()} style={{ width: W[size], maxWidth: '100%', height: '100%', background: 'var(--surface-card)',
        borderLeft: side === 'right' ? '1px solid var(--border-hairline)' : 'none', borderRight: side === 'left' ? '1px solid var(--border-hairline)' : 'none',
        boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column',
        animation: 'ds-pop-in var(--duration-base) var(--ease-out)', ...style }} {...rest}>
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', padding: 'var(--space-7)', borderBottom: '1px solid var(--border-hairline)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h2 style={{ font: 'var(--type-title)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h2>
            {description && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
          </div>
          {onClose && <IconButton icon="x" label="Close" size="sm" onClick={onClose} />}
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-7)' }}>{children}</div>
        {footer && <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-app)' }}>{footer}</footer>}
      </div>
    </div>
  );
}
