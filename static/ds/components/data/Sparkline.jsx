import React from 'react';
export function Sparkline({ data = [], width = '100%', height = 40, color = 'var(--viz-1)', fill = true, style, ...rest }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 100 - ((v - min) / span) * 100]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const area = `${line} L100,100 L0,100 Z`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width, height, display: 'block', overflow: 'visible', ...style }} {...rest}>
      {fill && <path d={area} fill={color} opacity="0.08" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
