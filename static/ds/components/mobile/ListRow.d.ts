/** The phone replacement for a table row: title + subtitle on the left, value + status on the right, tap to drill in. */
export interface ListRowProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned primary value, set in the mono face. */
  meta?: React.ReactNode;
  /** Right-aligned secondary slot — usually a <Badge />. */
  metaSub?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function ListRow(props: ListRowProps): JSX.Element;
