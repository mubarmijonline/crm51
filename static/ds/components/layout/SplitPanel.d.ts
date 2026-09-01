/** Two-column content layout: primary region plus a fixed-width side column (summary, filters, activity). Set stacked on phones. */
export interface SplitPanelProps {
  main: React.ReactNode;
  aside: React.ReactNode;
  asideWidth?: number;
  side?: 'left' | 'right';
  /** Stack into one column — pass true below the md breakpoint. */
  stacked?: boolean;
  gap?: string;
  style?: React.CSSProperties;
}
export declare function SplitPanel(props: SplitPanelProps): JSX.Element;
