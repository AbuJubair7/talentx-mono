import type { ComponentType, ReactNode } from "react";
import type { UserRole } from "@/types/auth";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string | number;
  exact?: boolean;
  matchPatterns?: (string | RegExp)[];
}

export interface SidebarUser {
  name: string;
  email: string;
  avatarUrl?: string | null;
  roleSubtitle?: string;
  role?: UserRole | string;
}

export type LayoutRole = "talent" | "employer" | "admin" | UserRole;

export interface AppSidebarProps {
  role?: LayoutRole;
  customNavItems?: SidebarNavItem[];
  user?: SidebarUser;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  onSignOut?: () => void | Promise<void>;
  layoutIdPrefix?: string;
  hideHeader?: boolean;
  onNavigate?: () => void;
}

export interface AppShellProps {
  children: ReactNode;
  role?: LayoutRole;
  customNavItems?: SidebarNavItem[];
  user?: SidebarUser;
  className?: string;
  onSignOut?: () => void | Promise<void>;
  initialCollapsed?: boolean;
}

export interface PortalPageContainerProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export interface PortalPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}
