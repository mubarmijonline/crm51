import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function FileUpload({ accept = 'CSV up to 20 MB', files = [], onRemove, onSelect, style, ...rest }) {
  const [over, setOver] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', ...style }} {...rest}>
      <div onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); onSelect && onSelect(); }}
        onClick={onSelect}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-9)', cursor: 'pointer',
          border: '1px dashed ' + (over ? 'var(--border-focus)' : 'var(--border-strong)'), borderRadius: 'var(--radius-card)',
          background: over ? 'var(--surface-selected)' : 'var(--surface-app)', transition: 'var(--transition-control)' }}>
        <Icon name="upload" size={20} color="var(--text-subtle)" />
        <span style={{ font: 'var(--type-label)', color: 'var(--text-body)' }}>Drop a file or click to browse</span>
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{accept}</span>
      </div>
      {files.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-4) var(--space-5)',
          border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)' }}>
          <Icon name="file-text" size={16} color="var(--text-muted)" />
          <span style={{ flex: 1, font: 'var(--type-body-sm)' }}>{f.name}</span>
          <span style={{ font: 'var(--type-caption)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{f.size}</span>
          <button type="button" aria-label="Remove file" onClick={() => onRemove && onRemove(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex' }}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
