/** Neutral metadata chip — filters, labels, applied query terms. Removable when it represents user input. */
export interface TagProps {
  onRemove?: () => void;
  interactive?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
