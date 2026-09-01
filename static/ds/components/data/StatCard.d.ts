/**
 * Single KPI tile for dashboard grids: label, big mono value, trend delta, optional sparkline.
 */
export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** e.g. "+12.4%" — the sign drives the colour when deltaTone is "auto". */
  delta?: string | number;
  deltaTone?: 'auto' | 'success' | 'danger' | 'neutral';
  caption?: React.ReactNode;
  icon?: string;
  /** Usually a <Sparkline />. */
  chart?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
