import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Checkbox({ checked, indeterminate, disabled, label, description, onChange, style, ...rest }) {
  const on = checked || indeterminate;
  return (
    <label style={{ display: 'inline-flex', gap: 'var(--space-4)', alignItems: description ? 'flex-start' : 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }} {...rest}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: 16, height: 16, flex: 'none', marginTop: description ? 2 : 0,
        borderRadius: 'var(--radius-xs)', border: '1px solid ' + (on ? 'var(--action-primary)' : 'var(--border-strong)'),
        background: on ? 'var(--action-primary)' : 'var(--surface-card)', color: 'var(--action-primary-fg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition-control)' }}>
        {indeterminate ? <Icon name="minus" size={12} strokeWidth={3} /> : checked ? <Icon name="check" size={12} strokeWidth={3} /> : null}
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
