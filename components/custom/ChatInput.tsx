/* eslint-disable @typescript-eslint/no-explicit-any */
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
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      alert("Speech Recognition not available on server.");
      return;
    }

    // Check internet connectivity first
    if (!navigator.onLine) {
      alert("Speech Recognition requires an internet connection. Please check your connection and try again.");
      return;
    }

    // Test microphone access first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log("✅ Microphone access granted");
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
        // Now try speech recognition
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition ||
          (window as any).mozSpeechRecognition ||
          (window as any).msSpeechRecognition;

        if (!SpeechRecognition) {
          alert("Speech Recognition is not supported in this browser. Please type your message instead or try using Chrome for better speech support.");
          return;
        }

        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;
          recognition.continuous = false;

          recognition.onstart = () => {
            console.log("🎤 Speech recognition started");
            setIsListening(true);
          };

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            console.log("📝 Speech recognition result:", transcript);
            setMessage(transcript);
            setIsListening(false);
          };

          recognition.onerror = (event: any) => {
            console.error("❌ Speech recognition error:", event.error);
            setIsListening(false);
            
            // Provide more specific error messages
            let errorMessage = "";
            switch (event.error) {
              case 'not-allowed':
                errorMessage = "🚫 Microphone access denied.\n\nTo fix this:\n1. Click the lock icon (🔒) in your address bar\n2. Set Microphone to 'Allow'\n3. Refresh the page";
                break;
              case 'no-speech':
                errorMessage = "🔇 No speech detected. Please speak clearly and try again.";
                break;
              case 'network':
                errorMessage = "🌐 Network error occurred.\n\nTroubleshooting:\n• Check internet connection\n• Try different browser (Chrome recommended)\n• Check if you're on HTTPS/localhost\n• Disable VPN if using one";
                break;
              case 'service-not-allowed':
                errorMessage = "🚫 Speech recognition service not available.\n\nTry:\n• Using Chrome browser\n• Enabling microphone in system settings\n• Checking network connectivity";
                break;
              case 'aborted':
                errorMessage = "⏹️ Speech recognition was cancelled.";
                break;
              default:
                errorMessage = `❌ Speech recognition failed (${event.error}).\n\nPlease try:\n• Different browser (Chrome recommended)\n• Check microphone permissions\n• Type your message instead`;
            }
            alert(errorMessage);
          };

          recognition.onend = () => {
            console.log("🔚 Speech recognition ended");
            setIsListening(false);
          };

          // Set a timeout to auto-stop after 10 seconds
          const timeout = setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 10000);

          recognition.start();
          recognitionRef.current = recognition;

          // Clear timeout when recognition ends
          recognition.onend = () => {
            clearTimeout(timeout);
            setIsListening(false);
          };

        } catch (error) {
          console.error("Error starting speech recognition:", error);
          setIsListening(false);
          alert("❌ Failed to start speech recognition.\n\nThis feature may not be fully supported on your system.\n\nPlease try:\n• Using Chrome browser\n• Typing your message instead");
        }
      })
      .catch((error) => {
        console.error("❌ Microphone access denied:", error);
        let errorMessage = "🎤 Microphone access required for speech recognition.\n\n";
        
        if (error.name === 'NotAllowedError') {
          errorMessage += "To enable:\n1. Click lock icon (🔒) in address bar\n2. Allow microphone access\n3. Refresh page and try again";
        } else if (error.name === 'NotFoundError') {
          errorMessage += "No microphone found.\n• Check if microphone is connected\n• Test microphone in System Preferences";
        } else {
          errorMessage += `Error: ${error.message}\n• Try different browser\n• Check system microphone settings`;
        }
        
        alert(errorMessage);
      });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
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

  const placeholder = "Ask anything (or click 🎤 to speak)";

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
        title="Attach file"
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
        title={message.trim() ? "Send message" : isListening ? "Stop recording" : "Voice input (requires internet)"}
        disabled={isListening && !message.trim()}
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
