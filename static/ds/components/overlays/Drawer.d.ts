/** Side panel for record editing and detail peeks that shouldn't lose the list behind them. Parent must be position:relative. */
export interface DrawerProps {
  open?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Drawer(props: DrawerProps): JSX.Element;
