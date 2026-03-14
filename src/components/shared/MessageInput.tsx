"use client";

import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  onTypingChange?: (hasText: boolean) => void;
  placeholder?: string;
  buttonVariant?: "text" | "icon";
  ariaLabel?: string;
  autoFocusOnMount?: boolean;
  autoFocusTrigger?: unknown;
}

/**
 * Shared message input with send button. Handles Enter-to-send,
 * typing state changes, and auto-focus.
 */
export function MessageInput({
  onSend,
  onTypingChange,
  placeholder = "Type a message...",
  buttonVariant = "text",
  ariaLabel = "Type a message",
  autoFocusOnMount = false,
  autoFocusTrigger,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusOnMount || autoFocusTrigger !== undefined) {
      inputRef.current?.focus();
    }
  }, [autoFocusTrigger, autoFocusOnMount]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage("");
    onTypingChange?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTypingChange?.(e.target.value.trim().length > 0);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        aria-label={ariaLabel}
      />
      {buttonVariant === "icon" ? (
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Send message"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
          aria-label="Send message"
        >
          Send
        </button>
      )}
    </div>
  );
}
