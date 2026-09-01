/** Modal for focused tasks and destructive confirmations. Positioned absolutely — its parent must be position:relative. */
export interface DialogProps {
  open?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Dialog(props: DialogProps): JSX.Element;
