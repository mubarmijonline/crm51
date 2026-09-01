import React from 'react';
// Lucide glyphs, loaded from CDN (see readme ICONOGRAPHY). Page must include the lucide UMD script.
export function Icon({ name, size = 16, strokeWidth = 1.75, color = 'currentColor', style, ...rest }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    const paint = () => {
      const el = ref.current;
      if (!el || cancelled) return false;
      if (!window.lucide) return false;
      el.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      el.appendChild(i);
      window.lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: size, height: size, 'stroke-width': strokeWidth } });
      return true;
    };
    if (!paint()) {
      const t = setInterval(() => { if (paint()) clearInterval(t); }, 120);
      setTimeout(() => clearInterval(t), 5000);
      return () => { cancelled = true; clearInterval(t); };
    }
    return () => { cancelled = true; };
  }, [name, size, strokeWidth]);
  return <span ref={ref} aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, flex: 'none', ...style }} {...rest} />;
}
