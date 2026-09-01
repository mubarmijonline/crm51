/** Dropdown action list anchored to a trigger — row overflow menus, account menus, bulk actions. */
export interface MenuItem { id?: string; label?: string; icon?: string; shortcut?: string; tone?: 'default' | 'danger'; disabled?: boolean; divider?: boolean; onSelect?: () => void }
export interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  onSelect?: (id?: string) => void;
  style?: React.CSSProperties;
}
export declare function Menu(props: MenuProps): JSX.Element;
