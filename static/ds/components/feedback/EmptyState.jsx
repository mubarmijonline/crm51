import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function EmptyState({ icon = 'inbox', title, description, action, compact, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)',
      padding: compact ? 'var(--space-8)' : 'var(--space-11) var(--space-8)', ...style }} {...rest}>
      <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-card)', background: 'var(--surface-sunken)',
        color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} />
      </span>
      <h4 style={{ font: 'var(--type-section)', color: 'var(--text-title)' }}>{title}</h4>
      {description && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', maxWidth: 380 }}>{description}</p>}
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
}
