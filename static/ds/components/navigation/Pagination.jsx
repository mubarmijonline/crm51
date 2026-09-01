import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
import { Select } from '../forms/Select.jsx';
export function Pagination({ page = 1, pageCount = 1, pageSize, pageSizes = [10, 25, 50, 100], total, onPageChange, onPageSizeChange, style, ...rest }) {
  const from = total != null && pageSize ? (page - 1) * pageSize + 1 : null;
  const to = total != null && pageSize ? Math.min(page * pageSize, total) : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)',
      padding: 'var(--space-5) var(--cell-pad-x)', font: 'var(--type-body-sm)', color: 'var(--text-muted)', ...style }} {...rest}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
        {from != null ? `${from}–${to} of ${total}` : `Page ${page} of ${pageCount}`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        {pageSize != null && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            Rows
            <Select size="sm" value={String(pageSize)} onChange={e => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
              options={pageSizes.map(s => ({ value: String(s), label: String(s) }))} style={{ width: 72 }} />
          </label>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <IconButton icon="chevron-left" label="Previous page" size="sm" disabled={page <= 1} onClick={() => onPageChange && onPageChange(page - 1)} />
          <IconButton icon="chevron-right" label="Next page" size="sm" disabled={page >= pageCount} onClick={() => onPageChange && onPageChange(page + 1)} />
        </div>
      </div>
    </div>
  );
}
