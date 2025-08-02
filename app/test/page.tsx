"use client";

import ChatSection from "@/components/custom/ChatSection";

export default function TestPage() {
  return (
    <main className="h-screen flex flex-col px-6 md:px-8">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Chat Test Page</h1>
      </header>
      <div className="flex-1 flex flex-col pt-4 md:pt-10">
        <ChatSection />
      </div>
    </main>
  );
}
