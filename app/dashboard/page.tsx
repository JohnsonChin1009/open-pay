"use client";

import Header from "@/components/custom/Header";
import ChatMessages from "@/components/custom/ChatMessages";
import ChatInput from "@/components/custom/ChatInput";

export default function DashboardPage() {
  return (
    <main className="h-screen flex flex-col px-6">
      <Header />

      {/* Scrollable chat content */}
      <div className="flex-1 overflow-y-auto py-4">
        <ChatMessages />
      </div>

      {/* Input box pinned at the bottom */}
      <div className="py-4 border-t bg-white">
        <ChatInput />
      </div>
    </main>
  );
}