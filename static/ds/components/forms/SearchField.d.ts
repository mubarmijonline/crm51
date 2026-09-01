/** Search input with leading glyph and a clear affordance. Standard in every table toolbar. */
export interface SearchFieldProps {
  value?: string;
  placeholder?: string;
  width?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  style?: React.CSSProperties;
}
export declare function SearchField(props: SearchFieldProps): JSX.Element;
