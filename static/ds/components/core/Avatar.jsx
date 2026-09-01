import React from 'react';
const SIZE = { xs: 20, sm: 24, md: 32, lg: 40 };
const HUES = ['--blue-100', '--green-100', '--amber-100', '--purple-100', '--red-100'];
const FG = ['--blue-700', '--green-700', '--amber-700', '--purple-600', '--red-700'];
export function Avatar({ name = '', src, size = 'md', square, style, ...rest }) {
  const px = SIZE[size] || SIZE.md;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const i = (name.charCodeAt(0) || 0) % HUES.length;
  return (
    <span title={name} style={{
      width: px, height: px, flex: 'none', borderRadius: square ? 'var(--radius-sm)' : '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      background: src ? 'var(--surface-sunken)' : `var(${HUES[i]})`, color: `var(${FG[i]})`,
      font: `var(--weight-semibold) ${px <= 24 ? 10 : 12}px/1 var(--font-sans)`,
      border: '1px solid var(--border-hairline)', ...style,
    }} {...rest}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  );
}
