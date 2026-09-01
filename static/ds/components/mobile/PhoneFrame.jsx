import React from 'react';
export function PhoneFrame({ time = '9:41', children, style, ...rest }) {
  return (
    <div style={{ width: 390, height: 844, flex: 'none', borderRadius: 44, background: 'var(--gray-900)', padding: 10,
      boxShadow: 'var(--shadow-lg)', ...style }} {...rest}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden', background: 'var(--surface-app)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 'none', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 22px', background: 'var(--surface-card)', font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-sans)', color: 'var(--text-title)' }}>
          <span>{time}</span>
          <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ width: 16, height: 9, borderRadius: 2, border: '1px solid var(--text-title)', display: 'inline-block', position: 'relative' }}>
              <span style={{ position: 'absolute', inset: 1, width: 9, background: 'var(--text-title)', borderRadius: 1 }} />
            </span>
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
}
