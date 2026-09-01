import React from 'react';
import { Input } from './Input.jsx';
import { Icon } from '../core/Icon.jsx';
export function SearchField({ value, onChange, onClear, placeholder = 'Search', width = 260, style, ...rest }) {
  return (
    <div style={{ position: 'relative', width, ...style }} {...rest}>
      <Input iconStart="search" value={value} onChange={onChange} placeholder={placeholder} />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={onClear}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex' }}>
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}
