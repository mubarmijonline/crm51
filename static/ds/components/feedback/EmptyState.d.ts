/** Zero-data state for tables, lists and panels. Always offer the next action. */
export interface EmptyStateProps {
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
