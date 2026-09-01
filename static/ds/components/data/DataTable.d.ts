/**
 * The workhorse table: sortable headers, row selection, per-column renderers, sticky header, density-aware rows.
 * @startingPoint section="Data" subtitle="Sortable, selectable data table with toolbar" viewport="700x340"
 */
export interface DataTableColumn<R = any> {
  key: string;
  header: React.ReactNode;
  /** Right-aligns and switches the cell to the tabular mono face. */
  numeric?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  sortable?: boolean;
  wrap?: boolean;
  render?: (row: R) => React.ReactNode;
}
export interface DataTableProps<R = any> {
  columns: DataTableColumn<R>[];
  rows: R[];
  /** Property used as the row identity, default "id". */
  rowKey?: string;
  selectable?: boolean;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>) => void;
  sort?: { key: string; dir: 'asc' | 'desc' };
  onSortChange?: (sort: { key: string; dir: 'asc' | 'desc' }) => void;
  onRowClick?: (row: R) => void;
  stickyHeader?: boolean;
  zebra?: boolean;
  /** Usually a <Pagination /> element. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function DataTable<R = any>(props: DataTableProps<R>): JSX.Element;
