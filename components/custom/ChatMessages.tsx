"use client";

type Message = {
  role: "user" | "bot";
  text: string;
};

const dummyMessages: Message[] = [
  { role: "user", text: "Hi there!" },
  { role: "bot", text: "Hello! How can I assist you today?" },
  { role: "user", text: "Tell me a joke." },
  { role: "bot", text: "Why don't scientists trust atoms? Because they make up everything!" },
];

export default function ChatMessages() {
  return (
    <div className="space-y-4">
      {dummyMessages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${
            msg.role === "user"
              ? "bg-blue-500 text-white self-end ml-auto"
              : "bg-gray-200 text-gray-800 self-start mr-auto"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}