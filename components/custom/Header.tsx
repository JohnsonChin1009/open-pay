"use client";

import ToggleThemeButton from "@/components/custom/ToggleThemeButton";
import ToggleLanguageButton from "@/components/custom/ToggleLanguageButton";
import { PanelRight } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 border-b">
      <div>
        <PanelRight size={20}/>
      </div>
      <div className="relative h-[40px] w-[120px]">
        <Image 
          src="/logo.png"
          alt="OpenPay Logo"
          fill
          objectFit="contain"
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

