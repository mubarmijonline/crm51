import React from 'react';
export function Kbd({ children, style, ...rest }) {
  return <kbd style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 5px',
    borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', borderBottomWidth: 2, background: 'var(--surface-card)',
    font: 'var(--weight-medium) var(--text-2xs)/1 var(--font-mono)', color: 'var(--text-muted)', ...style }} {...rest}>{children}</kbd>;
}
