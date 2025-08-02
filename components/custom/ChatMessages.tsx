"use client";

import { Message } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";

type ChatMessagesProps = {
  messages: Message[];
  isNewUser: boolean;
};

export default function ChatMessages({
  messages,
  isNewUser,
}: ChatMessagesProps) {
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayedMessages(messages);
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedMessages]);

  if (!displayedMessages || displayedMessages.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm mb-86">
        Start the conversation 👋
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col space-y-4 px-2 md:px-4 overflow-y-auto max-h-[calc(100vh-200px)]"
    >
      {displayedMessages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-[85%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap break-words shadow-md ${
            msg.role === "user"
              ? "bg-primary text-black self-end ml-auto"
              : "bg-white text-gray-800 self-start mr-auto border border-gray-200"
          }`}
        >
          {msg.role === "system" ? (
            <div className="prose prose-sm prose-gray dark:prose-invert">
              <ReactMarkdown>{msg.message}</ReactMarkdown>
            </div>
          ) : (
            msg.message
          )}
        </div>
      ))}
    </div>
  );
}
