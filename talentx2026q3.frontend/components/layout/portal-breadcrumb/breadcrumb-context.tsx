"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { parseBreadcrumbSegments } from "./dynamic-breadcrumb-parser";

export interface PortalBreadcrumbContextValue {
  customBreadcrumbs: string[] | null;
  setCustomBreadcrumbs: (crumbs: string[] | null) => void;
}

const PortalBreadcrumbContext =
  createContext<PortalBreadcrumbContextValue | null>(null);

export interface PortalBreadcrumbProviderProps {
  children: ReactNode;
}

export function PortalBreadcrumbProvider({
  children,
}: PortalBreadcrumbProviderProps) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<string[] | null>(
    null
  );

  const contextValue = useMemo(
    () => ({
      customBreadcrumbs,
      setCustomBreadcrumbs,
    }),
    [customBreadcrumbs]
  );

  return (
    <PortalBreadcrumbContext.Provider value={contextValue}>
      {children}
    </PortalBreadcrumbContext.Provider>
  );
}

export interface UsePortalBreadcrumbsResult {
  breadcrumbs: string[];
  setBreadcrumbs: (crumbs: string[] | null) => void;
}

export function usePortalBreadcrumbs(): UsePortalBreadcrumbsResult {
  const context = useContext(PortalBreadcrumbContext);
  const currentPathname = usePathname();
  const setCustomBreadcrumbs = context?.setCustomBreadcrumbs;

  const breadcrumbs = useMemo(() => {
    if (context?.customBreadcrumbs && context.customBreadcrumbs.length > 0) {
      return context.customBreadcrumbs;
    }
    return parseBreadcrumbSegments(currentPathname || "");
  }, [context?.customBreadcrumbs, currentPathname]);

  const setBreadcrumbs = useCallback(
    (crumbs: string[] | null) => {
      setCustomBreadcrumbs?.(crumbs);
    },
    [setCustomBreadcrumbs]
  );

  return {
    breadcrumbs,
    setBreadcrumbs,
  };
}

export function useSetDynamicBreadcrumbs(breadcrumbs: string[] | null): void {
  const { setBreadcrumbs } = usePortalBreadcrumbs();
  const serializedBreadcrumbs = breadcrumbs ? breadcrumbs.join("||") : null;

  useEffect(() => {
    const activeBreadcrumbs = serializedBreadcrumbs
      ? serializedBreadcrumbs.split("||")
      : null;
    setBreadcrumbs(activeBreadcrumbs);
    return () => {
      setBreadcrumbs(null);
    };
  }, [serializedBreadcrumbs, setBreadcrumbs]);
}
