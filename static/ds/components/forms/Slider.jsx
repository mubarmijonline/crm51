import React from 'react';
export function Slider({ value = 0, min = 0, max = 100, step = 1, label, valueLabel, disabled, onChange, style, ...rest }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', opacity: disabled ? 0.5 : 1, ...style }} {...rest}>
      {(label || valueLabel != null) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-label)' }}>
          <span>{label}</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{valueLabel != null ? valueLabel : value}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={e => onChange && onChange(Number(e.target.value))}
        style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%', height: 4, borderRadius: 'var(--radius-pill)', outline: 'none',
          background: `linear-gradient(to right, var(--action-primary) 0%, var(--action-primary) ${pct}%, var(--surface-sunken) ${pct}%, var(--surface-sunken) 100%)`,
          cursor: disabled ? 'not-allowed' : 'pointer' }} />
    </div>
  );
}
