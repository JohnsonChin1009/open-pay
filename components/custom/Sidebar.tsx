"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/app/context/SidebarContext";
import { LogOut, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    toggleSidebar();
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <Image src="/logo.png" alt="Logo" width={100} height={40} />
        <button onClick={toggleSidebar}>
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 p-4">
        <p className="text-sm text-gray-400">Navigation coming soon...</p>
      </nav>
      <div className="p-4 border-t">
        <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}