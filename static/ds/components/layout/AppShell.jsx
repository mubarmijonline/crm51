import React from 'react';
export function AppShell({ nav, header, children, mobileHeader, mobileNav, isMobile, footer, style, ...rest }) {
  if (isMobile) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-app)', position: 'relative', overflow: 'hidden', ...style }} {...rest}>
      {mobileHeader}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>{children}</main>
      {mobileNav}
    </div>
  );
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--surface-app)', position: 'relative', overflow: 'hidden', ...style }} {...rest}>
      {nav}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {header}
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--pad-page)' }}>{children}</main>
        {footer}
      </div>
    </div>
  );
}
