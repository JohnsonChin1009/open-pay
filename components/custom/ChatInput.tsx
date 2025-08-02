"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AudioLines, Send, Paperclip } from "lucide-react";
import { useState, useRef } from "react";

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
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

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
    e.target.value = ""; // reset input to allow same file re-upload
  };

  const placeholder = "Ask anything";

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Hidden file input */}
      <input
        type="file"
        accept="*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* File attachment button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="flex-shrink-0 px-1 h-12 w-12"
      >
        <Paperclip size={14} />
      </Button>

      {/* Text input */}
      <Input
        className="flex-1 rounded-lg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />

      {/* Send / Voice button */}
      <Button
        type="button"
        size="sm"
        onClick={message.trim() ? handleSendMessage : toggleListening}
        className="flex-shrink-0 px-1 h-12 w-12"
      >
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
