/** Read-only attribute list for detail panels: IDs, dates, plan, owner. */
export interface KeyValueItem { label: React.ReactNode; value: React.ReactNode; /** Render the value in the mono face (IDs, keys, timestamps). */ mono?: boolean }
export interface KeyValueListProps { items: KeyValueItem[]; columns?: number; style?: React.CSSProperties }
export declare function KeyValueList(props: KeyValueListProps): JSX.Element;
