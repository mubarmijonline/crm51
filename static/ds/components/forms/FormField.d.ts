/** Label + control + hint/error wrapper. Every form control in a page layout should sit in one. */
export interface FormFieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** When set, replaces the hint and turns the message red. */
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function FormField(props: FormFieldProps): JSX.Element;
