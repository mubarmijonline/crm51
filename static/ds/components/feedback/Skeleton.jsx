import React from 'react';
export function Skeleton({ width = '100%', height = 12, radius = 'var(--radius-xs)', lines = 1, style, ...rest }) {
  const bar = i => (
    <span key={i} style={{ display: 'block', width: lines > 1 && i === lines - 1 ? '60%' : width, height,
      borderRadius: radius, background: 'linear-gradient(90deg, var(--gray-100) 0px, var(--gray-200) 60px, var(--gray-100) 120px)',
      backgroundSize: '200px 100%', animation: 'ds-shimmer 1.4s ease-in-out infinite' }} />
  );
  return <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }} {...rest}>{Array.from({ length: lines }, (_, i) => bar(i))}</span>;
}
