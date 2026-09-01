/** Short label on hover for icon-only controls and truncated text. Never put actions inside one. */
export interface TooltipProps {
  label: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
