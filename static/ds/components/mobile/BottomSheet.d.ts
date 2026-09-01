/** The phone stand-in for Dialog, Menu and Popover: filters, row actions, confirmations. Parent must be position:relative. */
export interface BottomSheetProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Full-width stacked buttons pinned to the bottom. */
  actions?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function BottomSheet(props: BottomSheetProps): JSX.Element;
