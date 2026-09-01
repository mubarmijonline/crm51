/** Determinate progress or usage meter (seats used, storage, onboarding steps). */
export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  label?: React.ReactNode;
  /** Right-aligned numeric readout, rendered in the mono face. */
  valueLabel?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
