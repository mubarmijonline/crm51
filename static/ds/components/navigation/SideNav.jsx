import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function SideNav({ brand, sections = [], activeId, onSelect, footer, collapsed, style, ...rest }) {
  return (
    <nav style={{ width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)', flex: 'none',
      background: 'var(--surface-card)', borderRight: '1px solid var(--border-hairline)',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      transition: 'width var(--duration-base) var(--ease-standard)', ...style }} {...rest}>
      {brand && <div style={{ height: 'var(--topbar-height)', display: 'flex', alignItems: 'center', padding: '0 var(--space-6)', borderBottom: '1px solid var(--border-hairline)' }}>{brand}</div>}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5) var(--space-4)' }}>
        {sections.map((s, si) => (
          <div key={si} style={{ marginBottom: 'var(--space-6)' }}>
            {s.label && !collapsed && (
              <div style={{ font: 'var(--type-overline)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '0 var(--space-4) var(--space-3)' }}>{s.label}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {s.items.map(it => {
                const active = it.id === activeId;
                return (
                  <button key={it.id} type="button" onClick={() => onSelect && onSelect(it.id)} title={it.label}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', height: 34, padding: '0 var(--space-4)',
                      border: 0, borderRadius: 'var(--radius-control)', cursor: 'pointer', textAlign: 'left', width: '100%',
                      background: active ? 'var(--surface-selected)' : 'transparent',
                      color: active ? 'var(--text-brand)' : 'var(--text-body)',
                      font: active ? 'var(--weight-medium) var(--text-md)/1 var(--font-sans)' : 'var(--weight-regular) var(--text-md)/1 var(--font-sans)',
                      transition: 'var(--transition-control)' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--action-ghost-hover)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                    <Icon name={it.icon} size={16} />
                    {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>}
                    {!collapsed && it.badge ? <span style={{ font: 'var(--type-caption)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{it.badge}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {footer && <div style={{ borderTop: '1px solid var(--border-hairline)', padding: 'var(--space-5)' }}>{footer}</div>}
    </nav>
  );
}
