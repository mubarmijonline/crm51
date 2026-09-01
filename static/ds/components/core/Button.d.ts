/**
 * Primary action control. One primary button per view; everything else secondary or ghost.
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide icon name rendered before the label. */
  iconStart?: string;
  /** Lucide icon name rendered after the label. */
  iconEnd?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
