import React from 'react';
export function Spinner({ size = 16, color = 'var(--text-muted)', style, ...rest }) {
  return (
    <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border-hairline)`, borderTopColor: color,
      animation: 'ds-spin 800ms linear infinite', ...style }} {...rest} />
  );
}
