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

  const handleFileAttach = (file: File) => {
    const fileMessage: Message = {
      role: "user",
      message: `📎 Uploaded file: **${file.name}** (${Math.round(file.size / 1024)} KB)`,
    };

    setMessages((prev) => [...prev, fileMessage]);

    // Optional: You could also upload the file somewhere and send the link to Gemini
    // const botResponse = await sendToGemini(`User uploaded file: ${file.name}`);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-4xl mx-auto px-4 md:px-6 py-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        <ChatMessages messages={messages} isNewUser={isNewUser} />
      </div>
      <div className="pt-4 justify-content">
        <ChatInput onSend={handleSendMessage} onFileAttach={handleFileAttach} />
      </div>
    </div>
  );
}
