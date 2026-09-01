/** Progress through a multi-step task: onboarding, import wizards, verification flows. */
export interface Step { label: string; description?: string }
export interface StepperProps {
  steps: Step[];
  /** Zero-based index of the active step; earlier steps render as complete. */
  current?: number;
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}
export declare function Stepper(props: StepperProps): JSX.Element;
