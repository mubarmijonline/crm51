/** Responsive auto-fit grid — KPI tiles, card galleries. Items reflow to one column on phones without a media query. */
export interface GridProps {
  /** Nominal desktop column count (documentation only; wrapping is driven by minItemWidth). */
  columns?: number;
  /** Minimum width before an item wraps to the next row. 220 for KPI tiles, 320 for content cards. */
  minItemWidth?: number;
  gap?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Grid(props: GridProps): JSX.Element;
