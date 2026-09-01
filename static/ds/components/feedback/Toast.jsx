import React from 'react';
import { Icon } from '../core/Icon.jsx';
const GLYPH = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x' };
export function Toast({ tone = 'info', title, description, action, onDismiss, style, ...rest }) {
  return (
    <div role="alert" style={{
      display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start', minWidth: 320, maxWidth: 420,
      padding: 'var(--space-5) var(--space-6)', background: 'var(--surface-inverse)', color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-dialog)',
      animation: 'ds-pop-in var(--duration-base) var(--ease-out)', ...style }} {...rest}>
      <span style={{ marginTop: 1, color: tone === 'danger' ? 'var(--red-100)' : tone === 'success' ? 'var(--green-100)' : 'var(--blue-100)' }}><Icon name={GLYPH[tone]} size={16} /></span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <strong style={{ font: 'var(--type-label)' }}>{title}</strong>
        {description && <span style={{ font: 'var(--type-caption)', color: 'var(--gray-300)' }}>{description}</span>}
      </div>
      {action}
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} style={{ border: 0, background: 'transparent', color: 'var(--gray-400)', cursor: 'pointer', display: 'inline-flex' }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
