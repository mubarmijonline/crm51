import React from 'react';
export function Toolbar({ start, end, sticky, style, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap',
      padding: sticky ? 'var(--space-5) 0' : 0, position: sticky ? 'sticky' : undefined, top: sticky ? 0 : undefined,
      background: sticky ? 'var(--surface-app)' : 'transparent', zIndex: sticky ? 5 : undefined, ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>{start}</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>{end}</div>
    </div>
  );
}
