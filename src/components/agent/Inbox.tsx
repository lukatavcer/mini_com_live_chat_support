"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/store";
import { ConversationItem } from "./ConversationItem";
import { Thread } from "@/lib/types";

type SortMode = "recent" | "unread";

/**
 * Agent inbox showing all open conversations.
 * Supports sorting by most recent or most unread.
 * Keyboard navigable with arrow keys.
 */
export function Inbox() {
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const threads = useChatStore((s) => s.threads);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const getUnreadCount = useChatStore((s) => s.getUnreadCount);

  // Sort threads based on selected mode
  const sortedThreads = [...threads].sort((a: Thread, b: Thread) => {
    if (sortMode === "unread") {
      const aUnread = getUnreadCount(a.id, "agent-1");
      const bUnread = getUnreadCount(b.id, "agent-1");
      if (bUnread !== aUnread) return bUnread - aUnread;
    }
    return b.updatedAt - a.updatedAt; // fall back to most recent
  });

  const totalUnread = threads.reduce(
    (sum, t) => sum + getUnreadCount(t.id, "agent-1"),
    0
  );

  /** Handle keyboard navigation through inbox items */
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown" && index < sortedThreads.length - 1) {
      e.preventDefault();
      setActiveThread(sortedThreads[index + 1].id);
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      setActiveThread(sortedThreads[index - 1].id);
    }
  };

  return (
    <div className="w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700
                    flex flex-col bg-white dark:bg-gray-800 flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Inbox
            {totalUnread > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs font-bold
                              rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </h1>
        </div>

        {/* Sort toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setSortMode("recent")}
            className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       ${sortMode === "recent"
                         ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                         : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            aria-pressed={sortMode === "recent"}
          >
            Recent
          </button>
          <button
            onClick={() => setSortMode("unread")}
            className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       ${sortMode === "unread"
                         ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                         : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            aria-pressed={sortMode === "unread"}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Conversations"
      >
        {sortedThreads.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
            <p>No conversations yet.</p>
            <p className="mt-1">Waiting for visitors...</p>
          </div>
        ) : (
          sortedThreads.map((thread, index) => (
            <div
              key={thread.id}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <ConversationItem
                thread={thread}
                isActive={thread.id === activeThreadId}
                onClick={() => setActiveThread(thread.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
