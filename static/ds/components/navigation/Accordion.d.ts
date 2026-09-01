/** Disclosure list for secondary detail: settings groups, FAQs, log entries. Several sections may be open at once. */
export interface AccordionItem { id: string; label: React.ReactNode; meta?: React.ReactNode; content: React.ReactNode }
export interface AccordionProps { items: AccordionItem[]; defaultOpen?: string[]; style?: React.CSSProperties }
export declare function Accordion(props: AccordionProps): JSX.Element;
