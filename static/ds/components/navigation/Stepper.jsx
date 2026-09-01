import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Stepper({ steps = [], current = 0, orientation = 'horizontal', style, ...rest }) {
  const vertical = orientation === 'vertical';
  return (
    <ol style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 'var(--space-6)' : 'var(--space-5)',
      listStyle: 'none', margin: 0, padding: 0, ...style }} {...rest}>
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={i} style={{ display: 'flex', alignItems: vertical ? 'flex-start' : 'center', gap: 'var(--space-5)', flex: vertical ? 'none' : 1, minWidth: 0 }}>
            <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'var(--action-primary)' : active ? 'var(--surface-card)' : 'var(--surface-sunken)',
              border: '1px solid ' + (done || active ? 'var(--action-primary)' : 'var(--border-strong)'),
              color: done ? 'var(--action-primary-fg)' : active ? 'var(--text-brand)' : 'var(--text-subtle)',
              font: 'var(--weight-semibold) var(--text-2xs)/1 var(--font-mono)' }}>
              {done ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span style={{ font: active ? 'var(--weight-semibold) var(--text-md)/1.3 var(--font-sans)' : 'var(--type-body)', color: active || done ? 'var(--text-title)' : 'var(--text-muted)' }}>{s.label}</span>
              {s.description && <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{s.description}</span>}
            </span>
            {!vertical && i < steps.length - 1 && <span style={{ flex: 1, height: 1, background: done ? 'var(--action-primary)' : 'var(--border-hairline)', minWidth: 16 }} />}
          </li>
        );
      })}
    </ol>
  );
}
