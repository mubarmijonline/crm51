import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Tabs({ tabs = [], activeId, onSelect, variant = 'underline', style, ...rest }) {
  const pill = variant === 'pill';
  return (
    <div role="tablist" style={{ display: 'flex', alignItems: 'center', gap: pill ? 'var(--space-2)' : 'var(--space-7)',
      borderBottom: pill ? 'none' : '1px solid var(--border-hairline)',
      background: pill ? 'var(--surface-sunken)' : 'transparent', padding: pill ? '3px' : 0,
      borderRadius: pill ? 'var(--radius-control)' : 0, width: pill ? 'fit-content' : '100%', ...style }} {...rest}>
      {tabs.map(t => {
        const active = t.id === activeId;
        return (
          <button key={t.id} role="tab" aria-selected={active} type="button" onClick={() => onSelect && onSelect(t.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer',
              border: 0, background: pill && active ? 'var(--surface-card)' : 'transparent',
              boxShadow: pill && active ? 'var(--shadow-xs)' : 'none',
              borderRadius: pill ? 'var(--radius-xs)' : 0,
              padding: pill ? '5px 10px' : '0 0 9px',
              borderBottom: pill ? 'none' : '2px solid ' + (active ? 'var(--action-primary)' : 'transparent'),
              marginBottom: pill ? 0 : -1,
              color: active ? (pill ? 'var(--text-title)' : 'var(--text-brand)') : 'var(--text-muted)',
              font: 'var(--weight-medium) var(--text-md)/1.4 var(--font-sans)', transition: 'var(--transition-control)' }}>
            {t.icon && <Icon name={t.icon} size={15} />}
            {t.label}
            {t.count != null && (
              <span style={{ font: 'var(--type-caption)', fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 'var(--radius-xs)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
