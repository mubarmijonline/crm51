import React from 'react';
export function TableToolbar({ search, filters, selectionCount = 0, bulkActions, actions, style, ...rest }) {
  const selecting = selectionCount > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-5) var(--cell-pad-x)',
      borderBottom: '1px solid var(--border-hairline)', background: selecting ? 'var(--surface-selected)' : 'transparent',
      transition: 'background-color var(--duration-fast) var(--ease-standard)', ...style }} {...rest}>
      {selecting ? (
        <>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-brand)' }}>{selectionCount} selected</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>{bulkActions}</div>
        </>
      ) : (
        <>
          {search}
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>{filters}</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>{actions}</div>
        </>
      )}
    </div>
  );
}
