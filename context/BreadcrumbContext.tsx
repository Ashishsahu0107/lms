"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[] | null;
  breadcrumbPath: string | null;
  setBreadcrumbs: (crumbs: BreadcrumbItem[] | null, path?: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbs: null,
  breadcrumbPath: null,
  setBreadcrumbs: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[] | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string | null>(null);
  const pathname = usePathname();

  // If the pathname changes to a path different from where the breadcrumbs were registered,
  // automatically reset custom breadcrumbs so they never leak into other tabs
  useEffect(() => {
    if (breadcrumbPath && breadcrumbPath !== pathname) {
      setBreadcrumbsState(null);
      setBreadcrumbPath(null);
    }
  }, [pathname, breadcrumbPath]);

  const setBreadcrumbs = (crumbs: BreadcrumbItem[] | null, path?: string | null) => {
    setBreadcrumbsState(crumbs);
    setBreadcrumbPath(crumbs ? (path ?? pathname) : null);
  };

  const value = useMemo(
    () => ({
      breadcrumbs,
      breadcrumbPath,
      setBreadcrumbs,
    }),
    [breadcrumbs, breadcrumbPath]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs(customCrumbs?: BreadcrumbItem[]) {
  const context = useContext(BreadcrumbContext);
  const pathname = usePathname();

  const serialized = customCrumbs ? JSON.stringify(customCrumbs) : null;

  useEffect(() => {
    if (customCrumbs && customCrumbs.length > 0) {
      context.setBreadcrumbs(customCrumbs, pathname);
      return () => {
        context.setBreadcrumbs(null, null);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, pathname]);

  return context;
}
