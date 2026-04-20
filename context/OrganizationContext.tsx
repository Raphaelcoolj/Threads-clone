"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface OrganizationContextType {
  activeCommunity: any | null;
  setActiveCommunity: (community: any | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [activeCommunity, setActiveCommunity] = useState<any | null>(null);
  return (
    <OrganizationContext.Provider value={{ activeCommunity, setActiveCommunity }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error("useOrganization must be used within an OrganizationProvider");
  return context;
};
