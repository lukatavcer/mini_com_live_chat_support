"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/lib/store";
import { VirtualizedMessageList } from "@/components/shared/VirtualizedMessageList";
import { broadcast } from "@/lib/transport";
import { Thread, Message } from "@/lib/types";

/**
 * Floating chat widget for the visitor-facing mock website.
 * Opens from a bottom-right button, supports creating new conversations
 * and sending/receiving messages in real time.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const threads = useChatStore((s) => s.threads);
  const createThread = useChatStore((s) => s.createThread);
  const sendMessage = useChatStore((s) => s.sendMessage);

  // Keep currentThread in sync with store updates
  const storeThread = threads.find((t) => t.id === currentThread?.id);
  const activeThread = storeThread || currentThread;
  const messages = activeThread?.messages || [];

  // Find if the agent is typing in this thread
  const agentTyping = activeThread?.participants.find(
    (p) => p.role === "agent" && p.isTyping
  );

  const isOwnMessage = useCallback((msg: Message) => msg.senderRole === "visitor", []);

  // Notification badge for new messages when widget is closed
  useEffect(() => {
    if (!isOpen && storeThread && storeThread.messages.length > (currentThread?.messages.length || 0)) {
      setHasNewMessage(true);
      // Play notification sound
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRl9vT19teleGhhdGV2ZXI=");
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore autoplay restrictions
      } catch {}
    }
  }, [isOpen, storeThread?.messages.length]);

  // Sync typing indicator with whether the input has content.
  // Typing shows as long as there's text, clears when input is emptied or message is sent.
  const isTypingRef = useRef(false);

  const updateTyping = (hasText: boolean) => {
    if (!activeThread) return;
    if (hasText === isTypingRef.current) return; // no change, avoid redundant broadcasts
    isTypingRef.current = hasText;
    const visitor = activeThread.participants.find((p) => p.role === "visitor");
    if (visitor) {
      broadcast({ type: "TYPING", threadId: activeThread.id, participantId: visitor.id, isTyping: hasText });
    }
  };

  const handleStartChat = () => {
    const name = visitorName.trim() || "Visitor";
    const thread = createThread(name);
    setCurrentThread(thread);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text || !activeThread) return;
    sendMessage(activeThread.id, text, "visitor");
    setMessage("");
    updateTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
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
        {/* Notification badge */}
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
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat widget panel */}
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
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              M
            </div>
            <div>
              <h2 className="font-semibold text-sm">MiniCom Support</h2>
              <p className="text-xs text-blue-200">
                {activeThread
                  ? agentTyping
                    ? "Agent is typing..."
                    : "Online"
                  : "Start a conversation"}
              </p>
            </div>
          </div>

          {/* Body */}
          {!activeThread ? (
            /* Name input form for starting a new conversation */
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Welcome!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your name to start chatting with our support team.
                </p>
              </div>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartChat()}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Your name"
                autoFocus
              />
              <button
                onClick={handleStartChat}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           transition-colors text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Chat
              </button>
            </div>
          ) : (
            /* Message list and input */
            <>
              <VirtualizedMessageList
                messages={messages}
                isOwnMessage={isOwnMessage}
                typingName={agentTyping ? "Agent" : null}
                ariaLabel="Chat messages"
              />

              {/* Message input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      updateTyping(e.target.value.trim().length > 0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    aria-label="Type a message"
                  />
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
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
