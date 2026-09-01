import React from 'react';
import { Icon } from '../core/Icon.jsx';
const GLYPH = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x' };
export function Alert({ tone = 'info', title, actions, onDismiss, children, style, ...rest }) {
  return (
    <div role="status" style={{
      display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-5) var(--space-6)',
      background: `var(--status-${tone}-bg)`, border: `1px solid var(--status-${tone}-border)`,
      borderRadius: 'var(--radius-card)', color: 'var(--text-body)', ...style }} {...rest}>
      <span style={{ color: `var(--status-${tone}-fg)`, marginTop: 1 }}><Icon name={GLYPH[tone]} size={16} /></span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: 0 }}>
        {title && <strong style={{ font: 'var(--type-label)', color: `var(--status-${tone}-fg)` }}>{title}</strong>}
        {children && <div style={{ font: 'var(--type-body-sm)' }}>{children}</div>}
        {actions && <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', height: 16 }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
