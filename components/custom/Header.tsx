"use client";

import ProfileButton from "@/components/custom/ProfileButton";
import Image from "next/image";
import { IoMdMenu } from "react-icons/io";

export default function Header() {
  return (
    <header className="flex justify-between w-full items-center">
      <div>
        <IoMdMenu size={24} />
      </div>
      <div className="relative w-[180px] h-[72px]">
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
