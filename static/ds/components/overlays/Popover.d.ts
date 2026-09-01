/** Anchored panel for filter builders, column pickers and inline detail. Menu is for actions; Popover holds controls. */
export interface PopoverProps {
  trigger: React.ReactNode;
  title?: React.ReactNode;
  align?: 'start' | 'end';
  width?: number | string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Popover(props: PopoverProps): JSX.Element;
