"use client";

import { Thread } from "@/lib/types";
import { formatTime, truncate } from "@/lib/utils";
import { useChatStore } from "@/lib/store";

interface ConversationItemProps {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}

/**
 * A single conversation row in the agent inbox.
 * Shows visitor name, last message preview, time, and unread badge.
 */
export function ConversationItem({ thread, isActive, onClick }: ConversationItemProps) {
  const getUnreadCount = useChatStore((s) => s.getUnreadCount);
  const lastMessage = thread.messages[thread.messages.length - 1];
  const unreadCount = getUnreadCount(thread.id, "agent-1");
  const visitorOnline = thread.participants.find((p) => p.role === "visitor")?.isOnline;
  const visitorTyping = thread.participants.find((p) => p.role === "visitor")?.isTyping;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                  ${isActive ? "bg-blue-50 dark:bg-gray-700" : ""}`}
      role="option"
      aria-selected={isActive}
      aria-label={`Conversation with ${thread.visitorName}. ${unreadCount} unread messages.`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                          rounded-full flex items-center justify-center text-sm font-semibold">
            {thread.visitorName[0]?.toUpperCase() || "V"}
          </div>
          {visitorOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full
                            border-2 border-white dark:border-gray-800" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium truncate
                            ${unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
              {thread.visitorName}
            </span>
            {lastMessage && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                {formatTime(lastMessage.timestamp)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className={`text-sm truncate
                          ${unreadCount > 0
                            ? "text-gray-800 dark:text-gray-200 font-medium"
                            : "text-gray-500 dark:text-gray-400"}`}>
              {visitorTyping
                ? "Typing..."
                : lastMessage
                ? truncate(lastMessage.content, 40)
                : "No messages yet"}
            </p>
            {unreadCount > 0 && (
              <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-xs font-bold
                              rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
