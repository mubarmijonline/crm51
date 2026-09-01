/** Standard page opener: breadcrumbs, title (+ status badge), description, actions, and optional tabs underneath. */
export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PageHeader(props: PageHeaderProps): JSX.Element;
