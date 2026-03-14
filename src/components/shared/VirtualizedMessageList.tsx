"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";

interface VirtualizedMessageListProps {
  messages: Message[];
  isOwnMessage: (msg: Message) => boolean;
  typingName?: string | null;
  ariaLabel: string;
}

/**
 * Virtualized message list using @tanstack/react-virtual.
 * Only renders visible messages in the DOM. Auto-scrolls to bottom
 * on new messages when the user is already near the bottom.
 */
export function VirtualizedMessageList({
  messages,
  isOwnMessage,
  typingName,
  ariaLabel,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevCountRef = useRef(messages.length);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Announce new incoming messages to screen readers
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && !isOwnMessage(lastMsg)) {
        setLiveAnnouncement(`New message: ${lastMsg.content}`);
      }
    }
    prevCountRef.current = messages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Total items = messages + optional typing indicator
  const itemCount = messages.length + (typingName ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  // Track whether user is scrolled to bottom
  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el) return;
    const threshold = 80;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // Auto-scroll to bottom when new messages arrive (if user was at bottom)
  useEffect(() => {
    if (isAtBottomRef.current) {
      virtualizer.scrollToIndex(itemCount - 1, { align: "end" });
    }
    // virtualizer is stable from useVirtualizer — only react to itemCount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  // Scroll to bottom on initial mount
  useEffect(() => {
    if (itemCount > 0) {
      virtualizer.scrollToIndex(itemCount - 1, { align: "end" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto p-4"
      role="list"
      aria-label={ariaLabel}
      onScroll={handleScroll}
    >
      {/* Visually hidden live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>
      {messages.length === 0 && !typingName && (
        <EmptyState title="Send a message to get started!" />
      )}
      {itemCount > 0 && (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const isTypingRow = virtualItem.index === messages.length && typingName;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isTypingRow ? (
                  <TypingIndicator name={typingName} />
                ) : (
                  <MessageBubble
                    message={messages[virtualItem.index]}
                    isOwn={isOwnMessage(messages[virtualItem.index])}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
