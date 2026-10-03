"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[] | null;
  setBreadcrumbs: (crumbs: BreadcrumbItem[] | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbs: null,
  setBreadcrumbs: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[] | null>(null);

  const value = useMemo(
    () => ({
      breadcrumbs,
      setBreadcrumbs,
    }),
    [breadcrumbs]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs(customCrumbs?: BreadcrumbItem[]) {
  const context = useContext(BreadcrumbContext);

  const serialized = customCrumbs ? JSON.stringify(customCrumbs) : null;

  useEffect(() => {
    if (customCrumbs && customCrumbs.length > 0) {
      context.setBreadcrumbs(customCrumbs);
      return () => {
        context.setBreadcrumbs(null);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  return context;
}
