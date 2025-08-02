"use client";

import ProfileButton from "@/components/custom/ProfileButton";
import Image from "next/image";
import { IoMdMenu } from "react-icons/io";

export default function Header() {
  return (
    <header className="flex items-center justify-between w-full flex-wrap gap-4 px-2 sm:px-4 md:px-0">
      <div className="flex items-center gap-2">
        <IoMdMenu size={24} />
      </div>
      <div className="relative w-[180px] lg:w-[240px] h-[72px] lg:h-[96px]">
        <Image
          src="/logo.png"
          alt="openpay logo"
          fill
          objectFit="contain"
          className="object-contain"
        />
      </div>
      <ProfileButton />
    </header>
  );
}
