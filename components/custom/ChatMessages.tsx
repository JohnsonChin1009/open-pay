"use client";

import { Message } from "@/lib/types";
import React from "react";
import ReactMarkdown from "react-markdown"; // optional, for formatting Gemini output

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm mt-8">
        Start the conversation 👋
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 px-2 md:px-4 overflow-y-auto">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-[85%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap break-words shadow-md ${
            msg.role === "user"
              ? "bg-blue-600 text-white self-end ml-auto"
              : "bg-white text-gray-800 self-start mr-auto border border-gray-200"
          }`}
        >
          {msg.role === "bot" ? (
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
