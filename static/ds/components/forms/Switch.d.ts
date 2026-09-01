/** Immediate on/off setting — applies instantly, no Save button. For form values that need saving, use Checkbox. */
export interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}
export declare function Switch(props: SwitchProps): JSX.Element;
