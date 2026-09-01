/** Renders a single Lucide glyph at a token-sized box. */
export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "chevron-down"). */
  name: string;
  /** Pixel box, default 16. Use 16 in controls, 20 in nav, 24 in empty states. */
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
