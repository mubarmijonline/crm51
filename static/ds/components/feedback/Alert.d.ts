/** Inline, persistent message tied to a page or section (banner). Transient confirmations use Toast. */
export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Alert(props: AlertProps): JSX.Element;
