/**
 * Primary product navigation: fixed-width left rail, grouped items, one active destination.
 * @startingPoint section="Navigation" subtitle="App shell rail, tabs, breadcrumbs, pagination" viewport="700x360"
 */
export interface SideNavItem { id: string; label: string; icon: string; badge?: string | number }
export interface SideNavSection { label?: string; items: SideNavItem[] }
export interface SideNavProps {
  /** Product mark / workspace switcher rendered in the top slot. */
  brand?: React.ReactNode;
  sections: SideNavSection[];
  activeId?: string;
  onSelect?: (id: string) => void;
  footer?: React.ReactNode;
  collapsed?: boolean;
  style?: React.CSSProperties;
}
export declare function SideNav(props: SideNavProps): JSX.Element;
