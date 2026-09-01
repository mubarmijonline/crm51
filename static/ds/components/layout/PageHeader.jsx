import React from 'react';
export function PageHeader({ title, description, breadcrumbs, badge, actions, tabs, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {breadcrumbs}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <h1 style={{ font: 'var(--type-title-lg)', color: 'var(--text-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h1>
            {badge}
          </div>
          {description && <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', maxWidth: 640, textWrap: 'pretty' }}>{description}</p>}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
      {tabs}
    </div>
  );
}
