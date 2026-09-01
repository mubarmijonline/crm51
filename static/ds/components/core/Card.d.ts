/**
 * Bordered content container — the default surface for dashboard panels and forms.
 */
export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned header controls (buttons, menus, filters). */
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /** Set false when the body is a table or list that should bleed to the edges. */
  padded?: boolean;
  /** Adds the raised shadow; reserve for floating panels, not grid tiles. */
  elevated?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
