/** Bar above a DataTable: search + filters at rest, bulk actions when rows are selected. */
export interface TableToolbarProps {
  search?: React.ReactNode;
  filters?: React.ReactNode;
  /** When > 0 the bar switches to selection mode. */
  selectionCount?: number;
  bulkActions?: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function TableToolbar(props: TableToolbarProps): JSX.Element;
