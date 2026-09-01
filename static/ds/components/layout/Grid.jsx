import React from 'react';
export function Grid({ columns = 4, minItemWidth = 220, gap = 'var(--space-6)', children, style, ...rest }) {
  return (
    <div style={{ display: 'grid', gap,
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}px, 100%), 1fr))`,
      ...(columns ? { gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}px, 100%), 1fr))` } : null), ...style }} {...rest}>
      {children}
    </div>
  );
}
