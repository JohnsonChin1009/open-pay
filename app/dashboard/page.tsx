"use client";

import ChatSection from "@/components/custom/ChatSection";
import Header from "@/components/custom/Header";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex flex-col pt-4 pb-2 px-4 sm:px-6 md:px-8 lg:px-10 flex-1 items-center justify-between">
        <Header />
        <ChatSection></ChatSection>
      </div>
    </main>
  );
}
