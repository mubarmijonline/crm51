/** Native select styled to match Input. Use for <= 12 stable options; use Menu for actions. */
export interface SelectProps {
  options: Array<string | { value: string; label: string }>;
  value?: string;
  defaultValue?: string;
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
