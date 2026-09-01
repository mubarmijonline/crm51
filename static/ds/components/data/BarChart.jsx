import React from 'react';
export function BarChart({ data = [], height = 160, color = 'var(--viz-1)', valueFormat, showAxis = true, style, ...rest }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height, borderBottom: showAxis ? '1px solid var(--viz-grid)' : 'none', paddingBottom: 1 }}>
        {data.map((d, i) => (
          <div key={i} title={`${d.label}: ${valueFormat ? valueFormat(d.value) : d.value}`}
            style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', height: `${(d.value / max) * 100}%`, background: d.color || color, opacity: d.muted ? 0.35 : 1,
              borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0', transition: 'height var(--duration-slow) var(--ease-standard)' }} />
          </div>
        ))}
      </div>
      {showAxis && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {data.map((d, i) => (
            <span key={i} style={{ flex: 1, minWidth: 0, textAlign: 'center', font: 'var(--type-caption)', color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
