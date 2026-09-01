import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
const W = { sm: 400, md: 520, lg: 720 };
export function Dialog({ open = true, title, description, size = 'md', footer, onClose, children, style, ...rest }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{ position: 'absolute', inset: 0, background: 'var(--surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', animation: 'ds-fade-in var(--duration-base) var(--ease-out)', zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: W[size], background: 'var(--surface-card)', borderRadius: 'var(--radius-overlay)',
        boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'ds-pop-in var(--duration-base) var(--ease-out)', ...style }} {...rest}>
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', padding: 'var(--space-7) var(--space-7) var(--space-5)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h2 style={{ font: 'var(--type-title)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h2>
            {description && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
          </div>
          {onClose && <IconButton icon="x" label="Close" size="sm" onClick={onClose} />}
        </header>
        <div style={{ padding: '0 var(--space-7) var(--space-7)', font: 'var(--type-body)' }}>{children}</div>
        {footer && (
          <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-app)' }}>{footer}</footer>
        )}
      </div>
    </div>
  );
}
