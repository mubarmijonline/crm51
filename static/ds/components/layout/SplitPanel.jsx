import React from 'react';
export function SplitPanel({ main, aside, asideWidth = 320, side = 'right', stacked, gap = 'var(--space-6)', style, ...rest }) {
  if (stacked) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }} {...rest}>{main}{aside}</div>
  );
  return (
    <div style={{ display: 'grid', gap, alignItems: 'start',
      gridTemplateColumns: side === 'right' ? `minmax(0,1fr) ${asideWidth}px` : `${asideWidth}px minmax(0,1fr)`, ...style }} {...rest}>
      {side === 'right' ? <>{main}{aside}</> : <>{aside}{main}</>}
    </div>
  );
}
