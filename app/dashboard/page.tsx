"use client";

import ChatSection from "@/components/custom/ChatSection";
import LogoutButton from "@/components/custom/LogoutButton";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center">
        <LogoutButton></LogoutButton>
      </div>
      <div className="px-8 py-4">
        <ChatSection />
      </div>
    </main>
  );
}
