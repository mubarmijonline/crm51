/** The frame every admin screen sits in: fixed rail + top bar on desktop, header + bottom tab bar on mobile. Only the main region scrolls. */
export interface AppShellProps {
  /** Desktop left rail, usually <SideNav />. */
  nav?: React.ReactNode;
  /** Desktop header, usually <TopBar />. */
  header?: React.ReactNode;
  mobileHeader?: React.ReactNode;
  mobileNav?: React.ReactNode;
  /** Render the mobile arrangement. Drive it from a viewport query at the app root. */
  isMobile?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function AppShell(props: AppShellProps): JSX.Element;
