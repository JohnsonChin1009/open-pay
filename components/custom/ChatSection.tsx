"use client";

import { useState } from "react";
import ChatInput from "@/components/custom/ChatInput";
import ChatMessages from "@/components/custom/ChatMessages";
import { sendToGemini } from "@/lib/gemini";
import { Message } from "@/lib/types";

export default function ChatSection() {
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
        role: "user",
        message: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
        // Call Gemini helper
        const botText = await sendToGemini(text); // optionally add chat history

        const botReply: Message = {
        role: "bot",
        message: botText,
        };

        setMessages((prev) => [...prev, botReply]);
    } catch (error) {
        console.error("Gemini API Error:", error);
        setMessages((prev) => [
        ...prev,
        { role: "bot", message: "Sorry, something went wrong." },
        ]);
    }
    };


    return (
        <div className="flex flex-col min-h-0 flex-grow w-full md:max-w-[80%] mx-auto space-y-2">
        <div className="flex-grow overflow-y-auto">
            <ChatMessages messages={messages} />
        </div>
        <div className="pb-4">
            <ChatInput onSend={handleSendMessage} />
        </div>
        </div>
    );
}