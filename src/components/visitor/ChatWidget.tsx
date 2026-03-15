"use client";

import { useState, useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/shared/Avatar";
import { ChatNameForm } from "./ChatNameForm";
import { ChatConversation } from "./ChatConversation";
import { isRoleTyping } from "@/lib/selectors";

/**
 * Floating chat widget shell for the visitor-facing site.
 * Manages open/close state, notification badge, and delegates
 * to ChatNameForm or ChatConversation sub-components.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const prevMessageCount = useRef(0);

  const threads = useChatStore((s) => s.threads);
  const createThread = useChatStore((s) => s.createThread);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;
  const agentTyping = activeThread ? isRoleTyping(activeThread, "agent") : false;
  const messageCount = activeThread?.messages.length ?? 0;

  // Notification badge for new messages when widget is closed
  useEffect(() => {
    if (!isOpen && messageCount > prevMessageCount.current) {
      setHasNewMessage(true);
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRl9vT19teleGhhdGV2ZXI=");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    }
    prevMessageCount.current = messageCount;
  }, [isOpen, messageCount]);

  const handleStartChat = (name: string) => {
    setActiveThreadId(createThread(name).id);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700
                   text-white rounded-full shadow-lg flex items-center justify-center
                   transition-all duration-200 hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {hasNewMessage && !isOpen && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full
                          animate-pulse border-2 border-white"
            role="status"
            aria-live="polite"
            aria-label="New unread messages"
          />
        )}
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Widget panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)]
                     bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col
                     border border-gray-200 dark:border-gray-700 z-50
                     animate-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label="Chat support widget"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-blue-600 text-white rounded-t-2xl flex items-center gap-3">
            <Avatar initials="M" size="sm" />
            <div>
              <h2 className="font-semibold text-sm">MiniCom Support</h2>
              <p className="text-xs text-blue-200">
                {activeThread
                  ? agentTyping ? "Agent is typing..." : "Online"
                  : "Start a conversation"}
              </p>
            </div>
          </div>

          {/* Body */}
          {activeThread ? (
            <ChatConversation thread={activeThread} />
          ) : (
            <ChatNameForm onStartChat={handleStartChat} />
          )}
        </div>
      )}
    </>
  );
}
