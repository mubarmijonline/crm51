/** Searchable single-select for long option lists (customers, countries, owners). Under ~12 stable options use Select. */
export interface ComboboxProps {
  options: Array<string | { value: string; label: string }>;
  value?: string;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
  invalid?: boolean;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function Combobox(props: ComboboxProps): JSX.Element;
