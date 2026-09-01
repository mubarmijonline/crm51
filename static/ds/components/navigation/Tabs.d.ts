/** In-page view switch. Underline for page-level sections, pill for compact filter switches inside a card. */
export interface TabItem { id: string; label: string; icon?: string; count?: number }
export interface TabsProps {
  tabs: TabItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  variant?: 'underline' | 'pill';
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
