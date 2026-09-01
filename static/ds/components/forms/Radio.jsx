import React from 'react';
export function Radio({ checked, disabled, label, description, name, onChange, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', gap: 'var(--space-4)', alignItems: description ? 'flex-start' : 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }} {...rest}>
      <input type="radio" name={name} checked={!!checked} disabled={disabled} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: 16, height: 16, flex: 'none', marginTop: description ? 2 : 0, borderRadius: '50%',
        border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'), background: 'var(--surface-card)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition-control)' }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--action-primary)' }} />}
      </span>
      {(label || description) && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {label && <span style={{ font: 'var(--type-body)' }}>{label}</span>}
          {description && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{description}</span>}
        </span>
      )}
    </label>
  );
}
