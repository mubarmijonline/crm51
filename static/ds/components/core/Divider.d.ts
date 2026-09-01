/** Hairline rule between sections; optional centred overline label, or vertical for toolbars. */
export interface DividerProps { orientation?: 'horizontal' | 'vertical'; label?: React.ReactNode; spacing?: string; style?: React.CSSProperties }
export declare function Divider(props: DividerProps): JSX.Element;
