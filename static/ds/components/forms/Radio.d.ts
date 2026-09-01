/** Single choice from 2-5 visible options. More than five options: use Select. */
export interface RadioProps {
  checked?: boolean;
  name?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;
