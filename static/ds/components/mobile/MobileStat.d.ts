/** Compact KPI tile for phone dashboards — two per row. StatCard is the desktop version. */
export interface MobileStatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: string | number;
  deltaTone?: 'auto' | 'success' | 'danger' | 'neutral';
  icon?: string;
  style?: React.CSSProperties;
}
export declare function MobileStat(props: MobileStatProps): JSX.Element;
