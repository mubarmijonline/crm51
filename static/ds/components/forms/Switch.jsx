import React from 'react';
export function Switch({ checked, disabled, label, description, onChange, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', gap: 'var(--space-5)', alignItems: description ? 'flex-start' : 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }} {...rest}>
      <input type="checkbox" role="switch" checked={!!checked} disabled={disabled} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: 34, height: 20, flex: 'none', marginTop: description ? 2 : 0, borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--action-primary)' : 'var(--gray-300)', position: 'relative',
        transition: 'background-color var(--duration-fast) var(--ease-standard)' }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 16 : 2, width: 16, height: 16, borderRadius: '50%',
          background: 'var(--gray-0)', boxShadow: 'var(--shadow-sm)', transition: 'left var(--duration-fast) var(--ease-standard)' }} />
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
