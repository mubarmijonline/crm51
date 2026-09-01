/** Simple categorical bar chart for dashboard cards — revenue by month, signups by source. */
export interface BarDatum { label: string; value: number; color?: string; muted?: boolean }
export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  /** Any --viz-* token; per-bar colour overrides it. */
  color?: string;
  valueFormat?: (v: number) => string;
  showAxis?: boolean;
  style?: React.CSSProperties;
}
export declare function BarChart(props: BarChartProps): JSX.Element;
