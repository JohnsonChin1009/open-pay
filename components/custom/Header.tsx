"use client";

import ToggleThemeButton from "@/components/custom/ToggleThemeButton";
import ToggleLanguageButton from "@/components/custom/ToggleLanguageButton";
import { PanelRight } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/app/context/SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between py-4 border-b px-4">
      <button onClick={toggleSidebar}>
        <PanelRight size={20} />
      </button>
      <div className="relative h-[40px] w-[120px]">
        <Image
          src="/logo.png"
          alt="OpenPay Logo"
          fill
          className="object-contain opacity-0 md:opacity-100"
        />
      </div>
      <div className="space-x-1 md:space-x-2">
        <ToggleLanguageButton />
        <ToggleThemeButton />
      </div>
    </header>
  );
}
