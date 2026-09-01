/** ⌘K navigation and action launcher, grouped by kind. Parent must be position:relative. */
export interface CommandItem { id: string; label: string; icon?: string; shortcut?: string }
export interface CommandGroup { label?: string; items: CommandItem[] }
export interface CommandPaletteProps {
  open?: boolean;
  groups: CommandGroup[];
  placeholder?: string;
  onSelect?: (id: string) => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function CommandPalette(props: CommandPaletteProps): JSX.Element;
