/** Status pill for table cells and headers: Active, Failed, Pending, Trialing. */
export interface BadgeProps {
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent';
  /** Leading status dot. */
  dot?: boolean;
  /** Subtle tinted fill (default) vs solid. */
  subtle?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
