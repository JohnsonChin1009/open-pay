"use client";

import ProfileButton from "@/components/custom/ProfileButton";
import Image from "next/image";
import { IoMdMenu } from "react-icons/io";

export default function Header() {
  return (
    <header className="flex items-center justify-between w-full px-4 py-2">
      <div className="flex items-center gap-2">
        <IoMdMenu size={24} />
      </div>

      <div className="relative w-[120px] h-[48px] sm:w-[140px] sm:h-[56px] md:w-[160px] md:h-[60px]">
        <Image
          src="/logo2.png"
          alt="openpay logo"
          fill
          className="object-contain"
        />
      </div>
      <ProfileButton />
    </header>
  );
}
