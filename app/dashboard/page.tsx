"use client";

import ChatSection from "@/components/custom/ChatSection";
import Header from "@/components/custom/Header";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex flex-col pt-4 pb-2 flex-1 items-center px-6 justify-between">
        <Header />
        <ChatSection></ChatSection>
      </div>
    </main>
  );
}
