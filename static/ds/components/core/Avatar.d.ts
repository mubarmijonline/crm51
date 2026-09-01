/** User or workspace mark: image when available, tinted initials otherwise. */
export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Rounded-square form, used for workspaces and orgs. */
  square?: boolean;
  style?: React.CSSProperties;
}
export declare function Avatar(props: AvatarProps): JSX.Element;
