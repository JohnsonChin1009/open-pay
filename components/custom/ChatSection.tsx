"use client";

import { useEffect, useState } from "react";
import ChatInput from "@/components/custom/ChatInput";
import ChatMessages from "@/components/custom/ChatMessages";
import { sendToGemini } from "@/lib/gemini";
import { Message } from "@/lib/types";

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setIsNewUser(true);
      localStorage.setItem("hasSeenOnboarding", "true");
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      role: "user",
      message: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const botText = await sendToGemini(text);

      const botReply: Message = {
        role: "system",
        message: botText,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "system", message: "Sorry, something went wrong." },
      ]);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-grow w-full md:max-w-[90%] mx-auto space-y-2">
      <div className="flex-grow overflow-y-auto">
        <ChatMessages messages={messages} isNewUser={isNewUser} />
      </div>
      <div className="pb-4 flex items-center">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
