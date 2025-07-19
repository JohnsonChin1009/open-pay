"use client";

import Header from "@/components/custom/Header";
import ChatSection from "@/components/custom/ChatSection";

export default function DashboardPage() {
  return (
    <main className="h-screen flex flex-col px-6 md:px-8">
      <Header />
      <div className="flex-1 flex flex-col pt-4 md:pt-10">
        <ChatSection />
      </div>
    </main>
  );
}