import React from 'react';
export function Section({ title, description, actions, children, style, ...rest }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', ...style }} {...rest}>
      {(title || actions) && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            {title && <h2 style={{ font: 'var(--type-section)', color: 'var(--text-title)' }}>{title}</h2>}
            {description && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 'none' }}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
