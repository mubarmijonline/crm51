/** Compact exclusive switch for 2-4 short options (ranges, views, modes). More options or long labels: use Select. */
export interface SegmentedControlProps {
  options: Array<string | { value: string; label: string; icon?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
