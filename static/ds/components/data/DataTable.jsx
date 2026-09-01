import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Checkbox } from '../forms/Checkbox.jsx';
export function DataTable({ columns = [], rows = [], selectable, selectedIds = [], onSelectionChange, rowKey = 'id', sort, onSortChange, onRowClick, stickyHeader = true, zebra, footer, style, ...rest }) {
  const allOn = rows.length > 0 && selectedIds.length === rows.length;
  const someOn = selectedIds.length > 0 && !allOn;
  const toggleAll = () => onSelectionChange && onSelectionChange(allOn ? [] : rows.map(r => r[rowKey]));
  const toggleOne = id => onSelectionChange && onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  const align = c => c.align || (c.numeric ? 'right' : 'left');
  return (
    <div style={{ width: '100%', overflowX: 'auto', ...style }} {...rest}>
      <table style={{ width: '100%', borderCollapse: 'collapse', font: 'var(--weight-regular) var(--table-font)/var(--leading-normal) var(--font-sans)' }}>
        <thead>
          <tr style={{ background: 'var(--surface-app)', position: stickyHeader ? 'sticky' : undefined, top: 0, zIndex: 1 }}>
            {selectable && (
              <th style={{ width: 40, padding: '0 0 0 var(--cell-pad-x)', height: 40, borderBottom: '1px solid var(--border-hairline)' }}>
                <Checkbox checked={allOn} indeterminate={someOn} onChange={toggleAll} />
              </th>
            )}
            {columns.map(c => {
              const sorted = sort && sort.key === c.key;
              return (
                <th key={c.key} style={{ textAlign: align(c), height: 40, padding: '0 var(--cell-pad-x)', width: c.width,
                  borderBottom: '1px solid var(--border-hairline)', whiteSpace: 'nowrap',
                  font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-sans)', letterSpacing: 'var(--tracking-caps)',
                  textTransform: 'uppercase', color: 'var(--text-muted)', cursor: c.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                  onClick={() => c.sortable && onSortChange && onSortChange({ key: c.key, dir: sorted && sort.dir === 'asc' ? 'desc' : 'asc' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: align(c) === 'right' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    {c.header}
                    {c.sortable && <Icon name={sorted ? (sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down'} size={12} color={sorted ? 'var(--text-brand)' : 'var(--text-subtle)'} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => {
            const id = r[rowKey];
            const on = selectedIds.includes(id);
            return (
              <tr key={id ?? ri} onClick={() => onRowClick && onRowClick(r)}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = on ? 'var(--surface-selected)' : zebra && ri % 2 ? 'var(--gray-25)' : 'transparent'; }}
                style={{ background: on ? 'var(--surface-selected)' : zebra && ri % 2 ? 'var(--gray-25)' : 'transparent',
                  cursor: onRowClick ? 'pointer' : 'default', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}>
                {selectable && (
                  <td onClick={e => e.stopPropagation()} style={{ width: 40, padding: '0 0 0 var(--cell-pad-x)', height: 'var(--row-height)', borderBottom: '1px solid var(--border-hairline)' }}>
                    <Checkbox checked={on} onChange={() => toggleOne(id)} />
                  </td>
                )}
                {columns.map(c => (
                  <td key={c.key} style={{ textAlign: align(c), height: 'var(--row-height)', padding: '0 var(--cell-pad-x)',
                    borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-body)',
                    fontFamily: c.numeric ? 'var(--font-mono)' : undefined,
                    fontVariantNumeric: c.numeric ? 'tabular-nums' : undefined, whiteSpace: c.wrap ? 'normal' : 'nowrap' }}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {footer}
    </div>
  );
}
