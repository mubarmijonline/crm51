/** Drop zone plus uploaded-file list — CSV imports, logo upload, attachments. */
export interface UploadedFile { name: string; size: string }
export interface FileUploadProps {
  /** Constraint line under the prompt, e.g. "CSV up to 20 MB". */
  accept?: string;
  files?: UploadedFile[];
  onSelect?: () => void;
  onRemove?: (index: number) => void;
  style?: React.CSSProperties;
}
export declare function FileUpload(props: FileUploadProps): JSX.Element;
