/** Bottom tab bar — the primary navigation on phones; 3-5 destinations, never actions. Respects the safe-area inset. */
export interface TabBarItem { id: string; label: string; icon: string; badge?: string | number }
export interface TabBarProps { items: TabBarItem[]; activeId?: string; onSelect?: (id: string) => void; style?: React.CSSProperties }
export declare function TabBar(props: TabBarProps): JSX.Element;
