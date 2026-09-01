/** Table footer pager: range readout, page-size select, prev/next. */
export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  style?: React.CSSProperties;
}
export declare function Pagination(props: PaginationProps): JSX.Element;
