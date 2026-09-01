import React from 'react';
export function BottomSheet({ open = true, title, description, actions, onClose, children, style, ...rest }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 65, background: 'var(--surface-overlay)',
      display: 'flex', alignItems: 'flex-end', animation: 'ds-fade-in var(--duration-base) var(--ease-out)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '85%', background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', boxShadow: 'var(--elevation-dialog)', display: 'flex', flexDirection: 'column',
        paddingBottom: 'var(--safe-bottom)', animation: 'ds-sheet-up var(--duration-base) var(--ease-out)', ...style }} {...rest}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4) 0 var(--space-2)' }}>
          <span style={{ width: 36, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--gray-300)' }} />
        </div>
        {(title || description) && (
          <div style={{ padding: 'var(--space-5) var(--mobile-pad-page) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {title && <h2 style={{ font: 'var(--type-title)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h2>}
            {description && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--mobile-pad-page) var(--space-7)' }}>{children}</div>
        {actions && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-6) var(--mobile-pad-page)', borderTop: '1px solid var(--border-hairline)' }}>{actions}</div>}
      </div>
    </div>
  );
}
