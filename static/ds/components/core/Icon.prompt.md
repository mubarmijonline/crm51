Renders one Lucide glyph; use it anywhere an icon is needed instead of hand-drawn SVG.

```jsx
<Icon name="users" size={16} />
```

The host page must load the Lucide UMD script: `<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.js"></script>`. Icons inherit `currentColor`; stroke width is 1.75 by default (2 only for 12px glyphs).
