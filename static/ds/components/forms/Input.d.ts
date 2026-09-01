/**
 * Single-line text field.
 */
export interface InputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Lucide glyph inside the field, left edge (search, mail, lock). */
  iconStart?: string;
  iconEnd?: string;
  invalid?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
