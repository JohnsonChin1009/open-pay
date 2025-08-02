"use client";

import { useEffect, useState } from "react";
import ChatInput from "@/components/custom/ChatInput";
import ChatMessages from "@/components/custom/ChatMessages";
import { sendToGemini } from "@/lib/gemini";
import { Message } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setIsNewUser(true);
      localStorage.setItem("hasSeenOnboarding", "true");
    }

    // Get user ID
    const getUserId = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          setUserId(session.user.id);
        } else {
          // Fallback to localStorage if no session
          const localUserId = localStorage.getItem("user_id");
          if (localUserId) {
            setUserId(localUserId);
          }
        }
      } catch (error) {
        console.error("Error getting user session:", error);
        // Try localStorage as fallback
        const localUserId = localStorage.getItem("user_id");
        if (localUserId) {
          setUserId(localUserId);
        }
      }
    };

    getUserId();
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      role: "user",
      message: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const botText = await sendToGemini(text, userId || undefined);

      const botReply: Message = {
        role: "system",
        message: botText,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "system", message: "Sorry, something went wrong." },
      ]);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-grow w-full md:max-w-[80%] mx-auto space-y-2">
      <div className="flex-grow overflow-y-auto">
        <ChatMessages messages={messages} isNewUser={isNewUser} />
      </div>
      <div className="pb-4">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}