/** Reporting date-range picker: preset list first, custom range last. Standard in dashboard and report headers. */
export interface DateRangeFieldProps {
  value?: string;
  presets?: string[];
  width?: number | string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function DateRangeField(props: DateRangeFieldProps): JSX.Element;
