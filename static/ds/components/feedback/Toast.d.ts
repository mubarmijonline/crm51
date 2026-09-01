/** Transient dark confirmation, bottom-left of the viewport, auto-dismissing after ~5s. */
export interface ToastProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
