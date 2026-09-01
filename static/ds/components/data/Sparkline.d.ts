/** Minimal trend line for KPI tiles and table cells. No axes, no labels — the number carries the meaning. */
export interface SparklineProps {
  data: number[];
  width?: number | string;
  height?: number | string;
  /** Any --viz-* token; defaults to --viz-1. */
  color?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}
export declare function Sparkline(props: SparklineProps): JSX.Element;
