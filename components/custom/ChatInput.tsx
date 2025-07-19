/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AudioLines, Send, Paperclip } from "lucide-react";

type ChatInputProps = {
  onSend: (message: string) => void;
  onFileAttach?: (file: File) => void; // optional file handler
};

export default function ChatInput({ onSend, onFileAttach }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileAttach) {
      onFileAttach(file);
    }
    // reset so same file can be uploaded again
    e.target.value = "";
  };

  const placeholder = "Ask anything";

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept="*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip size={16} />
      </Button>

      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />

      <Button type="button" onClick={message.trim() ? handleSendMessage : toggleListening}>
        {message.trim() ? (
          <Send size={16} />
        ) : isListening ? (
          <AudioLines size={16} className="animate-pulse text-red-500" />
        ) : (
          <AudioLines size={16} />
        )}
      </Button>
    </div>
  );
}