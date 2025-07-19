"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext<{
  isOpen: boolean;
  toggleSidebar: () => void;
}>({
  isOpen: false,
  toggleSidebar: () => {},
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
