import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Breadcrumbs({ items = [], onNavigate, style, ...rest }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--type-caption)', color: 'var(--text-muted)', ...style }} {...rest}>
      {items.map((it, i) => (
        <React.Fragment key={it.id || i}>
          {i > 0 && <span style={{ color: 'var(--text-subtle)', display: 'inline-flex' }}><Icon name="chevron-right" size={12} /></span>}
          {i === items.length - 1
            ? <span style={{ color: 'var(--text-body)' }}>{it.label}</span>
            : <button type="button" onClick={() => onNavigate && onNavigate(it.id)} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', color: 'var(--text-muted)', font: 'inherit' }}>{it.label}</button>}
        </React.Fragment>
      ))}
    </nav>
  );
}
