"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChatStore } from "@/lib/store";
import { MessageBubble } from "@/components/shared/MessageBubble";
import { TypingIndicator } from "@/components/shared/TypingIndicator";
import { broadcast } from "@/lib/transport";
import { debounce } from "@/lib/utils";

/**
 * Thread detail view for the agent app.
 * Shows the full message history for a selected conversation
 * and allows the agent to reply.
 */
export function ThreadView() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const threads = useChatStore((s) => s.threads);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const markAsRead = useChatStore((s) => s.markAsRead);

  const thread = threads.find((t) => t.id === activeThreadId);
  const messages = thread?.messages || [];
  const visitorTyping = thread?.participants.find((p) => p.role === "visitor" && p.isTyping);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, visitorTyping]);

  // Mark messages as read when viewing thread
  useEffect(() => {
    if (thread) {
      markAsRead(thread.id, "agent-1");
    }
  }, [thread?.id, messages.length, markAsRead]);

  // Focus input when thread changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeThreadId]);

  // Debounced typing indicator
  const stopTyping = useCallback(
    debounce(() => {
      if (thread) {
        broadcast({ type: "TYPING", threadId: thread.id, participantId: "agent-1", isTyping: false });
      }
    }, 1000),
    [thread?.id]
  );

  const handleTyping = () => {
    if (thread) {
      broadcast({ type: "TYPING", threadId: thread.id, participantId: "agent-1", isTyping: true });
      stopTyping();
    }
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text || !thread) return;
    sendMessage(thread.id, text, "agent");
    setMessage("");

    // Stop typing indicator
    broadcast({ type: "TYPING", threadId: thread.id, participantId: "agent-1", isTyping: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">Select a conversation to start responding</p>
        </div>
      </div>
    );
  }

  const visitor = thread.participants.find((p) => p.role === "visitor");

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Thread header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                          rounded-full flex items-center justify-center text-sm font-semibold">
            {thread.visitorName[0]?.toUpperCase() || "V"}
          </div>
          {visitor?.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full
                            border-2 border-white dark:border-gray-800" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {thread.visitorName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {visitorTyping ? "Typing..." : visitor?.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6"
        role="list"
        aria-label="Conversation messages"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderRole === "agent"}
          />
        ))}
        {visitorTyping && <TypingIndicator name={thread.visitorName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="Reply to conversation"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
            aria-label="Send reply"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
