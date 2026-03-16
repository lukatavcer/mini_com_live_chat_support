"use client";

import { useState } from "react";

interface ChatNameFormProps {
  onStartChat: (name: string) => void;
}

/** Name input form shown before a chat conversation starts */
export function ChatNameForm({ onStartChat }: ChatNameFormProps) {
  const [visitorName, setVisitorName] = useState("");

  const handleStart = () => {
    onStartChat(visitorName.trim() || "Visitor");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Welcome!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your name to start chatting with our support team.
        </p>
      </div>
      <input
        type="text"
        value={visitorName}
        onChange={(e) => setVisitorName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleStart()}
        placeholder="Your name"
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        aria-label="Your name"
        autoFocus
      />
      <button
        onClick={handleStart}
        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                   transition-colors text-sm font-medium
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Start Chat
      </button>
    </div>
  );
}
