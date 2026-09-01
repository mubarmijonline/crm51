/** Square icon-only button for toolbars, table row actions and dismissals. Always pass a label for a11y + tooltip. */
export interface IconButtonProps {
  icon: string;
  label: string;
  variant?: 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
