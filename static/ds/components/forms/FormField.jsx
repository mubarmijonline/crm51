import React from 'react';
export function FormField({ label, hint, error, required, htmlFor, children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: 0, ...style }} {...rest}>
      {label && (
        <label htmlFor={htmlFor} style={{ font: 'var(--type-label)', color: 'var(--text-body)', display: 'flex', gap: '4px' }}>
          {label}{required && <span style={{ color: 'var(--text-danger)' }}>*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p style={{ font: 'var(--type-caption)', color: error ? 'var(--text-danger)' : 'var(--text-muted)' }}>{error || hint}</p>
      )}
    </div>
  );
}
