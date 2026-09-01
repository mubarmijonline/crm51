/** Bounded numeric input where the exact value matters less than the relative position (limits, thresholds, weights). */
export interface SliderProps {
  value: number; min?: number; max?: number; step?: number;
  label?: React.ReactNode;
  /** Formatted readout; defaults to the raw value. */
  valueLabel?: React.ReactNode;
  disabled?: boolean;
  onChange?: (value: number) => void;
  style?: React.CSSProperties;
}
export declare function Slider(props: SliderProps): JSX.Element;
