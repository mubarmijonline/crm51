/** Chronological event list — audit logs, billing history, account activity. */
export interface TimelineItem { icon?: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; text: React.ReactNode; meta?: React.ReactNode }
export interface TimelineProps { items: TimelineItem[]; style?: React.CSSProperties }
export declare function Timeline(props: TimelineProps): JSX.Element;
