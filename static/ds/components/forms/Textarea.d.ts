/** Multi-line text field; vertical resize only. */
export interface TextareaProps { rows?: number; placeholder?: string; value?: string; defaultValue?: string; invalid?: boolean; disabled?: boolean; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; style?: React.CSSProperties }
export declare function Textarea(props: TextareaProps): JSX.Element;
