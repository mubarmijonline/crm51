/**
 * Phone screen header. Compact (52px) for detail screens with a back affordance; large for top-level screens, where the title drops below the bar.
 */
export interface MobileHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  /** Slot before the title — avatar, workspace switcher. */
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  /** Large-title treatment for tab roots. */
  large?: boolean;
  style?: React.CSSProperties;
}
export declare function MobileHeader(props: MobileHeaderProps): JSX.Element;
