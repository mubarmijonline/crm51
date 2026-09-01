/** Titled block within a page — groups cards or a table under a heading with its own actions. */
export interface SectionProps { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode; style?: React.CSSProperties }
export declare function Section(props: SectionProps): JSX.Element;
