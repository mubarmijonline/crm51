/** Ancestor trail above a detail page title. Last crumb is the current page and is not a link. */
export interface Crumb { id?: string; label: string }
export interface BreadcrumbsProps { items: Crumb[]; onNavigate?: (id?: string) => void; style?: React.CSSProperties }
export declare function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
