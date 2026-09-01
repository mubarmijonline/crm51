/** App header: page title / breadcrumbs on the left, global search in the middle, account + primary action on the right. */
export interface TopBarProps {
  title?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  /** Centre slot — usually global search. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function TopBar(props: TopBarProps): JSX.Element;
